using IRepository;
using IService;
using Model.EntityMap;
using RepositoryImpl;
using SqlSugar;

namespace ServiceImpl
{
        public class ProductService: BaseService<Product>,IProductService
        {
                private readonly IProductRepository _IProductRepository;
                public ProductService(IProductRepository iProductRepository)
                {
                        base._iBaseRepository = iProductRepository;
                        _IProductRepository = iProductRepository;
                }
                public Task<List<Product>> FindManageAllPage(int page, int size, RefAsync<int> total, string keyword, int deviceType){
                        return _IProductRepository.FindManageAllPage(page, size, total, keyword, deviceType);
                }
                public Task<List<Product>> FindIsShowOnHomePage(int page, int size, RefAsync<int> total, string keyword)
                {
                        return _IProductRepository.FindIsShowOnHomePage(page, size, total, keyword);
                }
        }
}
