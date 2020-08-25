import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core'
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
  ResponseData,
  RangeResponseData,
  ResponseValidationState,
} from 'traisi-question-sdk'
import noUiSlider from 'nouislider'
import { BehaviorSubject } from 'rxjs'

import templateString from './range-question.component.html'
import styleString from './range-question.component.scss'
@Component({
  selector: 'traisi-range-question',
  template: '' + templateString,
  styles: ['' + styleString],
})
export class RangeQuestionComponent
  extends SurveyQuestion<ResponseTypes.Decminal>
  implements OnInit {
  public readonly QUESTION_TYPE_NAME: string = 'Range Question'

  @ViewChild('slider', { static: true })
  private sliderElement: ElementRef

  public sliderValue: BehaviorSubject<string>

  /**
   *
   * @param surveyViewerService
   */
  constructor(
    @Inject('SurveyViewerService') private surveyViewerService: SurveyViewer,
  ) {
    super()
    this.sliderValue = new BehaviorSubject<string>('')
  }

  public ngOnInit(): void {
    noUiSlider.create(this.sliderElement.nativeElement, {
      start: [0],
      step: parseInt(this.configuration['increment'], 10),
      range: {
        min: [parseInt(this.configuration['min'], 10)],
        max: [parseInt(this.configuration['max'], 10)],
      },
    })

    this.sliderElement.nativeElement.noUiSlider.on('update', this.sliderUpdate)

    this.savedResponse.subscribe(this.onSavedResponseData)
  }

  /**
   *
   */
  private onSavedResponseData: (
    response: ResponseData<ResponseTypes.Decminal>[] | 'none',
  ) => void = (response: ResponseData<ResponseTypes.Range>[] | 'none') => {
    if (response !== 'none') {
      let rangeResponse = <RangeResponseData>response[0]

      this.sliderValue.next(
        new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'CAD',
        }).format(rangeResponse['value']),
      )
      this.validationState.emit(ResponseValidationState.VALID)
    } else {
      console.log('no response')
      // console.log('no response value');
    }
  }

  public sliderUpdate = (values, handle, unencoded, isTap, positions): void => {
    // this.sliderValue = values[0];

    let value = parseInt(values[0], 10)
    this.response.emit({ value: value })
    this.sliderValue.next(
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'CAD',
      }).format(value),
    )
  }
}
