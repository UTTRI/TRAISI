import { QuestionOptionLabel } from './question-option-label.model';
import { TreeviewItem } from 'ngx-treeview';

export class QuestionConditionalTargetGroup {
	constructor(
		public index?: number,
		public source?: string,
		public condition?: string,
		public value?: string,
		public targets?: TreeviewItem[]
	) {}
}
