using Model.EntityMap;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRepository
{
        public interface IProductRepository : IBaseRepository<Product>
        {
                Task<List<Product>> FindManageAllPage(int page, int size, RefAsync<int> total, string keyword, int deviceType);
                Task<List<Product>> FindIsShowOnHomePage(int page, int size, RefAsync<int> total, string keyword);
              
        }
}
