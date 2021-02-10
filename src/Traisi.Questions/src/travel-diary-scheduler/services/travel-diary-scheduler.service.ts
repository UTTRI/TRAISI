import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { BehaviorSubject } from 'rxjs';
import { TimelineResponseData } from 'traisi-question-sdk';
import { TravelDiaryScheduleItem } from 'travel-diary-scheduler/models/services/travel-diary-schedule-item.model';

@Injectable()
export class TravelDiaryScheduler {
	public scheduleItems: TimelineResponseData[];

	public activeScheduleItem: BehaviorSubject<number> = new BehaviorSubject<number>(0);

	public isScheduleConfirmed: boolean = false;

	public constructor() {
		this.scheduleItems = [];
		this.initialize();
	}

	public clearItems(): void {
		this.scheduleItems = [];
	}

	/**
	 *
	 * @param idx
	 */
	public removeItem(idx: number): void {
		this.scheduleItems.splice(idx, 1);
		this.activeScheduleItem.next(idx - 1);
	}

	public unconfirmSchedule(): void {
		this.isScheduleConfirmed = false;
		this.activeScheduleItem.next(this.scheduleItems.length - 1);
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
			timeA: new Date(),
			timeB: new Date(),
			identifier: undefined,
			mode: undefined,
		});
		this.activeScheduleItem.next(this.scheduleItems.length - 1);
	}

	/**
	 *
	 */
	public initialize(): void {
		if (this.scheduleItems.length === 0) {
			// add default item at start of day
			this.addItem();
		}
	}
}
