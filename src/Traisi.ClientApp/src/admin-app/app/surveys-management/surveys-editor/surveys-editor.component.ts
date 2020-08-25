import { Component, ViewEncapsulation, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { Survey } from '../../models/survey.model';
import { UserGroupService } from '../../services/user-group.service';
import { AlertService, MessageSeverity } from '../../../../shared/services/alert.service';
import {BsDatepickerModule, BsDatepickerConfig} from 'ngx-bootstrap/datepicker';
// import { BsDatepickerConfig, BsDatepickerInlineContainerComponent } from 'ngx-bootstrap';
import { FileUploader, FileUploaderOptions, FileItem, Headers, FileLikeObject } from 'ng2-file-upload';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { AuthService } from '../../../../shared/services';

@Component({
	selector: 'app-surveys-editor',
	templateUrl: './surveys-editor.component.html',
	styleUrls: ['./surveys-editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SurveysEditorComponent implements OnInit {
	public changesSavedCallback: () => void;
	public changesCancelledCallback: () => void;
	public changesFailedCallback: () => void;
	public deleteSurveyCallback: () => void;

	public model: Survey = new Survey();
	public activePeriod: Date[] = [];
	public editMode: boolean = false;
	public isNewSurvey: boolean = false;
	public canDeleteSurvey: boolean = false;
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
		url: this.configurationService.baseUrl + '/api/survey/import',
		removeAfterUpload: true
	};

	public uploader: FileUploader = new FileUploader(this.importOptions);
	public importFile: FileLikeObject;

	@Input()
	public importing: boolean = false;

	@ViewChild('f', { static: true })
	private form: any;

	constructor(
		private alertService: AlertService,
		private userGroupService: UserGroupService,
		private surveyService: SurveyService,
		private configurationService: ConfigurationService,
		private authService: AuthService
	) {}

	public ngOnInit(): void {}

	/**
	 * Called when the new survey form is submitted.
	 */
	public onNewSurveyFormSubmit(): void {
		this.isSaving = true;
		this.model.startAt = this.activePeriod[0];
		this.model.endAt = this.activePeriod[1];
		if (!this.editMode) {
			if (this.importing) {
				this.uploader.authToken = `Bearer ${this.authService.accessToken}`;
				let surveyInfo: Headers = {
					name: 'parameters',
					value: JSON.stringify(this.model)
				};
				this.uploader.options.headers = [surveyInfo];
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
				this.surveyService
					.createSurvey(this.model)
					.subscribe(value => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
			}
		} else {
			this.surveyService.editSurvey(this.model).subscribe(value => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
		}
	}

	private saveSuccessHelper(): void {
		this.alertService.stopLoadingMessage();
		this.isSaving = false;
		this.importFile = undefined;
		if (this.isNewSurvey) {
			this.alertService.showMessage('Success', `Survey \"${this.model.name}\" was created successfully`, MessageSeverity.success);
		} else {
			this.alertService.showMessage(
				'Success',
				`Changes to survey \"${this.model.name}\" was saved successfully`,
				MessageSeverity.success
			);
		}
		this.model = new Survey();
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
		this.model = new Survey();

		this.form.reset();
		this.importFile = undefined;
		this.alertService.showMessage('Cancelled', 'Operation cancelled by user', MessageSeverity.default);
		this.alertService.resetStickyMessage();

		if (this.changesCancelledCallback) {
			this.changesCancelledCallback();
		}
	}

	private delete(): void {
		if (this.deleteSurveyCallback) {
			this.deleteSurveyCallback();
		}
	}

	public updateGroup(e: any): void {
		this.model.group = e;
	}

	public setImportFile(files: FileLikeObject[]): void {
		if (files[0] && (files[0].type === 'application/x-zip-compressed' || files[0].type === 'application/zip')) {
			this.importFile = files[0];
			while (this.uploader.queue.length > 1) {
				this.uploader.removeFromQueue(this.uploader.queue[0]);
			}
		}
	}
}
