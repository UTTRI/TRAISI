import { Inject, Injectable, Injector } from '@angular/core';
import { EventEmitter } from 'events';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimelineResponseData, TraisiValues, SurveyRespondent, SurveyViewQuestion } from 'traisi-question-sdk';
import { TravelDiarySchedulerConfiguration } from 'travel-diary-scheduler/models/config.model';
import { RespondentData } from 'travel-diary-scheduler/models/respondent-data.model';
import { TravelDiaryScheduleRespondentDataService } from './travel-diary-scheduler-respondent-data.service';
// import { TravelDiaryScheduleItem } from 'travel-diary-scheduler/models/services/travel-diary-schedule-item.model';

@Injectable()
export class TravelDiaryScheduler {
	public scheduleItems: TimelineResponseData[];

	public activeScheduleItem: BehaviorSubject<number> = new BehaviorSubject<number>(0);

	public isScheduleConfirmed: boolean = false;

	public onScheduleConfirmed: Observable<void>;

	/**
	 *
	 * @param _surveyAccessTime
	 * @param _configuration
	 */
	public constructor(
		@Inject(TraisiValues.SurveyAccessTime) private _surveyAccessTime: Date,
		@Inject(TraisiValues.Configuration) private _configuration: TravelDiarySchedulerConfiguration,
		@Inject(TraisiValues.PrimaryRespondent) private _primaryRespondent: SurveyRespondent,
		private _respondentData: TravelDiaryScheduleRespondentDataService,
		private _injector: Injector
	) {
		this.scheduleItems = [];
		this.initialize();
		this.onScheduleConfirmed = new Subject<void>();
	}

	/**
	 *
	 */

	public clearItems(): void {
		this.scheduleItems = [];
	}

	public get configuration(): TravelDiarySchedulerConfiguration {
		return this._configuration;
	}

	/**
	 *
	 * @param idx
	 */
	public removeItem(idx: number): void {
		this.scheduleItems.splice(idx, 1);
		if (!this.isScheduleConfirmed) {
			this.activeScheduleItem.next(idx - 1);
		}
	}

	/**
	 *
	 */
	public unconfirmSchedule(): void {
		this.isScheduleConfirmed = false;
		this.activeScheduleItem.next(this.scheduleItems.length - 1);
	}

	/**
	 * Confirms the schedule
	 */
	public confirmSchedule(): void {
		this.isScheduleConfirmed = true;
		(<Subject<void>>this.onScheduleConfirmed).next();
	}

	/**
	 *
	 */
	public addItem(): void {
		this.scheduleItems.push({
			address: {},
			latitude: -1,
			longitude: -1,
			name: '<empty>',
			order: 0,
			purpose: undefined,
			timeA: new Date(new Date(this._surveyAccessTime).setHours(0, 0, 0, 0)),
			timeB: new Date(new Date(this._surveyAccessTime).setHours(0, 0, 0, 0)),
			identifier: undefined,
			mode: undefined,
		});
		this.activeScheduleItem.next(this.scheduleItems.length - 1);
	}

	/**
	 * Initialize properties and other misc data values
	 * needed for operation
	 */
	public initialize(): void {
		// initialize respondent data
		if (this.scheduleItems.length === 0) {
			// add default item at start of day
			this.addItem();
		}
	}
}
