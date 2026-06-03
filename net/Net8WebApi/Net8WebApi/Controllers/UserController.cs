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
        private readonly IAuthorityService _AuthorityService;
        private readonly ITokenBlacklist _tokenBlacklist;
        private readonly IMapper _mapper;

        public UserController(IUserService iUserService, IMapper iMapper, ITokenBlacklist tokenBlacklist, IAuthorityService iAuthorityService)
        {
                _userService = iUserService;
                _mapper = iMapper;
                _tokenBlacklist = tokenBlacklist;
                _AuthorityService = iAuthorityService;
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
        /// 查询全部用户
        /// </summary>
        /// <returns></returns>
        [HttpGet("FindAll")]
        public async Task<Result> FindAll()
        {

                var claimsIdentity = User.Identity as ClaimsIdentity;
                var userIdClaim = User.FindFirst("Id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                        return Result.Error("未找到用户ID声明");
                }
                User user = await _userService.FindAsync(int.Parse(userIdClaim));
                if (user.Role !=1) {
                        return Result.Error("权限不足");
                }
                List<User> userList = await _userService.QueryAsync(u => u.Role != 1);
                return Result.Success(userList);
        }
        /// <summary>
        /// 根据ID查询
        /// </summary>
        /// <returns></returns>
        [HttpGet("FindById")]
        public async Task<Result> FindById(int id)
        {
                User user = await _userService.FindAsync(id);
                return Result.Success(user);
        }
        /// <summary>
        /// 根据用户名模糊查询
        /// </summary>
        /// <returns></returns>
        [HttpGet("FindByUsername")]
        public async Task<Result> FindByUsername(string username)
        {
                List<User> userList = await _userService.FuzzyQueryAsync("Username", username);
                return Result.Success(userList);
        }
        /// <summary>
        /// 根据用户名分页模糊查询
        /// </summary>
        /// <returns></returns>
        [HttpGet("FindByUsernamePage")]
        public async Task<Result> FindByUsernamePage(int page, int pageSize, string username = null)
        {
                RefAsync<int> total = 0;
                List<User> userList = new List<User>();
                if (username == null){
                        userList = await _userService.QueryAsync(u=>u.Role != 1 ,page, pageSize, total);
                }
                else{
                        userList = await _userService.FuzzyQueryAsync("Username", username, page, pageSize, total);
                        // 修复：使用LINQ的Where方法过滤角色为1的用户，而不是在遍历时修改集合
                        userList = userList.Where(u => u.Role != 1).ToList();
                }
                return Result.Success(userList, total);
        }
        /// <summary>
        /// 删除
        /// </summary>
        /// <returns></returns>
        [HttpDelete("DeleteById")]
        public async Task<Result> DeleteById(int  userId)
        {
                User u = await _userService.FindAsync(userId);
                if (u == null)
                {
                        return Result.Error("用户不存在");
                }
                await FileExt.UpdateFileUsageStatus(u.UserPic, false);
                List<Authority> list = await _AuthorityService.QueryAsync(a => a.AdministratorId == userId);
                foreach (Authority authority in list){
                        await _AuthorityService.DeleteAsync(authority.Id);
                }
                return await _userService.DeleteAsync(userId) ?Result.Success("删除成功"):Result.Error("删除失败");
        }
        /// <summary>
        /// 修改用户信息
        /// </summary>
        /// <returns></returns>
        [HttpPut("UpdateUser")]
        public async Task<Result> UpdateById(UserDto userDto)
        {
                User u = await _userService.FindAsync(userDto.UserId);
                if(u == null){
                        return Result.Error("用户不存在");
                }
                User user = _mapper.Map<User>(userDto);

                await FileExt.UpdateFileUsageStatus(u.UserPic, false);
                await FileExt.UpdateFileUsageStatus(user.UserPic, true);

                return   _userService.UpdataIgnoreNull(user) ? Result.Success() : Result.Error("修改失败");
        }
        /// <summary>
        /// 修改用户名和邮箱
        /// </summary>
        /// <returns></returns>
        [HttpPut("UpdateUserNameAndEmail")]
        public async Task<Result> UpdateUserNameAndEmail(string username,string email)
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
                u.Email = email;
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
        /// 修改用户头像
        /// </summary>
        /// <returns></returns>
        [HttpPatch("UpdateAvatar")]
        public async Task<Result> UpdateAvatar(string userPic)
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
                //将文件表旧头像文件isUsed改为false
                await FileExt.UpdateFileUsageStatus(user.UserPic,false);
                //更换头像,将文件表的被使用头像文件isUsed改为true
                await FileExt.UpdateFileUsageStatus(userPic, true);
                user.UserPic = userPic;
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
                user.Password = "35Kd3lh9";
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
                User user = await _userService.FindAsync(int.Parse(userIdClaim));
                if (user.Role != 1) return Result.Error("权限不足");
                user = await _userService.FindAsync(userId);
                if (user == null) return Result.Error("用户不存在");
                user.Status = status;
                return await _userService.EditAsync(user) ? Result.Success("用户状态修改成功") : Result.Error("修改失败");
        }
        /// <summary>
        /// 根据用户名模糊查询
        /// </summary>
        /// <returns></returns>
        [HttpGet("FindAllByPage")]
        public async Task<Result> FindAllByPage(int page, int size, string keyword = null)
        {
                RefAsync<int> total= 0;
                List<User> userList = await _userService.FindAllByPage(page,size,total,keyword);
                return Result.Success(userList, total);
        }

}
