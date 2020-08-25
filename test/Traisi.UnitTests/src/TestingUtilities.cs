using System.Security.Claims;
using System.Threading.Tasks;
using Traisi.Data;
using Traisi.Data.Core.Interfaces;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Moq;
using System.Collections.Generic;
using Traisi.Data.Models.Questions;
using Microsoft.AspNetCore.SignalR;
using Traisi.Helpers;

namespace Traisi.Testing
{
    public class TestingUtilities
    {



        /// <summary>
        /// Gets a Mocked SurveyRepository
        /// </summary>
        /// <returns></returns>
        public static ISurveyRepository GetSurveyRepository()
        {
            var mock = new Mock<ISurveyRepository>();
            mock.Setup(p => p.Get(1)).Returns(new Survey() { Name = "Test Survey" });

            mock.Setup(s => s.GetSurveyWithUserPermissionsAsync(1, "test")).Returns(Task.FromResult(new Survey() { Name = "Test Survey" }));

            return mock.Object;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public static IAuthorizationService GetAuthorizationService()
        {
            var mock = new Mock<IAuthorizationService>();
            mock.Setup(p => p.AuthorizeAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<object>(), It.IsAny<IEnumerable<IAuthorizationRequirement>>())).Returns(Task.FromResult(AuthorizationResult.Success()));

            return mock.Object;

        }

        public static IHubContext<NotifyHub> GetNotificationHub()
        {
            var mock = new Mock<IHubContext<NotifyHub>>();
            return mock.Object;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public static IAccountManager GetAccountManager()
        {
            var mock = new Mock<IAccountManager>();
            return mock.Object;
        }

        /// <summary>
        /// Creates and initializes a list of test survey objects with relevent test data created.
        /// </summary>
        /// <returns></returns>
        public static IList<ISurvey> GetTestSurveys()
        {
            IList<ISurvey> testSurveys = new List<ISurvey>();

            var testSurvey1 = new Survey()
            {
               // Title = "Test Survey 1",
                Id = 1,
                Name = "Test Survey Name 1",
                CreatedDate = new System.DateTime()
            };
            var testSurvey2 = new Survey()
            {
              //  Title = "Test Survey 2",
                Id = 2,
                Name = "Test Survey Name 2",
                CreatedDate = new System.DateTime()
            };
            var testSurvey3 = new Survey()
            {
           //     Title = "Test Survey 3",
                Id = 3,
                Name = "Test Survey Name 3",
                CreatedDate = new System.DateTime()
            };

            testSurveys.Add(testSurvey1);
            testSurveys.Add(testSurvey2);
            testSurveys.Add(testSurvey3);

            //survey view for first survay
            var surveyView1 = new SurveyView();
            surveyView1.Id = 1;
            testSurvey1.SurveyViews.Add(surveyView1);

            //2nd survey view for first sturvey
            var surveyView2 = new SurveyView();
            surveyView2.Id = 2;
            testSurvey1.SurveyViews.Add(surveyView2);

            var surveyView3 = new SurveyView();
            surveyView3.Id = 3;
            testSurvey2.SurveyViews.Add(surveyView3);

            //third survey has no survey views

            return testSurveys;
        }

        /// <summary>
        /// Adds test question definitions to the list of passed surveys
        /// </summary>
        /// <param name="surveys"></param>
        public static void BuildTestSurveyQuestions(IList<ISurvey> surveys)
        {

        }
    }
}