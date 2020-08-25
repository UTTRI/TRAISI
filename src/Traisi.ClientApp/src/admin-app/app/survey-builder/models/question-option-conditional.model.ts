import { QuestionOptionLabel } from './question-option-label.model';

export class QuestionOptionConditional {
	constructor(
		public id?: number,
		public targetOptionId?: number,
		public sourceQuestionId?: number,
		public condition?: string,
		public value?: string
	) {}
}
