using System.Text;

using backend.Api.Hub;
using backend.Application.Interface;
using backend.Application.Model;
using backend.Application.Service;
using backend.Domain.Entity;
using backend.Infrastructure.Factory;
using backend.Infrastructure.Persistence;
using backend.Infrastructure.Provider.Google;
using backend.Infrastructure.Provider.Spotify;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
  .AddJsonOptions(options => {
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
  });
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

builder.Services.AddAuthorization(options => {
  options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
});


builder.Services.AddSignalR();

builder.Services.AddSingleton<IJobQueue, JobQueue>();
builder.Services.AddSingleton<JobCancellationStore>();
builder.Services.AddHostedService<JobProcessingService>();

builder.Services.AddHttpClient();

builder.Services.AddScoped<IAuditLogService, AuditLogService>();

builder.Services.AddScoped<IProviderClient, GoogleProviderClient>();
builder.Services.AddScoped<IProviderClient, SpotifyProviderClient>();

builder.Services.AddScoped<IProviderFactory, ProviderFactory>();
builder.Services.AddScoped<IPlaylistProviderFactory, PlaylistProviderFactory>();

builder.Services.AddScoped<IPlaylistProviderClient, GooglePlaylistClient>();
builder.Services.AddScoped<IPlaylistProviderClient, SpotifyPlaylistClient>();

builder.Services.AddScoped<IPlaylistService, PlaylistService>();
builder.Services.AddScoped<IPlaylistSnapshotService, PlaylistSnapshotService>();

builder.Services.AddScoped<IOAuthService, OAuthService>();

builder.Services.AddScoped<IAccountTokensService, AccountTokensService>();
builder.Services.AddScoped<IAccountProfileService, AccountProfileService>();

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddScoped<IUserProfileService, UserProfileService>();

builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddScoped<IPlaylistSyncService, PlaylistSyncService>();
builder.Services.AddScoped<IScheduledJobService, ScheduledJobService>();
builder.Services.AddHostedService<PlaylistSyncBackgroundService>();


WebApplication app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ProgressHub>("/progressHub");

app.Run();
