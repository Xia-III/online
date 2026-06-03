using IRepository;
using IService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Model.EntityMap;
using Net8WebApi.Utility;
using Net8WebApiCore;
using Net8WebApiCore.SwaggerExt;
using RepositoryImpl;
using ServiceImpl;
using SqlSugar;
using SqlSugar.IOC;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace Net8WebApi
{
        public class Program
        {
                public static void Main(string[] args)
                {
                        var builder = WebApplication.CreateBuilder(args);

                        // Add services to the container.
                        //#region 注入SqlSugar
                        //builder.Services.AddTransient<SqlSugarClient>(serverprivider =>
                        //{
                        //        ConnectionConfig connectionConfig = new ConnectionConfig()
                        //        {
                        //                ConnectionString = builder.Configuration.GetConnectionString("SQLConn"),
                        //                DbType = DbType.SqlServer,
                        //                IsAutoCloseConnection = true
                        //        };
                        //        return new SqlSugarClient(connectionConfig);
                        //}
                        //);
                        //#endregion

                        #region 注入SqlSugarIOC
                        SugarIocServices.AddSqlSugar(new IocConfig()
                        {
                                ConnectionString = builder.Configuration.GetConnectionString("MySQLConn"),
                                DbType = IocDbType.MySql,
                                IsAutoCloseConnection = true//??????
                        });
                        #endregion
                        #region 注入仓储和服务
                        builder.Services.AddScoped<IUserRepository, UserRepository>();
                        builder.Services.AddTransient<IUserService, UserService>();
                        builder.Services.AddScoped<IFileRecordRepository, FileRecordRepository>();
                        builder.Services.AddTransient<IFileRecordService, FileRecordService>();
                        builder.Services.AddHostedService<FileCleanupService>();
                        builder.Services.AddSingleton<ITokenBlacklist, MemoryTokenBlacklist>();
                        builder.Services.AddScoped<IAuthorityRepository, AuthorityRepository>();
                        builder.Services.AddTransient<IAuthorityService, AuthorityService>();
                        builder.Services.AddScoped<IAiRecordRepository, AiRecordRepository>();
                        builder.Services.AddTransient<IAiRecordService, AiRecordService>();
                        builder.Services.AddScoped<IProductRepository, ProductRepository>();
                        builder.Services.AddTransient<IProductService, ProductService>();
                        #endregion
                        #region AutoMappper注入
                        builder.Services.AddAutoMapper(typeof(CustomAutoMapperProfile));
                        #endregion
                        #region JWT鉴权
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                              .AddJwtBearer(options =>
                              {
                                      options.TokenValidationParameters = new TokenValidationParameters
                                      {
                                              ValidateIssuerSigningKey = true,
                                              IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SDMC-CJAS1-SAD-DFSFA-SADHJVF-VFF")),
                                              ValidateIssuer = true,
                                              ValidIssuer = "http://localhost:5261",
                                              ValidateAudience = true,
                                              ValidAudience = "http://localhost:5261",
                                              ValidateLifetime = true,
                                              ClockSkew = TimeSpan.Zero,//时钟偏移
                                      };
                                      // ????????????
                                      options.Events = new JwtBearerEvents
                                      {
                                              OnTokenValidated = async context =>
                                              {
                                                      // 从请求头中获取完整的token
                                                      var authHeader = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
                                                      var completeToken = authHeader?.Replace("Bearer ", "");                                                     
                                                      var token = context.SecurityToken as JwtSecurityToken;
               
                                                      // 获取jti的两种方式
                                                      var jti = token?.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
                                                      
                                                      // 如果从token中获取jti失败，尝试从完整token中解析
                                                      if (string.IsNullOrEmpty(jti) && !string.IsNullOrEmpty(completeToken))
                                                      {
                                                              try
                                                              {
                                                                      var handler = new JwtSecurityTokenHandler();
                                                                      var jsonToken = handler.ReadToken(completeToken) as JwtSecurityToken;
                                                                      jti = jsonToken?.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
                                                              }
                                                              catch (Exception ex)
                                                              {
                                                                      Console.WriteLine($"解析Token出错: {ex.Message}");
                                                              }
                                                      }
                                                      if (!string.IsNullOrEmpty(jti))
                                                      {
                                                              var blacklist = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklist>();
                                                              if (await blacklist.IsInBlacklistAsync(jti))
                                                              {
                                                                      context.Fail("Token 已失效");
                                                              }
                                                      }
                                              }
                                      };
                              });
                        #endregion
                        #region 限制上传文件大小
                        builder.Services.Configure<FormOptions>(options =>
                        {
                                options.MultipartBodyLengthLimit = 30 * 1024 * 1024; // 设置为30MB
                        });
                        #endregion
                        builder.Services.AddControllers();
                        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
                        builder.Services.AddSwaggerExt();
                        //builder.Services.AddEndpointsApiExplorer();
                        //builder.Services.AddSwaggerGen(operation =>
                        //{
                        //        #region ???xml???????????
                        //        {
                        //                string xmlPath = Path.Combine(AppContext.BaseDirectory, "Net8WebApi.xml");
                        //                operation.IncludeXmlComments(xmlPath);
                        //        }
                        //        #endregion
                        //        #region ???Swagger?汾????
                        //        {
                        //                foreach (var field in typeof(ApiVersion).GetFields())
                        //                {
                        //                        operation.SwaggerDoc(field.Name, new Microsoft.OpenApi.Models.OpenApiInfo()
                        //                        {
                        //                                Title = $"{field.Name}?汾",
                        //                                Version = field.Name,
                        //                                Description = $"coreWebApi{field.Name} ?汾"
                        //                        });
                        //                }
                        //        }
                        //        #endregion
                        //        #region ???Swagger??token???
                        //        {
                        //                operation.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                        //                {
                        //                        Description = "token,????Bearer xxxxx",
                        //                        Name = "Authorization",
                        //                        In = ParameterLocation.Header,
                        //                        Type = SecuritySchemeType.ApiKey,
                        //                        BearerFormat = "JWT",
                        //                        Scheme = "Bearer"

                        //                });
                        //                operation.AddSecurityRequirement(new OpenApiSecurityRequirement
                        //                {
                        //                         {
                        //                                new OpenApiSecurityScheme{
                        //                                        Reference = new OpenApiReference(){
                        //                                                Type = ReferenceType.SecurityScheme,
                        //                                                Id = "Bearer"
                        //                                        }
                        //                                },
                        //                                new string[]{
                        //                                 }

                        //                         }
                        //                 });
                        //        }
                        //        #endregion
                        //});

                        // 添加 CORS 服务
                        builder.Services.AddCors(options =>
                        {
                                options.AddPolicy("AllowAll",
                                    policy =>
                                    {
                                            policy.AllowAnyOrigin()
                                                     .AllowAnyMethod()
                                                     .AllowAnyHeader();
                                    });
                        });

                        var app = builder.Build();

                        // 初始化 FileExt
                        FileExt.Initialize(app.Services);

                        // Configure the HTTP request pipeline.
                        app.UseSwaggerExt();
                        //if (app.Environment.IsDevelopment())
                        //{
                        //        app.UseSwaggerExt();
                        //        //app.UseSwagger();
                        //        //app.UseSwaggerUI(operation =>
                        //        //{
                        //        //        foreach (var field in typeof(ApiVersion).GetFields())
                        //        //        {
                        //        //                operation.SwaggerEndpoint($"/swagger/{field.Name}/swagger.json",
                        //        //                $"{field.Name}");
                        //        //        }

                        //        //});
                        //}

                        // 启用路由
                        app.UseRouting();
                        app.UseCors("AllowAll"); // 必须在 UseRouting 之后，UseAuthorization 之前
                        app.UseAuthentication();//鉴权中间件
                        app.UseAuthorization();//授权中间件


                        app.MapControllers();

                        app.Run();
                }
        }

}
