using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Traisi.ViewModels
{
    public class ApiKeysViewModel
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string MapBoxApiKey { get; set; }
        public string GoogleMapsApiKey { get; set; }
        public string MailgunApiKey { get; set; }
    }
}
