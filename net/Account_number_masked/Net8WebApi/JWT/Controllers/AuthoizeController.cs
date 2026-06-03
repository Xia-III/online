using IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Net8WebApi.Utility;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace MyBlog.JWT.Controllers
{
        [Route("api/[controller]")]
        [ApiController]
        public class AuthoizeController : ControllerBase
        {
                private readonly IUserService _iUserService;
                public AuthoizeController(IUserService iUserService)
                {
                        _iUserService = iUserService;
                }
                [HttpPost("Login")]
                public async Task<Result> Login(string username, string userpwd)
                {
                        //加密后的密码 123456 =>sdlkfjkldsjidaifdaskfaj == sdlkfjkldsjidaifdaskfaj
                        string pwd = MD5Helper.MD5Encrypt32(userpwd);
                        //数据校验
                        var user = await _iUserService.FindAsync(c => c.Username == username && c.Password == pwd);
                        if (user != null)
                        {
                                //登陆成功
                                var claims = new Claim[]
                                    {
                                                new Claim("Id", user.UserId.ToString()),
                                                new Claim("Username", user.Username)
                                                //不能放敏感信息 
                                    };
                                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SDMC-CJAS1-SAD-DFSFA-SADHJVF-VFF"));
                                //issuer代表颁发Token的Web应用程序，audience是Token的受理者
                                var token = new JwtSecurityToken(
                                    issuer: "http://localhost:6060",
                                    audience: "http://localhost:5261",
                                    claims: claims,
                                    notBefore: DateTime.Now,
                                    expires: DateTime.Now.AddHours(1),
                                    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
                                );
                                var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
                                return Result.Success(jwtToken);
                        }
                        else
                        {
                                return Result.Error("账号或密码错误");
                        }
                }
        }
}
