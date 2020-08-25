using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Traisi.Data.Repositories.Interfaces
{
    public interface IRepository<TEntity> where TEntity : class
    {
        void Add(TEntity entity);

        Task<EntityEntry<TEntity>> AddAsync(TEntity entity);

        void AddRange(IEnumerable<TEntity> entities);

        void AddRangeAsync(IEnumerable<TEntity> entities);

        void Update(TEntity entity);

        void UpdateRange(IEnumerable<TEntity> entities);

        EntityEntry<TEntity> Remove(TEntity entity);

        void RemoveRange(IEnumerable<TEntity> entities);

        int Count();

        Task<int> CountAsync();

        IEnumerable<TEntity> Find(Expression<Func<TEntity, bool>> predicate);

        Task<List<TEntity>>
        FindAsync(
            Expression<Func<TEntity, bool>> predicate
        );

        TEntity GetSingleOrDefault(Expression<Func<TEntity, bool>> predicate);

        Task<TEntity>
        GetSingleOrDefaultAsync(
            Expression<Func<TEntity, bool>> predicate
        );

        TEntity Get(int id);

        Task<TEntity> GetAsync(int id);

        IEnumerable<TEntity> GetAll();

        Task<IEnumerable<TEntity>> GetAllAsync();
    }
}
