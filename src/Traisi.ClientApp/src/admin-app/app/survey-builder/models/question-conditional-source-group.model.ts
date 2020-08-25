import { QuestionOptionLabel } from './question-option-label.model';
import { TreeviewItem } from 'ngx-treeview';

export class QuestionConditionalSourceGroup {
	constructor(
		public index?: number,
		public condition?: string,
		public value?: string,
		public targets?: TreeviewItem[]
	) {}
}
