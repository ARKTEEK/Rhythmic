using System.Text;
using backend.Application.Interface;
using backend.Application.Service;
using backend.Domain.Entity;
using backend.Infrastructure.Factory;
using backend.Infrastructure.Persistence;
using backend.Infrastructure.Provider;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

MySqlServerVersion mysqlVersion = new(new Version(8, 0, 40));

builder.Services.AddCors(options => {
  options.AddPolicy("AllowFrontend",
    b => b
      .WithOrigins(builder.Configuration["FrontendUrl"])
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials());
});

builder.Services.AddDbContext<DatabaseContext>(options =>
  options.UseMySql(builder.Configuration["DatabaseConnection"], mysqlVersion)
    .LogTo(Console.WriteLine, LogLevel.Information)
    .EnableDetailedErrors());

builder.Services.AddIdentity<User, IdentityRole>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
  })
  .AddEntityFrameworkStores<DatabaseContext>();

string jwtScheme = JwtBearerDefaults.AuthenticationScheme;

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = jwtScheme;
    options.DefaultChallengeScheme = jwtScheme;
    options.DefaultForbidScheme = jwtScheme;
    options.DefaultScheme = jwtScheme;
    options.DefaultSignInScheme = jwtScheme;
    options.DefaultSignOutScheme = jwtScheme;
  })
  .AddJwtBearer(options => {
    ConfigurationManager configuration = builder.Configuration;
    SymmetricSecurityKey signingKey = new(Encoding.UTF8.GetBytes(configuration["JWT:SigningKey"]));

    options.TokenValidationParameters = new TokenValidationParameters {
      ValidateIssuer = true,
      ValidIssuer = configuration["JWT:Issuer"],
      ValidateAudience = true,
      ValidAudience = configuration["JWT:Audience"],
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = signingKey
    };

    options.Events = new JwtBearerEvents {
      OnMessageReceived = context => {
        if (context.Request.Cookies.TryGetValue("jwt", out string? token)) {
          context.Token = token;
        }

        return Task.CompletedTask;
      }
    };
  });


builder.Services.AddHttpClient();

builder.Services.AddScoped<IProviderClient, GoogleProviderClient>();
builder.Services.AddScoped<IProviderFactory, ProviderFactory>();

builder.Services.AddScoped<IOAuthService, OAuthService>();

builder.Services.AddScoped<IAccountTokensService, AccountTokensService>();
builder.Services.AddScoped<IAccountProfileService, AccountProfileService>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<AuthService>();

WebApplication app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();