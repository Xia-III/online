using IRepository;
using IService;
using Model.EntityMap;
using RepositoryImpl;
using SqlSugar;

namespace ServiceImpl
{
        public class MaskedService: BaseService<Masked>,IMaskedService
        {
                private readonly IMaskedRepository _IMaskedRepository;
                public MaskedService(IMaskedRepository iMaskedRepository)
                {
                        base._iBaseRepository = iMaskedRepository;
                        _IMaskedRepository = iMaskedRepository;
                }
                public  Task<List<Masked>> FindAll(int userId,int day)
                {
                        return _IMaskedRepository.FindAll(userId,day);
                }
        }
}
