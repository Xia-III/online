using SqlSugar;
using System;

namespace Model.EntityMap
{
        [SugarTable("AiRecord")] // 指定数据库中的表名
        public class AiRecord
        {
               
                [SugarColumn(ColumnName = "userId", Length = 50, IsNullable = false)]
                public string UserId { get; set; }

                [SugarColumn(ColumnName = "dialogueId", Length = 50, IsNullable = true)]
                public string DialogueId { get; set; }
        }
}