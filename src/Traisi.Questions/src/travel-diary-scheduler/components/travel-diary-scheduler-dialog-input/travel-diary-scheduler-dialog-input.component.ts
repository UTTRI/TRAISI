import {
	Component,
	Inject,
	Injector,
	Input,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
} from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SurveyQuestion, SurveyRespondent, TimelineResponseData, TraisiValues } from 'traisi-question-sdk';
import { Purpose } from 'travel-diary-scheduler/models/purpose.model';
import { RespondentsData } from 'travel-diary-scheduler/models/respondent-data.model';
import { ScheduleInputState } from 'travel-diary-scheduler/models/schedule-input-state.model';
import { TimelineSchedulerData } from 'travel-diary-scheduler/models/timeline-scheduler-data.model';
import { TravelDiarySchedulerDialogState } from 'travel-diary-scheduler/models/travel-diary-scheduler-dialog-state.model';
import { TravelDiarySchedulerLogic } from 'travel-diary-scheduler/services/travel-diary-scheduler-logic.service';
import { TravelDiaryScheduleRespondentDataService } from 'travel-diary-scheduler/services/travel-diary-scheduler-respondent-data.service';
import { TravelDiaryScheduler } from 'travel-diary-scheduler/services/travel-diary-scheduler.service';

import templateString from './travel-diary-scheduler-dialog-input.component.html';
import styleString from './travel-diary-scheduler-dialog-input.component.scss';
@Component({
	selector: 'traisi-travel-diary-scheduler-dialog-input',
	template: '' + templateString,
	providers: [],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [],
	styles: ['' + styleString],
})
export class TravelDiarySchedulerDialogInput implements OnInit {
	private _isMapLoaded: boolean = false;

	private _mapComponent: any;

	@ViewChild('inputModal', { static: true })
	public modal: ModalDirective;

	@ViewChild('mapTemplate', { read: ViewContainerRef })
	public mapTemplate: ViewContainerRef;

	@Input()
	public scheduleIndex: number;

	public modalRef: BsModalRef;

	public isValid: boolean = false;

	public model: TimelineSchedulerData = <any>{ meta: {} };

	public onSaved: (data: TimelineSchedulerData) => void;

	public onCancelled: () => void;

	public respondents$: Observable<SurveyRespondent[]>;

	public get purposes(): Purpose[] {
		return this._scheduler.configuration.purpose;
	}

	public state: TravelDiarySchedulerDialogState = { collectFamilyMembers: false, isDropOffOrPickup: false };

	public get respondentsData(): RespondentsData {
		return this._respondentData.respondentsData;
	}

	public get primaryRespondent(): SurveyRespondent {
		return this._primaryRespondent;
	}

	public get respondentName(): string {
		return this._surveyRespondent.name;
	}

	/**
	 *
	 * @param _questionLoaderService
	 * @param _surveyRespondent
	 * @param _primaryRespondent
	 * @param _scheduler
	 * @param _injector
	 * @param _respondentData
	 */
	public constructor(
		@Inject(TraisiValues.QuestionLoader) private _questionLoaderService,
		@Inject(TraisiValues.Respondent) private _surveyRespondent,
		@Inject(TraisiValues.PrimaryRespondent) private _primaryRespondent,
		private _scheduler: TravelDiaryScheduler,
		private _injector: Injector,
		private _respondentData: TravelDiaryScheduleRespondentDataService
	) {}

	public ngOnInit(): void {
		this.respondents$ = this._respondentData.respondents$.pipe(
			map((v) => v.filter((r) => r.id !== this._surveyRespondent.id))
		);
	}

	/**
	 * Validates the current state of input
	 */
	public validate(): boolean {
		// determine that another passenger is selected
		this.isValid = true;
		if ((!this.state.isDropOffOrPickup && !this.model.address) || !this.model.latitude || !this.model.longitude) {
			this.isValid = false;
		} else if (
			this.state.isDropOffOrPickup &&
			(!this.model.address || this.model.meta.passengers?.length === 0 || !this.model.purpose)
		) {
			this.isValid = false;
		}

		return this.isValid;
	}

	/**
	 *
	 * @param model
	 */
	public show(model: TimelineResponseData): void {
		this.model = Object.assign({}, model);
		this.isValid = false;

		let purpose = this.purposes.find((x) => x.id === this.model.purpose);
		this.state = {
			collectFamilyMembers: purpose?.askIfOtherPassengers ?? false,
			isDropOffOrPickup: purpose?.isDropOffOrPickup ?? false,
		};
		this.modal.show();
		if (!this._isMapLoaded) {
			this._loadMapDisplay();
		}
		this.validate();
	}

	/**
	 *
	 */
	public dialogSave(): void {
		this.modal.hide();
		this.onSaved(this.model);
	}

	/**
	 *
	 */
	public hide(): void {
		this.modal.hide();
	}

	/**
	 *
	 * @param $event
	 */
	public modalShown($event: any): void {}

	/**
	 *
	 * @param $event
	 */
	public modalHidden($event: any): void {
		this.onCancelled();
	}

	/**
	 *
	 * @param value
	 */
	public locationResponseReceived = (value) => {
		this.model.address = value['address'];
		this.model.latitude = value['latitude'];
		this.model.longitude = value['longitude'];
		this.validate();
	};

	/**
	 *
	 * @param $event
	 */
	public onMembersChanged($event): void {
		// console.log($event);
		// this.model.meta['familyMembers'] = $event;
	}

	/**
	 *
	 * @param purpose
	 * @param passenger
	 */
	public onFacilitatePassengerPurposeChanged(purpose: Purpose): void {
		for (let passenger of this.model.meta.passengers) {
			passenger['purpose'] = purpose.id;
		}
		// retrieve passenger
		let passenger = this._respondentData.respondents.find((x) => x.id === purpose.respondentId);

		if (!passenger) {
			//no need to update map since no location data is associated with purpose
			this._mapComponent.resetInput();
			this.model.address = undefined;
			this.validate();
			return;
		}

		// find the matching purpose and update the location input
		let workPurpose = this.respondentsData.respondent[passenger.id].workLocations.find(
			(x) => x.purpose.id === purpose.id
		);
		let schoolPurpose = this.respondentsData.respondent[passenger.id].schoolLocations.find(
			(x) => x.purpose.id === purpose.id
		);

		if (purpose.id === this.respondentsData.homeLocation.purpose.id) {
			this.model.purpose = purpose.id;
			this.model.address = this.respondentsData.homeLocation.address;
			this.model.latitude = this.respondentsData.homeLocation.latitide;
			(this.model.longitude = this.respondentsData.homeLocation.longitude),
				this._mapComponent.setQuestionState(
					this.respondentsData.homeLocation.latitide,
					this.respondentsData.homeLocation.longitude,
					this.respondentsData.homeLocation.address
				);
		} else if (workPurpose) {
			this.model.purpose = workPurpose.purpose.id;
			this.model.address = workPurpose.address;
			this.model.latitude = workPurpose.latitide;
			this.model.longitude = workPurpose.longitude;
			this._mapComponent.setQuestionState(workPurpose.latitide, workPurpose.longitude, workPurpose.address);
		} else if (schoolPurpose) {
			this.model.purpose = schoolPurpose.purpose.id;
			this.model.address = schoolPurpose.address;
			this.model.latitude = schoolPurpose.latitide;
			this.model.longitude = schoolPurpose.longitude;
			this._mapComponent.setQuestionState(schoolPurpose.latitide, schoolPurpose.longitude, schoolPurpose.address);
		} else {
			this.model.address = undefined;
			this._mapComponent.resetInput();
		}
		this.validate();
	}

	/**
	 * Loads the map display into the dialog
	 */
	private _loadMapDisplay(): void {
		let componentRef = null;
		let factories = this._questionLoaderService.componentFactories;
		let sub = Object.keys(this._questionLoaderService.componentFactories).forEach((key) => {
			let factory = this._questionLoaderService.componentFactories[key];
			if (factory.selector === 'traisi-map-question') {
				componentRef = this.mapTemplate.createComponent(factory, undefined, this._injector);
				let instance: SurveyQuestion<any> = <SurveyQuestion<any>>componentRef.instance;
				instance.containerHeight = 300;
				instance['loadGeocoder'] = false;
				instance.response.subscribe(this.locationResponseReceived);
				this._mapComponent = instance;
				this._isMapLoaded = true;
			}
		});
	}
}
