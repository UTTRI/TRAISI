import { QuestionIconType } from './question-icon-type.enum';
import { QuestionOptionDefinition } from './question-option-definition.model';
import { QuestionConfigurationDefinition } from './question-configuration-definition.model';
import { ResponseValidator, DirectoryInfo,  QuestionPartSlotDefinition, ISurveyQuestion, QuestionResource, NestedQuestionDefinition } from '../services/survey-builder-client.service';
import { QuestionResponseType } from './question-response-type.enum';

export interface QuestionTypeDefinition {
    typeName?: string | undefined;
    location?: DirectoryInfo | undefined;
    questionOptions?: { [key: string]: QuestionOptionDefinition; } | undefined;
    questionConfigurations?: { [key: string]: QuestionConfigurationDefinition; } | undefined;
    resourceData?: { [key: string]: string; } | undefined;
    responseType?: QuestionResponseType;
    customBuilderCodeBundleName?: string | undefined;
    codeBundleName?: string | undefined;
    typeNameLocales?: { [key: string]: string; } | undefined;
    questionPartSlots?: QuestionPartSlotDefinition[] | undefined;
    type?: ISurveyQuestion | undefined;
    internalNavigationViewCount?: number;
    questionResources?: { [key: string]: QuestionResource; } | undefined;
    icon?: string | undefined;
    customBuilderViewName?: string | undefined;
    hasCustomBuilderView?: boolean;
    responseValidator?: ResponseValidator | undefined;
    nestedQuestionDefinitions?: { [key: string]: NestedQuestionDefinition; } | undefined;
}