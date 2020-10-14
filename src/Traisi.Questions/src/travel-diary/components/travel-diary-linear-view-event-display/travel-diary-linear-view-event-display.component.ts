import {
	Component,
	ViewEncapsulation,
	OnChanges,
	SimpleChanges,
	OnInit,
	Input,
	HostBinding,
	Inject,
} from '@angular/core';
import { CalendarWeekViewComponent, CalendarEvent } from 'angular-calendar';
import templateString from './travel-diary-linear-view-event-display.component.html';
import styleString from './travel-diary-linear-view-event-display.component.scss';
import { TravelDiaryEvent, TimelineLineResponseDisplayData } from 'travel-diary/models/consts';
import { TravelDiaryViewTimeEvent } from 'travel-diary/models/travel-diary-view-time-event.model';
import { Address, SurveyRespondent, TraisiValues } from 'traisi-question-sdk';
import { TravelDiaryService } from 'travel-diary/services/travel-diary.service';
import { TravelMode, Purpose } from 'travel-diary/models/travel-diary-configuration.model';
@Component({
	// tslint:disable-line max-classes-per-file
	selector: 'traisi-travel-diary-linear-view-event-display',
	template: '' + templateString,
	styles: ['' + styleString],
	providers: [],
})
export class TravelDiaryLinearViewEventDisplayComponent implements OnInit {
	@Input() public event: TravelDiaryEvent;

	public get model(): TimelineLineResponseDisplayData {
		return this.event.meta.model;
	}

	public get dateDisplay(): string {
		return this.model.timeA.toString();
	}

	public get isFirstEvent(): boolean {
		return this.event.start.getHours() === 0 && this.event.start.getMinutes() === 0;
	}

	public get mode(): TravelMode {
		return this._travelDiaryService.modeMap[this.model.mode];
	}

	public get purpose(): Purpose {
		return this._travelDiaryService.purposeMap[this.model.purpose];
	}

	public get addressDisplay(): string {
		let address = this.event.meta.model?.address as Address;
		if (address) {
			return `${address.formattedAddress}`;
		} else {
			return '';
		}
	}

	public constructor(
		private _travelDiaryService: TravelDiaryService,
		@Inject(TraisiValues.SurveyAccessTime) public surveyAccessTime: Date,
		@Inject(TraisiValues.Respondent) public surveyRespondent: SurveyRespondent
	) {}

	public ngOnInit(): void {}
}
