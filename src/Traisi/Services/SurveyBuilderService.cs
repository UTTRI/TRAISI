using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Http;
using Traisi.Data;
using Traisi.Data.Core;
using Traisi.Data.Models.Extensions;
using Traisi.Data.Models.Questions;
using Traisi.Data.Models.Surveys;
using Traisi.Helpers;
using Traisi.Sdk;
using Traisi.Sdk.Interfaces;
using Traisi.Services.Interfaces;

namespace Traisi.Services
{
    /// <summary>
    /// Service for building surveys.
    /// </summary>
    public class SurveyBuilderService : ISurveyBuilderService
    {
        private IUnitOfWork _unitOfWork;

        private IQuestionTypeManager _questions;

        /// <summary>
        ///

        /// </summary>
        /// <param name="unitOfWork"></param>
        /// <param name="questions"></param>
        public SurveyBuilderService(
            IUnitOfWork unitOfWork,
            IQuestionTypeManager questions
        )
        {
            this._unitOfWork = unitOfWork;
            this._questions = questions;
        }

        /// <summary>
        /// Adds a new view to the specified survey
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="viewName"></param>
        public SurveyView AddSurveyView(Survey survey, string viewName)
        {
            // ensure view doesn't already exist with that name
            var surveyView =
                survey
                    .SurveyViews
                    .Where(s => s.ViewName == viewName)
                    .FirstOrDefault();

            if (surveyView == null)
            {
                surveyView = new SurveyView() { ViewName = viewName };
                survey.SurveyViews.Add (surveyView);
            }

            return surveyView;
        }

        /// <summary>
        /// Removes the specified view from the targetted survey
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="id"></param>
        public void RemoveSurveyView(Survey survey, int id)
        {
            survey
                .SurveyViews
                .Remove(survey.SurveyViews.Single(s => s.Id == id));
        }

        public void DuplicateSurveyViewStructure(
            SurveyView sourceView,
            SurveyView targetView,
            string language
        )
        {
            bool structureExists = true;
            bool structureAndLanguageExists = false;

            //deal with base labels (welcome, t&c, thank you)
            if (targetView.WelcomePageLabels == null)
            {
                structureExists = false;
                targetView.WelcomePageLabels = new LabelCollection<Label>();
                targetView.TermsAndConditionsLabels =
                    new LabelCollection<Label>();
                targetView.ThankYouPageLabels = new LabelCollection<Label>();
            }
            else if (targetView.WelcomePageLabels[language] != null)
            {
                structureAndLanguageExists = true;
            }

            if (!structureAndLanguageExists)
            {
                targetView.WelcomePageLabels[language] =
                    new Label { Value = null };
                targetView.TermsAndConditionsLabels[language] =
                    new Label { Value = null };
                targetView.ThankYouPageLabels[language] =
                    new Label { Value = null };

                // if structure exists, just create new labels under the language
                if (structureExists)
                {
                    foreach (var sourcePage in sourceView.QuestionPartViews)
                    {
                        var page = sourcePage.CATIDependent;
                        page.Labels[language] =
                            new Label {
                                Value = sourcePage.Labels[language].Value
                            };
                        foreach (var question in page.QuestionPartViewChildren)
                        {
                            question.Labels[language] =
                                new Label { Value = null };
                            question.DescriptionLabels[language] =
                                new Label { Value = null };
                            foreach (var
                                subQuestion
                                in
                                question.QuestionPartViewChildren
                            )
                            {
                                subQuestion.Labels[language] =
                                    new Label { Value = null };
                                subQuestion.DescriptionLabels[language] =
                                    new Label { Value = null };
                            }
                        }
                    }
                }
                else
                {
                    foreach (var page in sourceView.QuestionPartViews)
                    {
                        QuestionPartView targetPage =
                            new QuestionPartView {
                                Order = page.Order,
                                Icon = page.Icon
                            };
                        page.CATIDependent = targetPage;
                        targetView.QuestionPartViews.Add (targetPage);
                        targetPage.Labels[language] =
                            new Label { Value = page.Labels[language].Value };
                        foreach (var question in page.QuestionPartViewChildren)
                        {
                            QuestionPartView targetQuestion =
                                new QuestionPartView {
                                    Order = question.Order,
                                    IsOptional = question.IsOptional,
                                    IsHousehold = question.IsHousehold,
                                    RepeatSource = question.RepeatSource,
                                    QuestionPart = question.QuestionPart
                                };
                            question.CATIDependent = targetQuestion;
                            targetPage.QuestionPartViewChildren.Add (
                                targetQuestion
                            );
                            targetQuestion.Labels[language] =
                                new Label { Value = null };
                            targetQuestion.DescriptionLabels[language] =
                                new Label { Value = null };
                            foreach (var
                                subQuestion
                                in
                                question.QuestionPartViewChildren
                            )
                            {
                                QuestionPartView targetSubQuestion =
                                    new QuestionPartView {
                                        Order = subQuestion.Order,
                                        IsOptional = subQuestion.IsOptional,
                                        RepeatSource = subQuestion.RepeatSource,
                                        QuestionPart = subQuestion.QuestionPart
                                    };
                                subQuestion.CATIDependent = targetSubQuestion;
                                targetQuestion.QuestionPartViewChildren.Add (
                                    targetSubQuestion
                                );
                                targetSubQuestion.Labels[language] =
                                    new Label { Value = null };
                                targetSubQuestion.DescriptionLabels[language] =
                                    new Label { Value = null };
                            }
                        }
                    }
                }
            }
        }

        public bool
        DeleteCATITranslation(SurveyView surveyView, string language)
        {
            if (
                surveyView
                    .WelcomePageLabels
                    .Where(l => l.Language == language)
                    .Any()
            )
            {
                surveyView
                    .WelcomePageLabels
                    .RemoveWhere(l => l.Language == language);
                surveyView
                    .TermsAndConditionsLabels
                    .RemoveWhere(l => l.Language == language);
                surveyView
                    .ThankYouPageLabels
                    .RemoveWhere(l => l.Language == language);
                foreach (var page in surveyView.QuestionPartViews)
                {
                    page.Labels.RemoveWhere(l => l.Language == language);
                    foreach (var question in page.QuestionPartViewChildren)
                    {
                        question
                            .Labels
                            .RemoveWhere(l => l.Language == language);
                        foreach (var
                            subQuestion
                            in
                            question.QuestionPartViewChildren
                        )
                        {
                            subQuestion
                                .Labels
                                .RemoveWhere(l => l.Language == language);
                        }
                    }
                }
            }
            return surveyView.WelcomePageLabels.Any();
        }

        /// <summary>
        /// Sets a configuration value for the specified question part
        /// </summary>
        /// <param name="questionPart"></param>
        /// <param name="name"></param>
        /// <param name="value"></param>
        public QuestionConfiguration
        SetQuestionConfiguration(
            QuestionPart questionPart,
            string name,
            object value
        )
        {
            var configuration =
                questionPart
                    .QuestionConfigurations
                    .SingleOrDefault(c => c.Name == name);

            if (configuration == null)
            {
                var valueType =
                    this
                        ._questions
                        .QuestionTypeDefinitions[questionPart.QuestionType]
                        .QuestionConfigurations[name]
                        .ValueType;
                QuestionConfiguration qc =
                    new QuestionConfiguration()
                    {
                        Name = name,
                        Value = value == null ? null : value.ToString(),
                        ValueType = valueType
                    };
                questionPart.QuestionConfigurations.Add (qc);
                return qc;
            }

            configuration.Value = value == null ? null : value.ToString();
            return configuration;
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="qpv"></param>
        /// <param name="text"></param>
        /// <param name="language"></param>
        public void SetQuestionPartViewLabel(
            QuestionPartView qpv,
            string text,
            string language = null
        )
        {
            qpv.Labels[language] =
                new Label() { Language = language ?? "en", Value = text };
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="qpv"></param>
        /// <param name="text"></param>
        /// <param name="language"></param>
        public void SetQuestionPartViewDescriptionLabel(
            QuestionPartView qpv,
            string text,
            string language = null
        )
        {
            qpv.DescriptionLabels[language] =
                new Label() { Language = language ?? "en", Value = text };
        }

        public void UpdateQuestionPartViewOptions(
            QuestionPartView qpv,
            bool isOptional,
            bool isHousehold,
            string repeatSourceQuestionName,
            int repeatSourceQuestionId,
            string icon
        )
        {
            if (qpv.IsHousehold && repeatSourceQuestionName != null)
            {
                throw new ArgumentException("Section cannot be both marked as household and repeat");
            }
            qpv.IsHousehold = isHousehold;
            qpv.IsOptional = isOptional;

            if (repeatSourceQuestionId > 0 )
            {
                int sourceQuestionId =
                    repeatSourceQuestionId;
                qpv.RepeatSource =
                    this._unitOfWork.QuestionParts.Get(sourceQuestionId);
            }
            else
            {
                qpv.RepeatSource = null;
            }
            qpv.Icon = icon;
        }

        public void UpdateQuestionPartName(
            int surveyId,
            QuestionPart qp,
            string newName
        )
        {
            //name update doesn't require any other updates (with part ID being used for question reference)
            if (qp != null)
            {
                if (
                    this
                        ._unitOfWork
                        .Surveys
                        .QuestionNameIsUnique(surveyId, newName, qp.Name)
                )
                {
                    qp.Name = newName;
                }
                else
                {
                    throw new ArgumentException("Question name must be unique.");
                }
            }
        }

        /// <summary>
        /// Sets a question option value on the specified question part. If langauge is null then the default label is used, otherwise

        /// the value data is set on the matched langauge label.
        /// </summary>
        /// <param name="questionPart"></param>
        /// <param name="name"></param>
        /// <param name="value"></param>
        /// <param name="language"></param>
        public QuestionOption
        SetQuestionOptionLabel(
            QuestionPart questionPart,
            int id,
            string code,
            string name,
            string value,
            string language = null
        )
        {
            var option =
                questionPart.QuestionOptions.SingleOrDefault(o => o.Id == id);
            if (option != null)
            {
                if (language == null)
                {
                    language = option.QuestionOptionLabels.First().Language;
                }

                // replace code if different and unique from other codes
                if (option.Code != code)
                {
                    var allCodes =
                        questionPart.QuestionOptions.Select(o => o.Code);
                    if (!allCodes.Contains(code))
                    {
                        option.Code = code;
                    }
                    else
                    {
                        throw new ArgumentException("Cannot have duplicate options!");
                    }
                }
                var optionLabel =
                    option
                        .QuestionOptionLabels
                        .FirstOrDefault(v => v.Language == language);
                if (optionLabel == null)
                {
                    option
                        .QuestionOptionLabels
                        .Add(new Label()
                        {
                            Language = language,
                            Value = value
                            // QuestionOption = option
                        });
                }
                else
                {
                    var allLabels =
                        questionPart
                            .QuestionOptions
                            .Where(q => q.Name == name && q.Id != id)
                            .SelectMany(o =>
                                o
                                    .QuestionOptionLabels
                                    .Where(q => q.Language == language)
                                    .Select(l => l.Value));
                    if (!allLabels.Contains(value))
                    {
                        optionLabel.Value = value;
                    }
                    else
                    {
                        throw new ArgumentException("Cannot have duplicate options");
                    }
                }

                return option;
            }
            else
            {
                return this
                    .AddQuestionOption(questionPart,
                    code,
                    name,
                    value,
                    language);
            }
        }

        /// <summary>
        /// Imports options into question part from stream
        /// </summary>
        /// <param name="questionPart">Question part</param>
        /// <param name="name">Option Group Name</param>
        /// <param name="language"></param>
        /// <param name="fileStream">File stream of csv file</param>
        /// <returns></returns>
        public List<(string, string, string)>
        ImportQuestionOptions(
            QuestionPart questionPart,
            string name,
            string language,
            IFormFile file
        )
        {
            try
            {
                //check if the option has a value / allows multiple
                List<(string, string, string)> errorList =
                    new List<(string, string, string)>();

                var definition =
                    this
                        ._questions
                        .QuestionTypeDefinitions[questionPart.QuestionType];

                if (definition != null)
                {
                    if (definition.QuestionOptions.Keys.Contains(name))
                    {
                        int startOptionOrderIndex =
                            questionPart
                                .QuestionOptions
                                .Count(o => o.Name == name);

                        IEnumerable<QuestionOptionData> optionData;
                        using (
                            var fileStream =
                                new StreamReader(file.OpenReadStream())
                        )
                        {
                            var reader =
                                new CsvReader(fileStream,
                                    CultureInfo.InvariantCulture);
                            reader
                                .Configuration
                                .RegisterClassMap<QuestionOptionMap>();
                            reader.Configuration.PrepareHeaderForMatch = (
                                string header,
                                int index
                            ) => Regex.Replace(header, @"\s", string.Empty);
                            optionData =
                                reader
                                    .GetRecords<QuestionOptionData>()
                                    .ToList();
                        }

                        // get unique codes from input list
                        var allCodes =
                            questionPart.QuestionOptions.Select(o => o.Code);

                        var importCodes =
                            optionData.Select(o => o.Code).ToList();
                        var duplicateImportCodes =
                            importCodes
                                .GroupBy(c => c)
                                .Where(g => g.Count() > 1)
                                .Select(c => c.Key)
                                .ToList();

                        var duplicateCodes =
                            importCodes
                                .Intersect(allCodes)
                                .Union(duplicateImportCodes)
                                .ToList();

                        // get unique labels from input list for question option group
                        var allLabels =
                            questionPart
                                .QuestionOptions
                                .Where(q => q.Name == name)
                                .SelectMany(o =>
                                    o
                                        .QuestionOptionLabels
                                        .Where(q => q.Language == language)
                                        .Select(l => l.Value));

                        var importLabels =
                            optionData.Select(o => o.Label).ToList();
                        var duplicateImportLabels =
                            importLabels
                                .GroupBy(c => c)
                                .Where(g => g.Count() > 1)
                                .Select(c => c.Key)
                                .ToList();

                        var duplicateLabels =
                            importLabels
                                .Intersect(allLabels)
                                .Union(duplicateImportLabels)
                                .ToList();

                        foreach (var option in optionData)
                        {
                            bool duplicateCode =
                                duplicateCodes.Contains(option.Code);
                            bool duplicateLabel =
                                duplicateLabels.Contains(option.Label);
                            if (duplicateCode || duplicateLabel)
                            {
                                string reason =
                                    duplicateCode && duplicateLabel
                                        ? "Duplicate option"
                                        : (
                                        duplicateCode
                                            ? "Duplicate Code"
                                            : "Duplicate Label"
                                        );
                                errorList
                                    .Add((option.Code, option.Label, reason));
                            }
                            else
                            {
                                var newOption =
                                    new QuestionOption()
                                    {
                                        Name = name,
                                        Code = option.Code,
                                        Order = startOptionOrderIndex++,
                                        QuestionOptionLabels =
                                            new LabelCollection<Label>()
                                            {
                                                new Label()
                                                {
                                                    Language = language ?? "en",
                                                    Value = option.Label
                                                }
                                            }
                                    };
                                if (
                                    definition
                                        .QuestionOptions[name]
                                        .IsMultipleAllowed
                                )
                                {
                                    questionPart.QuestionOptions.Add (
                                        newOption
                                    );
                                }
                                else if (newOption.Order == 0)
                                {
                                    questionPart.QuestionOptions.Add (
                                        newOption
                                    );
                                }
                                else
                                {
                                    throw new InvalidOperationException("Cannot assign new question option, remove first.");
                                }
                            }
                        }
                    }
                    else
                    {
                        throw new ArgumentException("Question Option does not exist for this question type.");
                    }
                }
                else
                {
                    throw new ArgumentException("Question Type does not exist.");
                }
                return errorList;
            }
            catch (ValidationException exception)
            {
                if (exception.Message.StartsWith("Header"))
                {
                    throw new ArgumentException("Error in CSV file.  Must contain 'Code' and 'Label' header row");
                }
                else
                {
                    throw new Exception("Error during import");
                }
            }
        }

        public class QuestionOptionData
        {
            public string Code { get; set; }

            public string Label { get; set; }
        }

        public sealed class QuestionOptionMap : ClassMap<QuestionOptionData>
        {
            public QuestionOptionMap()
            {
                Map(m => m.Code).Name("Code", "code").Index(0);
                Map(m => m.Label)
                    .Name("Value", "value", "Label", "label")
                    .Index(1);
            }
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="part"></param>
        /// <param name="name"></param>
        /// <param name="language"></param>
        public QuestionOption
        AddQuestionOption(
            QuestionPart part,
            string code,
            string name,
            string value,
            string language = null
        )
        {
            //check if the option has a value / allows multiple
            var definition =
                this._questions.QuestionTypeDefinitions[part.QuestionType];
            if (definition != null)
            {
                if (definition.QuestionOptions.Keys.Contains(name))
                {
                    //ensure code hasn't been used already
                    var allCodes = part.QuestionOptions.Select(o => o.Code);
                    if (allCodes.Contains(code))
                    {
                        throw new ArgumentException("Cannot have duplicate options");
                    }

                    var allLabels =
                        part
                            .QuestionOptions
                            .Where(q => q.Name == name)
                            .SelectMany(o =>
                                o
                                    .QuestionOptionLabels
                                    .Where(q => q.Language == language)
                                    .Select(l => l.Value));
                    if (allLabels.Contains(value))
                    {
                        throw new ArgumentException("Cannot have duplicate options");
                    }
                    var newOption =
                        new QuestionOption()
                        {
                            Name = name,
                            Code = code,
                            Order =
                                part.QuestionOptions.Count(o => o.Name == name),
                            QuestionOptionLabels =
                                new LabelCollection<Label>()
                                {
                                    new Label()
                                    {
                                        Language = language ?? "en",
                                        Value = value
                                    }
                                }
                        };
                    if (definition.QuestionOptions[name].IsMultipleAllowed)
                    {
                        part.QuestionOptions.Add (newOption);
                    }
                    else if (newOption.Order == 0)
                    {
                        part.QuestionOptions.Add (newOption);
                    }
                    else
                    {
                        throw new InvalidOperationException("Cannot assign new question option, remove first.");
                    }
                    return newOption;
                }
                else
                {
                    throw new ArgumentException("Question Option does not exist for this question type.");
                }
            }
            else
            {
                throw new ArgumentException("Question Type does not exist.");
            }
        }

        /// <summary>
        /// Removes a set question option from the specified question part
        /// </summary>
        /// <param name="part"></param>
        /// <param name="name"></param>
        /// <param name="language">Null to remove all instances, otherwise remove a specific label</param>
        public void RemoveQuestionOption(
            QuestionPart part,
            int optionId,
            string language = null
        )
        {
            var option =
                part.QuestionOptions.SingleOrDefault(c => c.Id == optionId);
            bool removed = false;
            if (language == null)
            {
                part.QuestionOptions.Remove (option);
                removed = true;
            }
            else
            {
                option?
                    .QuestionOptionLabels
                    .Remove(option
                        .QuestionOptionLabels
                        .SingleOrDefault(v => v.Language == language));
                if (option?.QuestionOptionLabels.Count == 0)
                {
                    part.QuestionOptions.Remove (option);
                    removed = true;
                }
            }

            //Update order if fully removed
            if (removed)
            {
                foreach (var remainingOption in part.QuestionOptions)
                {
                    if (remainingOption.Order > option.Order)
                    {
                        remainingOption.Order--;
                    }
                }
            }
        }

        public void ReOrderOptions(
            QuestionPart part,
            List<QuestionOption> newOrder
        )
        {
            Dictionary<int, int> newOrderDict =
                newOrder.ToDictionary(r => r.Id, r => r.Order);
            foreach (var option in part.QuestionOptions)
            {
                if (newOrderDict.ContainsKey(option.Id))
                {
                    option.Order = newOrderDict[option.Id];
                }
            }
        }

        /// <summary>
        /// Removes a configuration value (resets to default) from the specified QuestionPart.
        /// </summary>
        /// <param name="part"></param>
        /// <param name="name"></param>
        public void RemoveQuestionConfiguration(QuestionPart part, string name)
        {
            part
                .QuestionConfigurations
                .Remove(part
                    .QuestionConfigurations
                    .SingleOrDefault(c => c.Name == name));
        }

        /// <summary>
        /// Retrieves the list of question configurations associated with this question part. Only values that differ
        /// from default values will be returned (default values are not stored).
        /// </summary>
        /// <param name="questionPart"></param>
        /// <returns></returns>
        public IEnumerable<QuestionConfiguration>
        GetQuestionConfigurations(QuestionPart questionPart)
        {
            return questionPart.QuestionConfigurations;
        }

        /// <summary>
        /// Returns the set of question options associated with this question part.
        /// </summary>
        /// <param name="questionPart"></param>
        /// <param name="language">Specify a main label language</param>
        /// <returns></returns>
        public IEnumerable<QuestionOption>
        GetQuestionOptions(QuestionPart questionPart, string language = null)
        {
            return questionPart.QuestionOptions;
        }

        /// <summary>
        /// Adds a page to a survey
        /// </summary>
        /// <param name="view"></param>
        /// <param name="newPage"></param>
        public void AddSurveyPage(SurveyView view, QuestionPartView newPage)
        {
            view.QuestionPartViews.Add (newPage);
            newPage.Order = view.QuestionPartViews.Count - 1;
        }

        /// <summary>
        /// Removes a page from a survey
        /// </summary>
        /// <param name="view"></param>
        /// <param name="pageId"></param>
        public void RemoveSurveyPage(SurveyView view, int pageId)
        {
            List<QuestionPartView> pages =
                view.QuestionPartViews as List<QuestionPartView>;
            QuestionPartView toDelete = null;
            int pageIndex = Int32.MaxValue;
            for (int i = 0; i < pages.Count; i++)
            {
                if (pages[i].Order > pageIndex)
                {
                    pages[i].Order--;
                }
                else if (pages[i].Id == pageId)
                {
                    toDelete = pages[i];
                    pageIndex = toDelete.Order;
                }
            }

            //remove children question part views (to trigger question part deletes)
            var pageData =
                this
                    ._unitOfWork
                    .QuestionPartViews
                    .GetQuestionPartViewWithStructure(toDelete.Id);
            var childIds =
                pageData.QuestionPartViewChildren.Select(q => q.Id).ToList();
            childIds
                .ForEach(id =>
                    this.RemoveQuestionPartView(pageData, id, false));
            view.QuestionPartViews.Remove (toDelete);

            if (toDelete.CATIDependent != null)
            {
                var catiView =
                    this
                        ._unitOfWork
                        .SurveyViews
                        .GetSurveyViewWithPagesStructure(view.SurveyId, "CATI");
                this.RemoveSurveyPage(catiView, toDelete.CATIDependent.Id);
            }
        }

        public void ReOrderPages(
            SurveyView view,
            List<QuestionPartView> newOrder
        )
        {
            Dictionary<int, int> newOrderDict =
                newOrder.ToDictionary(r => r.Id, r => r.Order);
            foreach (var qpartView in view.QuestionPartViews)
            {
                qpartView.Order = newOrderDict[qpartView.Id];
            }
        }

        /// <summary>
        /// Adds a question to a page/question part
        /// </summary>
        /// <param name="view"></param>
        /// <param name="newPage"></param>
        public void AddQuestionPartView(
            QuestionPartView ParentQuestionPartView,
            QuestionPartView ChildQuestionPartView
        )
        {
            //update orders for existing questions
            foreach (var
                question
                in
                ParentQuestionPartView.QuestionPartViewChildren
            )
            {
                if (question.Order >= ChildQuestionPartView.Order)
                {
                    question.Order++;
                }
            }
            ParentQuestionPartView.QuestionPartViewChildren.Add (
                ChildQuestionPartView
            );
        }

        /// <summary>
        /// Removes a question/question part from a survey
        /// </summary>
        /// <param name="questionPartView"></param>
        /// <param name="childQuestionPartViewId"></param>
        public void RemoveQuestionPartView(
            QuestionPartView questionPartView,
            int childQuestionPartViewId,
            bool transfer
        )
        {
            if (questionPartView != null)
            {
                var childQuestions =
                    questionPartView
                        .QuestionPartViewChildren
                        .OrderBy(q => q.Order);
                QuestionPartView toDelete = null;
                int questionIndex = Int32.MaxValue;
                foreach (var childQuestion in childQuestions)
                {
                    if (childQuestion.Order > questionIndex)
                    {
                        childQuestion.Order--;
                    }
                    else if (childQuestion.Id == childQuestionPartViewId)
                    {
                        toDelete = childQuestion;
                        questionIndex = toDelete.Order;
                    }
                }
                questionPartView.QuestionPartViewChildren.Remove (toDelete);

                //delete question part if no other part and not a transfer
                if (toDelete.QuestionPart != null && !transfer)
                {
                    int priorParentViewCount =
                        this
                            ._unitOfWork
                            .QuestionParts
                            .GetNumberOfParentViews(toDelete.QuestionPart.Id);
                    if (priorParentViewCount == 1)
                    {
                        this
                            ._unitOfWork
                            .QuestionParts
                            .Remove(toDelete.QuestionPart);
                    }
                }
                else if (toDelete.QuestionPart == null && !transfer)
                {
                    //repeat for children (calling recursively)
                    var deleteStructure =
                        this
                            ._unitOfWork
                            .QuestionPartViews
                            .GetQuestionPartViewWithStructure(toDelete.Id);
                    var children =
                        deleteStructure.QuestionPartViewChildren.ToList();
                    foreach (var child in children)
                    {
                        this.RemoveQuestionPartView(toDelete, child.Id, false);
                    }
                }
                if (toDelete.CATIDependent != null)
                {
                    this
                        .RemoveQuestionPartView(questionPartView.CATIDependent,
                        toDelete.CATIDependent.Id,
                        transfer);
                }
            }
        }

        /// <summary>
        /// Reorder question within question part
        /// </summary>
        /// <param name="questionPartView"></param>
        /// <param name="newOrder"></param>
        public void ReOrderQuestions(
            QuestionPartView questionPartView,
            List<QuestionPartView> newOrder
        )
        {
            Dictionary<int, int> newOrderDict =
                newOrder.ToDictionary(r => r.Id, r => r.Order);
            foreach (var qpartView in questionPartView.QuestionPartViewChildren)
            {
                qpartView.Order = newOrderDict[qpartView.Id];
            }
        }

        /// <summary>
        /// Cleans up conditionals, removing any that are invalid (source question now after original)
        /// </summary>
        /// <param name="modifiedViews"></param>
        public void ValidateConditionals(
            SurveyView structure,
            int questionPartViewMovedId
        )
        {
            List<int> questionPartIdsBefore = new List<int>();
            List<int> questionPartIdsAfter = new List<int>();

            int questionPartId = 0;

            bool foundQuestion = false;

            structure
                .QuestionPartViews
                .OrderBy(q => q.Order)
                .ToList()
                .ForEach(page =>
                {
                    page
                        .QuestionPartViewChildren
                        .OrderBy(q => q.Order)
                        .ToList()
                        .ForEach(firstLayerQuestion =>
                        {
                            if (firstLayerQuestion.QuestionPart != null)
                            {
                                if (
                                    firstLayerQuestion.Id ==
                                    questionPartViewMovedId
                                )
                                {
                                    foundQuestion = true;
                                    questionPartId =
                                        firstLayerQuestion.QuestionPart.Id;
                                }
                                else
                                {
                                    if (!foundQuestion)
                                    {
                                        questionPartIdsBefore
                                            .Add(firstLayerQuestion
                                                .QuestionPart
                                                .Id);
                                    }
                                    else
                                    {
                                        questionPartIdsAfter
                                            .Add(firstLayerQuestion
                                                .QuestionPart
                                                .Id);
                                    }
                                }
                            }
                            else
                            {
                                firstLayerQuestion
                                    .QuestionPartViewChildren
                                    .OrderBy(q => q.Order)
                                    .ToList()
                                    .ForEach(secondLayerQuestion =>
                                    {
                                        if (
                                            secondLayerQuestion.Id ==
                                            questionPartViewMovedId
                                        )
                                        {
                                            foundQuestion = true;
                                            questionPartId =
                                                secondLayerQuestion
                                                    .QuestionPart
                                                    .Id;
                                        }
                                        else
                                        {
                                            if (!foundQuestion)
                                            {
                                                questionPartIdsBefore
                                                    .Add(secondLayerQuestion
                                                        .QuestionPart
                                                        .Id);
                                            }
                                            else
                                            {
                                                questionPartIdsAfter
                                                    .Add(secondLayerQuestion
                                                        .QuestionPart
                                                        .Id);
                                            }
                                        }
                                    });
                            }
                        });
                });

            // call repository functions to remove conditionals that don't belong for the specific question
            // this._unitOfWork.QuestionConditionals.ValidateSourceConditionals(questionPartId, questionPartIdsAfter);
            this
                ._unitOfWork
                .QuestionOptionConditionals
                .ValidateSourceConditionals(questionPartId,
                questionPartIdsAfter);

            //this._unitOfWork.QuestionConditionals.ValidateTargetConditionals(questionPartId, questionPartIdsBefore);
            this
                ._unitOfWork
                .QuestionOptionConditionals
                .ValidateTargetConditionals(questionPartId,
                questionPartIdsBefore);
        }

        /// <summary>
        /// Adds a question part to the specified SurveyView - this creates a new QuestionPartView from the part
        /// </summary>
        /// <param name="view"></param>
        /// <param name="part"></param>
        /// <param name="position">0-index order, position of the qustion</param>
        /// <returns>A reference to the created QuestionPartView</returns>
        public QuestionPartView
        AddQuestionPart(
            SurveyView view,
            QuestionPart part,
            QuestionTypeDefinition definition,
            int position = -1
        )
        {
            QuestionPartView questionPartView =
                new QuestionPartView { QuestionPart = part };
            if (position >= 0)
            {
                questionPartView.Order = position;
                (view.QuestionPartViews as List<QuestionPartView>)?
                    .Insert(position, questionPartView);
            }
            else
            {
                (view.QuestionPartViews as List<QuestionPartView>)?
                    .Add(questionPartView);
                questionPartView.Order = view.QuestionPartViews.Count - 1;
            }

            return questionPartView;
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="part"></param>
        /// <param name="definition"></param>
        public void AddQuestionPartChild(
            QuestionPart part,
            QuestionTypeDefinition definition
        )
        {
            part.QuestionType = definition.TypeName;
            part.QuestionPartChildren.Add (part);
        }

        /// <summary>
        /// Sets a survey title for the specified language.
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="title"></param>
        /// <param name="language"></param>
        public void SetSurveyTitle(Survey survey, string title, string language)
        {
            survey.TitleLabels[language] =
                new Label { Language = language, Value = title };
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="question"></param>
        /// <param name="conditionalOperator"></param>
        public void UpdateQuestionConditionals(
            QuestionPartView question,
            QuestionConditionalOperator[] conditionalOperators
        )
        {
            return;
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="view"></param>
        /// <param name="part"></param>
        /// <param name="definition"></param>
        /// <param name="position"></param>
        public QuestionPartView
        AddQuestion(
            SurveyView view,
            QuestionTypeDefinition definition,
            int position = -1
        )
        {
            QuestionPartView qpv = new QuestionPartView();

            return qpv;
        }

        public void SetQuestionConditionals(
            QuestionPart question,
            List<QuestionConditional> conditionals
        )
        {
        }

        /// <summary>
        /// Removes a survey logic instance from the associated survey.
        /// </summary>
        /// <param name="survey"></param>
        /// <param name="logic"></param>
        public async Task RemoveSurveyLogic(Survey survey, SurveyLogic logic)
        {
            survey
                .SurveyLogic
                .Remove(survey.SurveyLogic.Find(x => x.Id == logic.Id));
            this._unitOfWork.SurveyLogic.Remove(logic);
            await this._unitOfWork.SaveChangesAsync();
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="survey"></param>
        /// <param name="logic"></param>
        public async Task AddSurveyLogic(Survey survey, SurveyLogic logic)
        {
            this._unitOfWork.DbContext.Update(survey);
            if (!survey.SurveyLogic.Select(x => x.Id).Contains(logic.Id))
            {
                survey.SurveyLogic.Add (logic);
            }
            else
            {
            }
            await this._unitOfWork.SaveChangesAsync();
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="survey"></param>
        /// <param name="logic"></param>
        /// <returns></returns>
        public async Task UpdateSurveyLogic(Survey survey, SurveyLogic logic)
        {
            var source =
                survey.SurveyLogic.FirstOrDefault(x => x.Id == logic.Id);
            if (source == null)
            {
                return;
            }
            this._unitOfWork.DbContext.Update(survey);
            UpdateSurveyLogic(source, logic, source.Id, source);
            await this._unitOfWork.SaveChangesAsync();
            return;
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="oldLogic"></param>
        /// <param name="newLogic"></param>
        /// <param name="rootId"></param>
        private void UpdateSurveyLogic(
            SurveyLogic oldLogic,
            SurveyLogic newLogic,
            int rootId,
            SurveyLogic parent
        )
        {
            this._unitOfWork.DbContext.Update(oldLogic);
            oldLogic.ValidationMessages["en"].Value =
                newLogic.ValidationMessages["en"].Value;
            oldLogic.Operator = newLogic.Operator;
            oldLogic.Condition = newLogic.Condition;
            oldLogic.QuestionId = newLogic.QuestionId;
            oldLogic.ValidationQuestionId = newLogic.ValidationQuestionId;
            oldLogic.Value = newLogic.Value;
            oldLogic.ParentId = newLogic.ParentId;
            if (oldLogic.Id != rootId)
            {
                oldLogic.RootId = rootId;
            }
            oldLogic.LogicType = newLogic.LogicType;
            oldLogic
                .Expressions
                .RemoveAll(x => newLogic.Expressions.All(y => y.Id != x.Id));
            var newItems =
                newLogic
                    .Expressions
                    .Where(x => oldLogic.Expressions.All(y => y.Id != x.Id))
                    .ToList();
            foreach (var newItem in newItems)
            {
                newItem.RootId = rootId;
                newItem.Parent = parent;
            }
            oldLogic.Expressions.AddRange (newItems);
            foreach (var logic in oldLogic.Expressions)
            {
                logic.RootId = rootId;
                var newSubLogic =
                    newLogic.Expressions.First(x => x.Id == logic.Id);
                UpdateSurveyLogic (logic, newSubLogic, rootId, oldLogic);
            }
            return;
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="question"></param>
        /// <param name="conditionals"></param>
        public void SetQuestionOptionConditionals(
            QuestionPart question,
            List<QuestionOptionConditional> conditionals
        )
        {
            List<QuestionOptionConditional> newSource =
                new List<QuestionOptionConditional>();
            List<QuestionOptionConditional> updateSource =
                new List<QuestionOptionConditional>();
            List<QuestionOptionConditional> newTarget =
                new List<QuestionOptionConditional>();
            List<QuestionOptionConditional> updateTarget =
                new List<QuestionOptionConditional>();

            conditionals
                .ForEach(conditional =>
                {
                    if (conditional.SourceQuestionId == question.Id)
                    {
                        if (conditional.Id == 0)
                        {
                            newSource.Add (conditional);
                        }
                        else
                        {
                            updateSource.Add (conditional);
                        }
                    }
                    else
                    {
                        if (conditional.Id == 0)
                        {
                            newTarget.Add (conditional);
                        }
                        else
                        {
                            updateTarget.Add (conditional);
                        }
                    }
                });

            this
                ._unitOfWork
                .QuestionOptionConditionals
                .DeleteSourceConditionals(question.Id,
                updateSource.Select(c => c.Id).ToList());
            this
                ._unitOfWork
                .QuestionOptionConditionals
                .DeleteTargetConditionals(question.Id,
                updateTarget.Select(c => c.Id).ToList());

            this._unitOfWork.QuestionOptionConditionals.AddRange(newSource);
            this._unitOfWork.QuestionOptionConditionals.AddRange(newTarget);
            this
                ._unitOfWork
                .QuestionOptionConditionals
                .UpdateRange(updateSource);
            this
                ._unitOfWork
                .QuestionOptionConditionals
                .UpdateRange(updateTarget);
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="surveyId"></param>
        /// <param name="surveyViewName"></param>
        /// <returns></returns>
        public List<QuestionPartView>
        GetPageStructureWithOptions(int surveyId, string surveyViewName)
        {
            return this
                ._unitOfWork
                .SurveyViews
                .GetSurveyViewQuestionAndOptionStructure(surveyId,
                surveyViewName)
                .QuestionPartViews
                .OrderBy(q => q.Order)
                .ToList();
        }

        public Task
        RemoveQuestionLogic(QuestionPartView question, SurveyLogic logic)
        {
            throw new NotImplementedException();
        }

        public async Task
        AddQuestionLogic(QuestionPartView question, SurveyLogic logic)
        {
            this._unitOfWork.DbContext.Update(question);

            if (
                !question
                    .QuestionPart
                    .Conditionals
                    .Select(x => x.Id)
                    .Contains(logic.Id)
            )
            {
                question.QuestionPart.Conditionals.Add (logic);
            }

            await this._unitOfWork.SaveChangesAsync();
        }

        /// <summary>
        ///

        /// </summary>
        /// <param name="question"></param>
        /// <param name="logic"></param>
        /// <returns></returns>
        public async Task
        UpdateQuestionLogic(QuestionPartView question, SurveyLogic logic)
        {
            this._unitOfWork.DbContext.Update(question);
            var source =
                question
                    .QuestionPart
                    .Conditionals
                    .FirstOrDefault(x => x.Id == logic.Id);
            if (source == null && question.QuestionPart.Conditionals.Count == 0)
            {
                question.QuestionPart.Conditionals.Add (logic);
            }
            else if (
                source == null && question.QuestionPart.Conditionals.Count > 0
            )
            {
                return;
            }
            else
            {
                UpdateSurveyLogic(source, logic, source.Id, source);
            }
            await this._unitOfWork.SaveChangesAsync();
            return;
        }
    }
}
