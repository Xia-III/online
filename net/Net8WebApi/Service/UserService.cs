using IRepository;
using IService;
using Model.EntityMap;
using RepositoryImpl;
using SqlSugar;

namespace ServiceImpl
{
        public class UserService: BaseService<User>,IUserService
        {
                private readonly IUserRepository _IUserRepository;
                public UserService(IUserRepository iUserRepository)
                {
                        base._iBaseRepository = iUserRepository;
                        _IUserRepository = iUserRepository;
                }
                public Task<List<User>> FindAllByPage(int page, int size, RefAsync<int> total, string keyword){
                        return _IUserRepository.FindAllByPage( page,  size,  total,  keyword);
                }
        }
}
