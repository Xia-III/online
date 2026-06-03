using AutoMapper;
using IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.EntityDto;
using Model.EntityMap;
using Net8WebApi.Utility;
using ServiceImpl;
using SqlSugar;
using System.Drawing;
using System.Security.Claims;

namespace Net8WebApi.Controllers
{
        [ApiController]
        [Route("api/[controller]")]
        [Authorize]
        public class AuthorityController : Controller
        {
                private readonly IAuthorityService _AuthorityService;
                private readonly IUserService _userService;

                public AuthorityController(IAuthorityService iAuthorityService, IUserService iUserService)
                {
                        _AuthorityService = iAuthorityService;
                        _userService = iUserService;
                }
                /// <summary>
                /// 添加
                /// </summary>
                /// <returns></returns>
                [HttpPost("Add")]
                [Authorize]
                public async Task<Result> Add(string datasetsId,string datasetsName, int administratorId)
                {
                        Authority T = await _AuthorityService.FindAsync(a => a.DatasetsId == datasetsId && a.AdministratorId == administratorId);
                        if (T != null)
                        {
                                 return Result.Error("设置失败，已是该知识库的管理员");
                        }
                        Authority authority = new Authority();
                        authority.DatasetsId = datasetsId;
                        authority.DatasetsName = datasetsName;
                        authority.AdministratorId = administratorId;
                        return await _AuthorityService.CreateAsync(authority) ? Result.Success(null, "设置成功") : Result.Error("申请失败");
                }
                /// <summary>
                /// 删除
                /// </summary>
                /// <returns></returns>
                [HttpDelete("DeleteById")]
                public async Task<Result> DeleteById(int id)
                {
                        Authority T = await _AuthorityService.FindAsync(id);
                        if (T == null) return Result.Error("删除失败，不存在");
                        return await _AuthorityService.DeleteAsync(id) ? Result.Success() : Result.Error("删除失败");
                }
                /// <summary>
                /// 修改
                /// </summary>
                /// <returns></returns>
                [HttpPut("UpdateAuthority")]
                public async Task<Result> UpdateById(Authority authority)
                {
                        Authority T = await _AuthorityService.FindAsync(authority.Id);
                        if (T == null) return Result.Error("修改失败，不存在");
                        return await _AuthorityService.EditAsync(authority) ? Result.Success() : Result.Error("修改失败");
                }
                /// <summary>
                /// 查询全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindAll")]
                public async Task<Result> FindAll()
                {
                        List<Authority> list = await _AuthorityService.QueryAsync();
                        return Result.Success(list);
                }
                /// <summary>
                /// 条件全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindByDatasetsId")]
                public async Task<Result> FindByDatasetsId(string datasetsId)
                {
                        List<Authority> list = await _AuthorityService.QueryAsync(a=>a.DatasetsId==datasetsId);
                        return Result.Success(list);
                }
                /// <summary>
                /// 分页查询全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindAllQueryAsync")]
                public async Task<Result> FindAllQueryAsync(int page,int size)
                {
                        RefAsync<int> total = 0;
                        List<Authority> list = await _AuthorityService.QueryAsync(page,size,total);
                        return Result.Success(list);
                }
                /// <summary>
                /// 查询能管理的知识库
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindManageAllPage")]
                [Authorize]
                public async Task<Result> FindManageAllPage(int page, int size,string keyword=null)
                {
                        var claimsIdentity = User.Identity as ClaimsIdentity;
                        var userIdClaim = User.FindFirst("Id")?.Value;
                        if (string.IsNullOrEmpty(userIdClaim))
                        {
                                return Result.Error("未找到用户ID声明");
                        }
                        RefAsync<int> total = 0;
                        List<Authority> list = await _AuthorityService.FindManageAllPage( page,  size,  total, keyword, int.Parse(userIdClaim));
                        return Result.Success(list,total);
                }
        }
}

