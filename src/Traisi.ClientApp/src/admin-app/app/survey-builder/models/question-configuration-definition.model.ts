import { QuestionIconType } from './question-icon-type.enum';

export interface QuestionConfigurationDefinition {
	name: string;
	description: string;
	valueType: string;
	defaultValue: string;
    builderType: string;
    displayName: string;
    propertyName: string;
	resourceData: string;
}
export interface QuestionConfigurationDefinitionViewModel {
    name?: string | undefined;
    description?: string | undefined;
    valueType?: string | undefined;
    builderType?: string | undefined;
    defaultValue?: string | undefined;
    resourceData?: string | undefined;
    displayName?: string;
    propertyName?: string;
}
