using Model.EntityMap;
using SqlSugar;
using System.Diagnostics;

namespace SqlSugarTest
{
        internal class Program
        {
                static void Main(string[] args)
                {
                        try
                        {
                                //创建数据库对象 (用法和EF Dappper一样通过new保证线程安全)
                                SqlSugarClient Db = new SqlSugarClient(new ConnectionConfig()
                                {
                                        ConnectionString = "server=DESKTOP-F00G9BK\\SQL;uid=sa;pwd=123456;database=SqlSugar;Encrypt=True;TrustServerCertificate=True;",
                                        DbType = DbType.SqlServer,
                                        IsAutoCloseConnection = true
                                },
                                db => {

                                        db.Aop.OnLogExecuting = (sql, pars) =>
                                        {

                                                //获取原生SQL推荐 5.1.4.63  性能OK
                                                Console.WriteLine(UtilMethods.GetNativeSql(sql, pars));

                                                //获取无参数化SQL 对性能有影响，特别大的SQL参数多的，调试使用
                                                //Console.WriteLine(UtilMethods.GetSqlString(DbType.SqlServer,sql,pars))


                                        };

                                        //注意多租户 有几个设置几个
                                        //db.GetConnection(i).Aop

                                });
                                ////生成实体类
                                //Db.DbFirst.CreateClassFile("G:\\UnityP\\进阶\\Net8WebApi\\Model\\EntityMap");
                                int count = Db.Queryable<Log>().Count();
                                Console.WriteLine(count);

                        }
                        catch (Exception)
                        {
                                throw;
                        }
                }
        }
}
