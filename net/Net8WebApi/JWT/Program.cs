
using IRepository;
using IService;
using RepositoryImpl;
using ServiceImpl;
using SqlSugar.IOC;

namespace JWT
{
        public class Program
        {
                public static void Main(string[] args)
                {
                        var builder = WebApplication.CreateBuilder(args);

                        // Add services to the container.

                        builder.Services.AddControllers();
                        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
                        builder.Services.AddEndpointsApiExplorer();
                        builder.Services.AddSwaggerGen();

                        SugarIocServices.AddSqlSugar(new IocConfig()
                        {
                                //ConfigId="db01"  多租户用到
                                ConnectionString = "server=DESKTOP-F00G9BK\\SQL;uid=sa;pwd=123456;database=SqlSugar;Encrypt=True;TrustServerCertificate=True",
                                DbType = IocDbType.SqlServer,
                                IsAutoCloseConnection = true//自动释放
                        });
                        builder.Services.AddScoped<IUserRepository, UserRepository>();
                        builder.Services.AddTransient<IUserService, UserService>();
                        var app = builder.Build();

                        // Configure the HTTP request pipeline.
                        if (app.Environment.IsDevelopment())
                        {
                                app.UseSwagger();
                                app.UseSwaggerUI();
                        }

                        app.UseAuthorization();


                        app.MapControllers();

                        app.Run();
                }
        }
}
