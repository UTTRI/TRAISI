import { Injectable } from '@angular/core';
import { ViewTransformation } from '../../view-transformers/view-transformation';
import { NavigationState } from 'app/models/navigation-state.model';

@Injectable({
	providedIn: 'root',
})
export class ViewTransformer {
	private _viewTransformations: ViewTransformation[] = [];

	public constructor() {}

	/**
	 *
	 * @param viewTransform
	 */
	public registerViewTransformation(viewTransform: ViewTransformation): void {
		this._viewTransformations.push(viewTransform);
	}

	/**
	 *
	 * @param viewTransform
	 */
	public unRegisterViewTransformation(viewTransform: ViewTransformation): void {
		const idx = this._viewTransformations.findIndex((v) => (v = viewTransform));
		if (idx >= 0) {
			this._viewTransformations.splice(idx, 1);
		}
	}

	/**
	 *
	 * @param state
	 */
	public applyViewTransformations(state: NavigationState): NavigationState {
		let newState: NavigationState;
		for (let t of this._viewTransformations) {
			newState = t.transformNavigationState(state);
		}
		return newState;
	}
}
