import { QuestionInstanceState } from 'app/services/question-instance.service';
import { SurveyViewerValidationStateViewModel } from 'traisi-question-sdk/survey-validation.model';
import { SurveyViewQuestion } from 'traisi-question-sdk';


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
}
