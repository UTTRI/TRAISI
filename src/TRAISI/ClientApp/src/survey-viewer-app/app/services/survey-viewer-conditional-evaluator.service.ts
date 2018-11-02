import { Injectable, Inject } from '@angular/core';
import { SurveyViewerStateService } from './survey-viewer-state.service';
import { SurveyResponderService } from './survey-responder.service';

@Injectable({
	providedIn: 'root'
})
export class SurveyViewerConditionalEvaluator {
	/**
	 *
	 * @param _state q
	 * @param _responderService
	 */
	constructor() {}

	/**
	 *
	 * @param conditionalType
	 * @param sourceData
	 * @param targetData
	 * @param value
	 */
	public evaluateConditional(conditionalType: string, sourceData: any, targetData: any, value: any): boolean {
		switch (conditionalType) {
			case 'contains':
				return this.evaluateContains(sourceData, value);
			case 'doesNotContain':
				return !this.evaluateContains(sourceData, value);
			case 'isEqualTo':
				return this.evaluateEquals(sourceData, value);
			case 'contains':
				return this.evaluateContains(sourceData, value);
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
				return this.evaluateInBounds(sourceData, value);
			default:
				return false;
		}
	}

	/*		if (this.responseType === 'String') {
			this.dropDownListItems = ['Contains', 'Does Not Contain'];
		} else if (this.responseType === 'Boolean') {
			this.dropDownListItems = ['Is Equal To'];
		} else if (this.responseType === 'Integer') {
			this.dropDownListItems = ['Is Equal To', 'Is Not Equal To', 'Greater Than', 'Less Than'];
		} else if (this.responseType === 'Decimal') {
			this.dropDownListItems = ['Is Equal To', 'Is Not Equal To', 'Greater Than', 'Less Than'];
		} else if (this.responseType === 'Location') {
			this.dropDownListItems = ['In Bounds', 'Out Of Bounds'];
		} else if (this.responseType === 'Json') {
			this.dropDownListItems = ['Contains', 'Does Not Contain'];
		} else if (this.responseType === 'OptionSelect') {
			this.dropDownListItems = ['Is Equal To', 'Is Not Equal To'];
		} else if (this.responseType === 'OptionList') {
			this.dropDownListItems = ['Is Any Of', 'Is All Of'];
		} else if (this.responseType === 'DateTime') {
			this.dropDownListItems = ['In Range', 'Outside Range']; */

	/**
	 *
	 * @param sourceData
	 * @param value
	 */
	private evaluateContains(sourceData: any, value: string): boolean {
		const val: boolean = sourceData.value.indexOf(value) >= 0;

		return val;
	}

	private evaluateEquals(sourceData: any, value: any): boolean {
		const val: boolean = sourceData === value;
		return val;
	}

	private evaluateInBounds(sourceData: any, value: any): boolean {
		return true;
	}

	private evaluateIsAnyOf(sourceData: any, value: any): boolean {
		return true;
	}

	private evaluateIsAllOf(sourceData: any, value: any): boolean {
		return true;
	}

	private evaluateInRange(sourceData: any, value: any): boolean {
		return true;
	}
}
