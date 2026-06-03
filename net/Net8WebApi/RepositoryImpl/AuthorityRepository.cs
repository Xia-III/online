using IRepository;
using Model.EntityMap;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RepositoryImpl
{
    public class AuthorityRepository : BaseRepository<Authority>, IAuthorityRepository
    {
                public async Task<List<Authority>> FindManageAllPage(int page, int size, RefAsync<int> total, string keyword, int administratorId)
                {
                        return await base.Context.Queryable<Authority>()
                            .Where(a => a.AdministratorId == administratorId)
                            .WhereIF(!string.IsNullOrEmpty(keyword), a => a.DatasetsName.Contains(keyword))
                            .OrderBy(a => a.Id)
                            .ToPageListAsync(page, size, total);
                }
        }
}
