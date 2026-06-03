using SqlSugar;
using System;

namespace Model.EntityMap
{
        /// <summary>
        /// 文件记录表
        /// </summary>
        [SugarTable("FileRecord")] // 指定数据库表名
        public class FileRecord
        {
                /// <summary>
                /// 主键ID（自增）
                /// </summary>
                [SugarColumn(IsPrimaryKey = true, IsIdentity = true)]
                public int Id { get; set; }

                /// <summary>
                /// 文件名（最大长度255）
                /// </summary>
                /// 
                [SugarColumn(ColumnName = "FileName", Length = 255, IsNullable = false)]
                public string FileName { get; set; }
                /// <summary>
                ///标识号（账号或者文档id）
                /// </summary>
                [SugarColumn(ColumnName = "SegmentId", Length = 255, IsNullable = true)]
                public string? SegmentId { get; set; }
                /// <summary>
                /// 是否被使用（默认false）
                /// </summary>
                [SugarColumn(ColumnName = "IsUsed", Length = 30, IsNullable = false)]
                public bool IsUsed { get; set; } = false;
                /// <summary>
                /// 是否被压缩（默认false）
                /// </summary>
                [SugarColumn(ColumnName = "IsCompress", Length = 30, IsNullable = false)]
                public bool IsCompress { get; set; } = false;
                /// <summary>
                /// 上传时间（默认当前时间）
                /// </summary>
                [SugarColumn(ColumnName = "UploadTime", IsNullable = false)]
                public DateTime UploadTime { get; set; } = DateTime.Now;
        }
}