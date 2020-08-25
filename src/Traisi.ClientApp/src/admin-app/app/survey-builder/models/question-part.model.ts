export class QuestionPart {
	constructor(
		public id?: number,
		public questionType?: string,
		public name?: string,
		public isGroupQuestion?: boolean,
		public questionPartChildren?: QuestionPart[]
	) {}
}
