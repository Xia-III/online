using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.EntityDto
{
        public class UserDtotwo
        {
                public int UserId { get; set; }
                public string AccountNumber { get; set; }
                public string Username { get; set; }
                public string Password { get; set; }
                public int AuthoizeAdminId { get; set; }
                public int Role { get; set; } = 0;//默认为普通用户
                public int Status { get; set; } = 1; // 默认启
                public DateTime CreateTime { get; set; } = DateTime.Now;
                public int MaskedCount { get; set; } = 0;
        }
 }
