using System.Collections.Generic;
using System.ComponentModel;
using Traisi.Data;
using Traisi.Data.Models.Surveys;
using Traisi.Data.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Traisi.Helpers;
using Microsoft.EntityFrameworkCore;
using Traisi.Sdk;
using Traisi.Sdk.Attributes;
using Traisi.Sdk.Enums;
using Traisi.Sdk.Interfaces;

namespace Traisi.UnitTests
{
    public class Utility
    {

        /// <summary>
        /// Creates a Moq UnitOfWork object for unit testing
        /// </summary>
        /// <returns></returns>
        public static IUnitOfWork CreateUnitOfWork()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TraisiTestDb")
                .Options;
            var unitOfWork = new UnitOfWork(new ApplicationDbContext(options));
            return unitOfWork;
        }

        public static IConfiguration CreateConfiguration()
        {
            var mock = new Mock<IConfiguration>();
            return mock.Object;
        }

        /// <summary>
        /// Creates a Moq QuestionTypeManager
        /// </summary>
        /// <returns></returns>
        public static IQuestionTypeManager CreateQuestionTypeManager()
        {
            var mock = new Mock<IQuestionTypeManager>();

            Dictionary<string, QuestionTypeDefinition> definitions = new Dictionary<string, QuestionTypeDefinition>();

            var mockSurveyQuestion = new Mock<ISurveyQuestion>();
            mockSurveyQuestion.SetupGet(p => p.TypeName).Returns("TestQuestionType1");
            mockSurveyQuestion.SetupGet(p => p.Icon).Returns("IconType1");

            TypeDescriptor.AddAttributes(mockSurveyQuestion.Object, new QuestionConfigurationAttribute(ConfigurationValueType.Integer)
            {
                Description = "Description",
            });
            var questionAttribute = new SurveyQuestionAttribute(QuestionResponseType.Number)
            {
                CustomBuilderView = null,
            };
            QuestionTypeDefinition definition = new QuestionTypeDefinition(mockSurveyQuestion.Object, questionAttribute);

            // add the definitions
            definitions.Add(definition.TypeName,definition);

            definitions[definition.TypeName] = definition;
            mock.SetupGet(p => p.QuestionTypeDefinitions).Returns(definitions);
            return mock.Object;
        }

        public static ILoggerFactory CreateLoggerFactory()
        {
            return new LoggerFactory();

        }

        /// <summary>
        /// Creates a Moq Survey Repository
        /// </summary>
        /// <returns></returns>
        public static ISurveyRepository CreateSurveyRepository()
        {
            List<Survey> moqSurveys = new List<Survey>() {
                new Survey() {
                    Id = 1,
                    Name = "Test Survey 1",
   //                 Title = "Survey Title",
                    IsActive = true,
                    IsOpen = true
                },
                new Survey() {
                    Id = 2,
                    Name = "Test Survey 2",
               //     Title = "Survey Title",
                    IsActive = true,
                    IsOpen = true
                },new Survey() {
                    Id = 3,
                    Name = "Test Survey 3",
              //      Title = "Survey Title",
                    IsActive = true,
                    IsOpen = true
                },
                new Survey() {
                    Id = 4,
                    Name = "Test Survey 4",
              //      Title = "Survey Title",
                    IsActive = true,
                    IsOpen = true
                }

            };
            var mock = new Mock<ISurveyRepository>();
            mock.Setup(m => m.GetAllAsync()).ReturnsAsync(moqSurveys);
            mock.Setup(m => m.GetAsync(It.IsAny<int>())).
            ReturnsAsync((int i) => moqSurveys.Find(s => s.Id == i));

            mock.Setup(m => m.CountAsync()).ReturnsAsync(moqSurveys.Count);
            mock.Setup(m => m.Update(It.IsAny<Survey>())).Callback<Survey>((s) => moqSurveys.Find(p => p.Id == s.Id));

            return mock.Object;
        }
    }
}
