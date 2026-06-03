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
        public class AiRecordController : Controller
        {
                private readonly IAiRecordService _AiRecordService;
                public AiRecordController(IAiRecordService iAiRecordService, IUserService iUserService)
                {
                        _AiRecordService = iAiRecordService;
                }
                /// <summary>
                /// 添加
                /// </summary>
                /// <returns></returns>
                [HttpPost("Add")]
                public async Task<Result> Add(AiRecord aiRecord)
                {
                        AiRecord T = await _AiRecordService.FindAsync(t => t.UserId == aiRecord.UserId);
                        if (T != null)
                        {
                                 return Result.Error("保存失败,已存在");
                        }
                        return await _AiRecordService.CreateAsync(aiRecord) ? Result.Success(null, "设置成功") : Result.Error("申请失败");
                }
                /// <summary>
                /// 条件全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindByUserId")]
                public async Task<Result> FindByDatasetsId(string userId)
                {
                        AiRecord a = await _AiRecordService.FindAsync(t=>t.UserId== userId);
                        if (a != null){
                                return Result.Success(a.DialogueId);
                        }
                        return Result.Error("未找到相关记录");
                }
        }
}

