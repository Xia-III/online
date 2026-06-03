using Model.EntityMap;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRepository
{
        public interface IUserRepository : IBaseRepository<User>
        {
                Task<List<User>> FindAllByPage(int page, int size, RefAsync<int> total, string keyword);
        }
}
