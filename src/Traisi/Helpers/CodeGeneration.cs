using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Traisi.Data;
using Traisi.Data.Models.Surveys;

namespace Traisi.Helpers
{
    public interface ICodeGeneration
    {
        string GenerateCodeByLength(int surveyId, int codeLength);
        string GenerateCodeByPattern(int surveyId, string pattern);
        void GenerateShortCodesBatch(CodeGeneration parameters, Survey survey);
        Task<Shortcode> GenerateShortCode(CodeGeneration parameters, Survey survey);
        void GenerateGroupCode(CodeGeneration parameters, Survey survey);
        void GenerateGroupCodesBatch(CodeGeneration parameters, IList<string> groupNames, Survey survey);
    }

    public class CodeGenerationService : ICodeGeneration
    {
        private IUnitOfWork _unitOfWork;
        private readonly Random _randomGen;

        public CodeGenerationService(IUnitOfWork unitOfWork)
        {
            this._unitOfWork = unitOfWork;
            this._randomGen = new Random();
        }

        /// <summary>
        /// Generates single code for a survey
        /// </summary>
        /// <param name="parameters"></param>
        /// <param name="survey"></param>
        public async Task<Shortcode> GenerateShortCode(CodeGeneration parameters, Survey survey)
        {
            string codeString;
            if (parameters.UsePattern) {
                codeString = GenerateCodeByPattern(parameters.SurveyId, parameters.Pattern);
            }
            else {
                codeString = GenerateCodeByLength(parameters.SurveyId, parameters.CodeLength);
            }

            Shortcode newCode = new Shortcode()
            {
                Survey = survey,
                Code = codeString,
                IsTest = parameters.IsTest,
                CreatedDate = DateTime.UtcNow
            };
            await _unitOfWork.Shortcodes.AddAsync(newCode);

            return newCode;
        }

        /// <summary>
        /// Generates group code for a survey
        /// </summary>
        /// <param name="parameters"></param>
        /// <param name="survey"></param>
        public void GenerateGroupCode(CodeGeneration parameters, Survey survey)
        {
            string codeString;
            if (parameters.UsePattern) {
                codeString = GenerateCodeByPattern(parameters.SurveyId, parameters.Pattern);
            }
            else {
                codeString = GenerateCodeByLength(parameters.SurveyId, parameters.CodeLength);
            }

            Groupcode newCode = new Groupcode()
            {
                Survey = survey,
                Code = codeString,
                Name = parameters.GroupName,
                IsTest = parameters.IsTest,
                CreatedDate = DateTime.UtcNow
            };
            _unitOfWork.GroupCodes.Add(newCode);
        }

        /// <summary>
        /// Generates a batch of short codes for a survey
        /// </summary>
        /// <param name="parameters"></param>
        /// <param name="survey"></param>
        public void GenerateShortCodesBatch(CodeGeneration parameters, Survey survey)
        {
            List<string> newCodes = GenerateUniqueCodes(parameters, survey);

            for (int i = 0; i < parameters.NumberOfCodes; i++) {
                Shortcode newCode = new Shortcode()
                {
                    Survey = survey,
                    Code = newCodes[i],
                    IsTest = parameters.IsTest,
                    CreatedDate = DateTime.UtcNow
                };
                _unitOfWork.Shortcodes.Add(newCode);
            }
        }

        /// <summary>
        /// Generates a batch of group codes for a survey
        /// </summary>
        /// <param name="parameters"></param>
        /// <param name="survey"></param>
        public void GenerateGroupCodesBatch(CodeGeneration parameters, IList<string> groupNames, Survey survey)
        {
            List<string> newCodes = GenerateUniqueCodes(parameters, survey);

            for (int i = 0; i < parameters.NumberOfCodes; i++) {
                Groupcode newCode = new Groupcode()
                {
                    Survey = survey,
                    Code = newCodes[i],
                    Name = groupNames[i],
                    IsTest = parameters.IsTest,
                    CreatedDate = DateTime.UtcNow
                };
                _unitOfWork.GroupCodes.Add(newCode);
            }
        }

        /// <summary>
        /// Helper function to generate a list of unique codes for a survey (both short and group)
        /// </summary>
        /// <param name="parameters"></param>
        /// <param name="survey"></param>
        /// <returns></returns>
        private List<string> GenerateUniqueCodes(CodeGeneration parameters, Survey survey)
        {
            //Choose method of generation based on parameter
            Func<CodeGeneration, string> codeGenFunction;
            if (parameters.UsePattern) {
                codeGenFunction = delegate (CodeGeneration cParams) { return CodePatternFunction(cParams.Pattern); };
            }
            else {
                codeGenFunction = delegate (CodeGeneration cParams) { return CodePatternFunction(cParams.Pattern); };
            }

            List<string> newCodes = new List<string>();
            bool allUnique = false;
            int remainingCodes;

            /// in a loop, generate codes without checking for uniqueness 
            /// compare against short code and group codes repo en mass
            /// keep unique codes and continue until number required is generated
            do {
                remainingCodes = parameters.NumberOfCodes - newCodes.Count;
                List<string> partialCodes = new List<string>();
                for (int i = 0; i < remainingCodes; i++) {
                    string codeString = codeGenFunction(parameters);
                    partialCodes.Add(codeString);
                }
                newCodes = newCodes.Union(this._unitOfWork.GroupCodes.GetUniqueCodes(survey.Id, this._unitOfWork.Shortcodes.GetUniqueCodes(survey.Id, partialCodes))).ToList();
                allUnique = newCodes.Count == parameters.NumberOfCodes;
            } while (!allUnique);
            return newCodes;
        }

        public string GenerateCodeByLength(int surveyId, int codeLength)
        {
            bool uniqueCodeFound = false;
            string code;
            do {
                code = CodeFunction(codeLength);
                if (this._unitOfWork.GroupCodes.IsUniqueGroupCodeForSurvey(surveyId, code) && this._unitOfWork.Shortcodes.UniqueShortCodeForSurvey(surveyId, code)) {
                    uniqueCodeFound = true;
                }
            } while (!uniqueCodeFound);
            return code;
        }

        public string GenerateCodeByPattern(int surveyId, string pattern)
        {
            bool uniqueCodeFound = false;
            string code;
            do {
                code = CodePatternFunction(pattern);
                if (this._unitOfWork.GroupCodes.IsUniqueGroupCodeForSurvey(surveyId, code) && this._unitOfWork.Shortcodes.UniqueShortCodeForSurvey(surveyId, code)) {
                    uniqueCodeFound = true;
                }
            } while (!uniqueCodeFound);
            return code;
        }


        private string CodeFunction(int codeLength)
        {
            string code = Guid.NewGuid().ToString("N").Substring(0, codeLength);
            //string code = Path.GetRandomFileName().Substring(0, codeLength);
            return code.ToUpper();
        }

        private string CodePatternFunction(string pattern)
        {
            char[] patternArray = pattern.ToUpper().ToCharArray();
            patternArray = patternArray.Select(c => c == 'C' ? RandomLetter() : c == '#' ? RandomNumber() : '-').ToArray();
            return new string(patternArray);
        }

        private char RandomLetter()
        {
            string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            int num = this._randomGen.Next(0, chars.Length - 1);
            return chars[num];
        }

        private char RandomNumber()
        {
            int randomNumber = this._randomGen.Next(0, 9);
            char gen = '0';
            gen += (char)randomNumber;
            return gen;
        }
    }

}