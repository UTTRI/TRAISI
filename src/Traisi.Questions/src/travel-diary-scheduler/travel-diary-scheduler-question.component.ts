import {
	SurveyQuestion,
	ResponseTypes,
	OnVisibilityChanged,
	LocationResponseData,
	TimelineResponseData,
	ResponseValidationState,
	ValidationError,
	SurveyRespondent,
	TraisiValues,
	SurveyAnalyticsService,
} from 'traisi-question-sdk';
import {
	Component,
	ViewEncapsulation,
	OnInit,
	AfterViewInit,
	ViewChild,
	ElementRef,
	TemplateRef,
	Injector,
	Inject,
	OnDestroy,
} from '@angular/core';
import { setHours, isSameMonth, setMinutes, addHours } from 'date-fns';
import templateString from './travel-diary-scheduler-question.component.html';
import styleString from './travel-diary-scheduler-question.component.scss';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TravelDiaryScheduler } from './services/travel-diary-scheduler.service';
import { TravelDiarySchedulerLogic } from './services/travel-diary-scheduler-logic.service';
import { TravelDiarySchedulerDialogInput } from './components/travel-diary-scheduler-dialog-input/travel-diary-scheduler-dialog-input.component';
import { TravelDiaryScheduleRespondentDataService } from './services/travel-diary-scheduler-respondent-data.service';

@Component({
	selector: 'traisi-travel-diary-scheduler-question',
	template: '' + templateString,
	providers: [TravelDiaryScheduler, TravelDiarySchedulerLogic, TravelDiaryScheduleRespondentDataService],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [],
	styles: ['' + styleString],
})
export class TravelDiarySchedulerQuestionComponent
	extends SurveyQuestion<ResponseTypes.Timeline>
	implements OnInit, AfterViewInit, OnVisibilityChanged, OnDestroy {
	public viewHeight: number = 100;

	public get scheduleItems(): TimelineResponseData[] {
		return this._scheduler.scheduleItems;
	}

	public get isScheduleConfirmed(): boolean {
		return this._scheduler.isScheduleConfirmed;
	}

	/**
	 *
	 * @param _modalService
	 * @param _elementRef
	 * @param _injector
	 * @param modalService
	 * @param _scheduler
	 * @param _respondent
	 * @param _primaryRespondent
	 * @param _analytics
	 */
	public constructor(
		private _modalService: BsModalService,
		private _elementRef: ElementRef,
		private _injector: Injector,
		private modalService: BsModalService,
		private _scheduler: TravelDiaryScheduler,
		private _scheulderLogic: TravelDiarySchedulerLogic,
		@Inject(TraisiValues.Respondent) private _respondent: SurveyRespondent,
		@Inject(TraisiValues.PrimaryRespondent) private _primaryRespondent: SurveyRespondent,
		@Inject(TraisiValues.SurveyAnalytics) private _analytics: SurveyAnalyticsService
	) {
		super();
		// this.isFillVertical = true;
	}
	public ngOnInit(): void {
		// mark invalid
		this.validationState.emit(ResponseValidationState.INVALID);
		this._scheduler.component = this;
		this._scheduler.initialize();
		this._scheduler.onScheduleConfirmed.subscribe(this.onScheduleConfirmed);
	}
	public ngAfterViewInit(): void {
		// throw new Error('Method not implemented.');
	}
	public onQuestionShown(): void {
		// throw new Error('Method not implemented.');
	}
	public onQuestionHidden(): void {
		// new Error('Method not implemented.');
	}
	public ngOnDestroy(): void {
		// throw new Error('Method not implemented.');
	}

	/**
	 * Unconfirms the schedule diary, so it can be re-edited.
	 */
	public unconfirmSchedule(): void {
		this._scheduler.unconfirmSchedule();
	}

	/**
	 *
	 * @param idx
	 */
	public editSchedulerItem(idx: number): void {}

	/**
	 * Callback for when schedule has been confirmed
	 */
	public onScheduleConfirmed = (): void => {
		console.log('schedule confirmed');
		console.log(this._scheduler.scheduleItems);
		this.response.emit(this._scheduler.scheduleItems);
	};
}
