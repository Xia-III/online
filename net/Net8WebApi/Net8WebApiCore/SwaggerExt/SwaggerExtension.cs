using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System.Reflection;


namespace Net8WebApiCore.SwaggerExt
{
    public static class SwaggerExtension
    {
        public static void AddSwaggerExt(this IServiceCollection services){
                        services.AddEndpointsApiExplorer();
                        services.AddSwaggerGen(operation =>
                        {
                                #region 注释xml文件注入，展示注释
                                {
                                        string xmlPath = Path.Combine(AppContext.BaseDirectory, "Net8WebApi.xml");
                                        operation.IncludeXmlComments(xmlPath);
                                }
                                #endregion
                                #region 支持Swagger版本控制
                                {
                                        foreach (FieldInfo field in typeof(ApiVersion).GetFields())
                                        {
                                                operation.SwaggerDoc(field.Name, new Microsoft.OpenApi.Models.OpenApiInfo()
                                                {
                                                        Title = $"{field.Name}版本",
                                                        Version = field.Name,
                                                        Description = $"coreWebApi{field.Name} 版本"
                                                });
                                        }
                                }
                                #endregion
                                #region 支持Swagger的token传值
                                {
                                        operation.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                                        {
                                                Description = "token,格式为Bearer xxxxx",
                                                Name = "Authorization",
                                                In = ParameterLocation.Header,
                                                Type = SecuritySchemeType.ApiKey,
                                                BearerFormat = "JWT",
                                                Scheme = "Bearer"

                                        });
                                        operation.AddSecurityRequirement(new OpenApiSecurityRequirement
                                        {
                                                 {
                                                        new OpenApiSecurityScheme{
                                                                Reference = new OpenApiReference(){
                                                                        Type = ReferenceType.SecurityScheme,
                                                                        Id = "Bearer"
                                                                }
                                                        },
                                                        new string[]{
                                                         }

                                                 }
                                         });
                                }
                                #endregion
                        });
         }
         public static void UseSwaggerExt(this WebApplication app){
                        app.UseSwagger();
                        app.UseSwaggerUI(operation =>
                        {
                                foreach (var field in typeof(ApiVersion).GetFields())
                                {
                                        operation.SwaggerEndpoint($"/swagger/{field.Name}/swagger.json",
                                        $"{field.Name}");
                                }

                        });
                }
    }
}
