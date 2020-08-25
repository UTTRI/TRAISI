import { QuestionOptionLabel } from './question-option-label.model';

export class QuestionOptionValue {
	constructor(
		public id?: number,
		public code?: string,
		public name?: string,
		public optionLabel?: QuestionOptionLabel,
		public order?: number
	) {}
}
