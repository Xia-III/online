using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Model.EntityMap
{
        public class Authority
        {
                [SugarColumn(IsPrimaryKey = true, IsIdentity = true)]
                public int Id { get; set; }
                [SugarColumn(Length = 50, IsNullable = false)]
                public string DatasetsId { get; set; }

                [SugarColumn(Length = 50, IsNullable = false)]
                public string DatasetsName { get; set; }

                [SugarColumn(Length = 12, IsNullable = true)]
                public int AdministratorId { get; set; }
        }
}
