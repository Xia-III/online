using Model.EntityMap;
using SqlSugar;

namespace IService
{
        public interface IProductService: IBaseService<Product>
        {
                Task<List<Product>> FindManageAllPage(int page, int size, RefAsync<int> total, string keyword, int deviceType);
                Task<List<Product>> FindIsShowOnHomePage(int page, int size, RefAsync<int> total, string keyword);
        }
}
