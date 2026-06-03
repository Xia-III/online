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
        public class ProductController : Controller
        {
                private readonly IProductService _ProductService;

                public ProductController(IProductService iProductService)
                {
                        _ProductService = iProductService;
                }
                /// <summary>
                /// 添加
                /// </summary>
                /// <returns></returns>
                [HttpPost("Add")]
                [Authorize]
                public async Task<Result> Add(Product product)
                {
                        await UpdateImageFile(product,true);
                        return await _ProductService.CreateAsync(product) ? Result.Success() : Result.Error("添加失败");
                }
                /// <summary>
                /// 删除
                /// </summary>
                /// <returns></returns>
                [HttpDelete("DeleteById")]
                [Authorize]
                public async Task<Result> DeleteById(int id)
                {
                        Product T = await _ProductService.FindAsync(id);
                        if (T == null) return Result.Error("删除失败，不存在");
                        await UpdateImageFile(T, false);
                        return await _ProductService.DeleteAsync(id) ? Result.Success() : Result.Error("删除失败");
                }
                /// <summary>
                /// 修改
                /// </summary>
                /// <returns></returns>
                [HttpPut("UpdateProduct")]
                [Authorize]
                public async Task<Result> UpdateById(Product product)
                {
                        Product T = await _ProductService.FindAsync(product.Id);
                        if (T == null) return Result.Error("修改失败，不存在");
                        await UpdateImageFile(T, false);
                        await UpdateImageFile(product, true);
                        return await _ProductService.EditAsync(product) ? Result.Success() : Result.Error("修改失败");
                }

                /// <summary>
                /// 修改是否在首页显示
                /// </summary>
                /// <returns></returns>
                [HttpPut("UpdateIsShowOnHome")]
                [Authorize]
                public async Task<Result> UpdateIsShowOnHome(int id ,bool isShow)
                {
                        if (isShow){
                                var list = await _ProductService.QueryAsync(t => t.IsShowOnHome == true);
                                int count = list.Count;
                                if (count >= 6) {
                                        return Result.Error("已超过首页显示的数量");
                                }
                        }
                        Product T = await _ProductService.FindAsync(id);
                        if (T == null) return Result.Error("修改失败，不存在");
                        T.IsShowOnHome = isShow;
                        return await _ProductService.EditAsync(T) ? Result.Success() : Result.Error("修改失败");
                }
                /// <summary>
                /// 查询全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindAll")]
                public async Task<Result> FindAll()
                {
                        List<Product> list = await _ProductService.QueryAsync();
                        return Result.Success(list);
                }
                /// <summary>
                /// 查询全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("GetProductDetail")]
                public async Task<Result> GetProductDetail(int id)
                {
                        Product t = await _ProductService.FindAsync(id);
                        return Result.Success(t);
                }
                /// <summary>
                /// 首页显示的产品
                /// </summary>
                /// <returns></returns>
                [HttpGet("IsShowOnHome")]
                public async Task<Result> IsShowOnHome()
                {
                        List<Product> list = await _ProductService.QueryAsync(t=>t.IsShowOnHome==true);
                        return Result.Success(list);
                }

                /// <summary>
                /// 分页条件查询首页显示的产品
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindIsShowOnHomePage")]
                public async Task<Result> FindIsShowOnHomePage(int page, int size, string keyword = null)
                {
                        RefAsync<int> total = 0;
                        List<Product> list = await _ProductService.FindIsShowOnHomePage(page,size,total,keyword);
                        return Result.Success(list, total);
                }
                /// <summary>
                /// 分页查询全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindAllQueryAsync")]
                public async Task<Result> FindAllQueryAsync(int page,int size)
                {
                        RefAsync<int> total = 0;
                        List<Product> list = await _ProductService.QueryAsync(page,size,total);
                        return Result.Success(list);
                }

                /// <summary>
                /// 分页条件查询
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindManageAllPage")]
                public async Task<Result> FindManageAllPage(int page, int size, string keyword = null, int deviceType = 0)
                {
                        RefAsync<int> total = 0;
                        List<Product> list = await _ProductService.FindManageAllPage(page, size, total,keyword,deviceType);
                        return Result.Success(list,total);
                }

                /// <summary>
                /// 分页查询全部
                /// </summary>
                /// <returns></returns>
                [HttpGet("FindShowOnHome")]
                public async Task<Result> FindShowOnHome()
                {
                        List<Product> list = await _ProductService.QueryAsync(t => t.IsShowOnHome ==true);
                        return Result.Success(list);
                }



                async Task UpdateImageFile(Product product,bool status){
                        if (!string.IsNullOrEmpty(product.ImageUrl1))
                        {
                                await FileExt.UpdateFileUsageStatus(product.ImageUrl1, status);
                        }
                        if (!string.IsNullOrEmpty(product.ImageUrl2))
                        {
                                await FileExt.UpdateFileUsageStatus(product.ImageUrl2, status);
                        }
                        if (!string.IsNullOrEmpty(product.ImageUrl3))
                        {
                                await FileExt.UpdateFileUsageStatus(product.ImageUrl3, status);
                        }
                }
        }
}

