export class ShortCode {
	constructor(public id?: number,
		public code?: string,
		public surveyId?: number,
		public respondent?: string,
		public isTest?: boolean,
		public createdDate?: Date) {
	}
}
