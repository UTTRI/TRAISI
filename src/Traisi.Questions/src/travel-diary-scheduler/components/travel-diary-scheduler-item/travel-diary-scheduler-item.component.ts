import {
	ChangeDetectorRef,
	Component,
	Inject,
	Input,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Address, SurveyRespondent, TimelineResponseData, TraisiValues } from 'traisi-question-sdk';
import { ScheduleInputState } from 'travel-diary-scheduler/models/schedule-input-state.model';
import { TravelDiarySchedulerLogic } from '../../services/travel-diary-scheduler-logic.service';
import { TravelDiaryScheduler } from 'travel-diary-scheduler/services/travel-diary-scheduler.service';
import { TravelDiarySchedulerDialogInput } from '../travel-diary-scheduler-dialog-input/travel-diary-scheduler-dialog-input.component';

import templateString from './travel-diary-scheduler-item.component.html';
import styleString from './travel-diary-scheduler-item.component.scss';
import { TravelDiarySchedulerConfiguration } from 'travel-diary-scheduler/models/config.model';
import { TravelDiaryScheduleRespondentDataService } from 'travel-diary-scheduler/services/travel-diary-scheduler-respondent-data.service';
import { PurposeLocation } from 'travel-diary-scheduler/models/purpose-location.model';
import { Purpose } from 'travel-diary/models/travel-diary-configuration.model';
import { TravelDiarySchedulerErrorState } from 'travel-diary-scheduler/models/error-state.model';
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

	public isInputValid: boolean = false;

	public modalRef: BsModalRef | null;

	public get scheduleItems(): TimelineResponseData[] {
		return this._scheduler.scheduleItems;
	}

	public get modes(): any[] {
		return this._scheduler.configuration.mode;
	}
	public get purposes(): any[] {
		return this._scheduler.configuration.purpose;
	}

	public get configuration(): TravelDiarySchedulerConfiguration {
		return this._scheduler.configuration;
	}

	public get definedSchoolLocations(): PurposeLocation[] {
		return this._respondentData.respondentData.schoolLocations;
	}

	public get definedHomeLocation(): PurposeLocation {
		return this._respondentData.respondentData.homeLocation;
	}

	public get definedWorkLocations(): PurposeLocation[] {
		return this._respondentData.respondentData.workLocations;
	}

	public get state(): ScheduleInputState {
		return this._schedulerLogic.inputState;
	}

	public get errorState(): TravelDiarySchedulerErrorState {
		return this._schedulerLogic.inputState.errorState;
	}

	/**
	 *
	 * @param _scheduler
	 * @param _schedulerLogic
	 * @param _modalService
	 */
	public constructor(
		private _scheduler: TravelDiaryScheduler,
		private _schedulerLogic: TravelDiarySchedulerLogic,
		private _modalService: BsModalService,
		private _respondentData: TravelDiaryScheduleRespondentDataService,
		private ref: ChangeDetectorRef
	) {}

	public ngOnInit(): void {
		this._schedulerLogic.inputState = { model: this.model, scheduleIndex: this.scheduleIndex };
		if (!this.model.meta) {
			this.model.meta = {};
		}
	}

	/**
	 *
	 * @param purpose
	 */
	public onPurposeChanged(purpose: Purpose): void {
		let workPurpose = this.definedWorkLocations.find((x) => x.purpose.id === purpose.id);
		let schoolPurpose = this.definedSchoolLocations.find((x) => x.purpose.id === purpose.id);
		if (purpose.id === this.definedHomeLocation.purpose.id) {
			this.model.purpose = purpose.id;
			this.model.address = this.definedHomeLocation.address;
		} else if (workPurpose) {
			this.model.purpose = workPurpose.purpose.id;
			this.model.address = workPurpose.address;
		} else if (workPurpose) {
			this.model.purpose = schoolPurpose.purpose.id;
			this.model.address = schoolPurpose.address;
		} else {
			this.model.purpose = purpose.id;
			this.openModal(this.addressInputDialogTemplate);
		}

		this.updateState();
		console.log(this.model);
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
		this.model.timeA = time;
		this.updateState();
	}

	/**
	 *
	 * @param val
	 */
	public onLastLocationChanged(val: string): void {}

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
	public confirmScheduleItemAndComplete(): void {
		this._schedulerLogic.confirmAndCompleteSchedule();
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
		this.dialogInput.onSaved = (data) => {
			this.model.address = data.address;
			this.model.latitude = data.latitude;
			this.model.longitude = data.longitude;
			this.model.meta = data.meta;
		};

		this.dialogInput.show(this.model);
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
