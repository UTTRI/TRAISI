import { TestBed, inject } from '@angular/core/testing';

import { SurveyBuilderService } from './survey-builder.service';

describe('SurveyBuilderService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [SurveyBuilderService]
		});
	});

	it(
		'should be created',
		inject([SurveyBuilderService], (service: SurveyBuilderService) => {
			expect(service).toBeTruthy();
		})
	);
});
