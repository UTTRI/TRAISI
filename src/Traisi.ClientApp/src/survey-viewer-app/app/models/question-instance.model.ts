import { QuestionInstanceState } from 'app/services/question-instance.service';
import { SurveyViewerValidationStateViewModel } from 'traisi-question-sdk/survey-validation.model';
import { SurveyViewQuestion, ValidationError } from 'traisi-question-sdk';

/**
 * Represents a question isntance that is displayable.
 * @export
 * @interface QuestionInstance
 */
export interface QuestionInstance {
	id: string;

	index: number;

	model: SurveyViewQuestion;

	validationState: SurveyViewerValidationStateViewModel;

	component: any;

	questionInstanceState: QuestionInstanceState;

	repeat: number;

	// the specific value that is fed into repeat, ie, an index, or ordered 
	// response
	repeatValue?: any;

	// the entire repeat source (question response)
	repeatSource?: any;

	validationErrors: ValidationError[];
}
