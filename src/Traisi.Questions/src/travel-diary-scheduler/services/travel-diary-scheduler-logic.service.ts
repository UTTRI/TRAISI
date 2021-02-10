import { Injectable } from '@angular/core';
import { ScheduleInputState } from 'travel-diary-scheduler/models/schedule-input-state.model';
import { TravelDiaryScheduler } from './travel-diary-scheduler.service';

@Injectable()
export class TravelDiarySchedulerLogic {
	public inputState: ScheduleInputState;

	/**
	 *
	 * @param _scheduler
	 */
	private constructor(private _scheduler: TravelDiaryScheduler) {
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
		} else if (this.inputState.model.purpose.toLocaleLowerCase() === 'return home') {
			this.inputState.model.purpose = 'Home';
			this._scheduler.isScheduleConfirmed = true;
		} 
        
        else {
			this._scheduler.addItem();
		}
		this.inputState.isConfirmed = true;
	}

	/**
	 *
	 * @param model
	 * @param idx
	 */
	public canAdvance(): boolean {
		let idx = this.inputState.scheduleIndex;
		let model = this.inputState.model;
		if (idx === 0 && !model.purpose) {
			return false;
		} else if (idx > 0 && (!model.timeA || !model.mode || !model.purpose)) {
			return false;
		}
		return true;
	}
}
