import { SurveyExecuteModule } from './survey-execute.module';

describe('SurveyExecuteModule', () => {
	let surveyExecuteModule: SurveyExecuteModule;

	beforeEach(() => {
		surveyExecuteModule = new SurveyExecuteModule();
	});

	it('should create an instance', () => {
		expect(surveyExecuteModule).toBeTruthy();
	});
});
