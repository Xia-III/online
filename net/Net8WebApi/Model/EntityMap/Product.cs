using SqlSugar;
using System;

namespace Model.EntityMap
{
        /// <summary>
        /// 产品表
        /// </summary>
        [SugarTable("Product")]
        public class Product
        {
                /// <summary>
                /// 主键ID（自增）
                /// </summary>
                [SugarColumn(IsPrimaryKey = true, IsIdentity = true)]
                public int Id { get; set; }

                /// <summary>
                /// 产品名称（最大长度200）
                /// </summary>
                [SugarColumn(ColumnName = "ProductName", Length = 200, IsNullable = false)]
                public string ProductName { get; set; }

                /// <summary>
                /// 图片路径1（最大长度500）
                /// </summary>
                [SugarColumn(ColumnName = "ImageUrl1", Length = 500, IsNullable = true)]
                public string? ImageUrl1 { get; set; }

                /// <summary>
                /// 图片路径2（最大长度500）
                /// </summary>
                [SugarColumn(ColumnName = "ImageUrl2", Length = 500, IsNullable = true)]
                public string? ImageUrl2 { get; set; }

                /// <summary>
                /// 图片路径3（最大长度500）
                /// </summary>
                [SugarColumn(ColumnName = "ImageUrl3", Length = 500, IsNullable = true)]
                public string? ImageUrl3 { get; set; }

                /// <summary>
                /// 产品类型（1：扭蛋机、2：娃娃机、 3：游戏机、4：兑币机、5：糖果机、6：礼品机、7：盲盒机、8：捞鱼机、9夹子机、10弹珠机、 11.中岛机）
                /// </summary>
                [SugarColumn(ColumnName = "device_type")]
                public int DeviceType { get; set; }

                /// <summary>
                /// 产品功率
                /// </summary>
                [SugarColumn(ColumnName = "power", IsNullable = true)]
                public int Power { get; set; } 

                /// <summary>
                /// 产品尺寸（例如：10x20x30 cm，最大长度100）
                /// </summary>
                [SugarColumn(ColumnName = "Size", Length = 100, IsNullable = false)]
                public string Size { get; set; }

                /// <summary>
                /// 产品重量（千克，保留两位小数）
                /// </summary>
                [SugarColumn(ColumnName = "weight", DecimalDigits = 2, IsNullable = true)]
                public decimal? Weight { get; set; }

                /// <summary>
                /// 支付方式（1.投币 2.纸钞 4.扫码 8.网上支付，15种组合1~15）
                /// </summary>
                [SugarColumn(ColumnName = "payment_type")]
                public int PaymentType { get; set; }

                /// <summary>
                /// 是否在首页展示（默认false）
                /// </summary>
                [SugarColumn(ColumnName = "IsShowOnHome", Length = 30, IsNullable = false)]
                public bool IsShowOnHome { get; set; } = false;
        }
}