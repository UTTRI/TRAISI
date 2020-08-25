import { QuestionPartView } from './question-part-view.model';
import { QuestionConditional } from './question-conditional.model';
import { QuestionConditionalType } from './question-conditional-type.enum';
import { QuestionCondtionalOperatorType } from './question-conditional-operator-type.enum';

export interface QuestionConditionalOperator {
    lhs?: QuestionConditional | undefined;
    rhs?: QuestionConditional | undefined;
    id?: number;
    order?: number;
    targetQuestionId?: number;
    operatorType: QuestionCondtionalOperatorType;
}
