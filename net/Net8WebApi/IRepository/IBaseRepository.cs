using Model.EntityMap;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace IRepository
{
        public interface IBaseRepository<TEntity> where TEntity : class, new()
        {
                Task<bool> CreateAsync(TEntity entity);//创建实体
                Task<bool> DeleteAsync(int id);//删除实体
                Task<bool> EditAsync(TEntity entity);//修改实体
                /// <summary>
                /// 修改实体，忽略空字段
                /// </summary>
                bool UpdataIgnoreNull(TEntity entity);
                Task<TEntity> FindAsync(int id);//根据id查询实体
                /// <summary>
                /// 根据字段模糊查询
                /// </summary>
                /// <param name="fieldName"></param>
                /// <param name="keyword"></param>
                /// <returns></returns>
                Task<List<TEntity>> FuzzyQueryAsync(string fieldName, string keyword);
                /// <summary>
                /// 根据字段模糊查询并分页
                /// </summary>
                /// <param name="fieldName"></param>
                /// <param name="keyword"></param>
                /// <param name="page"></param>
                /// <param name="size"></param>
                /// <param name="total"></param>
                /// <returns></returns>
                Task<List<TEntity>> FuzzyQueryAsync(string fieldName, string keyword, int page, int size, RefAsync<int> total);
                Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> func);//查询多个实体

                /// <summary>
                /// 查询全部的数据
                /// </summary>
                /// <returns></returns>
                Task<List<TEntity>> QueryAsync();
                /// <summary>
                /// 自定义条件查询
                /// </summary>
                /// <param name="func"></param>
                /// <returns></returns>
                Task<List<TEntity>> QueryAsync(Expression<Func<TEntity, bool>> func);
                /// <summary>
                /// 分页查询
                /// </summary>
                /// <param name="page"></param>
                /// <param name="size"></param>
                /// <param name="total"></param>
                /// <returns></returns>
                Task<List<TEntity>> QueryAsync(int page, int size, RefAsync<int> total);
                /// <summary>
                /// 自定义条件分页查询
                /// </summary>
                /// <param name="func"></param>
                /// <param name="page"></param>
                /// <param name="size"></param>
                /// <param name="total"></param>
                /// <returns></returns>
                Task<List<TEntity>> QueryAsync(Expression<Func<TEntity, bool>> func, int page, int size, RefAsync<int> total);
                /// <summary>
                /// 查询字段总和
                /// </summary>
                /// <typeparam name="TProperty"></typeparam>
                /// <param name="selector"></param>
                /// <returns></returns>
                Task<TProperty> SumAsync<TProperty>(Expression<Func<TEntity, TProperty>> selector) where TProperty : struct;
                /// <summary>
                /// 自定义条件查询字段总和
                /// </summary>
                /// <typeparam name="TProperty"></typeparam>
                /// <param name="func"></param>
                /// <param name="selector"></param>
                /// <returns></returns>
                Task<TProperty> SumAsync<TProperty>(Expression<Func<TEntity, bool>> func, Expression<Func<TEntity, TProperty>> selector) where TProperty : struct;

        }
}
