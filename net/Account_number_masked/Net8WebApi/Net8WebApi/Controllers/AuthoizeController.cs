using IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Model.EntityMap;
using Net8WebApi.Utility;
using ServiceImpl;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Net8WebApi.Controllers
{
        [Route("api")]
        [ApiController]
        public class AuthoizeController : ControllerBase
        {
                private readonly IUserService _userService;
                public AuthoizeController(IUserService iUserService)
                {
                        _userService = iUserService;
                }
                [HttpPost("User/Login")]
                public async Task<Result> Login(string accountNumber, string password)
                {
                        ////加密后的密码 123456 =>sdlkfjkldsjidaifdaskfaj == sdlkfjkldsjidaifdaskfaj
                        //string pwd = MD5Helper.MD5Encrypt32(password);
                        //数据校验
                        var user = await _userService.FindAsync(c => c.AccountNumber == accountNumber && c.Password == password);
                        if (user != null)
                        {
                                if (user.Status == 0) return Result.Error("账号异常");
                                //登陆成功
                                var claims = new Claim[]
                                    {
                                                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                                                new Claim("Id", user.UserId.ToString()),
                                                new Claim("AccountNumber", user.AccountNumber)
                                                //不能放敏感信息 
                                    };
                                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SDMC-CJAS1-SAD-DFSFA-SADHJVF-VFF"));
                                //issuer代表颁发Token的Web应用程序，audience是Token的受理者
                                var token = new JwtSecurityToken(
                                    issuer: "http://localhost:5262",
                                    audience: "http://localhost:5262",
                                    claims: claims,
                                    notBefore: DateTime.UtcNow,
                                    expires: DateTime.UtcNow.AddHours(2),
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
                /// <summary>
                /// 注册
                /// </summary>
                /// <returns></returns>
                [HttpPost("User/Register")]
                public async Task<Result> Add(string accountNumber, string password, string username=null)
                {
                        User u = await _userService.FindAsync(u => u.AccountNumber == accountNumber);
                        if (u != null) return Result.Error("账号已被使用");
                        User user = new User();
                        user.AccountNumber = accountNumber;
                        if(username != null) {
                                user.Username = username;
                        }
                        user.Password = password;
                        return await _userService.CreateAsync(user) ? Result.Success("注册成功") : Result.Error("注册失败");

                }
                /// <summary>
                /// 添加管理员账号
                /// </summary>
                /// <returns></returns>
                [HttpPost("User/AddAdmin")]
                public async Task<Result> AddAdmin(string accountNumber, string password, string username = null)
                {
                        User u = await _userService.FindAsync(u => u.AccountNumber == accountNumber);
                        if (u != null) return Result.Error("账号已被使用");
                        // 从认证信息中获取 Claims
                        var claimsIdentity = User.Identity as ClaimsIdentity;
                        // 获取特定 Claim
                        var userIdClaim = User.FindFirst("Id")?.Value;
                        if (string.IsNullOrEmpty(userIdClaim))
                        {
                                return Result.Error("未找到用户ID声明");
                        }
                        u = await _userService.FindAsync(int.Parse(userIdClaim));
                        if (u == null || u.Role!=3)
                        {
                                return Result.Error("非法用户");
                        }

                        User user = new User();
                        user.AccountNumber = accountNumber;
                        if (username != null)
                        {
                                user.Username = username;
                        }
                        user.Password = password;
                        user.Role = 2;
                        user.AuthoizeAdminId = u.UserId;
                        return await _userService.CreateAsync(user) ? Result.Success("注册成功") : Result.Error("注册失败");

                }
                /// <summary>
                /// 添加子账号
                /// </summary>
                /// <returns></returns>
                [HttpPost("User/AddUser")]
                public async Task<Result> AddUser(string accountNumber, string password, string username = null)
                {
                        User u1 = await _userService.FindAsync(u => u.AccountNumber == accountNumber);
                        if (u1 != null) return Result.Error("账号已被使用");

                        // 从认证信息中获取 Claims
                        var claimsIdentity = User.Identity as ClaimsIdentity;
                        // 获取特定 Claim
                        var userIdClaim = User.FindFirst("Id")?.Value;
                        if (string.IsNullOrEmpty(userIdClaim))
                        {
                                return Result.Error("未找到用户ID声明");
                        }
                        User u = await _userService.FindAsync(int.Parse(userIdClaim));
                        if (u == null)
                        {
                                return Result.Error("非法用户");
                        }

                        User user = new User();
                        user.AccountNumber = accountNumber;
                        if (username != null)
                        {
                                user.Username = username;
                        }
                        user.Password = password;
                        user.Role = 1;
                        user.AuthoizeAdminId = u.UserId;
                        return await _userService.CreateAsync(user) ? Result.Success("注册成功") : Result.Error("注册失败");
                }
        }
}
