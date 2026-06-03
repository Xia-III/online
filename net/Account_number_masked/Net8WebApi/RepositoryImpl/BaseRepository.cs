using Model;
using SqlSugar;
using SqlSugar.IOC;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Model.EntityMap;
using IRepository;
using Dm;
using Newtonsoft.Json.Linq;

namespace RepositoryImpl
{
        public class BaseRepository<TEntity> : SimpleClient<TEntity>, IBaseRepository<TEntity> where TEntity : class, new()
        {
                public BaseRepository(ISqlSugarClient context = null) : base(context)
                {
                        base.Context = DbScoped.Sugar;
                        //// 创建数据库
                        //base.Context.DbMaintenance.CreateDatabase();
                        //创建表
                        base.Context.CodeFirst.InitTables(
                          typeof(User),
                          typeof(Masked)
                          );
                }
                public async Task<bool> CreateAsync(TEntity entity)
                {
                        return await base.InsertAsync(entity);
                }
                public async Task<bool> DeleteAsync(int id)
                {
                        return await base.DeleteByIdAsync(id);
                }


                public async Task<bool> EditAsync(TEntity entity)
                {
                        return await base.UpdateAsync(entity);
                }
                public bool UpdataIgnoreNull(TEntity entity) { 
                        return  base.Context.Updateable(entity).IgnoreColumns(ignoreAllNullColumns: true).ExecuteCommand() > 0;
                }
                //导航查询
                public virtual async Task<TEntity> FindAsync(int id)
                {
                        return await base.GetByIdAsync(id);
                }

                public async Task<List<TEntity>> FuzzyQueryAsync(string fieldName, string keyword)
                {
                        // 验证字段是否存在且为字符串类型
                        var property = typeof(TEntity).GetProperty(fieldName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                        if (property == null || property.PropertyType != typeof(string))
                        {
                                throw new ArgumentException($"字段 {fieldName} 不存在或不是字符串类型");
                        }

                        // 动态构建表达式：it => SqlFunc.Contains(it.FieldName, keyword)
                        var parameter = Expression.Parameter(typeof(TEntity), "it");
                        var propertyAccess = Expression.Property(parameter, property);
                        var constant = Expression.Constant(keyword);
                        var containsMethod = typeof(SqlFunc).GetMethod("Contains", new[] { typeof(string), typeof(string) });
                        var containsCall = Expression.Call(containsMethod, propertyAccess, constant);
                        var lambda = Expression.Lambda<Func<TEntity, bool>>(containsCall, parameter);

                        return await base.Context.Queryable<TEntity>().Where(lambda).ToListAsync();
                }
                public async Task<List<TEntity>> FuzzyQueryAsync(string fieldName, string keyword, int page, int size, RefAsync<int> total)
                {
                        // 参数校验
                        if (page < 1) throw new ArgumentException("页码不能小于1", nameof(page));
                        if (size < 1) throw new ArgumentException("每页数量不能小于1", nameof(size));

                        // 字段验证
                        var property = typeof(TEntity).GetProperty(fieldName,
                            BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);

                        if (property == null || property.PropertyType != typeof(string))
                        {
                                throw new ArgumentException($"字段 {fieldName} 不存在或不是字符串类型");
                        }

                        // 构建表达式树
                        var parameter = Expression.Parameter(typeof(TEntity), "it");
                        var propertyAccess = Expression.Property(parameter, property);
                        var constant = Expression.Constant(keyword);

                        // 使用 SqlFunc.Contains 构建模糊条件
                        var containsMethod = typeof(SqlFunc).GetMethod("Contains", new[] { typeof(string), typeof(string) });
                        var containsCall = Expression.Call(containsMethod, propertyAccess, constant);
                        var lambda = Expression.Lambda<Func<TEntity, bool>>(containsCall, parameter);

                        // 执行分页查询
                        return await base.Context.Queryable<TEntity>()
                            .Where(lambda)
                            .ToPageListAsync(page, size, total);
                }

                public async Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> func)
                {
                        return await base.GetSingleAsync(func);
                }

                public virtual async Task<List<TEntity>> QueryAsync()
                {
                        return await base.GetListAsync();
                }

                public virtual async Task<List<TEntity>> QueryAsync(Expression<Func<TEntity, bool>> func)
                {
                        return await base.GetListAsync(func);
                }

                public virtual async Task<List<TEntity>> QueryAsync(int page, int size, RefAsync<int> total)
                {
                        return await base.Context.Queryable<TEntity>()
                          .ToPageListAsync(page, size, total);
                }

                public virtual async Task<List<TEntity>> QueryAsync(Expression<Func<TEntity, bool>> func, int page, int size, RefAsync<int> total)
                {
                        return await base.Context.Queryable<TEntity>()
                          .Where(func)
                          .ToPageListAsync(page, size, total);
                }
                public virtual async Task<TProperty> SumAsync<TProperty>(Expression<Func<TEntity, TProperty>> selector)where TProperty : struct
                {
                        return await base.Context.Queryable<TEntity>() .SumAsync(selector);
                }
                public virtual async Task<TProperty> SumAsync<TProperty>(Expression<Func<TEntity, bool>> func, Expression<Func<TEntity, TProperty>> selector)where TProperty:struct
                {
                        return await base.Context.Queryable<TEntity>().Where(func).SumAsync(selector);
                }

        }
}
