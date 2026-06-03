using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.EntityDto
{
        public class UserDto
        {
                public int UserId { get; set; }
                public string AccountNumber { get; set; }
                public string Username { get; set; }
                public int Role { get; set; } = 0;//默认为普通用户
                public int Status { get; set; } = 1; // 默认启
        }
}
