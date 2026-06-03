using Model.EntityMap;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRepository
{
        public interface IMaskedRepository : IBaseRepository<Masked>
        {
                Task<List<Masked>> FindAll(int userId, int day);
        }
}
