using Model.EntityMap;
using SqlSugar;

namespace IService
{
        public interface IAuthorityService: IBaseService<Authority>
        {
                Task<List<Authority>> FindManageAllPage(int page, int size, RefAsync<int> total, string keyword, int administratorId);
        }
}
