import { Component, ViewEncapsulation, OnChanges, SimpleChanges, OnInit, Input, HostBinding, Inject } from '@angular/core';
import { CalendarWeekViewComponent, CalendarEvent } from 'angular-calendar';
import templateString from './travel-diary-event-display.component.html';
import styleString from './travel-diary-event-display.component.scss';
import { TravelDiaryEvent, TimelineLineResponseDisplayData } from 'travel-diary/models/consts';
import { TravelDiaryViewTimeEvent } from 'travel-diary/models/travel-diary-view-time-event.model';
import { Address, SurveyRespondent, TraisiValues } from 'traisi-question-sdk';
import { TravelDiaryService } from 'travel-diary/services/travel-diary.service';
import { TravelMode, Purpose } from 'travel-diary/models/travel-diary-configuration.model';
@Component({
	// tslint:disable-line max-classes-per-file
	selector: 'traisi-travel-diary-event-display',
	template: '' + templateString,
	styles: ['' + styleString],
	providers: [],
})
export class TravelDiaryEventDisplayComponent implements OnInit {
	@Input() public timeEvent: TravelDiaryViewTimeEvent;

	@HostBinding('class') public class = '';

	public get addressDisplay(): string {
		let address = this.timeEvent.event.meta.model?.address as Address;
		if (address) {
			return `${address.formattedAddress}`;
		} else {
			return '';
		}
	}

	public get model(): TimelineLineResponseDisplayData {
		return this.timeEvent.event.meta.model;
	}

	public get dateDisplay(): string {
		return this.model.timeA.toString();
	}

	public get isFirstEvent(): boolean {
		return this.timeEvent.event.start.getHours() === 0 && this.timeEvent.event.start.getMinutes() === 0;
	}

	public get mode(): TravelMode {
		return this._travelDiaryService.modeMap[this.model.mode];
	}

	public get purpose(): Purpose {
		return this._travelDiaryService.purposeMap[this.model.purpose];
	}

	public constructor(private _travelDiaryService: TravelDiaryService, 
		@Inject(TraisiValues.SurveyAccessTime) public surveyAccessTime: Date,
		@Inject(TraisiValues.SurveyAccessTime) public surveyRespondent: SurveyRespondent) {
	}

	public ngOnInit(): void {
		if (!this.timeEvent.event.meta.isValid) {
			this.class = '';
		} else if (this.timeEvent.event.meta.homeAllDay) {
			this.class = 'event-home-all-day';
		}
	}
}
