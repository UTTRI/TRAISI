import { Field, QueryBuilderConfig } from 'angular2-query-builder';

interface SurveyLogicFieldMap {
	[key: string]: SurveyLogicField;
}
export interface SurveyLogicField extends Field {
	questionId?: number;
}

export type SurveyLogicQueryConfig = QueryBuilderConfig & { fields: SurveyLogicFieldMap };
