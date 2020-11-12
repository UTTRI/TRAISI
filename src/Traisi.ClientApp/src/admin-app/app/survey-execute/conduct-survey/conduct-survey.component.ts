import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, AfterViewInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Survey } from '../../models/survey.model';
import { SurveyService } from '../../services/survey.service';
import { DROPZONE_CONFIG, DropzoneComponent } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { ShortCode } from '../../models/short-code.model';
import { CodeGenerator } from '../../models/code-generator.model';
import { SurveyExecuteService } from '../../services/survey-execute.service';
import { AlertService, DialogType, MessageSeverity } from '../../../../shared/services/alert.service';
import { Utilities } from '../../../../shared/services/utilities';
import { AuthService } from '../../../../shared/services/auth.service';
import { Title } from '@angular/platform-browser';
import { TitleCasePipe } from '@angular/common';
import { RealTimeNotificationServce } from '../../services/real-time-notification.service';
import { DownloadNotification } from '../../models/download-notification';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UserGroupService } from 'app/services/user-group.service';
import { UserGroup } from 'app/models/user-group.model';
import { AccountService } from 'app/services/account.service';
import { Permission } from '../../../../shared/models/permission.model';
import { Sample } from 'app/models/sample.model';
import { SampleEditorComponent } from '../../../app/sample-management/sample-editor/sample-editor.component';
import { SampleService } from '../../services/sample.service';
import { fadeInOut } from '../../services/animations';
import { AppTranslationService } from '../../../../shared/services/app-translation.service';
import { FileUploader, FileUploaderOptions, Headers, FileItem, FileLikeObject } from 'ng2-file-upload';

@Component({
	selector: 'app-test-survey',
	templateUrl: './conduct-survey.component.html',
	styleUrls: ['./conduct-survey.component.scss'],
	encapsulation: ViewEncapsulation.None,
	animations: [fadeInOut],
	exportAs: 'child'
})
export class ConductSurveyComponent implements OnInit, AfterViewInit {
	public surveyId: number;
	public survey: Survey;
	public codeGenParams: CodeGenerator;
	public executeMode: string;

	public codeProperties: string = 'pattern';
	public generateType: string = 'numberCodes';
	public baseUrl: string = '';
	public loadingIndicator: boolean = false;
	public generatingIndicator: boolean = false;
	public downloadIndicator: boolean = false;
	public pageLimit: number = 20;

	public individualCodeBeingViewed: boolean = true;
	public groupCodeBeingViewed: boolean = false;
	public samplesBeingViewed: boolean = false;
	public emailBeingViewed: boolean = false;
	public scheduleBeingViewed: boolean = false;

	//TestSampleData
	public samplesArray: Sample[] = [];
	public sampleColumns: any[] = [];
	public sampleRows: Sample[] = [];
	public sampleRowsCache: Sample[] = [];
	public editModel: Sample;
	public model: Sample;
	public sampleEditMode: boolean = false;

	public importing: boolean = false;

	public searchKey: string = "";
	public searchValue: string = "";

	private importOptions: FileUploaderOptions = {
		autoUpload: false,
		//allowedFileType: ['compress','csv'], allowedMimeType:['application/x-zip-compressed'],
		allowedMimeType:['application/vnd.ms-excel'],
		authTokenHeader: 'Authorization',
		queueLimit: 2,
		url: this.configurationService.baseUrl + '/api/upload',
		removeAfterUpload: true
	};

	public uploader: FileUploader = new FileUploader(this.importOptions);

	public indivCodeRows: ShortCode[];
	public indivCodeColumns: any[] = [];

	public totalIndivCodes: number = 0;
	public currentIndivPage: number = 0;

	public groupCodeRows: ShortCode[];
	public groupCodeColumns: any[] = [];
	public totalGroupCodes: number = 0;
	public currentGroupPage: number = 0;

	private downloadProgress: DownloadNotification = null;
	private downloadNotifier: Subject<DownloadNotification>;

	public indivDropZoneconfig: DropzoneConfigInterface = {
		// Change this to your upload POST address:
		maxFilesize: 50,
		maxFiles: 1,
		acceptedFiles: '.csv',
		autoReset: 2000,
		errorReset: 2000,
		cancelReset: 2000,
		timeout: 3000000
	};

	public groupDropZoneconfig: DropzoneConfigInterface = {
		// Change this to your upload POST address:
		maxFilesize: 50,
		maxFiles: 1,
		acceptedFiles: '.csv',
		autoReset: 2000,
		errorReset: 2000,
		cancelReset: 2000,
		timeout: 3000000
	};


	@ViewChild('samplesTable')
	public stable: any;
	@ViewChild('sampleTagTemplate', { static: true })
	public sampleTagTemplate: TemplateRef<any>;
	@ViewChild('expandTemplate', { static: true })
	public expandTemplate: TemplateRef<any>;
	@ViewChild('textTemplate', { static: true })
	public textTemplate: TemplateRef<any>;
	@ViewChild('actionsTemplate', { static: true })
	public actionsTemplate: TemplateRef<any>;
	@ViewChild('dateTemplate', { static: true })
	public dateTemplate: TemplateRef<any>;
	@ViewChild('editorModal')
	public editorModal: ModalDirective;
	@ViewChild('sampleEditor')
	public sampleEditor: SampleEditorComponent;

	@ViewChild('csvReader') csvReader: any;

	@ViewChild('indivUpload', { static: true })
	dropZoneIndiv: DropzoneComponent;
	@ViewChild('groupUpload', { static: true })
	dropZoneGroup: DropzoneComponent;

	constructor(
		private surveyService: SurveyService,
		private surveyExecuteService: SurveyExecuteService,
		private route: ActivatedRoute,
		private configurationService: ConfigurationService,
		private alertService: AlertService,
		private authService: AuthService,
		private sampleService: SampleService,
		private translationService: AppTranslationService,
		private userGroupService: UserGroupService,
		private accountService: AccountService,
		private router: Router,
		private title: Title,
		private titleCasePipe: TitleCasePipe,
		private notificationService: RealTimeNotificationServce
	) {
		this.survey = new Survey();
		this.model = new Sample();
		this.codeGenParams = new CodeGenerator();
		this.downloadProgress = new DownloadNotification();
		this.baseUrl = configurationService.baseUrl;

		this.indivDropZoneconfig.url = this.baseUrl + '/api/SurveyExecution/uploadIndividual';
		this.indivDropZoneconfig.headers = {
			Authorization: 'Bearer ' + this.authService.accessToken
		};

		this.groupDropZoneconfig.url = this.baseUrl + '/api/SurveyExecution/uploadGroup';
		this.groupDropZoneconfig.headers = {
			Authorization: 'Bearer ' + this.authService.accessToken
		};
		this.route.params.subscribe(params => {
			this.surveyId = params['id'];
			this.codeGenParams.surveyId = this.surveyId;
			this.codeGenParams.isGroupCode = false;
			this.executeMode = params['mode'];
			if (this.executeMode === 'test') {
				this.codeGenParams.isTest = true;
			} else if (this.executeMode === 'live') {
				this.codeGenParams.isTest = false;
			} else if (this.executeMode === 'settings') {
				this.codeGenParams.isTest = false;
			} else {
				this.router.navigate(['error']);
			}
		});
	}

	public ngOnInit(): void {

		console.log(this.importOptions);
		//SampleTestData
		/* this.samplesArray = [
			{ accessCode: "DKT-406", hhIdNum: 1000001, mailingBlock: 100, lastName: "Philips", postalCode: "L1G4P2", address: "45 Leyton St", phoneNumber: 6478888151, owner: "Management Staff", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "YFE-314", hhIdNum: 1000002, mailingBlock: 100, lastName: "Pugh", postalCode: "L1G5O2", address: "55 Sunrise St", phoneNumber: 6478998080, owner: "Management Staff", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "RER-313", hhIdNum: 1000003, mailingBlock: 100, lastName: "Hossain", postalCode: "M2G3Y1", address: "105 Sunset Ave", phoneNumber: 6479901080, owner: "Management Staff", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "CQW-438", hhIdNum: 1000004, mailingBlock: 100, lastName: "Perry", postalCode: "M2G4Z5", address: "15 Don Valley PWY", phoneNumber: 4168901000, owner: "Management Staff", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "ATS-461", hhIdNum: 1000005, mailingBlock: 100, lastName: "Leung", postalCode: "N2A5B6", address: "55 Stoney Creek St", phoneNumber: 4161991111, owner: "Management Staff", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "YCH-001", hhIdNum: 1000006, mailingBlock: 100, lastName: "Omaruan", postalCode: "N2A6C8", address: "10 Matheson St", phoneNumber: 4372225555, owner: "Management Staff", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" }
		];
 */
		//Manage Samples page
		this.model.status = "Fresh";
		this.model.state = "";
		this.sampleRows = this.samplesArray;
		this.sampleColumns = this.samplesArray;

		// columns for the display data table
		this.sampleColumns = [
			{
				width: 10,
				cellTemplate: this.expandTemplate,
				sortable: false,
				resizeable: false,
				draggable: false,
				canAutoResize: false
			},
			{
				prop: 'accessCode',
				name: 'Access Code',
				width: 90,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				canAutoResize: false
			},
			{
				prop: 'hhIdNum',
				name: 'HhId Num',
				minWidth: 80,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'mailingBlock',
				name: 'Mailing Block',
				minWidth: 100,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'lastName',
				name: 'Last Name',
				minWidth: 90,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'postalCode',
				name: 'Postal Code',
				minWidth: 90,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'address',
				name: 'Address',
				minWidth: 140,
				flexGrow: 35,
				cellTemplate: this.textTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'phoneNumber',
				name: 'Phone Number',
				minWidth: 115,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'status',
				name: 'Sample Status',
				minWidth: 110,
				flexGrow: 30,
				cellTemplate: this.sampleTagTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'state',
				name: 'Sample State',
				minWidth: 98,
				flexGrow: 30,
				cellTemplate: this.sampleTagTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'startDate',
				name: 'Start Date',
				minWidth: 105,
				flexGrow: 35,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'lastModified',
				name: 'Last Modified',
				minWidth: 110,
				flexGrow: 35,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'owner',
				name: 'Owner',
				minWidth: 140,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'group',
				name: 'Group',
				minWidth: 70,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'language',
				name: 'Language',
				minWidth: 85,
				flexGrow: 30,
				cellTemplate: this.sampleTagTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			}
		];

		this.indivCodeColumns = [
			{
				prop: 'index',
				name: '#',
				width: 50,
				canAutoResize: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'code',
				name: 'code',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'createdDate',
				name: 'Creation Date',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellTemplate: this.dateTemplate,
				cellClass: 'remove-padding'
			}
		];

		this.groupCodeColumns = [
			{
				prop: 'index',
				name: '#',
				width: 50,
				canAutoResize: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'code',
				name: 'code',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'name',
				name: 'Group Name',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'createdDate',
				name: 'Creation Date',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellTemplate: this.dateTemplate,
				cellClass: 'remove-padding'
			}
		];

		if (this.canViewSamples){
			this.sampleColumns.push({
				name: 'Actions',
				width: 120,
				cellTemplate: this.actionsTemplate,
				resizeable: false,
				canAutoResize: false,
				sortable: false,
				draggable: false
			});
		}
		this.loadData();

		this.survey = this.surveyService.getLastSurvey();
		if (!this.survey || this.survey === null || this.survey.id !== this.surveyId) {
			this.survey = new Survey();
			this.surveyService.getSurvey(this.surveyId).subscribe(
				result => {
					this.survey = result;
					this.loadIndivCodeData(1);
					this.loadIndivCodeCount();
				},
				error => {
					this.router.navigate(['error']);
				}
			);
		} else {
			this.loadIndivCodeData(1);
			this.loadIndivCodeCount();
		}
		this.title.setTitle(`Execute ${this.titleCasePipe.transform(this.executeMode)} Survey - TRAISI`);
	}

	public get canViewSamples(): boolean {
		return this.accountService.userHasPermission(Permission.viewSamplesPermission);
	}

	/**
	* Launches the new sample modal.
	*/
	public newSample(): void {
		this.importing = false;
		this.sampleEditMode = false;
		this.sampleEditor.isNewSample = true;
		this.editorModal.show();
	}

	public editSample(sample: Sample): void {
		this.sampleEditMode = true;
		this.sampleEditor.isNewSample = false;
		this.model = sample;
		this.editModel = new Sample();
		Object.assign(this.editModel, this.model);
		this.editorModal.show();
	}

	public ngAfterViewInit(): void 
	{
		this.sampleEditor.changesSavedCallback = () => {
		this.editorModal.hide();
		};
		this.sampleEditor.changesCancelledCallback = () => {
			this.importing = false;
			this.editModel = null;
			this.editorModal.hide();
		};
		this.dropZoneIndiv.DZ_SENDING.subscribe(data => this.onSendingIndiv(data));
		this.dropZoneGroup.DZ_SENDING.subscribe(data => this.onSendingGroup(data));
	}

	public switchTab(tab: string): void {
		if (tab === 'indivCode') {
			this.individualCodeBeingViewed = true;
			this.groupCodeBeingViewed = false;
			this.samplesBeingViewed = false;
			this.emailBeingViewed = false;
			this.scheduleBeingViewed = false;
			this.generateType = 'numberCodes';
			this.loadIndivCodeData(1);
			this.loadIndivCodeCount();
		} else if (tab === 'groupCode') {
			this.individualCodeBeingViewed = false;
			this.groupCodeBeingViewed = true;
			this.samplesBeingViewed = false;
			this.emailBeingViewed = false;
			this.scheduleBeingViewed = false;
			this.generateType = 'single';
			this.loadGroupCodeData(1);
			this.loadGroupCodeCount();
		} else if (tab === 'samples') {
			this.individualCodeBeingViewed = false;
			this.groupCodeBeingViewed = false;
			this.samplesBeingViewed = true;
			this.emailBeingViewed = false;
			this.scheduleBeingViewed = false;
		} else if (tab === 'email') {
			this.individualCodeBeingViewed = false;
			this.groupCodeBeingViewed = false;
			this.samplesBeingViewed = false;
			this.emailBeingViewed = true;
			this.scheduleBeingViewed = false;
		} else {
			this.individualCodeBeingViewed = false;
			this.groupCodeBeingViewed = false;
			this.samplesBeingViewed = false;
			this.emailBeingViewed = false;
			this.scheduleBeingViewed = true;
		}
	}
	
	public uploadFiles(): void {
		if (this.csvReader.nativeElement.files[0] == null) {
			this.alertService.showStickyMessage('Error', "Please select a file to upload", MessageSeverity.error);
			return;
		}
		this.uploader.authToken = `Bearer ${this.authService.accessToken}`;
		let sampleInfo: Headers = {
			name: 'parameters',
			value: JSON.stringify(this.model)
		};
		this.uploader.options.headers = [sampleInfo];
		this.uploader.onSuccessItem = (item, response, status, headers) => {
			let files: File[] = [item._file];
			this.alertService.showMessage('Success', "File is uploaded successfully for Region conversion", MessageSeverity.success);
			this.csvReader.nativeElement.value = '';
		};
		this.uploader.onErrorItem = (item, response, status, headers) => {
			this.alertService.showStickyMessage('Error', "Failed to upload the file", MessageSeverity.error);
			let files: File[] = [item._file];			
		};
		this.uploader.uploadAll();
	}

	//Sample Action
	public sampleStateAction(): void {
		if (this.model.state == "")
			return;

		for (var i in this.sampleRows) {
			this.sampleRows[i].state = this.model.state;
		}
		this.sampleRows = [...this.sampleRows];
	}

	//Sample Status
	public onStatusChanged(): void {
		if (this.model.status != "Select Status") {
			this.sampleRowsCache = this.samplesArray;
			this.sampleRows = this.sampleRowsCache.filter(r => r.status == this.model.status);
			this.sampleRows = [...this.sampleRows];
		}
		else {
			this.sampleRows = this.samplesArray;
			this.sampleRows = [...this.sampleRows];
		}
	}

	/**
	 * Load initial sample info (samples for user and group list)
	 */
	public loadData(): void {
		this.alertService.startLoadingMessage();
		this.loadingIndicator = true;

		this.sampleService.listSamples().subscribe(
			(activeSamples: Sample[]) => {
					this.userGroupService
						.listUserGroups()
						.subscribe(
							userGroups => this.onDataLoadSuccessful(activeSamples, userGroups),
							error => this.onDataLoadFailed(error)
						);
			},
			error => this.onDataLoadFailed(error)
		);
	}

	/**
	*
	* @param value
	*/
	public onSearchChanged(): void {
		this.sampleRowsCache = this.samplesArray;
		this.sampleRows = this.sampleRowsCache
			.filter(item => item[this.searchKey]
				.toString().toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0);
	}

	public onDataLoadSuccessful(activeSamples: Sample[],
		groups: UserGroup[]): void {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.sampleRows = activeSamples;
		this.sampleRowsCache = [...activeSamples];

	}

	public onDataLoadFailed(error: any): void {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.alertService.showStickyMessage(
			'Load Error',
			`Unable to retrieve surveys from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
			MessageSeverity.error,
			error
		);
	}

	public importSample(): void {
		this.sampleEditMode = false;
		this.sampleEditor.isNewSample = true;
		this.importing = true;
		this.editorModal.show();
	}

	//TestSamples
	public addToSamples(newSampleData: any) {
		if (newSampleData.isNewSample) {
			this.samplesArray.push(newSampleData.modelObj);
			this.samplesArray = [...this.samplesArray];
			this.sampleRows = this.samplesArray;
		}
	}

	//Importing from CSV file
	public addFromImport(csvArray: Sample[]) {

		let bno = Math.floor(Math.random() * (999 - 100)) + 100;
		bno = Math.round(bno);

		for (var i = 0; i < csvArray.length; i++) {
			var currentObj: Sample = csvArray[i];
			var index: number = this.samplesArray.findIndex(item => item.phoneNumber == currentObj.phoneNumber);
			if (index < 0) {
				var n: any = 0;
				if (this.samplesArray.length == 0) {
					n = 1000000;
				}
				else {
					n = this.samplesArray[this.samplesArray.length - 1].hhIdNum;
				}
				csvArray[i].hhIdNum = ++n;
				csvArray[i].mailingBlock = bno;
				csvArray[i].accessCode = this.getAccessCode();
				this.samplesArray.push(csvArray[i]);
			}
		}
		this.samplesArray = [...this.samplesArray];
		this.sampleRows = this.samplesArray;
	}

	public getAccessCode() {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZ';
		var x = Math.floor(Math.random() * (999 - 100)) + 100;
		const stringLength = 3;
		let randomstring = '';
		for (let i = 0; i < stringLength; i++) {
			const rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum, rnum + 1);
		}
		return randomstring + "-" + x;
	}

	public onEditorModalHidden(): void { }

	/**
	 * Called before new sample modal is displayed. The input data and model will be reset.
	 */
	public onEditorModalShow(): void {
		if (!this.sampleEditMode) {
			this.model = new Sample();
			this.model.startDate = new Date();
			this.model.lastModified = new Date();
			this.model.group = this.sampleEditor.selectedGroup;
			this.model.owner = this.authService.currentUser.fullName;
			this.model.group = "TTS";
			this.model.status = "Fresh";
			this.model.state = "Inactive";
			this.model.language = "English";
			this.editModel = new Sample();
			Object.assign(this.editModel, this.model);
			this.sampleEditor.editMode = false;
		} else {
			this.sampleEditor.editMode = true;
		}
		this.sampleEditor.model = this.editModel;
	}

	public closeEditorModal(): void {
		this.editorModal.hide();
	}

	setIndivPage(pageInfo: any) {
		this.loadIndivCodeData(pageInfo.offset + 1);
		this.currentIndivPage = pageInfo.offset;
	}

	setGroupPage(pageInfo: any) {
		this.loadGroupCodeData(pageInfo.offset + 1);
		this.currentGroupPage = pageInfo.offset;
	}

	loadGroupCodeData(pageNum: number) {
		this.alertService.startLoadingMessage('Loading codes...');
		this.loadingIndicator = true;

		this.surveyExecuteService
			.listSurveyGroupCodes(this.surveyId, this.executeMode, pageNum, this.pageLimit)
			.subscribe(
				results => {
					this.groupCodeRows = results;
					this.groupCodeRows.forEach((code, index) => {
						(<any>code).index = (pageNum - 1) * this.pageLimit + index + 1;
					});
					this.alertService.stopLoadingMessage();
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Loading Error',
						`An error occured whilst loading the codes.\r\nError: "${Utilities.getHttpResponseMessage(
							error
						)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
	}

	loadIndivCodeData(pageNum: number) {
		this.alertService.startLoadingMessage('Loading codes...');
		this.loadingIndicator = true;

		this.surveyExecuteService
			.listSurveyShortCodes(this.surveyId, this.executeMode, pageNum, this.pageLimit)
			.subscribe(
				results => {
					this.indivCodeRows = results;
					this.indivCodeRows.forEach((code, index) => {
						(<any>code).index = (pageNum - 1) * this.pageLimit + index + 1;
					});
					this.alertService.stopLoadingMessage();
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Loading Error',
						`An error occured whilst loading the codes.\r\nError: "${Utilities.getHttpResponseMessage(
							error
						)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
	}

	loadIndivCodeCount() {
		this.surveyExecuteService.totalSurveyShortCodes(this.surveyId, this.executeMode).subscribe(result => {
			this.totalIndivCodes = result;
		});
	}

	loadGroupCodeCount() {
		this.surveyExecuteService.totalSurveyGroupCodes(this.surveyId, this.executeMode).subscribe(result => {
			this.totalGroupCodes = result;
		});
	}

	generateIndivCodes() {
		this.generatingIndicator = true;
		this.alertService.startLoadingMessage('Generating codes...');

		this.codeGenParams.isGroupCode = false;
		this.codeGenParams.usePattern = this.codeProperties === 'pattern';

		if (this.generateType === 'numberCodes') {
			this.surveyExecuteService.createSurveyShortCodes(this.codeGenParams).subscribe(
				results => {
					this.alertService.stopLoadingMessage();
					this.alertService.showMessage('Success', 'Successfully generated codes', MessageSeverity.success);
					this.generatingIndicator = false;
					this.loadIndivCodeData(1);
					this.currentIndivPage = 0;
					this.loadIndivCodeCount();
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Generation Error',
						`An error occured whilst generating the codes.\r\nError: "${Utilities.getHttpResponseMessage(
							error
						)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
		} else {
			this.alertService.stopLoadingMessage();
			this.generatingIndicator = false;

			this.alertService.showStickyMessage(
				'Generation Error',
				`Importing via CSV is not yet available.`,
				MessageSeverity.error
			);
		}
	}

	generateGroupCodes() {
		this.generatingIndicator = true;
		this.alertService.startLoadingMessage('Generating group codes...');

		this.codeGenParams.isGroupCode = true;
		this.codeGenParams.usePattern = this.codeProperties === 'pattern';

		if (this.generateType === 'single') {
			this.surveyExecuteService.createSurveyGroupCodes(this.codeGenParams).subscribe(
				results => {
					this.alertService.stopLoadingMessage();
					this.alertService.showMessage('Success', 'Successfully generated codes', MessageSeverity.success);
					this.generatingIndicator = false;
					this.loadGroupCodeData(1);
					this.currentGroupPage = 0;
					this.loadGroupCodeCount();
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Generation Error',
						`An error occured whilst generating the codes.\r\nError: "${Utilities.getHttpResponseMessage(
							error
						)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
		} else {
			this.alertService.stopLoadingMessage();
			this.generatingIndicator = false;

			this.alertService.showStickyMessage(
				'Generation Error',
				`Importing via CSV is not yet available.`,
				MessageSeverity.error
			);
		}
	}

	onUploadError(error: any) {
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Generation Error',
			`An error occured whilst generating the codes.\r\nError: "${Utilities.getHttpResponseMessage(
				this.processDZError(error[1])
			)}"`,
			MessageSeverity.error
		);
	}

	private processDZError(errors: any): string {
		let errorString: string = '';
		for (const error of errors['']) {
			errorString += error + '\n';
		}
		return errorString;
	}

	onUploadSuccessIndiv(event: any) {
		this.alertService.stopLoadingMessage();
		this.alertService.showMessage('Success', 'Successfully generated codes', MessageSeverity.success);
		this.loadIndivCodeData(1);
		this.currentIndivPage = 0;
		this.loadIndivCodeCount();
	}

	onUploadSuccessGroup(event: any) {
		this.alertService.showMessage('Success', 'Successfully generated codes', MessageSeverity.success);
		this.loadGroupCodeData(1);
		this.currentGroupPage = 0;
		this.loadGroupCodeCount();
	}

	onSendingIndiv(data) {
		this.alertService.startLoadingMessage('Generating codes...');
		this.codeGenParams.isGroupCode = false;
		this.codeGenParams.usePattern = this.codeProperties === 'pattern';
		data[2].append('parameters', JSON.stringify(this.codeGenParams));
	}

	onSendingGroup(data) {
		this.alertService.startLoadingMessage('Generating codes...');
		this.codeGenParams.isGroupCode = true;
		this.codeGenParams.usePattern = this.codeProperties === 'pattern';
		data[2].append('parameters', JSON.stringify(this.codeGenParams));
	}

	downloadGroupCodes() {
		this.alertService.startLoadingMessage('Creating codes file...');
		this.downloadProgress = new DownloadNotification('', 1);
		this.downloadIndicator = true;
		this.surveyExecuteService.downloadSurveyGroupCodes(this.surveyId, this.executeMode).subscribe(
			result => {
				this.downloadProgress.id = result;
				this.downloadProgress.progress = 25;
				this.downloadNotifier = this.notificationService.registerChannel<DownloadNotification>(result);
				this.downloadNotifier.subscribe(
					update => {
						this.downloadSuccessHelper(update);
					},
					error => {
						this.downloadErrorHelper(error);
					}
				);
			},
			error => {
				this.downloadErrorHelper(error);
			}
		);
	}

	downloadIndividualCodes() {
		this.alertService.startLoadingMessage('Creating codes file...');
		this.downloadProgress = new DownloadNotification('', 1);
		this.downloadIndicator = true;
		this.surveyExecuteService.downloadSurveyShortCodes(this.surveyId, this.executeMode).subscribe(
			result => {
				this.downloadProgress.id = result;
				this.downloadProgress.progress = 25;
				this.downloadNotifier = this.notificationService.registerChannel<DownloadNotification>(result);
				this.downloadNotifier.subscribe(
					update => {
						this.downloadSuccessHelper(update);
					},
					error => {
						this.downloadErrorHelper(error);
						this.notificationService.deRegisterChannel(this.downloadProgress.id);
					}
				);
			},
			error => {
				this.downloadErrorHelper(error);
			}
		);
	}

	downloadSuccessHelper(update: DownloadNotification) {
		this.downloadProgress = update;
		if (update.progress === 100) {
			this.alertService.stopLoadingMessage();
			this.downloadIndicator = false;
			// download file and unsubscribe
			window.open(this.downloadProgress.url, '_self');
			this.downloadNotifier.unsubscribe();
			this.notificationService.deRegisterChannel(this.downloadProgress.id);
		}
	}

	downloadErrorHelper(error: any) {
		this.downloadIndicator = false;
		this.downloadNotifier.unsubscribe();
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Download Error',
			`An error occured whilst downloading the codes.\r\nError: "${Utilities.getHttpResponseMessage(
				this.processDZError(error[1])
			)}"`,
			MessageSeverity.error
		);
	}

	getFormattedTimeZone() {
		return new Date()
			.toString()
			.match(/([A-Z]+[\+-][0-9]+.*)/)[1]
			.split(' (')[0]
			.replace(/[A-Z]+/, '');
	}
}
