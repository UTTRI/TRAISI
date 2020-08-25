import { SurveyRespondent } from 'traisi-question-sdk';

export interface SurveyRespondentEdit {
	respondent: SurveyRespondent;
	isSaved: boolean;
	isValid: boolean;
}
