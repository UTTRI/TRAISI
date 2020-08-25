using System;
using Xunit;
using Moq;
using Traisi.Data.Models.Surveys;
using Traisi.Data;
using Traisi.Data.Models.Questions;
using System.Collections.Generic;
using System.Linq;
using Org.BouncyCastle.Bcpg.OpenPgp;
using Traisi.Services;
using Traisi.Services.Interfaces;
using Traisi.Data.Models.Extensions;

namespace Traisi.UnitTests.Services
{
    public class SurveyBuilderServiceUnitTests : IDisposable
    {
        private ISurveyBuilderService _surveyBuilderService;

        public SurveyBuilderServiceUnitTests()
        {
            this._surveyBuilderService = new SurveyBuilderService(Utility.CreateUnitOfWork(), Utility.CreateQuestionTypeManager());
        }



        [Fact]
        public void TestAddSurveyView()
        {
            Survey survey = new Survey()
            {
                //     Title = "Test Survey",
            };
            Assert.True(survey.SurveyViews.Count == 0);
            var view = this._surveyBuilderService.AddSurveyView(survey, "View 1");
            Assert.True(survey.SurveyViews.Count == 1);
            Assert.True(view.ViewName == "View 1");
            view = this._surveyBuilderService.AddSurveyView(survey, "View 2");
            Assert.True(view.ViewName == "View 2");
            Assert.True(survey.SurveyViews.Count == 2);
        }

        [Fact]
        public void TestRemoveSurveyView()
        {
            Survey survey = new Survey()
            {
                //     Title = "Test Survey",

            };
            Assert.True(survey.SurveyViews.Count == 0);
            var view = this._surveyBuilderService.AddSurveyView(survey, "View 1");
            Assert.True(survey.SurveyViews.Count == 1);
            this._surveyBuilderService.RemoveSurveyView(survey, view.Id);
            Assert.True(survey.SurveyViews.Count == 0);
        }

        [Fact]
        public void AddSurveyLogic_ReturnsSingleSurveyLogic()
        {
            /*
            Survey survey = new Survey();
            SurveyLogic logic1 = new SurveyLogic()
            {
                Id = 1,
                ValidationMessages = new List<SurveyLogicLabel> {
                    new SurveyLogicLabel() {
                       Value="ValidationMessage1"}
                },
                Condition = SurveyLogicCondition.And,
                Expressions = new List<SurveyLogic> {
                    new SurveyLogic() {
                        Id = 1,
                        Operator = SurveyLogicOperator.Equals,
                        Value = "TestValue1"
                    }
                }
            };
            this._surveyBuilderService.AddSurveyLogic(survey, logic1);
            Assert.Equal(survey.SurveyLogic.First(), logic1); */
        }

        [Fact]
        public void UpdateSurveyLogic_WithNewChildren_AddsCorrectly()
        {
            Survey survey = new Survey();
            SurveyLogic logic1 = new SurveyLogic()
            {
                Id = 1,
                ValidationMessages = new LabelCollection<Label>()
            };
            logic1.ValidationMessages["en"].Value = "Logic1";
            this._surveyBuilderService.AddSurveyLogic(survey, logic1);

            SurveyLogic logic1Update = new SurveyLogic()
            {
                Id = 1,
                ValidationMessages = new LabelCollection<Label>()
            };
            logic1Update.ValidationMessages["en"].Value = "Logic1Update";
            logic1Update.Expressions.Add(new SurveyLogic()
            {
                Id = 2,
                ValidationMessages = new LabelCollection<Label>()
            });
            logic1Update.Expressions.Add(new SurveyLogic()
            {
                Id = 3,
                ValidationMessages = new LabelCollection<Label>()
            });
            this._surveyBuilderService.UpdateSurveyLogic(survey, logic1Update);


            Assert.Equal("Logic1Update", survey.SurveyLogic.First().ValidationMessages["en"].Value);
            Assert.Collection(survey.SurveyLogic.First().Expressions, (logic) =>
            {
                Assert.Equal(2, logic.Id);
            },
                (logic) =>
                {
                    Assert.Equal(3, logic.Id);
                });


        }

        [Fact]
        public void UpdateSurveyLogic_RemovesChild_RemovesCorrectly()
        {
            Survey survey = new Survey();
            SurveyLogic logic1 = new SurveyLogic()
            {
                Id = 1,
                ValidationMessages = new LabelCollection<Label>()
            };
            logic1.ValidationMessages["en"].Value = "Logic1";
            this._surveyBuilderService.AddSurveyLogic(survey, logic1);

            SurveyLogic logic1Update = new SurveyLogic()
            {
                Id = 1,
                ValidationMessages = new LabelCollection<Label>()
            };
            logic1Update.ValidationMessages["en"].Value = "Logic1Update";
            logic1Update.Expressions.Add(new SurveyLogic()
            {
                Id = 2,
                ValidationMessages = new LabelCollection<Label>()
            });
            logic1Update.Expressions.Add(new SurveyLogic()
            {
                Id = 3,
                ValidationMessages = new LabelCollection<Label>()
            });

            logic1Update.Expressions.First().Expressions.Add(new SurveyLogic()
            {
                Id = 4,
                ValidationMessages = new LabelCollection<Label>()
            });

            this._surveyBuilderService.UpdateSurveyLogic(survey, logic1Update);

            // remove ID 2

            SurveyLogic logic2Update = new SurveyLogic()
            {
                Id = 1,
                ValidationMessages = new LabelCollection<Label>()
            };
            logic2Update.ValidationMessages["en"].Value = "Logic3Update";
            logic2Update.Expressions.Add(new SurveyLogic()
            {
                Id = 3,
                ValidationMessages = new LabelCollection<Label>()
            });

            logic2Update.Expressions.First().Expressions.Add(new SurveyLogic()
            {
                Id = 4,
                ValidationMessages = new LabelCollection<Label>()
            });
            this._surveyBuilderService.UpdateSurveyLogic(survey, logic2Update);
            Assert.Collection(survey.SurveyLogic.First().Expressions,
                (logic) =>
                {
                    Assert.Equal(3, logic.Id);
                    Assert.Collection(logic.Expressions, (logic2) =>
                    {
                        Assert.Equal(4, logic2.Id);
                    });
                });

        }

        [Fact]
        public void AddAndRemoveSurveyLogic_ReturnsEmptySurveyLogic()
        {
            /*Survey survey = new Survey();
            SurveyLogic logic1 = new SurveyLogic()
            {
                Id = 1,
                ValidationMessages = new List<SurveyLogicLabel> {
                    new SurveyLogicLabel() {
                       Value="ValidationMessage1"}
                },
                Condition = SurveyLogicCondition.And,
                Expressions = new List<SurveyLogic> {
                    new SurveyLogic() {
                        Id = 1,
                        Operator = SurveyLogicOperator.Equals,
                        Value = "TestValue1"
                    }
                }
            };
            SurveyLogic logic2 = new SurveyLogic()
            {
                Id = 2,
                ValidationMessages = new List<SurveyLogicLabel> {
                    new SurveyLogicLabel() {
                       Value="ValidationMessage1"}
                },
                Condition = SurveyLogicCondition.And,
                Expressions = new List<SurveyLogic> {
                    new SurveyLogic() {
                        Id = 2,
                        Operator = SurveyLogicOperator.Equals,
                        Value = "TestValue1"
                    }
                }
            };
            this._surveyBuilderService.AddSurveyLogic(survey, logic1);
            this._surveyBuilderService.AddSurveyLogic(survey, logic2);
            Assert.Equal(survey.SurveyLogic.Count, 2);
            this._surveyBuilderService.RemoveSurveyLogic(survey, logic1);
            Assert.Equal(survey.SurveyLogic.Count, 1);
            //remove same survey logic (should have no effect)
            this._surveyBuilderService.RemoveSurveyLogic(survey, logic1);
            Assert.Equal(survey.SurveyLogic.Count, 1);
            this._surveyBuilderService.RemoveSurveyLogic(survey, logic2);
            Assert.Empty(survey.SurveyLogic); */
        }

        /// <summary>
        /// Cleanup, teardown after each test
        /// </summary>
        public void Dispose()
        {

        }


    }


}