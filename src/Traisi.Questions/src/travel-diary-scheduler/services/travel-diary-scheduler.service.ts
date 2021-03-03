import { Inject, Injectable, Injector } from '@angular/core';
import { EventEmitter } from 'events';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TimelineResponseData, TraisiValues, SurveyRespondent, SurveyViewQuestion, Address, ResponseValidationState } from 'traisi-question-sdk';
import { TravelDiarySchedulerConfiguration } from 'travel-diary-scheduler/models/config.model';
import { RespondentData } from 'travel-diary-scheduler/models/respondent-data.model';
import { TimelineSchedulerData } from 'travel-diary-scheduler/models/timeline-scheduler-data.model';
import { TravelDiarySchedulerQuestionComponent } from 'travel-diary-scheduler/travel-diary-scheduler-question.component';
import { TravelDiaryScheduleRespondentDataService } from './travel-diary-scheduler-respondent-data.service';
// import { TravelDiaryScheduleItem } from 'travel-diary-scheduler/models/services/travel-diary-schedule-item.model';

/**
 *
 */
@Injectable()
export class TravelDiaryScheduler {
	public scheduleItems: TimelineSchedulerData[];

	public activeScheduleItem: BehaviorSubject<number> = new BehaviorSubject<number>(0);

	public isScheduleConfirmed: boolean = false;

	public onScheduleConfirmed: Observable<void>;

	public component: TravelDiarySchedulerQuestionComponent;

	/**
	 *
	 * @param _surveyAccessTime
	 * @param _configuration
	 * @param _primaryRespondent
	 * @param _respondentData
	 * @param _injector
	 */
	public constructor(
		@Inject(TraisiValues.SurveyAccessTime) private _surveyAccessTime: Date,
		@Inject(TraisiValues.Configuration) private _configuration: TravelDiarySchedulerConfiguration,
		@Inject(TraisiValues.PrimaryRespondent) private _primaryRespondent: SurveyRespondent,
		private _respondentData: TravelDiaryScheduleRespondentDataService,
		private _injector: Injector
	) {
		this.scheduleItems = [];
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
		this.activeScheduleItem.next(-1);
		for (let item of this.scheduleItems) {
			item.isConfirmed = true;
		}
		(<Subject<void>>this.onScheduleConfirmed).next();
	}

	/**
	 * Adds an ew blank schedule item
	 */
	public addItem(): void {
		this.scheduleItems.push({
			address: {},
			latitude: -1,
			longitude: -1,
			name: null,
			order: 0,
			purpose: null,
			timeA: undefined,
			timeB: undefined,
			identifier: null,
			meta: {},
			mode: null,
		});
		this.activeScheduleItem.next(this.scheduleItems.length - 1);
	}

	/**
	 * Adds a prefilled home trip to the end of the schedule.
	 */
	public addHomeItem(homeAddress: Address, latitude: number, longitude: number): void {
		this.scheduleItems.push({
			address: homeAddress,
			latitude: latitude,
			longitude: longitude,
			name: null,
			order: 0,
			purpose: 'home-defined',
			timeA: undefined,
			timeB: undefined,
			identifier: null,
			meta: {},
			mode: null,
		});
		this.activeScheduleItem.next(this.scheduleItems.length - 1);
	}

	/**
	 * Initialize properties and other misc data values
	 * needed for operation
	 */
	public initialize(): void {
		this.component.savedResponse.subscribe((response: TimelineResponseData[]) => {
			this.scheduleItems = this.scheduleItems.concat(response);
			for (let item of this.scheduleItems) {
				item.isConfirmed = true;
			}

			if (this.scheduleItems.length === 0) {
				// add default item at start of day
				this.addItem();
			} else {
				this.isScheduleConfirmed = true;
				this.activeScheduleItem.next(-1);
				this.component.validationState.emit(ResponseValidationState.VALID);
			}
		});
	}
}
