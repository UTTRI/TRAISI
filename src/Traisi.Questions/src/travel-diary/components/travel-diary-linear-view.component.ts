import {
	Component,
	ViewEncapsulation,
	OnChanges,
	SimpleChanges,
	OnInit,
	Input,
	HostBinding,
	EventEmitter,
	Output,
} from '@angular/core';
import { CalendarWeekViewComponent, CalendarEvent } from 'angular-calendar';
import templateString from './travel-diary-linear-view.component.html';
import styleString from './travel-diary-linear-view.component.scss';
import { TravelDiaryEvent, TimelineLineResponseDisplayData } from 'travel-diary/models/consts';
import { TravelDiaryViewTimeEvent } from 'travel-diary/models/travel-diary-view-time-event.model';
import { Address } from 'traisi-question-sdk';
import { TravelDiaryService } from 'travel-diary/services/travel-diary.service';
import { TravelMode, Purpose } from 'travel-diary/models/travel-diary-configuration.model';
import { Observable } from 'rxjs';
@Component({
	// tslint:disable-line max-classes-per-file
	selector: 'traisi-travel-diary-linear-view',
	template: '' + templateString,
	styles: ['' + styleString],
	providers: [],
})
export class TravelDiaryLinearViewComponent implements OnInit {
	@Output() eventClicked = new EventEmitter<TravelDiaryEvent>();

	public get events$(): Observable<TravelDiaryEvent[]> {
		return this._travelDiaryService.diaryEvents$;
	}

	public constructor(private _travelDiaryService: TravelDiaryService) {}

	public ngOnInit(): void {}

	public onEventClicked(event: TravelDiaryEvent): void {
		this.eventClicked.next(event);
	}
}
