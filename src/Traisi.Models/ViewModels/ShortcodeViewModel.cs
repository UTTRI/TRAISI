using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Traisi.ViewModels
{
    public class ShortcodeViewModel
    {
        public int Id { get; set; }
        public int SurveyId { get; set; }
        public string Respondent { get; set; }
        public string Code { get; set; }
        public Boolean IsTest { get; set; }
        public DateTime CreatedDate { get; set; }
    }

}