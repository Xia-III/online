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
using static Dm.net.buffer.ByteArrayBuffer;

namespace Net8WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaskedController : ControllerBase
{
        private readonly IUserService _userService;
        private readonly IMaskedService _maskedService;
        private readonly ITokenBlacklist _tokenBlacklist;

        public MaskedController(IUserService iUserService, IMaskedService iMaskedService, ITokenBlacklist tokenBlacklist)
        {
                _userService = iUserService;
                _maskedService = iMaskedService;
                _tokenBlacklist = tokenBlacklist;
        }
        /// <summary>
        /// 查询解码总数
        /// </summary>
        /// <returns></returns>
        [HttpPost("FindAdminCount")]
        public async Task<Result> FindAdminCount(int UserId = -1, int Role = -1)
        {
                List<Masked> list = new List<Masked>();
                if (Role == 1)
                {
                        list = await _maskedService.QueryAsync(t => t.UserId == UserId);
                }
                else if (Role == 2)
                {
                        list = await _maskedService.QueryAsync(t => t.AdminId == UserId);
                }
                if (UserId == -1 && Role == -1)
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
                        if (u.Role == 3)
                        {
                                list = await _maskedService.QueryAsync();
                        }
                        if (u.Role == 2)
                        {
                                list = await _maskedService.QueryAsync(t => t.AdminId == u.UserId);
                        }
                }
                return Result.Success(list.Count);

        }
        /// <summary>
        /// 查询个人解码记录
        /// </summary>
        /// <returns></returns>
        [HttpPost("FindAll")]
        public async Task<Result> FindAll(int userId=-1, int day = -1)
        {
                List<Masked> list = new List<Masked>();
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
                if (userId !=-1){
                        User u1 = await _userService.FindAsync(userId);  
                        if (u.Role == 3 || (u1.AuthoizeAdminId == u.UserId && u.Role == 2))
                        {
                                list = await _maskedService.FindAll(userId, day);
                        }
                }
                else{
                        list = await _maskedService.FindAll(u.UserId,day);
                }

                return Result.Success(list);
        }
        /// <summary>
        /// 解码
        /// </summary>
        /// <returns></returns>
        [HttpPost("Decode")]
        public async Task<Result> Decode(string param1, string param2, string param3)
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
                string result; 
                string errorMessage;
                bool isDecode = DecoderUtility.TryDecode(param1, param2, param3,out result,out errorMessage);
                if (isDecode) {
                        Masked masked = new Masked();
                        masked.UserId = u.UserId;
                        masked.Code = result;
                        masked.AdminId = u.AuthoizeAdminId;
                        await _maskedService.CreateAsync(masked);
                }
                return isDecode ? Result.Success(result) : Result.Error(errorMessage);
        }
}
