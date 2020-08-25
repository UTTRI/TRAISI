import { QuestionOption } from './question-option';
import { QuestionConfiguration } from './question-configuration';

/**
 *
 *
 * @export
 * @interface OnQuestionStateChanged
 */
export interface OnQuestionStateChanged {
	/**
	 * In mobile, or other navigation features that scrolls
	 * directly to or displays independently a particular quest will
	 * have this method called if implemented to their question component.
	 *
	 * @memberof OnQuestionStateChanged
	 */
	onQuestionMadeFocusActive(): void;

	/**
	 * Notifies the subscribing component that the question state is no longer
	 * in focus - and thus offscreen or scrolled away.
	 *
	 * @memberof OnQuestionStateChanged
	 */
	onQuestionMadeUnfocused(): void;
}

/**
 * Interface that can be implemented standard changes in visibility state,
 * ie: hidden in the DOM - or scrolled away.
 *
 * @export
 * @interface OnVisibilityChanged
 */
export interface OnVisibilityChanged {
	/**
	 *
	 */
	onQuestionShown(): void;

	/**
	 *
	 */
	onQuestionHidden(): void;
}

/**
 * This will be called if options are changed externally -- usually the result of some pending
 * query from the server with a reduced set of option choices.
 *
 * @export
 * @interface OnOptionsLoaded
 */
export interface OnOptionsLoaded {
	/**
	 *
	 * @param options
	 */
	onOptionsLoaded(options: QuestionOption[]): void;
}

/**
 * Interface that is called once the question is initialized
 *
 * @export
 * @interface OnSurveyQuestionInit
 */
export interface OnSurveyQuestionInit {
	/**
	 *
	 * @param configuration
	 */
	onSurveyQuestionInit(configuration: QuestionConfiguration[]): void;
}

/**
 * Interface for monitering feedback from the server after a response has been submitted,
 * Server errors, success, and validation fails can be learned from this callback.
 *
 * @export
 * @interface OnSaveResponseStatus
 */
export interface OnSaveResponseStatus {
	/**
	 *
	 *
	 * @param {*} result
	 * @memberof OnSaveResponseStatus
	 */
	onResponseSaved(result: any): void;
}

/**
 *
 */
export interface OnSurveyNext {
	onSurveyNext(): boolean;
}


/**
 *
 */
export interface OnSurveyPrevious {
	onSurveyPrevious(): boolean;
}
