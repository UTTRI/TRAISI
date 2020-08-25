import { Directive, ElementRef } from '@angular/core';
@Directive({
	selector: '[traisiSurveyInternalView]'
})
export class SurveyInternalViewDirective {

	/**
	 * Creates an instance of survey internal view.
	 * @param _element
	 */
	constructor(private _elementRef: ElementRef)
	{

	}
}
