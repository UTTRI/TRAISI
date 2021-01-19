import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import templateString from './travel-diary-logger.component.html';
import styleString from './travel-diary-logger.component.scss';

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
	ResponseValidationState,
	ResponseData,
	OptionSelectResponseData,
} from 'traisi-question-sdk';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'traisi-travel-diary-logger',
  template: '' + templateString,
  entryComponents: [],
	styles: ['' + styleString],
})
export class TravelDiaryLoggerComponent  extends SurveyQuestion<ResponseTypes.String>  implements OnInit {
  modalRef: BsModalRef;
  
  @ViewChild('dateInput', {static: true})
	public dateInput: BsDatepickerDirective;

  public dateData: Date;
  

  bsInlineValue = new Date();
  bsInlineRangeValue: Date[];
  maxDate = new Date();


	// public bsConfig: Partial<BsDatepickerConfig>;

  constructor(@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer, private modalService: BsModalService) {
		super();		
    this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
 
  }
  
	public ngOnInit(): void {
	//	this.savedResponse.subscribe(this.onSavedResponseData);

		
	}
 

  public loadConfigurationData(data: QuestionConfiguration[]): void {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  
}