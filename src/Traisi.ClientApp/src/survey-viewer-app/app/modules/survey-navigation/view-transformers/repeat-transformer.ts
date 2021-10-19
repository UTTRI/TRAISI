import { NavigationState } from 'app/models/navigation-state.model';
import { SurveyResponseService, TraisiValues, SurveyViewQuestion, SurveyRespondent } from 'traisi-question-sdk';
import { Injectable, Inject } from '@angular/core';
import { ViewTransformation } from './view-transformation';
import { ViewTransformer } from '../services/survey-navigator/view-transformer.service';
import { SurveyViewerResponseService } from 'app/services/survey-viewer-response.service';
import { QuestionInstance } from 'app/models/question-instance.model';
import { ValidationState } from 'app/services/survey-viewer-api-client.service';
import { Observable } from 'rxjs';
import { SurveyViewerStateService } from 'app/services/survey-viewer-state.service';

const transit_modes = ['transit-all-way', 'transit-park-ride', 'transit-kiss-ride', 'transit-cycle-ride', 'transit-ridehailing-ride'];

@Injectable({
	providedIn: 'root',
})
export class RepeatTransformer extends ViewTransformation {
	public constructor(
		@Inject(TraisiValues.SurveyResponseService) private _responseService: SurveyViewerResponseService,
		private _state: SurveyViewerStateService
	) {
		super();
	}
	/**
	 * Transforms the current navigation state by removing (hiding) questions that are not visible
	 * as the result of conditional logic evaluation.
	 * @param state
	 */
	public transformNavigationState(
		state: NavigationState,
		questionInstances: QuestionInstance[]
	): Observable<QuestionInstance[]> {
		// loop through the active question instances and duplicate them

		let clones = [];
		let toLoad = [];
		for (let question of questionInstances) {
			if (question.model.repeatSource > 0) {
				toLoad.push(this._state.viewerState.questionMap[question.model.repeatSource]);
			}
		}
		return new Observable((obs) => {
			this._responseService.loadSavedResponses(toLoad, state.activeRespondent).subscribe({
				complete: () => {
					for (let question of questionInstances) {
						if (question.model.repeatSource === 0) {
							clones.push(question);
							continue;
						}
						let response;
						if (
							this._responseService.hasStoredResponse(
								this._state.viewerState.questionMap[question.model.repeatSource],
								state.activeRespondent
							)
						) {
							response = this._responseService.getStoredResponse(
								this._state.viewerState.questionMap[question.model.repeatSource],
								state.activeRespondent
							);

							// count how many needed
							let cloneCount: number = 0;
							let responses = [];
							for (let r of response) {
								if (transit_modes.includes(r['mode'])) {
									cloneCount++;
									responses.push(r);
								}
							}

							clones = clones.concat(this.createClones(cloneCount, question, state, responses, response));
						}
					}
					let result = clones;
					obs.next(result);
					obs.complete();
				},
			});
		});
	}

	private createClones(
		count: number,
		question: QuestionInstance,
		state: NavigationState,
		responses: any[],
		fullResponses: any[]
	): QuestionInstance[] {
		let clones = [];
		for (let i = 0; i < count; i++) {
			let clone: QuestionInstance = {
				component: undefined,
				id: this.getQuestionInstanceId(question.model, i, state.activeRespondent),
				model: question.model,
				questionInstanceState: null,
				repeat: i,
				repeatValue: responses[i],
				repeatSource: fullResponses,
				validationErrors: [],
				validationState: {
					isValid: false,
					questionValidationState: {
						validationState: ValidationState.Untouched,
						errorMessages: [],
					},
					surveyLogicValidationState: {
						validationState: ValidationState.Untouched,
						errorMessages: [],
					},
				},
				index: state.activeQuestionIndex,
			};
			clones.push(clone);
		}
		return clones;
	}

	private getQuestionInstanceId(
		question: SurveyViewQuestion,
		repeat: number = 0,
		respondent: SurveyRespondent
	): string {
		return `${question.id}_${respondent.id}_${repeat}`;
	}
}
