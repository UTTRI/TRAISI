import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TravelDiarySchedulerItemComponent } from 'travel-diary-scheduler/components/travel-diary-scheduler-item/travel-diary-scheduler-item.component';
import { TravelDiarySchedulerErrorState } from 'travel-diary-scheduler/models/error-state.model';
import { ScheduleInputState } from 'travel-diary-scheduler/models/schedule-input-state.model';
import { TravelDiaryScheduler } from './travel-diary-scheduler.service';

@Injectable()
export class TravelDiarySchedulerLogic {
	public inputState: ScheduleInputState;

	

	/**
	 *
	 * @param _scheduler
	 */
	public constructor(private _scheduler: TravelDiaryScheduler) {
		this._scheduler.activeScheduleItem.subscribe(this._onActiveScheduleItemChanged);
	}

	/**
	 *
	 * @param idx
	 */
	private _onActiveScheduleItemChanged = (idx: number) => {
		if (this.inputState?.scheduleIndex === idx) {
			this.inputState.isConfirmed = false;
		}
	};

	public updateScheduleInputState(): void {
		this.inputState.canAdvance = this.inputState.isValid = this.canAdvance();
	}

	/**
	 *
	 */
	public confirmSchedule(): void {
		if (this.inputState.returnHomeResponse === 'yes') {
			this.inputState.model.purpose = 'Home';
			this._scheduler.isScheduleConfirmed = true;
		} else if (
			this.inputState.model.purpose &&
			this.inputState.model.purpose.toLocaleLowerCase() === 'return home'
		) {
			this.inputState.model.purpose = 'Home';
			this._scheduler.isScheduleConfirmed = true;
		} else {
			this._scheduler.addItem();
		}
		this.inputState.isConfirmed = true;
	}

	/**
	 *
	 */
	public confirmAndCompleteSchedule(): void {
		// remove last item
		this._scheduler.removeItem(this._scheduler.scheduleItems.length - 1);
		this._scheduler.confirmSchedule();
		this.inputState.isConfirmed = true;
		


	}

	/**
	 *
	 * @param model
	 * @param idx
	 */
	public canAdvance(): boolean {
		this.inputState.errorState = this.validate();
		return this.inputState.errorState.isValid;
	}

	/**
	 * Validates the current state of the travel diary.
	 */
	public validate(): TravelDiarySchedulerErrorState {
		let state: TravelDiarySchedulerErrorState = {
			invalidTime: false,
			isValid: true,
		};

		let idx = this.inputState.scheduleIndex;
		let model = this.inputState.model;
		if (idx === 0 && !model.purpose) {
			state.isValid = false;
		} else if (idx > 0 && (!model.timeA || !model.mode || !model.purpose)) {
			state.isValid = false;
		}

		for (let i = 2; i < this._scheduler.scheduleItems.length; i++) {
			if (this._scheduler.scheduleItems[i - 1].timeA >= this._scheduler.scheduleItems[i].timeA) {
				state.invalidTime = true;
				state.isValid = false;
			}
		}
		return state;
	}
}
