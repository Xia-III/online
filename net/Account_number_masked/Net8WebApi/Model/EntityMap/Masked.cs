using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.EntityMap
{
        public class Masked
        {
                [SugarColumn(IsPrimaryKey = true, IsIdentity = true)]
                public int Id { get; set; }

                [SugarColumn(Length = 50, IsNullable = false)] 
                public int AdminId { get; set; }

                [SugarColumn(Length = 50, IsNullable = false)]
                public int UserId { get; set; }

                /// <summary>
                /// 码
                /// </summary>
                [SugarColumn(ColumnName = "Code", Length = 10, IsNullable = false)]
                public string Code { get; set; }
                /// <summary>
                /// 解码时间（默认当前时间）
                /// </summary>
                [SugarColumn(ColumnName = "Time", IsNullable = false)]
                public DateTime Time { get; set; } = DateTime.Now;
        }
}
