using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Traisi.Data.Binding
{
	/// <summary>
	/// Model binder for SurveyRespondent entities.
	/// </summary>
	public class SurveyRespondentEntityBinder : IModelBinder
	{
		private readonly ApplicationDbContext _db;

		private readonly IUnitOfWork _unitOfWork;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="db"></param>
		/// <param name="_unitOfWork"></param>
		public SurveyRespondentEntityBinder(ApplicationDbContext db, IUnitOfWork _unitOfWork)
		{
			this._db = db;
			this._unitOfWork = _unitOfWork;
		}

		/// <summary>
		/// 
		/// </summary>
		/// <param name="bindingContext"></param>
		/// <returns></returns>
		public Task BindModelAsync(ModelBindingContext bindingContext)
		{

			if (bindingContext == null)
			{
				throw new ArgumentNullException(nameof(bindingContext));
			}

			var modelName = bindingContext.ModelName;

			var valueProviderResult =
		   bindingContext.ValueProvider.GetValue(modelName);

			if (valueProviderResult == ValueProviderResult.None)
			{
				return Task.CompletedTask;
			}

			bindingContext.ModelState.SetModelValue(modelName,
			valueProviderResult);

			var value = valueProviderResult.FirstValue;

			if (string.IsNullOrEmpty(value))
			{
				return Task.CompletedTask;
			}

			int respondentId = 0;
			if (!int.TryParse(value, out respondentId))
			{
				// Non-integer arguments result in model state errors
				bindingContext.ModelState.TryAddModelError(
										modelName,
										"Invalid respondent id");
				return Task.CompletedTask;
			}


			var respondent = this._unitOfWork.SurveyRespondents.Get(respondentId);

			bindingContext.Result = ModelBindingResult.Success(respondent);
			return Task.CompletedTask;
		}


	}
}

