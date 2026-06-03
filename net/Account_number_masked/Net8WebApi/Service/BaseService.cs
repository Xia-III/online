using Azure;
using IRepository;
using IService;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace ServiceImpl
{
        public class BaseService<TEntity> : IBaseService<TEntity> where TEntity : class, new()
        {
                protected IBaseRepository<TEntity> _iBaseRepository;

                public Task<bool> CreateAsync(TEntity entity)
                {
                        return _iBaseRepository.CreateAsync(entity);
                }

                public Task<bool> DeleteAsync(int id)
                {
                        return _iBaseRepository.DeleteAsync(id);
                }

                public Task<bool> EditAsync(TEntity entity)
                {
                        return _iBaseRepository.EditAsync(entity);
                }
                /// <summary>
                /// 修改实体，忽略空字段
                /// </summary>
                public bool UpdataIgnoreNull(TEntity entity)
                {
                        return _iBaseRepository.UpdataIgnoreNull(entity);
                }
                public Task<TEntity> FindAsync(int id)
                {
                        return _iBaseRepository.FindAsync(id);
                }
                public Task<List<TEntity>> FuzzyQueryAsync(string fieldName, string keyword){
                        return _iBaseRepository.FuzzyQueryAsync(fieldName, keyword);
                }
                public Task<List<TEntity>> FuzzyQueryAsync(string fieldName, string keyword, int page, int size, RefAsync<int> total){
                        return _iBaseRepository.FuzzyQueryAsync(fieldName, keyword, page,size,total);
                }
                public Task<TEntity> FindAsync(Expression<Func<TEntity, bool>> func)
                {
                        return _iBaseRepository.FindAsync( func);
                }

                public Task<List<TEntity>> QueryAsync()
                {
                        return _iBaseRepository.QueryAsync();
                }

                public Task<List<TEntity>> QueryAsync(Expression<Func<TEntity, bool>> func)
                {
                        return _iBaseRepository.QueryAsync(func);
                }

                public Task<List<TEntity>> QueryAsync(int page, int size, RefAsync<int> total)
                {
                        return _iBaseRepository.QueryAsync(page, size, total);
                }

                public Task<List<TEntity>> QueryAsync(Expression<Func<TEntity, bool>> func, int page, int size, RefAsync<int> total)
                {
                        return _iBaseRepository.QueryAsync(func, page, size, total);
                }
                public Task<TProperty> SumAsync<TProperty>(Expression<Func<TEntity, TProperty>> selector) where TProperty : struct
                {
                        return _iBaseRepository.SumAsync(selector);
                }
                public Task<TProperty> SumAsync<TProperty>(Expression<Func<TEntity, bool>> func, Expression<Func<TEntity, TProperty>> selector) where TProperty : struct
                {
                        return _iBaseRepository.SumAsync(func,selector);
                }
        }
}
