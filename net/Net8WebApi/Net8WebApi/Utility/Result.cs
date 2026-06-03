using Microsoft.AspNetCore.Http;
using SqlSugar;

namespace Net8WebApi.Utility
{
        public  class Result
        {
                public int Code { get; set; }
                public string Msg { get; set; }
                public int? Total { get; set; }
                public dynamic Data { get; set; }

                public static Result Success( )
                {
                        return new Result
                        {
                                Code = 0,
                                Data = null,
                                Msg = "操作成功",
                                Total = null
                        };
                }
                public static Result Success(dynamic data)
                {
                        return new Result
                        {
                                Code = 0,
                                Data = data,
                                Msg = "操作成功",
                                Total = null
                        };
                }
                public static Result Success(dynamic data, string msg)
                {
                        return new Result
                        {
                                Code = 0,
                                Data = data,
                                Msg = msg,
                                Total = null
                        };
                }
                public static Result Success(dynamic data, RefAsync<int> total)
                {
                        return new Result
                        {
                                Code = 0,
                                Data = data,
                                Msg = "操作成功",
                                Total = total
                        };
                }
                public static Result Error(string msg)
                {
                        return new Result
                        {
                                Code = 1,
                                Data = null,
                                Msg = msg,
                                Total = null
                        };
                }
        }
}
