using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Traisi.Data.Models;
using Traisi.Data.Models.Questions;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Models.Extensions;

namespace Traisi.Data.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class LabelRepository : Repository<Label>, ILabelRepository
    {
        public LabelRepository(ApplicationDbContext context) : base(context) { }

        private ApplicationDbContext _appContext => (ApplicationDbContext)_context;

    }
}