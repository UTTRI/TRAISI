import {
	SurveyQuestion,
	ResponseTypes,
	OnVisibilityChanged,
	TimelineResponseData,
	TraisiValues,
	SurveyRespondent,
} from 'traisi-question-sdk';
import {
	Component,
	ViewEncapsulation,
	Output,
	EventEmitter,
	ViewChild,
	TemplateRef,
	OnInit,
	Inject,
	ViewContainerRef,
	Injector,
	AfterViewInit,
	SkipSelf,
	ApplicationRef,
	ChangeDetectorRef,
} from '@angular/core';
import templateString from './travel-diary-edit-dialog.component.html';
import styleString from './travel-diary-edit-dialog.component.scss';
import { TravelDiaryService } from '../services/travel-diary.service';
import { CalendarEvent, CalendarView, CalendarDayViewComponent } from 'angular-calendar';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { TravelDiaryConfiguration, TravelMode, Purpose } from '../models/travel-diary-configuration.model';
import { Subject, BehaviorSubject, Observable, concat, of } from 'rxjs';
import {
	DialogMode,
	SurveyRespondentUser,
	TimelineLineResponseDisplayData,
	TravelDiaryEvent,
} from 'travel-diary/models/consts';
import { NgForm } from '@angular/forms';
import { TravelDiaryEditor } from 'travel-diary/services/travel-diary-editor.service';
import { v4 as uuidv4 } from 'uuid';
@Component({
	selector: 'traisi-travel-diary-edit-dialog',
	template: '' + templateString,
	encapsulation: ViewEncapsulation.None,
	providers: [],
	styles: ['' + styleString],
})
export class TravelDiaryEditDialogComponent implements AfterViewInit {
	@Output() public newEventSaved: EventEmitter<
		TimelineResponseData | { users: SurveyRespondentUser[] }
	> = new EventEmitter();
	@Output() public eventSaved: EventEmitter<{
		newData: TimelineLineResponseDisplayData;
		oldData: TimelineLineResponseDisplayData;
	}> = new EventEmitter();
	@Output() public eventDeleted: EventEmitter<
		TimelineResponseData | { users: SurveyRespondentUser[] }
	> = new EventEmitter();

	public modalRef: BsModalRef;

	public confirmModalRef: BsModalRef;

	private _mapComponent: any;

	@ViewChild('eventForm') eventForm: NgForm;

	@ViewChild('newEntryModal', { static: true })
	public modal: ModalDirective;

	@ViewChild('mapTemplate', { read: ViewContainerRef })
	public mapTemplate: ViewContainerRef;

	@ViewChild('allDayHomeTemplate', { read: TemplateRef })
	public allDayHomeTemplate: TemplateRef<any>;

	public searchInFocus: boolean = false;

	public model: TimelineLineResponseDisplayData;

	public dialogMode: DialogMode;

	public dialogModeEdit = DialogMode.Edit;

	public dialogModeNew = DialogMode.New;

	public dialogModeCreateHome = DialogMode.CreateHome;

	private _isMapLoaded = false;

	public isInsertedDepartureTime: boolean = false;

	public isRequiresEndTime: boolean = false;

	public isRequiresReturnHomeTime: boolean = false;

	public insertedIntoEvent: TravelDiaryEvent;

	public swapEvent: TravelDiaryEvent;

	public isFirstEventInDay: boolean = false;

	public isRequiresEventSwapConfirm: boolean = false;

	public displayIndex: number = -1;

	private _oldModel: TimelineLineResponseDisplayData = undefined;

	private _respondentRef: SurveyRespondentUser;

	private _defaultDate: Date;

	public get defaultDate(): Date {
		return this._defaultDate;
	}

	public get activeRespondentName(): string {
		return this._respondent.name;
	}

	public get respondent(): SurveyRespondentUser {
		return this._respondentRef;
	}

	public get isShowMemberSelect(): boolean {
		if (this.dialogMode === DialogMode.CreateHome) {
			return false;
		}
		if (this.model.purpose === 'dropoff' || this.model.purpose === 'pickup') {
			return false;
		}
		if (this._primaryRespondent.id === this._respondent.id && this.displayIndex > 0) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 *Creates an instance of TravelDiaryEditDialogComponent.
	 * @param {BsModalService} _modalService
	 * @param {Injector} _injector
	 * @param {TravelDiaryService} _travelDiaryService
	 * @param {*} _questionLoaderService
	 */
	public constructor(
		private _modalService: BsModalService,
		private _injector: Injector,
		private _editorService: TravelDiaryEditor,
		private _travelDiaryService: TravelDiaryService,
		private _cdRef: ChangeDetectorRef,
		@Inject(TraisiValues.QuestionLoader) private _questionLoaderService,
		@Inject(TraisiValues.SurveyAccessTime) private _surveyAccessTime: Date,
		@Inject(TraisiValues.Respondent) private _respondent: SurveyRespondent,
		@Inject(TraisiValues.PrimaryRespondent) private _primaryRespondent: SurveyRespondent
	) {
		this._initialize();
	}

	private _initialize(): void {
		this._defaultDate = new Date(this._surveyAccessTime);
		this._defaultDate.setHours(12);
		this._defaultDate.setMinutes(0);
		this._defaultDate.setSeconds(0);
		this.resetModel();
	}

	private resetModel(): void {
		this.isInsertedDepartureTime = false;
		this.insertedIntoEvent = null;
		this.isRequiresEndTime = false;
		this.isRequiresReturnHomeTime = false;
		this.isRequiresEventSwapConfirm = false;
		this.swapEvent = undefined;
		this.insertedIntoEvent = undefined;
		this.isRequiresEndTime = false;
		this.isRequiresReturnHomeTime = false;
		this.isFirstEventInDay = false;
		let id = uuidv4();
		let users = [];
		if (this._respondentRef) {
			users = [].concat(this._respondentRef);
		}

		this.model = {
			id: undefined,
			identifier: id,
			isValid: false,
			address: undefined,
			latitude: 0,
			longitude: 0,
			isInserted: undefined,
			isUpdateEventSwap: false,
			name: undefined,
			isRequireDepartureConfirm: false,
			order: 0,
			isFirstEvent: null,
			purpose: undefined,
			timeA: null,
			timeB: undefined,
			users: users,
			displayAddress: undefined,
		};

		if (this.eventForm) {
			this.eventForm.resetForm();
		}

		if (this._mapComponent) {
			this._mapComponent.resetInput();
		}
		this._travelDiaryService.resetAddressQuery();
	}

	public eventInputChanges($event): void {
		// console.log(this.eventInputChanges);
	}

	public onMembersChanged($event: any) {
		this.checkTimeOverlaps();
		if (!this.model.users.some((x) => x.id !== this._respondent.id)) {
			this.model.users = [this._respondentRef].concat(this.model.users);
		}
	}

	public get isFormValid(): boolean {
		if (this.eventForm && this.model) {
			return this.eventForm.valid && this.model.address !== undefined;
		} else {
			return false;
		}
	}

	public checkTimeOverlaps(): void {
		let insertedEvent = this._editorService.getOverlappingDeparture(
			this.model,
			this._travelDiaryService.diaryEvents$.value
		);

		if (this.dialogMode === DialogMode.Edit) {
			let laterEvent = this._editorService.getOverlappingLaterDeparture(
				this.model,
				this._travelDiaryService.diaryEvents$.value
			);
			this.swapEvent = laterEvent;

			//console.log(laterEvent);
			//if (laterEvent && insertedEvent) {
			//		this.model.hasEndTime = true;

			//	this.isRequiresEndTime = true;
			//} else {
			//		this.model.hasEndTime = false;
			//	this.isRequiresEndTime = false;
			//}

			let laterOverlap = this._editorService.getOverlappingLaterDeparture(
				this.model,
				this._travelDiaryService.diaryEvents$.value
			);

			if (laterOverlap && laterOverlap.meta.model.identifier !== this.model.identifier) {
				this.isRequiresEventSwapConfirm = true;
			} else {
				this.isRequiresEventSwapConfirm = false;
			}
		}

		if (insertedEvent && this.dialogMode === DialogMode.New) {
			this.insertedIntoEvent = insertedEvent;
			this.isInsertedDepartureTime = true;
			if (
				insertedEvent.meta.model.purpose.toLowerCase().includes('home') &&
				insertedEvent.meta.model.identifier !== this.model.identifier
			) {
				this.isRequiresReturnHomeTime = true;
				this.model.isReturnHomeSplit = true;
				this.model.hasEndTime = true;
				this.model.isInserted = true;
			} else {
				this.isRequiresReturnHomeTime = false;
				this.model.isInserted = null;
			}
		} else {
			this.isRequiresReturnHomeTime = false;
			this.model.isReturnHomeSplit = false;
			this.insertedIntoEvent = undefined;
			this.isInsertedDepartureTime = false;
		}

		if (!insertedEvent) {
			this.model.isInserted = false;
		}
	}

	public initTimeInput(model: TimelineLineResponseDisplayData): void {
		if (!model.timeA) {
			model.timeA = this.defaultDate;
			this.onDepartureTimeChange(model.timeA);
		}
	}

	public initReturnTimeInput(model: TimelineLineResponseDisplayData): void {
		if (!model.insertedEndTime) {
			model.insertedEndTime = this.defaultDate;
		}
	}

	/**
	 *
	 * @param $event
	 */
	public onDepartureTimeChange($event: Date): void {
		if (!$event) {
			return;
		}
		this.model.isUsingTemporaryTime = false;
		$event.setFullYear(this.defaultDate.getFullYear());
		$event.setMonth(this.defaultDate.getMonth());
		$event.setDate(this.defaultDate.getDate());
		if ($event.getHours() < 4 && $event.getHours() >= 0) {
			// this needs to be adjusted
			$event.setDate($event.getDate() + 1);
		}

		this.model.timeA = $event;
		this.checkTimeOverlaps();
	}

	/**
	 *
	 * @param $event
	 */
	public onReturnTimeChange($event: Date): void {
		if (!$event) {
			return;
		}
		$event.setDate(this.defaultDate.getDate());
		if ($event.getHours() < 4 && $event.getHours() >= 0) {
			// this needs to be adjusted
			$event.setDate($event.getDate() + 1);
		}

		if ($event < this.model.timeA) {
			this.eventForm.form.controls['insertedEndTime'].setErrors({ invalid: true });
		} else {
			this.eventForm.form.controls['insertedEndTime'].setErrors(null);
		}
	}

	public onInsertionConfirm($event: any): void {}

	/**
	 *
	 * @param force
	 */
	public dialogSave(force: boolean): void {
		if (
			this._travelDiaryService.userTravelDiaries[this._respondent.id].length === 0 &&
			!force &&
			this.model.purpose.toLocaleLowerCase().includes('home') &&
			this.model.users.length > 1
		) {
			this.confirmModalRef = this._modalService.show(this.allDayHomeTemplate, { class: 'modal-dialog-centered' });
		} else {
			this.hide();
			if (this.dialogMode === DialogMode.New || this.dialogMode == DialogMode.CreateHome) {
				this.newEventSaved.emit(this.model);
			} else {
				this.eventSaved.emit({ newData: this.model, oldData: this._oldModel });
			}
		}
	}

	public onShown(): void {
		this._cdRef.detectChanges();
	}

	public forceDialogSave(): void {
		this.dialogSave(true);
	}

	public hide(): void {
		this.modal.hide();
	}

	public delete(): void {
		this.eventDeleted.emit(this.model);
		this.modal.hide();
		this.resetModel();
	}

	/**
	 * Show a new model
	 *
	 */
	public show(mode: DialogMode, model?: TimelineLineResponseDisplayData): void {
		this.dialogMode = mode;

		if (mode === DialogMode.New) {
			this.resetModel();
			this.eventForm.form.markAsPristine();
			this.eventForm.form.markAsUntouched();
			this.eventForm.form.reset();
			this.eventForm.reset();
			this.model.users = [].concat(this._respondentRef);
			this.displayIndex = 1;
			this.model.identifier = uuidv4();
			this.model.order = 1;
		} else if (mode === DialogMode.CreateHome) {
			this.resetModel();
			this.eventForm.form.markAsPristine();
			this.eventForm.form.markAsUntouched();
			this.eventForm.form.reset();
			this.eventForm.reset();
			this.model.isFirstEvent = true;
			this.isFirstEventInDay = true;
			this.model.users = [].concat(this._respondentRef);
		} else {
			this.eventForm.form.markAllAsTouched();
			this.eventForm.form.updateValueAndValidity();
			this.model = Object.assign({}, model);
			this._oldModel = Object.assign({}, model);
			this.model.isInserted = false;
			this.model.isReturnHomeSplit = false;
			this.model.isUpdateEventSwap = undefined;
			this.isFirstEventInDay = false;
			this.model.isRequireDepartureConfirm = false;
			this.displayIndex = this._editorService.getEventIndex(
				this.model,
				this._travelDiaryService.diaryEvents$.value
			);
			let users = this._travelDiaryService.getUsersForEvent(model);
			this.model.users = users;
			if (!this.model.isValid && this.model.isUsingTemporaryTime) {
				this.model.timeA = undefined;
			}
		}

		this.isFirstEventInDay = this.model.order > 0 ? false : true;
		if (mode === DialogMode.CreateHome) {
			this.isFirstEventInDay = true;
		}

		this.isRequiresEndTime = false;
		this.searchInFocus = false;
		this.checkTimeOverlaps();

		this.modal.show();
		if (!this._isMapLoaded) {
			this._loadMapDisplay();
		}
	}

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
				instance.response.subscribe((value) => {
					this.mapResonse(value);
				});
				this._mapComponent = instance;
				this._isMapLoaded = true;
			}
		});
	}

	public searchFocus(): void {
		this.searchInFocus = true;
	}

	public searchBlur(): void {
		this.searchInFocus = false;
		if (this._mapComponent) {
			setTimeout(() => {
				this._mapComponent['resize']();
			}, 200);
		}
	}

	public get users(): any {
		return this._travelDiaryService.users;
	}

	public get purposes(): Purpose[] {
		return this._travelDiaryService.configuration.purpose;
	}

	public get addresses(): Observable<string[]> {
		return this._travelDiaryService.addresses$;
	}

	public get modes(): TravelMode[] {
		return this._travelDiaryService.configuration.mode;
	}

	public get addressInput(): Subject<string> {
		return this._travelDiaryService.addressInput$;
	}

	public locationChanged(event): void {
		let r = [event.center[0], event.center[1]];
		(<any>this._mapComponent).setMarkerLocation(r);
		(<any>this._mapComponent).flyToPosition(r);
		(<any>this._mapComponent).saveLocation({ lat: r[1], lng: r[0] });
	}

	public mapResonse(response): void {
		this.model.address = response['address'];
		this.model.latitude = response['latitude'];
		this.model.longitude = response['longitude'];
	}

	public ngAfterViewInit(): void {}

	/**
	 *
	 * @param type
	 * @param $event
	 */
	public modalShown($event: ModalDirective): void {
		this._cdRef.detectChanges();
		this._updateMapDisplay();
	}

	private _updateMapDisplay(): void {
		this._mapComponent.updateAddressInput(this.model.address);
		if (this.model.longitude !== 0) {
			(<any>this._mapComponent).flyToPosition([this.model.longitude, this.model.latitude]);
			(<any>this._mapComponent).setMarkerLocationLngLat(this.model.longitude, this.model.latitude);
		}
	}

	public ngOnInit(): void {
		this._travelDiaryService.users.subscribe((x) => {
			let r = x.find((y) => y.id === this._respondent.id);
			if (r) {
				this._respondentRef = r;
			}
		});
	}
}
