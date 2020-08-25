import { QuestionOptionLabel } from './question-option-label.model';
import { SBPageStructureViewModel } from '../services/survey-builder-client.service';
import { QuestionPartView } from './question-part-view.model';
import { QuestionConditionalType } from './question-conditional-type.enum';

export interface QuestionConditional {
	id?: number;
    sourceQuestionId?: number;
    condition?: QuestionConditionalType;
    value?: string | undefined;
}
