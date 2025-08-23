using System.Text;
using backend;
using backend.Entity;
using backend.Services;
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

builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseMySql(builder.Configuration["DatabaseConnection"], mysqlVersion)
    .LogTo(Console.WriteLine, LogLevel.Information)
    .EnableDetailedErrors());

builder.Services.AddIdentity<User, IdentityRole>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
  })
  .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication(options => {
  options.DefaultAuthenticateScheme =
    options.DefaultChallengeScheme =
      options.DefaultForbidScheme =
        options.DefaultScheme =
          options.DefaultSignInScheme =
            options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
  options.TokenValidationParameters = new TokenValidationParameters {
    ValidateIssuer = true,
    ValidIssuer = builder.Configuration["JWT:Issuer"],
    ValidateAudience = true,
    ValidAudience = builder.Configuration["JWT:Audience"],
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(
      Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"]))
  };

  options.Events = new JwtBearerEvents {
    OnMessageReceived = context => {
      if (context.Request.Cookies.ContainsKey("jwt")) {
        context.Token = context.Request.Cookies["jwt"];
      }

      return Task.CompletedTask;
    }
  };
});

builder.Services.AddHttpClient();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserConnectionService, UserConnectionService>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddScoped<IYoutubeService, YoutubeService>();

WebApplication app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();