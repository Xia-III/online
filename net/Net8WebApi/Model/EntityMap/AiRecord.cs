using SqlSugar;
using System;

namespace Model.EntityMap
{
        [SugarTable("AiRecord")] // 指定数据库中的表名
        public class AiRecord
        {

                /// <summary>
                /// 主键ID（自增）
                /// </summary>
                [SugarColumn(IsPrimaryKey = true, IsIdentity = true)]
                public int Id { get; set; }

                [SugarColumn(ColumnName = "userId", Length = 50, IsNullable = false)]
                public string UserId { get; set; }

                [SugarColumn(ColumnName = "dialogueId", Length = 50, IsNullable = true)]
                public string DialogueId { get; set; }

                /// <summary>
                /// 上传时间（默认当前时间）
                /// </summary>
                [SugarColumn(ColumnName = "createTime", IsNullable = false)]
                public DateTime CreateTime { get; set; } = DateTime.Now;
        }
}