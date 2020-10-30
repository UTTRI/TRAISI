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
import templateString from './travel-diary-question.component.html';
import styleString from './travel-diary-question.component.scss';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TravelDiaryService } from './services/travel-diary.service';
import { CalendarEvent, CalendarView, CalendarDayViewComponent } from 'angular-calendar';
import { TravelDiaryEditDialogComponent } from './components/travel-diary-edit-dialog.component';
import { DayViewSchedulerComponent } from './components/day-view-scheduler.component';
import { BehaviorSubject, Observable, of, Subscriber } from 'rxjs';
import {
	colors,
	DialogMode,
	TimelineLineResponseDisplayData,
	SurveyRespondentUser,
	TravelDiaryEvent,
} from './models/consts';
import { TravelDiaryEditor } from './services/travel-diary-editor.service';
import { ReturnTimeValidatorDirective } from './validators/return-time.directive';
import { TravelDiaryTourService } from './services/travel-diary-tour.service';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
// import { tour } from './tour/travel-diary-tour';
@Component({
	selector: 'traisi-travel-diary-question',
	template: '' + templateString,
	providers: [TravelDiaryService, TravelDiaryEditor, ReturnTimeValidatorDirective, TravelDiaryTourService],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [],
	styles: ['' + styleString],
})
export class TravelDiaryQuestionComponent extends SurveyQuestion<ResponseTypes.Timeline>
	implements OnInit, AfterViewInit, OnVisibilityChanged, OnDestroy {
	public viewHeight: number = 100;

	@ViewChild('schedule')
	public scheduleComponent: DayViewSchedulerComponent;

	@ViewChild('entryDialog')
	public entryDialog: TravelDiaryEditDialogComponent;

	@ViewChild('dropdownToggle')
	public dropdownToggle: BsDropdownDirective;

	@ViewChild('template', { read: TemplateRef })
	public template: TemplateRef<any>;

	@ViewChild('activitySwap', { read: TemplateRef })
	public activitySwapTemplate: TemplateRef<any>;

	@ViewChild('confirmNoReturnHome', { read: TemplateRef })
	public confirmNoReturnHomeTemplate: TemplateRef<any>;

	@ViewChild('confirmSingleTrip', { read: TemplateRef })
	public confirmSingleTripTemplate: TemplateRef<any>;

	private _isValid: boolean = false;

	public modalRef: BsModalRef | null;

	public isSummaryTravelDiaryView: boolean = false;

	public navigateNextEnabled: boolean = false;

	private _navigateObs: Subscriber<{ cancel: boolean }>;

	private _startTime: number;

	/**
	 *
	 * @param _travelDiaryService
	 * @param _modalService
	 * @param _elementRef
	 * @param _injector
	 * @param _tour
	 * @param modalService
	 * @param _respondent
	 * @param _primaryRespondent
	 * @param _analytics
	 */
	public constructor(
		private _travelDiaryService: TravelDiaryService,
		private _modalService: BsModalService,
		private _elementRef: ElementRef,
		private _injector: Injector,
		private _tour: TravelDiaryTourService,
		private modalService: BsModalService,
		@Inject(TraisiValues.Respondent) private _respondent: SurveyRespondent,
		@Inject(TraisiValues.PrimaryRespondent) private _primaryRespondent: SurveyRespondent,
		@Inject(TraisiValues.SurveyAnalytics) private _analytics: SurveyAnalyticsService
	) {
		super();
		this.isFillVertical = true;
	}

	public get events$(): Observable<CalendarEvent[]> {
		return this._travelDiaryService.diaryEvents$;
	}

	public get events(): CalendarEvent[] {
		return this._travelDiaryService.diaryEvents;
	}

	public get users(): Observable<any> {
		return this._travelDiaryService.activeUsers;
	}

	public get isTravelDiaryValid(): boolean {
		return this._isValid;
	}

	public get viewDate(): Date {
		return this._travelDiaryService.viewDate;
	}

	public get respondentName(): string {
		return this._respondent.name;
	}

	public get isTravelDiaryCollectionDisabled(): boolean {
		return this._travelDiaryService.isActiveUserDisabled;
	}

	public newEvent(): void {
		this._tour.stopTour();
		this.entryDialog.show(DialogMode.New);
	}

	public newEntrySaved(event: TimelineLineResponseDisplayData) {
		this._travelDiaryService.newEvent(event);
	}

	public eventSaved(event: { oldData: TimelineLineResponseDisplayData; newData: TimelineLineResponseDisplayData }) {
		this._travelDiaryService.updateEvent(event.newData, event.oldData);
		this._analytics.sendEvent('Travel Diary Events', 'travel_diary_event_saved');
	}

	public eventDeleted(event: TimelineLineResponseDisplayData): void {
		this._travelDiaryService.deleteEvent(event);
		this._analytics.sendEvent('Travel Diary Events', 'travel_diary_event_deleted');
	}

	public resetEvents(): void {
		this._travelDiaryService.resetTravelDiary().subscribe({
			complete: () => {
				if (this._travelDiaryService.diaryEvents$.value.length > 0) {
					if (this._travelDiaryService.diaryEvents$.value[0].meta.model.timeA.getHours() > 2) {
						// create new home event
						this.entryDialog.show(DialogMode.CreateHome);
					}
				}
			},
		});
		this._analytics.sendEvent('Travel Diary Events', 'travel_diary_events_reset');
	}

	public clearEvents(): void {
		this._travelDiaryService.clearTravelDiary();
		this.entryDialog.show(DialogMode.CreateHome);
		this._analytics.sendEvent('Travel Diary Events', 'travel_diary_events_cleared');
	}

	public ngOnInit(): void {
		this._travelDiaryService.initialize();
		this._travelDiaryService.diaryEvents$.subscribe(this.eventsUpdated);
		this._travelDiaryService.activeUsers.subscribe(this.usersUpdated);
		this._travelDiaryService.inactiveDiaryEvents$.subscribe(this.inactiveEventsUpdated);

		this._travelDiaryService.isLoaded.subscribe((v) => {
			if (v) {
				setTimeout(() => this.startTour());
			} else {
				//this._tour.initializeSubTour(this.dropdownToggle);
				// setTimeout(() => this.startTour());
			}
		});

		this._tour.tourEnded.subscribe((x) => {
			if (this._travelDiaryService.diaryEvents$.value.length > 0) {
				if (this._travelDiaryService.diaryEvents$.value[0].meta.model.timeA.getHours() > 2) {
					// create new home event
					this.entryDialog.show(DialogMode.CreateHome);
				}
			}
		});
	}

	public usersUpdated = (users: SurveyRespondentUser[]): void => {};

	/**
	 *
	 * @param events
	 */
	public eventsUpdated = (events: CalendarEvent[]): void => {
		// check events for activity sap
		for (let e of events) {
			if (e.meta.model.isRequireDepartureConfirm) {
				this.openModal(this.activitySwapTemplate);
				break;
			}
		}

		if (!this._travelDiaryService.isActiveUserDisabled) {
			let isValid = this._travelDiaryService.isTravelDiaryValid;
			this._isValid = isValid;

			if (isValid) {
				this.saveTravelDiary();
			} else {
				this.saveTemporaryTravelDiary();
			}
			if (this._travelDiaryService.isLoaded.value && isValid) {
				this.validationState.emit(ResponseValidationState.VALID);
			} else {
				this.validationState.emit(ResponseValidationState.INVALID);
			}
		} else {
			this.validationState.emit(ResponseValidationState.VALID);
		}
	};

	/**
	 *
	 * @param events
	 */
	public inactiveEventsUpdated = (events: TravelDiaryEvent[]): void => {
		if (events.length > 0) {
			let respondent = events[0].meta.model.users[0];
			this.saveInactiveTravelDiary(respondent);
		}
	};

	/**
	 * Saves the travel diary for all active respondents
	 */
	public saveTravelDiary(): void {
		if (this._travelDiaryService.isLoaded.value) {
			for (let r of this._travelDiaryService.activeRespondents) {
				this.responseWithRespondent.emit({
					respondent: r,
					response: this._travelDiaryService.getTimelineResponseDataForRespondent(r),
				});
			}
		}
	}

	/**
	 *
	 */
	public saveTemporaryTravelDiary(): void {
		if (this._travelDiaryService.isLoaded.value) {
			for (let r of this._travelDiaryService.activeRespondents) {
				let response = {
					respondent: r,
					response: this._travelDiaryService.getTimelineResponseDataForRespondent(r),
					isPartial: true,
				};
				this.responseWithRespondent.emit(response);
			}
		}
	}

	/**
	 *
	 * @param value
	 */
	public setSummaryTavelDiaryView(value: boolean): void {
		this.isSummaryTravelDiaryView = value;
		this._analytics.sendEvent(
			'Travel Diary Events',
			value ? 'travel_diary_activated_summary_view' : 'travel_diary_activated_linear_view'
		);
	}

	/**
	 * Saves the inactive
	 * @param respondent
	 */
	public saveInactiveTravelDiary(respondent: SurveyRespondentUser): void {
		if (this._travelDiaryService.isLoaded.value) {
			let response = this._travelDiaryService.getTimelineResponseDataForRespondent(respondent);
			this.responseWithRespondent.emit({
				respondent: respondent,
				response: response,
			});
		}
	}

	public eventClicked({ event }: { event: CalendarEvent }): void {
		this.entryDialog.show(DialogMode.Edit, event.meta.model);
	}

	public linearViewEventClicked(event: TravelDiaryEvent): void {
		this.entryDialog.show(DialogMode.Edit, event.meta.model);
	}

	public startTour(full: boolean = false): void {
		if (!this.isTravelDiaryCollectionDisabled) {
			if (this._respondent.id === this._primaryRespondent.id || full) {
				this._tour.initialize(this.dropdownToggle);
			} else {
				this._tour.initializeSubTour(this.dropdownToggle);
			}
			this._tour.startTour();
		}
		this._analytics.sendEvent('Travel Diary Events', 'travel_diary_manual_start_tour');
	}

	public ngAfterViewInit(): void {}
	public onQuestionShown(): void {}
	public onQuestionHidden(): void {}

	public ngOnDestroy(): void {
		this._analytics.sendTiming(
			'travel_diary_user_view_active',
			new Date().getTime() - this._startTime,
			'Travel Diary Timing'
		);
	}

	public get isComponentLoaded(): BehaviorSubject<boolean> {
		return this._travelDiaryService.isLoaded;
	}

	public reportErrors(): Observable<ValidationError[]> {
		return this._travelDiaryService.reportErrors();
	}

	/**
	 *
	 */
	public onWillNavigateNext(): Observable<{ cancel: boolean }> {
		if (!this._travelDiaryService.isTravelDiaryValid) {
			return of({ cancel: false });
		} else if (
			this._travelDiaryService.checkHasRequiredReturnHome() &&
			this._travelDiaryService.checkHasAtLeastOneTrip()
		) {
			return of({ cancel: false });
		}

		let s = this.modalService.onHidden.subscribe(() => {
			if (this._navigateObs) {
				this._navigateObs.next({ cancel: true });
				this._navigateObs.complete();
				s.unsubscribe();
			}
		});

		this.navigateNextEnabled = false;
		setTimeout(() => {
			this.navigateNextEnabled = true;
		}, 4000);
		if (!this._travelDiaryService.checkHasRequiredReturnHome()) {
			this.openModal(this.confirmNoReturnHomeTemplate);
		} else if (!this._travelDiaryService.checkHasAtLeastOneTrip()) {
			this.openModal(this.confirmSingleTripTemplate);
		}

		return new Observable((obs) => {
			this._navigateObs = obs;
		});
	}

	/**
	 *
	 * @param template
	 */
	public openModal(template: TemplateRef<any>): void {
		this.modalRef = this.modalService.show(template, { class: 'modal-dialog-centered' });
	}

	public confirm(): void {
		this._navigateObs.next({ cancel: false });
		this._navigateObs.complete();
		this._navigateObs = undefined;
		this.modalRef.hide();
	}

	public decline(): void {
		this._navigateObs.next({ cancel: true });
		this._navigateObs.complete();
		this._navigateObs = undefined;
		this.modalRef.hide();
	}

	public traisiOnInit(): void {
		this._startTime = new Date().getTime();
	}
}
