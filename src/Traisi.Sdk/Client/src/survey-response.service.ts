import { Observable } from 'rxjs'
import { SurveyRespondent } from './survey-respondent.model'
import {
  ResponseTypes,
  ResponseData,
  QuestionResponseType,
} from './survey-question'
import { SurveyViewQuestion } from './survey-view-question.model'
import { SurveyViewerValidationStateViewModel } from './survey-validation.model'
import { ResponseModel } from './models'
export abstract class SurveyResponseService {
  id: number
  abstract listSurveyResponsesOfType(
    surveyId: number,
    type: QuestionResponseType,
  ): Observable<any>
  abstract saveResponse(
    question: SurveyViewQuestion,
    respondent: SurveyRespondent,
    repeat: number,
    responseData: Array<ResponseData<ResponseTypes>>,
    isPartial: boolean
  ): Observable<SurveyViewerValidationStateViewModel>

  abstract loadSavedResponsesForRespondents(
    questions: Array<SurveyViewQuestion>,
    respondents: Array<SurveyRespondent>,
  ): Observable<ResponseModel[]>
}
