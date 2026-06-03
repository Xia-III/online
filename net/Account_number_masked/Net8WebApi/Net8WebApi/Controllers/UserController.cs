using AutoMapper;
using IRepository;
using IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Model.EntityDto;
using Model.EntityMap;
using Net8WebApi.Utility;
using Net8WebApiCore;
using SqlSugar;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Net8WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
        private readonly IUserService _userService;
        private readonly IMaskedService _maskedService;
        private readonly ITokenBlacklist _tokenBlacklist;
        private readonly IMapper _mapper;

        public UserController(IUserService iUserService, IMaskedService iMaskedService, IMapper iMapper, ITokenBlacklist tokenBlacklist)
        {
                _userService = iUserService;
                _maskedService = iMaskedService;
                _mapper = iMapper;
                _tokenBlacklist = tokenBlacklist;
        }
        /// <summary>
        /// 获取用户信息
        /// </summary>
        /// <returns></returns>
        [HttpGet("UserInfo")]
        public async Task<Result> UserInfo()
        {
                try
                {
                        // 从认证信息中获取 Claims
                        var claimsIdentity = User.Identity as ClaimsIdentity;

                        // 获取特定 Claim
                        var userIdClaim = User.FindFirst("Id")?.Value;

                        if (string.IsNullOrEmpty(userIdClaim))
                        {
                                return Result.Error("未找到用户ID声明");
                        }
                        User user = await _userService.FindAsync(int.Parse(userIdClaim));
                        UserDto userDto = _mapper.Map<UserDto>(user);
                        return Result.Success(userDto);
                }
                catch (Exception ex)
                {
                        return Result.Error($"服务器错误: {ex.Message}");
                }

        }
        /// <summary>
        /// 退出登录
        /// </summary>
        /// <returns></returns>
        [HttpPost("Logout")]
public async Task<Result> Logout()
{
    try
    {
        // 获取当前Token的jti和过期时间
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        var expClaim = User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;                 
        if (string.IsNullOrEmpty(jti) || !long.TryParse(expClaim, out var expTimestamp))
        {
            return Result.Error("无效的Token");
        }

        var expiry = DateTimeOffset.FromUnixTimeSeconds(expTimestamp).UtcDateTime;

        // 将jti加入黑名单
        await _tokenBlacklist.AddToBlacklistAsync(jti, expiry);
        
        // 添加日志记录
        Console.WriteLine($"用户登出成功，Token {jti} 已加入黑名单");
        Console.WriteLine("过期时间" + expiry);
        return Result.Success("退出成功");
    }
    catch (Exception ex)
    {
        return Result.Error($"退出失败: {ex.Message}");
    }
}
        /// <summary>
        /// 根据用户名模糊查询管理员
        /// </summary>
        /// <returns></returns>
        [HttpGet("FindAdminByUsername")]
        public async Task<Result> FindAdminByUsername(string username = null)
        {
                // 从认证信息中获取 Claims
                var claimsIdentity = User.Identity as ClaimsIdentity;
                // 获取特定 Claim
                var userIdClaim = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                        return Result.Error("未找到用户ID声明");
                }
                User u = await _userService.FindAsync(int.Parse(userIdClaim));
                if (u == null){
                        return Result.Error("非法查询");
                }
                if(u.Role!= 3){
                        return Result.Error("权限不足");
                }
                List<User> userList = new List<User>();
                if (username == null){
                        userList = await _userService.QueryAsync();
                }
                else{
                        userList = await _userService.FuzzyQueryAsync("Username", username);
                }
                userList = userList.Where(l=>l.Role==2).ToList();
                return Result.Success(userList);
        }
        /// <summary>
        /// 根据用户名模糊查询子用户
        /// </summary>
        /// <returns></returns>
        [HttpGet("FindUserByUsername")]
        public async Task<Result> FindUserByUsername(int userId = -1, string username = null)
        {
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
                List<User> userList = new List<User>();
                if (u.Role == 3 && userId!=-1)
                {
                        userList = await _userService.QueryAsync(t => t.AuthoizeAdminId == userId);
                }
                if (u.Role == 2 && username != null)
                {
                        userList = await _userService.FuzzyQueryAsync("Username", username);
                        userList = userList.Where(t => t.AuthoizeAdminId == u.UserId).ToList();
                }else if(u.Role == 2 && username ==null)
                {
                        userList = await _userService.QueryAsync(t => t.AuthoizeAdminId == u.UserId);
                }
                return Result.Success(userList);
        }
        /// <summary>
        /// 删除
        /// </summary>
        /// <returns></returns>
        [HttpDelete("DeleteById")]
        public async Task<Result> DeleteById(int  userId)
        {
                User u1 = await _userService.FindAsync(userId);
                if (u1 == null)
                {
                        return Result.Error("用户不存在");
                }

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

                List<User> users = new List<User>();
                if (u.Role == 3 && u1.Role ==2) {
                        users = await _userService.QueryAsync(t => t.AuthoizeAdminId == userId);
                }
                try {
                        foreach (User u2 in users)
                        {
                                await _userService.DeleteAsync(u2.UserId);
                        }

                        await _userService.DeleteAsync(userId);
                        return Result.Success("删除成功");

                } catch (Exception ex) { 
                        return Result.Error(ex.Message);
                }
        }
        /// <summary>
        /// 修改用户信息
        /// </summary>
        /// <returns></returns>
        [HttpPut("UpdateUser")]
        public async Task<Result> UpdateById(int UserId, string Username,string Password)
        {
                User u = await _userService.FindAsync(UserId);
                if(u == null){
                        return Result.Error("用户不存在");
                }
                u.Username = Username;
                u.Password = Password;
                return   _userService.UpdataIgnoreNull(u) ? Result.Success() : Result.Error("修改失败");
        }
        /// <summary>
        /// 修改用户名
        /// </summary>
        /// <returns></returns>
        [HttpPut("UpdateUserName")]
        public async Task<Result> UpdateUserName(string username)
        {
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
                        return Result.Error("用户不存在");
                }
                u.Username = username;
                return await _userService.EditAsync(u) ? Result.Success() : Result.Error("修改失败");
        }
        /// <summary>
        /// 修改用户密码
        /// </summary>
        /// <returns></returns>
        [HttpPatch("UpdatePassword")]
        public async Task<Result> UpdatePassword(string oldpassword, string newpassword, string repassword)
        {
                if (!newpassword.Equals(repassword)) return Result.Error("两次密码输入不一致");
                // 从认证信息中获取 Claims
                var claimsIdentity = User.Identity as ClaimsIdentity;
                // 获取特定 Claim
                var userIdClaim = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                        return Result.Error("未找到用户ID声明");
                }
                User user = await _userService.FindAsync(int.Parse(userIdClaim));
                if (user ==null)
                {
                        return Result.Error("未找到用户");
                }
                if (!oldpassword.Equals(user.Password)){
                        return Result.Error("原密码错误，请重新输入");
                }
                user.Password = newpassword;
                return await _userService.EditAsync(user) ? Result.Success() : Result.Error("修改失败");
        }
        /// <summary>
        /// 重置用户密码
        /// </summary>
        /// <returns></returns>
        [HttpPut("ResetPassword")]
        public async Task<Result> ResetPassword(int userId)
        {
                // 从认证信息中获取 Claims
                var claimsIdentity = User.Identity as ClaimsIdentity;
                // 获取特定 Claim
                var userIdClaim = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                        return Result.Error("未找到用户ID声明");
                }
                User user = await _userService.FindAsync(int.Parse(userIdClaim));
                if (user.Role != 1) return Result.Error("权限不足");
                user = await _userService.FindAsync(userId);
                if (user == null) return Result.Error("用户不存在");
                user.Password = MD5Helper.MD5Encrypt32("35Kd3lh9");
                return await _userService.EditAsync(user) ? Result.Success("密码重置成功") : Result.Error("修改失败");
        }
        /// <summary>
        /// 修改用户状态
        /// </summary>
        /// <returns></returns>
        [HttpPut("UpdateUserStatus")]
        public async Task<Result> UpdateUserStatus(int userId,int status)
        {
                // 从认证信息中获取 Claims
                var claimsIdentity = User.Identity as ClaimsIdentity;
                // 获取特定 Claim
                var userIdClaim = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                        return Result.Error("未找到用户ID声明");
                }
                User u = await _userService.FindAsync(int.Parse(userIdClaim));
                User user = await _userService.FindAsync(userId);
                if (user == null) return Result.Error("用户不存在");
                if (u.Role <= user.Role || u.Role>3) return Result.Error("权限不足");
                user.Status = status;
                return await _userService.EditAsync(user) ? Result.Success("用户状态修改成功") : Result.Error("修改失败");
        }

}
