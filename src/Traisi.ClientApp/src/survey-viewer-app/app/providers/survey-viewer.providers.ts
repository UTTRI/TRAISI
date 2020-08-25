import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';
import { Provider } from '@angular/core';
import { TraisiValues } from 'traisi-question-sdk';
import { SurveyViewerStateService } from 'app/services/survey-viewer-state.service';

export const surveyIdProviderFactory = (session: SurveyViewerSession): number => {
	return session.surveyId;
};

// provide information about the SurveyId
export const SurveyViewerProviders: Provider[] = [
	{
		provide: TraisiValues.SurveyId,
		useFactory: surveyIdProviderFactory,
		deps: [SurveyViewerSession],
	},
];

export const QuestionModelProviders: Provider[] = [];
