using IRepository;
using IService;
using Model.EntityMap;
using RepositoryImpl;
using SqlSugar;

namespace ServiceImpl
{
        public class AuthorityService: BaseService<Authority>,IAuthorityService
        {
                private readonly IAuthorityRepository _IAuthorityRepository;
                public AuthorityService(IAuthorityRepository iAuthorityRepository)
                {
                        base._iBaseRepository = iAuthorityRepository;
                        _IAuthorityRepository = iAuthorityRepository;
                }
                public Task<List<Authority>> FindManageAllPage(int page, int size, RefAsync<int> total, string keyword, int administratorId){
                        return _IAuthorityRepository.FindManageAllPage(page,size,total,keyword, administratorId);
                }
        }
}
