import {
	SurveyQuestion,
	ResponseTypes,
	OnVisibilityChanged,
	TimelineResponseData,
	TraisiValues,
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
} from '@angular/core';
import templateString from './travel-diary-edit-dialog.component.html';
import styleString from './travel-diary-edit-dialog.component.scss';
import { TravelDiaryService } from '../services/travel-diary.service';
import { CalendarEvent, CalendarView, CalendarDayViewComponent } from 'angular-calendar';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { TravelDiaryConfiguration } from '../models/travel-diary-configuration.model';
import { Subject, BehaviorSubject, Observable, concat, of } from 'rxjs';
import { DialogMode, SurveyRespondentUser, TimelineLineResponseDisplayData } from 'travel-diary/models/consts';
import { NgForm } from '@angular/forms';
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
	@Output() public eventSaved: EventEmitter<
		TimelineResponseData | { users: SurveyRespondentUser[] }
	> = new EventEmitter();
	@Output() public eventDeleted: EventEmitter<
		TimelineResponseData | { users: SurveyRespondentUser[] }
	> = new EventEmitter();

	public modalRef: BsModalRef;

	private _mapComponent: any;

	@ViewChild('eventForm') eventForm: NgForm;

	@ViewChild('newEntryModal', { static: true })
	public modal: ModalDirective;

	@ViewChild('mapTemplate', { read: ViewContainerRef })
	public mapTemplate: ViewContainerRef;

	public searchInFocus: boolean = false;

	public model: TimelineLineResponseDisplayData;

	public dialogMode: DialogMode;

	public dialogModeEdit = DialogMode.Edit;

	public dialogModeNew = DialogMode.New;

	private _isMapLoaded = false;

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
		private _travelDiaryService: TravelDiaryService,
		@Inject(TraisiValues.QuestionLoader) private _questionLoaderService
	) {
		this.resetModel();
	}

	private resetModel(): void {
		this.model = {
			id: Date.now(),
			address: undefined,
			latitude: 0,
			longitude: 0,
			name: undefined,
			order: 0,
			purpose: undefined,
			timeA: new Date(),
			timeB: new Date(),
			users: [],
		};
		if (this._mapComponent) {
			this._mapComponent.resetInput();
		}
		this._travelDiaryService.resetAddressQuery();
	}

	public eventInputChanges($event): void {
		console.log(this.eventInputChanges);
	}

	public dialogSave(): void {
		this.hide();
		if (this.dialogMode === DialogMode.New) {
			this.newEventSaved.emit(this.model);
		} else {
			this.eventSaved.emit(this.model);
		}
	}

	public hide(): void {
		this.modal.hide();
	}

	public showEdit(model: TimelineResponseData): void {
		Object.assign({}, this.model);
		this.modal.show();
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
		this.eventForm.resetForm();
		if (mode == DialogMode.New) {
			this.resetModel();
		} else {
			this.model = model;
		}

		this.modal.show();
		if (!this._isMapLoaded) {
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
	}

	public searchFocus(): void {
		this.searchInFocus = true;
	}

	public searchBlur(): void {
		this.searchInFocus = false;
		if (this._mapComponent) {
			setTimeout(() => {
				this._mapComponent['resize']();
			}, 100);
		}
	}

	public get users(): any {
		return this._travelDiaryService.users;
	}

	public get purposes(): string[] {
		return this._travelDiaryService.configuration.purpose;
	}

	public get addresses(): Observable<string[]> {
		return this._travelDiaryService.addresses$;
	}

	public get modes(): string[] {
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

	public ngAfterViewInit(): void {

	}
	public ngOnInit(): void {}
}
