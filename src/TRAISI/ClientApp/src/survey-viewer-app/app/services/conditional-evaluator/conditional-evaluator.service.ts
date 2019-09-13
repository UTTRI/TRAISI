import { Injectable, Inject } from '@angular/core';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { every as _every, some as _some } from 'lodash';
import { point } from '@turf/helpers';
import { SurveyResponderService } from '../survey-responder.service';
import { SurveyViewQuestion } from 'app/models/survey-view-question.model';
import { Observable } from 'rxjs';
import { SurveyViewerStateService } from '../survey-viewer-state.service';

@Injectable({
	providedIn: 'root'
})
export class ConditionalEvaluator {
	/**
	 *
	 * @param _state q
	 * @param _responderService
	 */
	constructor(private _responderService: SurveyResponderService, private _state: SurveyViewerStateService) {}

	/**
	 *
	 * @param conditionalType
	 * @param sourceData
	 * @param targetData
	 * @param value
	 */
	public evaluateConditional(conditionalType: string, sourceData: any, targetData: any, value: any): boolean {
		if (sourceData === undefined) {
			return false;
		}
		switch (conditionalType) {
			case 'contains':
				return this.evaluateContains(sourceData, value);
			case 'doesNotContain':
				return !this.evaluateContains(sourceData, value);
			case 'isEqualTo':
				return this.evaluateEquals(sourceData, value);
			case 'lessThan':
				return this.evaluatLessThan(sourceData, value);
			case 'greaterThan':
				return this.evaluatGreaterThan(sourceData, value);
			case 'isNotEqualTo':
				return !this.evaluateEquals(sourceData, value);
			case 'isAnyOf':
				return this.evaluateIsAnyOf(sourceData, value);
			case 'isAllOf':
				return this.evaluateIsAllOf(sourceData, value);
			case 'inRange':
				return this.evaluateInRange(sourceData, value);
			case 'outsideRange':
				return !this.evaluateInRange(sourceData, value);
			case 'inBounds':
				return this.evaluateInBounds(sourceData, value);
			case 'outOfBounds':
				return !this.evaluateInBounds(sourceData, value);
			default:
				return false;
		}
	}
	/**
	 *
	 * @param sourceData
	 * @param value
	 */
	private evaluateContains(sourceData: any[], value: string): boolean {
		return sourceData[0].value.indexOf(value) >= 0;
	}

	/**
	 * Evaluates equals
	 * @param sourceData
	 * @param value
	 * @returns true if equals
	 */
	private evaluateEquals(sourceData: any[], value: any): boolean {
		const val: boolean = sourceData[0].value === parseInt(value, 10);

		return val;
	}

	private evaluatLessThan(sourceData: any[], value: any): boolean {
		const val: boolean = sourceData[0].value < parseInt(value, 10);

		return val;
	}

	private evaluatGreaterThan(sourceData: any[], value: any): boolean {
		const val: boolean = sourceData[0].value > parseInt(value, 10);

		return val;
	}

	/**
	 * Evaluates in bounds
	 * @param sourceData
	 * @param value
	 * @returns true if in bounds
	 */
	private evaluateInBounds(sourceData: any, boundsInfo: any): boolean {
		let bounds = JSON.parse(boundsInfo);

		if (bounds.features === undefined) {
			return false;
		}
		let p = point([sourceData[0].longitude, sourceData[0].latitude]);
		let contains = booleanPointInPolygon(p, bounds.features[0]);
		// point([sourceData[0].latitude, sourceData[0].longitude]);

		return contains;
	}

	/**
	 * Evaluates is any of
	 * @param sourceData
	 * @param value
	 * @returns true if is any of
	 */
	private evaluateIsAnyOf(sourceData: any[], conditionalData: string): boolean {
		let conditionals = JSON.parse(conditionalData);

		let isAny: boolean = false;

		sourceData.forEach(response => {
			if (response === undefined) {
				return false;
			}
			conditionals.forEach(conditional => {
				if (response.code === conditional.code) {
					isAny = true;
				}
			});
		});
		return isAny;
	}

	/**
	 * Evaluates is all of
	 * @param sourceData
	 * @param value
	 * @returns true if is all of
	 */
	private evaluateIsAllOf(sourceData: any[], conditionalData: string): boolean {
		let conditionals = JSON.parse(conditionalData);

		return _every(conditionals, x => {
			return _some(sourceData, y => {
				return x.code === y.code;
			});
		});
	}

	/**
	 * Evaluates in range
	 * @param sourceData
	 * @param value
	 * @returns true if in range
	 */
	private evaluateInRange(sourceData: any[], rangeData: string): boolean {
		let dateIn = new Date(sourceData[0].value);
		let dateRange = JSON.parse(rangeData);

		let dateLower = new Date(dateRange[0]);
		let dateUpper = new Date(dateRange[1]);

		if (dateLower <= dateIn && dateIn <= dateUpper) {
			return true;
		} else {
			return false;
		}
	}

	public shouldHide(
		question: SurveyViewQuestion,
		respondentId: number
	): Observable<{ shouldHide: boolean; question: SurveyViewQuestion }> {
		return Observable.create(observer => {
			if (question.targetConditionals.length === 0) {
				observer.next({ shouldHide: false, question: question });
				observer.complete();
			} else {
				let sourceIds = [];
				for (let source of question.targetConditionals) {
					let sourceQuestion = this._state.viewerState.questionMap[source.sourceQuestionId];
					sourceIds.push(sourceQuestion.questionId);
				}

				this._responderService.readyCachedSavedResponses(sourceIds, respondentId).subscribe(v => {
					let evalTrue: boolean = question.targetConditionals.some(evalConditional => {
						let response = this._responderService.getCachedSavedResponse(evalConditional.sourceQuestionId, respondentId);

						if (response === undefined || response.length === 0) {
							return true;
						}
						let evalResult = this.evaluateConditional(evalConditional.conditionalType, response, '', evalConditional.value);
						return evalResult;
					});

					observer.next({ shouldHide: evalTrue, question: question });
					observer.complete();
				});

				/*forkJoin(conditionalEvals).subscribe(values => {
					this.viewerState.questionMap[updatedQuestionId].sourceConditionals.forEach(conditional => {
						let targetQuestion = this.viewerState.questionMap[conditional.targetQuestionId];

						let evalTrue: boolean = targetQuestion.targetConditionals.some(evalConditional => {
							let response = this._responderService.getCachedSavedResponse(evalConditional.sourceQuestionId, respondentId);

							if (response === undefined || response.length === 0) {
								return;
							}
							let evalResult = this._conditionalEvaluator.evaluateConditional(
								evalConditional.conditionalType,
								response,
								'',
								evalConditional.value
							);
							return evalResult;
						});

						if (targetQuestion.isRespondentHidden === undefined) {
							targetQuestion.isRespondentHidden = {};
						}
						targetQuestion.isRespondentHidden[respondentId] = evalTrue;
						targetQuestion.isHidden = evalTrue;
					});
					observer.complete();
				}); */
			}
		});
	}
}
