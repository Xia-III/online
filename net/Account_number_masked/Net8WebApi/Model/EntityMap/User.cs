using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.EntityMap
{
        [SugarIndex("Unique_AccountNumber", nameof(AccountNumber), OrderByType.Asc, true)]
        /// <summary>
        /// 用户表（系统操作员）
        /// </summary>
        [SugarTable("User")]
        public class User
        {
                /// <summary>
                /// 用户ID（主键，自增）
                /// </summary>
                [SugarColumn(ColumnName = "UserId", IsPrimaryKey = true, IsIdentity = true)]
                public int UserId { get; set; }
                /// <summary>
                /// 账号
                /// </summary>
                [SugarColumn(ColumnName = "AccountNumber", Length = 20, IsNullable = false)]
                public string AccountNumber { get; set; }
                /// <summary>
                /// 昵称（必填，最大长度50）
                /// </summary>
                [SugarColumn(ColumnName = "Username", Length = 50, IsNullable = false)]
                public string Username { get; set; } = "未设置用户名";

                /// <summary>
                /// 密码（必填，加密存储，最大长度100）
                /// </summary>
                [SugarColumn(ColumnName = "Password", Length = 100, IsNullable = false)]
                public string Password { get; set; }

                /// <summary>
                /// 用户角色（必填, 3：系统管理员 2：管理员 1：子账户 0：普通用户）
                /// </summary>
                [SugarColumn(ColumnName = "Role", IsNullable = false)]
                public int Role { get; set; } = 0;//默认为普通用户


                [SugarColumn(Length = 50, IsNullable = false)]
                public int AuthoizeAdminId { get; set; }

                /// <summary>
                /// 账号状态（必填，0:禁用 1:启用）
                /// </summary>
                [SugarColumn(ColumnName = "Status", IsNullable = false)]
                public int Status { get; set; } = 1; // 默认启用

                /// <summary>
                /// 授权时间（默认当前时间）
                /// </summary>
                [SugarColumn(ColumnName = "CreateTime", IsNullable = false)]
                public DateTime CreateTime { get; set; } = DateTime.Now;
        }
}
