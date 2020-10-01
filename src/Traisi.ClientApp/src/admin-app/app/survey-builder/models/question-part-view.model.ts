import { QuestionPartViewLabel } from './question-part-view-label.model';
import { QuestionPart } from './question-part.model';
import { QuestionConditionalOperator } from './question-conditional-operator.model';

export class QuestionPartView {
	constructor(
		public id?: number,
		public label?: QuestionPartViewLabel,
		public descriptionLabel?: QuestionPartViewLabel,
		public icon?: string,
		public parentViewId?: number,
		public questionPartViewChildren?: QuestionPartView[],
		public order?: number,
		public questionPart?: QuestionPart,
		public isOptional?: boolean,
		public isHousehold?: boolean,
		public repeatSourceQuestionName?: string,
		public repeatSourceQuestionId?: number,
		public catiDependent?: QuestionPartView,
		public isMultiView?: boolean,
		public conditionals?: QuestionConditionalOperator[]
	) {}
}
