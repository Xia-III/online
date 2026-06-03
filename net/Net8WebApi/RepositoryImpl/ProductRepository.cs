using IRepository;
using Model.EntityMap;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RepositoryImpl
{
    public class ProductRepository : BaseRepository<Product>, IProductRepository
     {
                public async Task<List<Product>> FindManageAllPage(int page, int size, RefAsync<int> total, string keyword, int deviceType)
                {
                        return await base.Context.Queryable<Product>()
                            .WhereIF(deviceType != 0, t => t.DeviceType == deviceType)
                            .WhereIF(!string.IsNullOrEmpty(keyword), t => t.ProductName.Contains(keyword))
                            .OrderBy(t => t.Id)
                            .ToPageListAsync(page, size, total);
                }
                public async Task<List<Product>> FindIsShowOnHomePage(int page, int size, RefAsync<int> total, string keyword)
                {
                        return await base.Context.Queryable<Product>()
                            .Where(t => t.IsShowOnHome ==true)
                            .WhereIF(!string.IsNullOrEmpty(keyword), t => t.ProductName.Contains(keyword))
                            .OrderBy(t => t.Id)
                            .ToPageListAsync(page, size, total);
                }
        }
}
