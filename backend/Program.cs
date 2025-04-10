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

string connectionString = "server=localhost;user=root;password=pass123;database=listport";
MySqlServerVersion mysqlVersion = new(new Version(8, 0, 40));

builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseMySql(connectionString, mysqlVersion)
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
});

builder.Services.AddScoped<ITokenService, TokenService>();

WebApplication app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();