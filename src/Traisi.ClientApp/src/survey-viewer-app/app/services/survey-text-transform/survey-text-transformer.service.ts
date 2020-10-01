import { Injectable } from '@angular/core';
import { SurveyViewerStateService } from '../survey-viewer-state.service';

const surveyAccessTimeRegex = /{\{\s*surveyAccessTime\s*\|\s*(\w*)\s*\}\}/;
const yesterdayRegex = /\{\{\s*yesterday\s*\}\}/;
const todayRegex = /\{\{\s*today\s*\}\}/;

const previousWeekDay = 'previousweekday';

@Injectable({
	providedIn: 'root',
})
export class SurveyTextTransformer {
	public constructor(private _viewerState: SurveyViewerStateService) {}

	/**
	 *
	 * @param text
	 */
	public transformText(text: string): string {
		if (!text) {
			return '';
		}
		let yesterdayDate = new Date();
		text = text.replace(todayRegex, yesterdayDate.toDateString());
		yesterdayDate.setDate(yesterdayDate.getDate() - 1);
		text = text.replace(yesterdayRegex, yesterdayDate.toDateString());

		let accessTime = surveyAccessTimeRegex.exec(text);
		if (accessTime && accessTime.length > 1) {
			text = this.processSurveyAccessTime(text, accessTime);
		}

		return text;
	}

	private processSurveyAccessTime(text: string, result: RegExpExecArray): string {
		let replaceDate = new Date(this._viewerState.viewerState.surveyAccessTime);
		if (result.length > 1) {
			// read parameter
			let param = result[1];
			if (param.toLocaleLowerCase() === previousWeekDay) {
				let day = replaceDate.getDay();
				if (day === 0) {
					replaceDate.setDate(replaceDate.getDate() - 2);
				} else if (day === 1) {
					replaceDate.setDate(replaceDate.getDate() - 3);
				} else {
					replaceDate.setDate(replaceDate.getDate() - 1);
				}
			}
		}
		
		return text.replace(surveyAccessTimeRegex, replaceDate.toDateString());
	}
}
