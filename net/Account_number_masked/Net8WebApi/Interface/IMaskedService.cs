using Model.EntityMap;
using SqlSugar;

namespace IService
{
        public interface IMaskedService: IBaseService<Masked>
        {
                Task<List<Masked>> FindAll(int userId, int day);
        }
}
