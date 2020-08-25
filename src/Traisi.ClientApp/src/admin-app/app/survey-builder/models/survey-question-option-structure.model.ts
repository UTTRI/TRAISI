export class SurveyQuestionOptionStructure {
	constructor(
		public id?: string,
		public label?: string,
		public type?: string,
		public children?: SurveyQuestionOptionStructure[]
	) {}
}
