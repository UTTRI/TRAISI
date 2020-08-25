

import { SurveyNavigator } from '../../app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import { createTestSurveyViewerStateService, getTestSurvey } from '../utils/util';

describe('SurveyNavigator', () => {
	// JSON.parse()

	let navigator: SurveyNavigator;

	beforeEach(() => {
		navigator = new SurveyNavigator(null, null, null,null);
	});

	it('initial navigation state should be null', () => {
		navigator.navigationStateChanged.subscribe(value => {
			expect(value).toEqual(null);
		});
	});

	it('initial navigation state should be null', () => {
		navigator.navigationStateChanged.subscribe(value => {
			expect(value).toEqual(null);
		});
	});
});
