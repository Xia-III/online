using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.EntityMap
{
        [SugarIndex("Unique_Username", nameof(Username), OrderByType.Asc, true)]
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
                /// 用户名（必填，唯一约束，最大长度50）
                /// </summary>
                [SugarColumn(ColumnName = "Username", Length = 50, IsNullable = false)]
                public string Username { get; set; } = "未设置用户名";

                /// <summary>
                /// 密码（必填，加密存储，最大长度100）
                /// </summary>
                [SugarColumn(ColumnName = "Password", Length = 100, IsNullable = false)]
                public string Password { get; set; }

                /// <summary>
                /// 用户头像地址
                /// </summary>
                [SugarColumn(ColumnName = "UserPic", Length = 100, IsNullable = true)]
                public string? UserPic { get; set; }
                /// <summary>
                /// 用户邮箱
                /// </summary>
                [SugarColumn(ColumnName = "Email", Length = 30, IsNullable = true)]
                public string? Email { get; set; }
                /// <summary>
                /// 用户角色（必填, 1：管理员  0：普通用户）
                /// </summary>
                [SugarColumn(ColumnName = "Role", IsNullable = false)]
                public int Role { get; set; } = 0;//默认为普通用户

                /// <summary>
                /// 账号状态（必填，0:禁用 1:启用）
                /// </summary>
                [SugarColumn(ColumnName = "Status", IsNullable = false)]
                public int Status { get; set; } = 1; // 默认启用
        }
}
