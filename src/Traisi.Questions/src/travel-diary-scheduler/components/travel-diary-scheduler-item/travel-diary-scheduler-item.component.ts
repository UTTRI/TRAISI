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
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
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
import { TimelineSchedulerData } from 'travel-diary-scheduler/models/timeline-scheduler-data.model';
import { SurveyRespondentUser } from 'travel-diary/models/consts';
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
	public model: TimelineSchedulerData;

	private _prevModel: TimelineSchedulerData;

	@Input()
	public scheduleIndex: number;

	@ViewChild('addressInputDialogTemplate', { read: TemplateRef })
	public addressInputDialogTemplate: TemplateRef<any>;

	@ViewChild('dialogInput')
	public dialogInput: TravelDiarySchedulerDialogInput;

	@ViewChild('confirmModal', { static: true })
	public confirmModal: ModalDirective;

	public dataCollected: boolean = false;

	public isInputValid: boolean = false;

	public modalRef: BsModalRef | null;

	private _defaultDate: Date;

	public get scheduleItems(): TimelineSchedulerData[] {
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
		return this._respondentData.respondentsData.respondent[this._respondent.id]?.schoolLocations;
	}

	public get definedHomeLocation(): PurposeLocation {
		return this._respondentData.respondentsData.homeLocation;
	}

	public get definedWorkLocations(): PurposeLocation[] {
		return this._respondentData.respondentsData.respondent[this._respondent.id]?.workLocations;
	}

	public get state(): ScheduleInputState {
		return this._schedulerLogic.inputState;
	}

	public get errorState(): TravelDiarySchedulerErrorState {
		return this._schedulerLogic.inputState.errorState;
	}

	public get respondent(): SurveyRespondent {
		return this._respondent;
	}

	public get scheduleItemsCount(): number {
		return this._scheduler.scheduleItems.length;
	}

	/**
	 *
	 * @param _scheduler
	 * @param _schedulerLogic
	 * @param _modalService
	 * @param _surveyAccessTime
	 * @param _respondent
	 * @param _respondentData
	 * @param ref
	 */
	public constructor(
		private _scheduler: TravelDiaryScheduler,
		private _schedulerLogic: TravelDiarySchedulerLogic,
		private _modalService: BsModalService,
		@Inject(TraisiValues.SurveyAccessTime) private _surveyAccessTime: Date,
		@Inject(TraisiValues.Respondent) private _respondent: SurveyRespondent,
		private _respondentData: TravelDiaryScheduleRespondentDataService,
		private ref: ChangeDetectorRef
	) {}

	public ngOnInit(): void {
		this._schedulerLogic.inputState = { model: this.model, scheduleIndex: this.scheduleIndex };
		if (!this.model.meta) {
			this.model.meta = {};
		}

		this._scheduler.activeScheduleItem.subscribe((x) => {
			if (x === this.scheduleIndex) {
				this.updateState();
			}
		});

		this._defaultDate = new Date(this._surveyAccessTime);

		let day = this._defaultDate.getDay();
		if (day === 0) {
			this._defaultDate.setDate(this._defaultDate.getDate() - 2);
		} else if (day === 1) {
			this._defaultDate.setDate(this._defaultDate.getDate() - 3);
		} else {
			this._defaultDate.setDate(this._defaultDate.getDate() - 1);
		}
		this._defaultDate.setHours(12);
		this._defaultDate.setMinutes(0);
		this._defaultDate.setSeconds(0);
		this._defaultDate.setMilliseconds(0);

		this._prevModel = Object.assign({}, this.model);
	}

	/**
	 * Called when the ng-select window closes.
	 * @param $event
	 */
	public purposeSelected(): void {
		let purpose = this.model.purpose;
		if (!purpose) {
			return;
		}
		let workPurpose = this.definedWorkLocations.find((x) => x.purpose.id === purpose);
		let schoolPurpose = this.definedSchoolLocations.find((x) => x.purpose.id === purpose);
		if (this.model.purpose !== this._prevModel.purpose) {
			this.model.address = {};
			this.model.latitude = undefined;
			this.model.longitude = undefined;
			this.model.meta = {};
		}

		if (purpose === this.definedHomeLocation.purpose.id) {
			this.model.purpose = purpose;
			this.model.address = this.definedHomeLocation.address;
			this.model.latitude = this.definedHomeLocation.latitide;
			this.model.longitude = this.definedHomeLocation.longitude;
		} else if (workPurpose) {
			this.model.purpose = workPurpose.purpose.id;
			this.model.address = workPurpose.address;
			this.model.latitude = workPurpose.latitide;
			this.model.longitude = workPurpose.longitude;
		} else if (schoolPurpose) {
			this.model.purpose = schoolPurpose.purpose.id;
			this.model.address = schoolPurpose.address;
			this.model.latitude = schoolPurpose.latitide;
			this.model.longitude = schoolPurpose.longitude;
		} else {
			this.model.purpose = purpose;
			this.openModal(this.addressInputDialogTemplate);
		}
		this._prevModel.purpose = purpose;

		this.updateState();
	}

	/**
	 *
	 * @param purpose
	 */
	public purposeModelChange(purpose: string): void {
		this.model.purpose = purpose;
		// this._prevModel = Object.assign({}, this.model);
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
		time.setFullYear(this._defaultDate.getFullYear());
		time.setMonth(this._defaultDate.getMonth());
		time.setDate(this._defaultDate.getDate());
		time.setMilliseconds(0);
		if (time.getHours() < 4 && time.getHours() >= 0) {
			// this needs to be adjusted
			time.setDate(time.getDate() + 1);
		}

		this.model.timeA = time;
		this.updateState();
	}

	/**
	 * Initializes the model time when user clicks on the time input control.
	 */
	public initTimeInput(): void {
		if (!this.model.timeA) {
			this.model.timeA = this._defaultDate;
			this.onDepartureTimeChanged(this.model.timeA);
		}
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
	 * Confirms the schedule and completes the input. Will ask if a return home trip needs to be made.
	 */
	public confirmScheduleItemAndComplete(): void {
		if (
			!this._scheduler.scheduleItems[this._scheduler.scheduleItems.length - 1].purpose.startsWith('home') &&
			this.scheduleIndex > 0
		) {
			this.confirmModal.show();
		} else {
			this._schedulerLogic.confirmAndCompleteSchedule();
		}
	}

	/**
	 * Confirms a return home trip, adds it to schedule
	 */
	public confirmReturnHome(): void {
		// add a home item
		this._schedulerLogic.confirmSchedule(false);
		this._scheduler.addHomeItem(
			this.definedHomeLocation?.address,
			this.definedHomeLocation?.latitide,
			this.definedHomeLocation?.longitude
		);
		this.confirmModal.hide();
	}

	/**
	 *
	 */
	public declineReturnHome(): void {
		this._schedulerLogic.confirmAndCompleteSchedule();
		this.confirmModal.hide();
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
			this.model.address = Object.assign({}, data.address);
			this.model.latitude = data.latitude;
			this.model.longitude = data.longitude;
			this.model.meta = Object.assign({}, data.meta);
			this.updateState();
		};

		this.dialogInput.onCancelled = () => {
			//this.model.purpose = undefined;
			// this.model.meta = {};
			this.updateState();
		};

		this.dialogInput.show(this.model);
	}

	/**
	 *
	 */
	public closeAddressInputDialog(): void {
		// clear purpose as address was reset
		this.model.purpose = undefined;
		this.modalRef.hide();
		this.updateState();
	}

	/**
	 *
	 */
	public saveAddressInputDialog(): void {
		// clear purpose as address was reset
		this.modalRef.hide();
		this.updateState();
	}

	/**
	 * When this scheduler item is active
	 */
	public setActive(): void {
		this.dataCollected = false;
		this.updateState();
	}
}
