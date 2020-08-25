import { Injectable, Inject } from '@angular/core';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { every as _every, some as _some } from 'lodash';
import { point } from '@turf/helpers';
import { Observable, iif } from 'rxjs';
import { SurveyViewerStateService } from '../survey-viewer-state.service';
import { Stack } from 'stack-typescript';
import { SurveyViewerResponseService } from '../survey-viewer-response.service';
import {
	SurveyRespondent,
	ResponseData,
	ResponseTypes,
	NumberResponseData,
	StringResponseData,
	SurveyViewQuestion,
} from 'traisi-question-sdk';
import { SurveyLogicRules, SurveyLogicRule, SurveyLogicOperator, SurveyLogicCondition } from 'traisi-question-sdk';
@Injectable({
	providedIn: 'root',
})
export class ConditionalEvaluator {
	/**
	 *
	 * @param _state q
	 * @param _responderService
	 */
	constructor(private _responseService: SurveyViewerResponseService, private _state: SurveyViewerStateService) {}

	/**
	 *
	 * @param conditionalType
	 * @param sourceData
	 * @param targetData
	 * @param value
	 */
	public evaluateConditional(
		conditionalType: SurveyLogicOperator,
		sourceData: Array<ResponseData<ResponseTypes>>,
		value: string[] | any
	): boolean {
		if (sourceData === undefined) {
			return false;
		}
		switch (conditionalType) {
			case SurveyLogicOperator.contains:
				return this.evaluateContains(sourceData as StringResponseData[], value);
			case SurveyLogicOperator.noneOf:
				return !this.evaluateIsAnyOf(sourceData, value);
			case SurveyLogicOperator.equals:
				return this.evaluateEquals(sourceData as NumberResponseData[], value);
			case SurveyLogicOperator.lessThan:
				return this.evaluatLessThan(sourceData as NumberResponseData[], value);
			case SurveyLogicOperator.greaterThan:
				return this.evaluatGreaterThan(sourceData as NumberResponseData[], value);
			case SurveyLogicOperator.notEquals:
				return !this.evaluateEquals(sourceData as NumberResponseData[], value);
			case SurveyLogicOperator.anyOf:
				return this.evaluateIsAnyOf(sourceData, value);
			case SurveyLogicOperator.allOf:
				return this.evaluateIsAllOf(sourceData, value);
			// case SurveyLogicOperator.InRange:
			// 	return this.evaluateInRange(sourceData, value);
			// case SurveyLogicOperator.OutsideRange:
			// 	return !this.evaluateInRange(sourceData, value);
			// case SurveyLogicOperator.InBounds:
			// 	return this.evaluateInBounds(sourceData, value);
			// case SurveyLogicOperator.OutOfBounds:
			// 	return !this.evaluateInBounds(sourceData, value);
			default:
				return false;
		}
	}
	/**
	 *
	 * @param sourceData
	 * @param value
	 */
	private evaluateContains(sourceData: StringResponseData[], value: string[]): boolean {
		return sourceData[0].value.indexOf(value[0]) >= 0;
	}

	/**
	 * Evaluates equals
	 * @param sourceData
	 * @param value
	 * @returns true if equals
	 */
	private evaluateEquals(sourceData: Array<NumberResponseData>, value: string[]): boolean {
		const val: boolean = sourceData[0].value === parseInt(value[0], 10);
		return val;
	}

	private evaluatLessThan(sourceData: Array<NumberResponseData>, value: string[]): boolean {
		const val: boolean = sourceData[0].value < parseInt(value[0], 10);

		return val;
	}

	private evaluatGreaterThan(sourceData: Array<NumberResponseData>, value: string[]): boolean {
		const val: boolean = sourceData[0].value > parseInt(value[0], 10);

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
	private evaluateIsAnyOf(sourceData: any[], conditionalData: string[]): boolean {
		let conditionals = conditionalData;
		let isAny: boolean = false;

		sourceData.forEach((response) => {
			if (response === undefined) {
				return false;
			}
			conditionals.forEach((conditional) => {
				if (response.code === conditional) {
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
	private evaluateIsAllOf(sourceData: any[], conditionalData: string[]): boolean {
		let conditionals = conditionalData;

		return _every(conditionals, (x) => {
			return _some(sourceData, (y) => {
				return x.code === y;
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

	/**
	 * Evaluates a particular conditional for true or false
	 * @param conditional
	 */
	public evaluate(logic: SurveyLogicRules | SurveyLogicRule, respondent: SurveyRespondent): boolean {
		if (this._isRuleLogic(logic)) {
			let sourceValue = this._getSourceValue(logic, respondent);
			return sourceValue ? this.evaluateConditional(logic.operator, sourceValue, logic.value) : false;
		} else if (this._isRulesLogic(logic)) {
			if (logic.condition === SurveyLogicCondition.and) {
				return _every(logic.rules, (o) => this.evaluate(o, respondent));
			} else {
				return _some(logic.rules, (o) => this.evaluate(o, respondent));
			}
		}
	}

	/**
	 * Returns question source data, or undefined if it does not yet exist.
	 * @param logic
	 * @param respondent
	 */
	private _getSourceValue(
		logic: SurveyLogicRule,
		respondent: SurveyRespondent
	): ResponseData<ResponseTypes>[] | undefined {
		let question = this._state.viewerState.questionMap[logic.sourceQuestionId];
		if (this._responseService.hasStoredResponse(question, respondent)) {
			return this._responseService.getStoredResponse(question, respondent);
		} else {
			return undefined;
		}
	}

	private _isRuleLogic(logic: SurveyLogicRules | SurveyLogicRule): logic is SurveyLogicRule {
		return (logic as SurveyLogicRule).operator !== undefined;
	}

	private _isRulesLogic(logic: SurveyLogicRules | SurveyLogicRule): logic is SurveyLogicRule {
		return (logic as SurveyLogicRules).condition !== undefined;
	}

	private _listSourceQuestions(
		logic: SurveyLogicRules | SurveyLogicRule,
		sourceQuestions: SurveyViewQuestion[]
	): SurveyViewQuestion[] {
		if (this._isRuleLogic(logic)) {
			sourceQuestions.push(this._state.viewerState.questionMap[logic.sourceQuestionId]);
		} else {
			for (let rule of logic.rules) {
				this._listSourceQuestions(rule, sourceQuestions);
			}
		}
		return sourceQuestions;
	}

	/**
	 * Determines if a question should be visible for the associated respondent. A question is hidden
	 * when specific survey conditionals are met.
	 * @param question
	 * @param respondentId
	 */
	public shouldHide(
		question: SurveyViewQuestion,
		respondent: SurveyRespondent
	): Observable<{ shouldHide: boolean; question: SurveyViewQuestion }> {
		return new Observable((observer) => {
			if (question.conditionals.length === 0) {
				observer.next({ shouldHide: false, question: question });
				observer.complete();
			} else {
				let sourceQuestions = this._listSourceQuestions(question.conditionals[0] as any, []);
				this._responseService.loadSavedResponses(sourceQuestions, respondent).subscribe({
					complete: () => {
						let evalTrue: boolean = this.evaluate(question.conditionals[0] as any, respondent);
						observer.next({
							shouldHide: !evalTrue,
							question: question,
						});
						observer.complete();
					},
				});
			}
		});
	}
} 
