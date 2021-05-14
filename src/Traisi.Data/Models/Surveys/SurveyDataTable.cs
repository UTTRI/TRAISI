using System.Collections.Generic;

namespace Traisi.Data.Models.Surveys
{
    public class SurveyDataTable
    {
        public int Id {get;set;}

        public List<string> ColumnNames {get;set;}

        public List<string> RowNames {get;set;}

        public string Name {get;set;}

        public Survey Survey{get;set;}


    }
}