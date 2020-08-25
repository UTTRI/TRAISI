import { Component, OnInit } from '@angular/core'
import {
  SurveyQuestion,
  ResponseTypes,
  QuestionConfiguration,
  SurveyViewer,
  OnSurveyQuestionInit,
  OnVisibilityChanged,
  OnSaveResponseStatus,
  StringResponseData,
  OnOptionsLoaded,
  QuestionOption,
} from 'traisi-question-sdk'
import templateString from './matrix-question.builder.component.html'
import styleString from './matrix-question.builder.component.scss'
@Component({
  selector: 'traisi-matrix-question',
  template: '' + templateString,
  styles: ['' + styleString],
})
export class MatrixQuestionBuilderComponent extends SurveyQuestion<ResponseTypes.Json> {

}