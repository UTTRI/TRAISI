import { SurveyRespondent } from 'traisi-question-sdk';

/**
 * @export
 * @interface SurveyViewerSessionData
 */
export interface SurveyViewerSessionData {
	surveyId: number;
	surveyCode: string;
	surveyTitle: string;
	shortcode: string;
	groupcode: string;
	primaryRespondent: SurveyRespondent;
	isLoggedIn: boolean;
	isUsingGroupcode: boolean;
	authenticationMode: any;
	language: string;
}
