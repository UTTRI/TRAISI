using System;
using Traisi.Services;
using Xunit;
using Moq;
using Traisi.Data.Models.Surveys;
using Traisi.Data;
using Traisi.Data.Models.Questions;
using Traisi.Helpers;
using Traisi.Sdk.Interfaces;

namespace Traisi.UnitTests.Services
{
    public class QuestionTypeManagerTests
    {

        private IQuestionTypeManager _questions;
        public QuestionTypeManagerTests()
        {
            this._questions = Utility.CreateQuestionTypeManager();
        }

        [Fact]
        public void Test_ListQuestionSlots()
        {
            
        }


    }
}