namespace TRAISI.ViewModels
{
    public class SurveyStartViewModel
    {
        public int Id { get; set; }

        public string WelcomeText { get; set; }

        public string TitleText { get; set; }

        public int[] SurveyViews { get; set; }

        public bool HasGroupCodes {get;set;}

    }
}