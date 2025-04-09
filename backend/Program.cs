using backend;
using backend.Repositories;
using backend.Services;
using Microsoft.EntityFrameworkCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var connectionString = "server=localhost;user=root;password=pass123;database=listport";
var mysqlVersion = new MySqlServerVersion(new Version(8, 0, 40));

builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseMySql(connectionString, mysqlVersion)
    .LogTo(Console.WriteLine, LogLevel.Information)
    .EnableDetailedErrors());

builder.Services.AddScoped<IUserRepository, UserRepository>();

WebApplication app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();