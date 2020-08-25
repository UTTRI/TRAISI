using System;

namespace Traisi.Sdk.Attributes
{
	[AttributeUsage(AttributeTargets.Field)]
	public class NestedQuestionAttribute : Attribute
	{

		/// <summary>
		/// 
		/// </summary>
		/// <value></value>
		public string Description { get; set; }

	}
}