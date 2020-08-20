import {
	SurveyQuestion,
	ResponseTypes,
	OnVisibilityChanged,
	LocationResponseData,
	TimelineResponseData,
} from 'traisi-question-sdk';
import { Component, ViewEncapsulation, OnInit, AfterViewInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { setHours, isSameMonth, setMinutes, addHours } from 'date-fns';
import templateString from './travel-diary-question.component.html';
import styleString from './travel-diary-question.component.scss';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TravelDiaryService, colors } from './travel-diary.service';
import { CalendarEvent, CalendarView, CalendarDayViewComponent } from 'angular-calendar';
import { TravelDiaryEditDialogComponent } from './travel-diary-edit-dialog.component';
import { User, DayViewSchedulerComponent } from './day-view-scheduler.component';
import { BehaviorSubject } from 'rxjs';
@Component({
	selector: 'traisi-travel-diary-question',
	template: '' + templateString,
	providers: [TravelDiaryService],
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
		private _elementRef: ElementRef
	) {
		super();
	}

	events: CalendarEvent[] = [];

	public get users(): any[] {
		return this._travelDiaryService.respondents;
	}

	public newEvent(): void {
		this.entryDialog.show();
	}

	public entrySaved(event: TimelineResponseData & { users: User[] }) {
		console.log('saved');
		console.log(event);
		let events: CalendarEvent[] = [];
		for (let u of event.users) {
			events.push({
				title: event.name,
				start: event.timeA,
				end: event.timeB,
				draggable: true,
				resizable: { afterEnd: true },
				meta: {
					user: u,
				},
				color: colors.blue,
			});
		}
		this.events = events;
		console.log(this.events);
		// this.scheduleComponent.
	}

	public ngOnInit(): void {
		this._travelDiaryService.initialize();
	}
	public ngAfterViewInit(): void {}
	public onQuestionShown(): void {}
	public onQuestionHidden(): void {}

	public traisiOnInit(): void {
		console.log('in on init ');
	}

	public get isComponentLoaded(): BehaviorSubject<boolean> {
		return this._travelDiaryService.isLoaded;
	}
}
