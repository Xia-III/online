using Model.EntityMap;
using SqlSugar;

namespace IService
{
        public interface IUserService: IBaseService<User>
        {
                Task<List<User>> FindAllByPage(int page, int size, RefAsync<int> total, string keyword);
        }
}
