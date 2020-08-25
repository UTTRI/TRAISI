import { Component, ViewEncapsulation, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { Survey } from '../../models/survey.model';
import { UserGroupService } from '../../services/user-group.service';
import { AlertService, MessageSeverity } from '../../../../shared/services/alert.service';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
//import { BsDatepickerConfig, BsDatepickerInlineContainerComponent } from 'ngx-bootstrap';
import { FileUploader, FileUploaderOptions, FileItem, Headers, FileLikeObject } from 'ng2-file-upload';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { AuthService } from '../../../../shared/services';
import { Sample } from '../../models/sample.model';
import { SampleService } from '../../services/sample.service';
import { CurrencyPipe } from '@angular/common';

@Component({
	selector: 'app-sample-editor',
	templateUrl: './sample-editor.component.html',
	styleUrls: ['./sample-editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SampleEditorComponent implements OnInit {
	public changesSavedCallback: () => void;
	public changesCancelledCallback: () => void;
	public changesFailedCallback: () => void;
	public deleteSampleCallback: () => void;

	public model: Sample = new Sample();
	public activePeriod: Date[] = [];
	public editMode: boolean = false;
	public isNewSample: boolean = false;
	public canDeleteSample: boolean = false;
	public isSaving: boolean = false;

	public groupsOptions: Array<{ id: string; text: string }> = [];
	public selectedGroup: string;

	public bsConfig: Partial<BsDatepickerConfig> = Object.assign(
		{},
		{
			containerClass: 'theme-default',
			dateInputFormat: 'YYYY-MM-DD'
		}
	);

	private importOptions: FileUploaderOptions = {
		autoUpload: false,
		allowedFileType: ['compress'],
		authTokenHeader: 'Authorization',
		queueLimit: 2,
		url: this.configurationService.baseUrl + '/api/sample/import',
		removeAfterUpload: true
	};

	public uploader: FileUploader = new FileUploader(this.importOptions);
	public importFile: FileLikeObject;

	@Input()
	public importing: boolean = false;

	@Output()
	public onSampleSave: EventEmitter<any> = new EventEmitter();

	@Output()
	public onImportSamples: EventEmitter<Sample[]> = new EventEmitter();

	@ViewChild('csvReader') csvReader: any;

	@ViewChild('f', { static: true })
	private form: any;

	//public sampleState:string =  "active";

	constructor(
		private alertService: AlertService,
		private userGroupService: UserGroupService,
		private surveyService: SurveyService,
		private sampleService: SampleService,
		private configurationService: ConfigurationService,
		private authService: AuthService
	) { }

	//public SamplesArray: Sample[] = [];

	public ngOnInit(): void {}

	/**
	 * Called when the new sample form is submitted.
	 */
	public onNewSampleFormSubmit(): void {
		
		if (this.importing == true) {
			if (this.csvReader.nativeElement.files[0] == null) {
				this.saveFailedHelper("Please select a file to import");
				return;
			}
			let reader = new FileReader();
			reader.readAsText(this.csvReader.nativeElement.files[0]);
			let csvArr: Sample[] = [];

			reader.onload = () => {
				let csvData = reader.result;
				let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
				for (let i = 1; i < csvRecordsArray.length - 1; i++) {
					let currentRecord = (<string>csvRecordsArray[i]).split(',');
					let csvRecord: Sample = {};
					csvRecord.lastName = currentRecord[0];
					csvRecord.postalCode = currentRecord[1];
					csvRecord.address = currentRecord[2];
					csvRecord.phoneNumber = currentRecord[3];
					csvRecord.owner = this.authService.currentUser.fullName;
					csvRecord.group = "TTS";
					csvRecord.startDate = new Date();
					csvRecord.lastModified = new Date();
					csvRecord.status = "Fresh";
					csvRecord.state = "Inactive";
					csvRecord.language = "English";
					csvArr.push(csvRecord);
				}
				this.onImportSamples.emit(csvArr);
				this.saveSuccessHelper();
			};
		}
		else {
			var obj: any = {};
			obj.modelObj = this.model;
			obj.isNewSample = this.isNewSample;
			if (this.model.accessCode == null) {
				this.saveFailedHelper("The Access Code field cannot be empty");
				return;
			}
			if (this.model.hhIdNum == null) {
				this.saveFailedHelper("The Household Number field cannot be empty");
				return;
			}
			if (this.model.mailingBlock == null) {
				this.saveFailedHelper("The Mailing Block field cannot be empty");
				return;
			}
			if (this.model.lastName == null) {
				this.saveFailedHelper("The LastName field cannot be empty");
				return;
			}
			if (this.model.postalCode == null) {
				this.saveFailedHelper("The Postal Code field cannot be empty");
				return;
			}
			if (this.model.address == null) {
				this.saveFailedHelper("The Address field cannot be empty");
				return;
			}
			if (this.model.phoneNumber == null) {
				this.saveFailedHelper("The Phone Number field cannot be empty");
				return;
			}
			this.onSampleSave.emit(obj);
			this.saveSuccessHelper();
		}
		
		/*if (!this.editMode) {
			if (this.importing) {
				this.uploader.authToken = `Bearer ${this.authService.accessToken}`;
				let sampleInfo: Headers = {
					name: 'parameters',
					value: JSON.stringify(this.model)
				};
				this.uploader.options.headers = [sampleInfo];
				this.uploader.onSuccessItem = (item, response, status, headers) => {
					this.saveSuccessHelper();
				};
				this.uploader.onErrorItem = (item, response, status, headers) => {
					this.saveFailedHelper(response);
					let files: File[] = [item._file];
					this.uploader.addToQueue(files);
				};
				this.uploader.uploadAll();
			} else {
				this.sampleService
					.createSample(this.model)
					.subscribe(value => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
			}
		} else {
			this.sampleService.editSample(this.model).subscribe(value => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
		}*/
	}
	
	private saveSuccessHelper(): void {
		this.alertService.stopLoadingMessage();
		this.isSaving = false;
		this.importFile = undefined;
		if (this.isNewSample) {
			this.alertService.showMessage('Success', `Sample \"${this.model.name}\" was created successfully`, MessageSeverity.success);
		} else {
			this.alertService.showMessage(
				'Success',
				`Changes to sample \"${this.model.name}\" was saved successfully`,
				MessageSeverity.success
			);
		}
		this.model = new Sample();
		this.form.reset();
		if (this.changesSavedCallback) {
			this.changesSavedCallback();
		}
	}

	private saveFailedHelper(error: any): void {
		this.isSaving = false;
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Save Error',
			'The below errors occured whilst saving your changes:',
			MessageSeverity.error,
			error
		);
		this.alertService.showStickyMessage(error, null, MessageSeverity.error);

		if (this.changesFailedCallback) {
			this.changesFailedCallback();
		}
	}

	public cancel(): void {
		this.model = new Sample();

		this.form.reset();
		this.importFile = undefined;
		this.alertService.showMessage('Cancelled', 'Operation cancelled by user', MessageSeverity.default);
		this.alertService.resetStickyMessage();

		if (this.changesCancelledCallback) {
			this.changesCancelledCallback();
		}
	}

	private delete(): void {
		if (this.deleteSampleCallback) {
			this.deleteSampleCallback();
		}
	}

	public updateGroup(e: any): void {
		this.model.group = e;
	}

	public setImportFile(files: FileLikeObject[]): void {
		alert(files[0].type);
		/*
		if (files[0] && (files[0].type === 'application/x-zip-compressed' || files[0].type === 'application/zip')) {
		if (files[0] && (files[0].type === 'application/csv')) {
			alert("Hello");
			this.importFile = files[0];
			console.log(this.importFile);
			/* while (this.uploader.queue.length > 1) {
				this.uploader.removeFromQueue(this.uploader.queue[0]); 
			}
		}  */
	}
}
