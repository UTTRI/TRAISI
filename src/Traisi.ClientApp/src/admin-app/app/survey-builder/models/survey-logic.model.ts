import { RuleSet } from 'angular2-query-builder';

export interface SurveyLogic extends RuleSet {
	message: string;
	id: number;
	parentId?: number;
	rootId?: number;
	validationQuestionId?: number;
}
