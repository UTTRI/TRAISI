using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Models;
using DAL.Models.Surveys;
using DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.IO;


namespace DAL.Repositories
{
    public class WelcomePageLabelsRepository : Repository<WelcomePageLabel>, IWelcomePageLabelsRepository 
    {
        public WelcomePageLabelsRepository(ApplicationDbContext context) : base(context) { }

        public WelcomePageLabelsRepository(DbContext context) : base(context) { }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

    }
}