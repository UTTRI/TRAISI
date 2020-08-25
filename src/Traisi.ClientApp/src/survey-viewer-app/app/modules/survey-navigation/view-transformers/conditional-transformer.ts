import { NavigationState } from 'app/models/navigation-state.model';
import { SurveyResponseService } from 'traisi-question-sdk';
import { Injectable } from '@angular/core';
import { ViewTransformation } from './view-transformation';
import { ViewTransformer } from '../services/survey-navigator/view-transformer.service';

@Injectable({
	providedIn: 'root',
})
export class ConditionalTransformer extends ViewTransformation {
	public constructor(private _viewTransformer: ViewTransformer, private _responseService: SurveyResponseService) {
		super();
		_viewTransformer.registerViewTransformation(this);
	}
	/**
	 * Transforms the current navigation state by removing (hiding) questions that are not visible
	 * as the result of conditional logic evaluation.
	 * @param state
	 */
	public transformNavigationState(state: NavigationState): NavigationState {
		throw new Error('Method not implemented.');
	}
}
