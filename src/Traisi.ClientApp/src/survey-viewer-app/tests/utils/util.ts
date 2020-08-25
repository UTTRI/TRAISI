import { SurveyViewerStateService } from 'app/services/survey-viewer-state.service';
import * as testSurvey from '../data/test-survey.json';
import {} from 'jasmine';

let getTestSurvey = () => {
	return testSurvey;
};

let createTestSurveyViewerStateService = () => {
	return null;
};

let getTestSurveyResponderService = () => {
	return null;
}

let getTestSurveyResponseService = () => {
	return null;
}

export { createTestSurveyViewerStateService, getTestSurvey, getTestSurveyResponderService, getTestSurveyResponseService };
