using IRepository;
using IService;
using Model.EntityMap;
using RepositoryImpl;

namespace ServiceImpl
{
        public class AiRecordService: BaseService<AiRecord>,IAiRecordService
        {
                private readonly IAiRecordRepository _IAiRecordRepository;
                public AiRecordService(IAiRecordRepository iAiRecordRepository)
                {
                        base._iBaseRepository = iAiRecordRepository;
                        _IAiRecordRepository = iAiRecordRepository;
                }
        }
}
