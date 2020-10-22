import { ResponseValidationState } from './public_api'
import { ValidationState } from './question-response-state'

export interface ValidationStateViewModel {
  relatedQuestions?: number[] | undefined
  validationState: ValidationState
  errorMessages: string[] | undefined
}

export interface SurveyViewerValidationStateViewModel {
  isValid: boolean;
  isPartial?: boolean;
  clientValidationState?: ResponseValidationState
  questionValidationState: ValidationStateViewModel | undefined
  surveyLogicValidationState: ValidationStateViewModel | undefined
}
