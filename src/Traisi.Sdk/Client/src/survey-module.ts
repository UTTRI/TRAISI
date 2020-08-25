import { ResponseTypes, SurveyQuestion } from './survey-question';

export class SurveyModule {
	/**
	 *
	 */
	public traisiBootstrap<T extends ResponseTypes>(component: SurveyQuestion<T>): void { }
}
