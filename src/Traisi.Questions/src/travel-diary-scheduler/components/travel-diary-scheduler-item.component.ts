import { Component, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TimelineResponseData } from 'traisi-question-sdk';
import { ScheduleInputState } from 'travel-diary-scheduler/models/schedule-input-state.model';
import { TravelDiarySchedulerLogic } from 'travel-diary-scheduler/services/travel-diary-scheduler-logic.service';
import { TravelDiaryScheduler } from 'travel-diary-scheduler/services/travel-diary-scheduler.service';
import { TravelDiarySchedulerDialogInput } from './travel-diary-scheduler-dialog-input/travel-diary-scheduler-dialog-input.component';

import templateString from './travel-diary-scheduler-item.component.html';
import styleString from './travel-diary-scheduler-item.component.scss';
@Component({
	selector: 'traisi-travel-diary-scheduler-item',
	template: '' + templateString,
	providers: [TravelDiarySchedulerLogic],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [],
	styles: ['' + styleString],
})
export class TravelDiarySchedulerItemComponent implements OnInit {
	@Input()
	public model: TimelineResponseData;

	@Input()
	public scheduleIndex: number;

	@ViewChild('addressInputDialogTemplate', { read: TemplateRef })
	public addressInputDialogTemplate: TemplateRef<any>;

    @ViewChild('dialogInput')
	public dialogInput: TravelDiarySchedulerDialogInput;

	public dataCollected: boolean = false;

	public purposes: string[] = ['Home', 'School', 'Work', 'Other'];

	public modes: string[] = ['Auto', 'Bus', 'Walk', 'Fly', 'Swim'];

	public isInputValid: boolean = false;

	public state: ScheduleInputState = {};

	public purposesExtended: string[] = [
		'Return Home',
		'School',
		'Work',
		'Work (other member)',
		'School (other member)',
		'Other',
		'Stay Home All Day',
	];

	public modalRef: BsModalRef | null;

	public get scheduleItems(): TimelineResponseData[] {
		return this._scheduler.scheduleItems;
	}

	/**
	 *
	 * @param _scheduler
	 * @param _schedulerLogic
	 * @param _modalService
	 */
	private constructor(
		private _scheduler: TravelDiaryScheduler,
		private _schedulerLogic: TravelDiarySchedulerLogic,
		private _modalService: BsModalService
	) {}

	public ngOnInit(): void {
		
		this.state = { model: this.model, scheduleIndex: this.scheduleIndex };
		this._schedulerLogic.inputState = this.state;
	}



	/**
	 *
	 */
	public onPurposeChanged(): void {
		if (this.model.purpose.toLocaleLowerCase() === 'other') {
			// show dialog for collecting address
			this.openModal(this.addressInputDialogTemplate);
		} else {
			// simply update the state
			this.updateState();
		}
	}

	/**
	 *
	 */
	public onModeChanged(): void {
		this.updateState();
	}

	/**
	 *
	 * @param time
	 */
	public onDepartureTimeChanged(time: Date): void {
		this.updateState();
	}

	/**
	 *
	 * @param val
	 */
	public onLastLocationChanged(val: string): void {
		console.log(this.state.returnHomeResponse);
	}

	/**
	 *
	 */
	public updateState(): void {
		this._schedulerLogic.updateScheduleInputState();
	}

	/**
	 *
	 */
	public confirmScheduleItem(): void {
		this._schedulerLogic.confirmSchedule();
		
	}

	/**
	 *
	 */
	public removeScheduleItem(): void {
		this._scheduler.removeItem(this.scheduleIndex);
	}

	/**
	 *
	 * @param template
	 */
	public openModal(template: TemplateRef<any>): void {
		// this.modalRef = this._modalService.show(template, { class: 'modal-dialog-centered' });
        this.dialogInput.show();
	}

	public closeAddressInputDialog(): void {
		// clear purpose as address was reset
		this.model.purpose = undefined;
		this.modalRef.hide();
		this.updateState();
	}

	public saveAddressInputDialog(): void {
		// clear purpose as address was reset
		this.modalRef.hide();
		this.updateState();
	}

	public setActive(): void {
		this.dataCollected = false;
	}
}
