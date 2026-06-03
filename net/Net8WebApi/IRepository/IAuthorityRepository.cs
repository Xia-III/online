using Model.EntityDto;
using Model.EntityMap;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRepository
{
    public interface IAuthorityRepository: IBaseRepository<Authority>
    {
               Task<List<Authority>>FindManageAllPage(int page, int size, RefAsync<int> total, string keyword,int administratorId);
        }
}
