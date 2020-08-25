import { QuestionIconType } from './question-icon-type.enum';
import { QuestionOptionValueType } from './question-option-value-type.enum';

export interface QuestionOptionDefinition {
    name?: string | undefined;
    description?: string | undefined;
    valueType?: QuestionOptionValueType;
    typeId?: any | undefined;
    defaultValue?: string | undefined;
    isMultipleAllowed?: boolean;
}
