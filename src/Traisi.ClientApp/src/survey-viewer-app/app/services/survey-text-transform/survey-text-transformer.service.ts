import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class SurveyTextTransformer {
	public constructor() {}

	/**
	 *
	 * @param text
	 */
	public transformText(text: string): string {
		if (!text) {
			return '';
		}
		let yesterdayRegex = /\{\{\s*yesterday\s*\}\}/;
		let todayRegex = /\{\{\s*today\s*\}\}/;
		let yesterdayDate = new Date();
		text = text.replace(todayRegex, yesterdayDate.toDateString());
		yesterdayDate.setDate(yesterdayDate.getDate() - 1);
		text = text.replace(yesterdayRegex, yesterdayDate.toDateString());
		return text;
	}
}
