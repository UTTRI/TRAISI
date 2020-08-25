using System.Threading.Tasks;

namespace Traisi.Data.Repositories.Interfaces
{
    public interface IApplicationDbContext
    {
        int SaveChanges();
      
        Task<int> SaveChangesAsync();
        
    }
}