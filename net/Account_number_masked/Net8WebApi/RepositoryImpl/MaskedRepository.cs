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
    public class MaskedRepository : BaseRepository<Masked>, IMaskedRepository
     {
                public async Task<List<Masked>> FindAll(int userId, int day)
                {
                        var query = base.Context.Queryable<Masked>();

                        // 根据day参数设置查询条件
                        if (day > 0)
                        {
                                // 查询day天前的记录到现在的记录
                                var startTime = DateTime.Now.AddDays(-day);
                                query = query.Where(m => m.Time >= startTime && m.Time <= DateTime.Now && m.UserId == userId);
                        }
                        else if (day == 0)
                        {
                                // 查询当天的记录
                                var today = DateTime.Now.Date;
                                var tomorrow = today.AddDays(1);
                                query = query.Where(m => m.Time >= today && m.Time < tomorrow && m.UserId == userId);
                        }
                        else {
                                query = query.Where(m => m.UserId == userId);
                        }
                        // day = -1或其他负数时，查询全部记录

                        // 按Time字段降序排列
                        query = query.OrderBy(m => m.Time, OrderByType.Desc);

                        return await query.ToListAsync();
                }
        }
}
