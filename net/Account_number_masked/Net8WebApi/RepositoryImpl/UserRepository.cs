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
    public class UserRepository : BaseRepository<User>, IUserRepository
     {
                public async Task<List<User>> FindAllByPage(int page, int size, RefAsync<int> total, string keyword){
                        return await base.Context.Queryable<User>()
                            .Where(u=>u.Role==0)
                            .WhereIF(!string.IsNullOrEmpty(keyword), u => u.Username.Contains(keyword) || u.AccountNumber.Contains(keyword))
                            .OrderBy(u => u.UserId)
                            .ToPageListAsync(page, size, total);
                }
        }
}
