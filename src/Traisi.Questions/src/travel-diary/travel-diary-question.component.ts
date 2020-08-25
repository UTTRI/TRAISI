import {
	SurveyQuestion,
	ResponseTypes,
	OnVisibilityChanged,
	LocationResponseData,
	TimelineResponseData,
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
} from '@angular/core';
import { setHours, isSameMonth, setMinutes, addHours } from 'date-fns';
import templateString from './travel-diary-question.component.html';
import styleString from './travel-diary-question.component.scss';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TravelDiaryService } from './services/travel-diary.service';
import { CalendarEvent, CalendarView, CalendarDayViewComponent } from 'angular-calendar';
import { TravelDiaryEditDialogComponent } from './components/travel-diary-edit-dialog.component';
import {  DayViewSchedulerComponent } from './components/day-view-scheduler.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { colors, DialogMode, TimelineLineResponseDisplayData } from './models/consts';
import { TravelDiaryEditor } from './services/travel-diary-editor.service';
@Component({
	selector: 'traisi-travel-diary-question',
	template: '' + templateString,
	providers: [TravelDiaryService,TravelDiaryEditor],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [],
	styles: ['' + styleString],
})
export class TravelDiaryQuestionComponent extends SurveyQuestion<ResponseTypes.Timeline>
	implements OnInit, AfterViewInit, OnVisibilityChanged {
	public viewDate: Date = new Date();

	public viewHeight: number = 100;

	@ViewChild('schedule')
	public scheduleComponent: DayViewSchedulerComponent;

	@ViewChild('entryDialog')
	public entryDialog: TravelDiaryEditDialogComponent;

	public constructor(
		private _travelDiaryService: TravelDiaryService,
		private _modalService: BsModalService,
		private _elementRef: ElementRef,
		private _injector: Injector
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

	public get users(): any[] {
		return this._travelDiaryService.respondents;
	}

	public newEvent(): void {
		this.entryDialog.show(DialogMode.New);
	}

	public editEvent(event): void {
		this.entryDialog.showEdit(event);
	}

	public newEntrySaved(event: TimelineLineResponseDisplayData) {
		this._travelDiaryService.newEvent(event);
	}

	public eventDeleted(event: TimelineLineResponseDisplayData): void {
		this._travelDiaryService.deleteEvent(event);
	}

	public ngOnInit(): void {
		this._travelDiaryService.initialize();
		this._travelDiaryService.diaryEvents$.subscribe(this.eventsUpdated);
	}

	public eventsUpdated = (events: CalendarEvent[]): void => {
		// this.scheduleComponent.refreshSubscription();
		if (this.scheduleComponent) {
			// this.scheduleComponent.refresh.next();
		}
	};

	public eventClicked({ event }: { event: CalendarEvent }): void {
		this.entryDialog.show(DialogMode.Edit, event.meta.model);
	}

	public ngAfterViewInit(): void {}
	public onQuestionShown(): void {}
	public onQuestionHidden(): void {}

	public traisiOnInit(): void {}

	public get isComponentLoaded(): BehaviorSubject<boolean> {
		return this._travelDiaryService.isLoaded;
	}
}
