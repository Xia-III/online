using IRepository;
using IService;
using Model.EntityMap;
using RepositoryImpl;

namespace ServiceImpl
{
        public class FileRecordService: BaseService<FileRecord>,IFileRecordService
        {
                private readonly IFileRecordRepository _IFileRecordRepository;
                public FileRecordService(IFileRecordRepository iFileRecordRepository)
                {
                        base._iBaseRepository = iFileRecordRepository;
                        _IFileRecordRepository = iFileRecordRepository;
                }
        }
}
