import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { constructor } from 'jquery';
import { AlertService, DialogType, MessageSeverity } from '../../../shared/services/alert.service';
import { AppTranslationService } from '../../../shared/services/app-translation.service';
import { AccountService } from 'app/services/account.service';
import { UserGroupService } from 'app/services/user-group.service';
import { UserGroup } from '../models/user-group.model';
import { fadeInOut } from '../services/animations';
import { SamplePermissions } from '../models/sample-permissions.model';
import { Permission } from '../../../shared/models/permission.model';
import { Sample } from '../models/sample.model';
import { SampleEditorComponent } from './sample-editor/sample-editor.component';
import { SampleService } from '../services/sample.service';
import { Utilities } from '../../../shared/services/utilities';
import { sample } from 'rxjs/operators';
import { id } from '@swimlane/ngx-datatable';
import { Select2OptionData } from 'ng-select2';
import { FileSelectDirective } from 'ng2-file-upload';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
	selector: 'app-sample-management',
	templateUrl: './sample-management.component.html',
	styleUrls: ['./sample-management.component.scss'],
	encapsulation: ViewEncapsulation.None,
	animations: [fadeInOut]
})

export class SampleManagementComponent implements OnInit, AfterViewInit {

	//TestSampleData
	public samplesArray: Sample[] = [];	

	public activateSampleColumns: any[] = [];
	public activateSampleRows: Sample[] = [];
	public activateSampleRowsCache: Sample[] = [];

	public distributionSampleColumns: any[] = [];
	public distributionSampleRows: Sample[] = [];
	public distributionSampleRowsCache: Sample[] = [];

	public queueSampleColumns: any[] = [];
	public queueSampleRows: Sample[] = [];
	public queueSampleRowsCache: Sample[] = [];

	public activateBeingViewed: boolean = true;
	public distributionBeingViewed: boolean = false;
	public queueBeingViewed: boolean = false;

	public model: Sample;
	public editModel: Sample;

	public importing: boolean = false;

	public groupActive: string;
	public allGroups: UserGroup[] = [];

	public sampleEditMode: boolean = false;
	public loadingIndicator: boolean;

	public searchKey: string = "";
	public searchValue: string = "";

	@ViewChild('editorModal', { static: true })
	public editorModal: ModalDirective;

	@ViewChild('sampleEditor', { static: true })
	public sampleEditor: SampleEditorComponent;

	@ViewChild('activateTable')
	public table: any;

	@ViewChild('distributionTable')
	public dTable: any;

	@ViewChild('queueTable')
	public qTable: any;

	@ViewChild('sampleTagTemplate', { static: true })
	public sampleTagTemplate: TemplateRef<any>;

	@ViewChild('dateTemplate', { static: true })
	public dateTemplate: TemplateRef<any>;

	@ViewChild('expandTemplate', { static: true })
	public expandTemplate: TemplateRef<any>;

	@ViewChild('textTemplate', { static: true })
	public textTemplate: TemplateRef<any>;

	@ViewChild('actionsTemplate', { static: true })
	public actionsTemplate: TemplateRef<any>;

	/**
	 *
	 * @param {SampleService} sampleService
	 */
	constructor(
		private alertService: AlertService,
		private translationService: AppTranslationService,
		private accountService: AccountService,
		private sampleService: SampleService,
		private userGroupService: UserGroupService,
		private authService: AuthService
	) {
		this.model = new Sample();
	}

	//Sample Distribution
	public daysInField: number = 10;
	public avgResponsePerDay = 40;
	public completed = 245;

	public responses: any = [
		{ region: "Toronto", resCount: 201, totalSurveys: 430, percentage: 0, colorClass: "progress-bar bg-success" },
		{ region: "Durham", resCount: 6, totalSurveys: 100, percentage: 0, colorClass: "progress-bar bg-info" },
		{ region: "Halton", resCount: 3, totalSurveys: 90, percentage: 0, colorClass: "progress-bar bg-warning" },
		{ region: "Peel", resCount: 13, totalSurveys: 220, percentage: 0, colorClass: "progress-bar bg-danger" },
		{ region: "York", resCount: 20, totalSurveys: 170, percentage: 0, colorClass: "progress-bar bg-primary" },
		{ region: "Hamilton", resCount: 10, totalSurveys: 100, percentage: 0, colorClass: "progress-bar bg-warning" },
		{ region: "Mississauga", resCount: 25, totalSurveys: 150, percentage: 0, colorClass: "progress-bar bg-info" },
		{ region: "Brampton", resCount: 55, totalSurveys: 200, percentage: 0, colorClass: "progress-bar bg-danger" }
	];

	public ngOnInit(): void {
		const gT = (key: string) => this.translationService.getTranslation(key);
		//SampleTestData
		/* this.samplesArray = [
			{ accessCode: "DKT-406", hhIdNum: 1000001, mailingBlock: 100, lastName: "Philips", postalCode: "L1G4P2", address: "45 Leyton St", phoneNumber: 6478888151, owner: "Administrator", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "YFE-314", hhIdNum: 1000002, mailingBlock: 100, lastName: "Pugh", postalCode: "L1G5O2", address: "55 Sunrise St", phoneNumber: 6478998080, owner: "Administrator", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "RER-313", hhIdNum: 1000003, mailingBlock: 100, lastName: "Hossain", postalCode: "M2G3Y1", address: "105 Sunset Ave", phoneNumber: 6479901080, owner: "Administrator", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "CQW-438", hhIdNum: 1000004, mailingBlock: 100, lastName: "Perry", postalCode: "M2G4Z5", address: "15 Don Valley PWY", phoneNumber: 4168901000, owner: "Administrator", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "ATS-461", hhIdNum: 1000005, mailingBlock: 100, lastName: "Leung", postalCode: "N2A5B6", address: "55 Stoney Creek St", phoneNumber: 4161991111, owner: "Administrator", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" },
			{ accessCode: "YCH-001", hhIdNum: 1000006, mailingBlock: 100, lastName: "Omaruan", postalCode: "N2A6C8", address: "10 Matheson St", phoneNumber: 4372225555, owner: "Administrator", group: "TTS", startDate: new Date(), lastModified: new Date(), status: "Fresh", state: "Inactive", language: "English" }
		]; */
		
		//Sample Distribution visual data
		for (let i = 0; i < this.responses.length; i++) {
			let rC = this.responses[i].resCount;
			let tS = this.responses[i].totalSurveys;
			let rPercent = (rC / tS) * 100;
			this.responses[i].percentage = Math.round(rPercent) + "%";
		}
		//console.log(this.responses);
		
		//Manage Samples page
		this.model.status = "Fresh";
		this.model.state = "";
		this.activateSampleRows = this.samplesArray;
		this.activateSampleColumns = this.samplesArray;
		
		// columns for the display data table
		this.activateSampleColumns = [
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
		this.distributionSampleColumns = [
			{
				width: 10,
				cellTemplate: this.expandTemplate,
				sortable: false,
				resizeable: false,
				draggable: false,
				canAutoResize: false
			}
		];
		this.queueSampleColumns = [
			{
				width: 10,
				cellTemplate: this.expandTemplate,
				sortable: false,
				resizeable: false,
				draggable: false,
				canAutoResize: false
			},
		];

		if (this.canViewSamples) {
			this.activateSampleColumns.push({
				name: 'Actions',
				width: 100,
				cellTemplate: this.actionsTemplate,
				resizeable: false,
				canAutoResize: false,
				sortable: false,
				draggable: false
			});
		}
		this.loadData();
	}

	public get canViewSamples(): boolean {
		return this.accountService.userHasPermission(Permission.viewSamplesPermission);
	}
    /**
    *
    * @param name
    */
	public switchGroup(name: string): void {
		if (name === 'Activate') {
			this.activateBeingViewed = true;
			this.distributionBeingViewed = false;
			this.queueBeingViewed = false;			
			this.groupActive = '';
		} else if (name === 'Distribution') {
			this.activateBeingViewed = false;
			this.distributionBeingViewed = true;
			this.queueBeingViewed = false;
			this.groupActive = '';
		}
		else {
			this.activateBeingViewed = false;
			this.distributionBeingViewed = false;
			this.queueBeingViewed = true;
			this.groupActive = '';
		}
	}

    /**
	*
	* @param value
	*/
	public onSearchChanged(): void {
		this.activateSampleRowsCache = this.samplesArray;
		this.activateSampleRows = this.activateSampleRowsCache
			.filter(item => item[this.searchKey]
				.toString().toLowerCase().indexOf(this.searchValue.toLowerCase()) >= 0);

		/*if (this.queueBeingViewed) {= 
			this.queueSampleRows = this.queueSampleRowsCache.filter(r => Utilities.searchArray(value, false, r.name));
		} else if (this.distributionBeingViewed) {
			this.distributionSampleRows = this.distributionSampleRowsCache.filter(r => Utilities.searchArray(value, false, r.name));
		} else {
			//this.activateSampleRows = this.activateSampleRows.filter(r => Utilities.searchArray(value, false, r.name));
			this.activateSampleRowsCache = this.samplesArray;
			this.activateSampleRows = this.activateSampleRowsCache.filter(r => r.address == value);
		} */
	}

	public toggleExpandRow(row: Sample): void {
		if (this.queueSampleRows) {
			this.qTable.rowDetail.toggleExpandRow(row);
		} else if (this.distributionSampleRows) {
			this.dTable.rowDetail.toggleExpandRow(row);
		} else {
			this.table.rowDetail.toggleExpandRow(row);
		}
	}
	public rowExpand(event: any): void {
		if (event.type === 'click') {
			this.toggleExpandRow(event.row);
		}
	}

	public rowCursor(row: any): string {
		return 'cursor-pointer';
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
		//this.sampleEditor.canDeleteSample = sample.owner === this.accountService.currentUser.userName || this.canDelete(sample);
		this.model = sample;
		this.editModel = new Sample();
		Object.assign(this.editModel, this.model);
		//this.sampleEditor.activePeriod = [this.editModel.startAt, this.editModel.endAt];
		this.editorModal.show();
	}

	public canDelete(row: Sample): boolean {
		return (
			this.accountService.currentUser.roles.includes('management') ||
			row.samplePermissions[0].permissions.includes('sample.delete')
		);
	}

	public ngAfterViewInit(): void {
		this.sampleEditor.changesSavedCallback = () => {
			this.importing = false;
			Object.assign(this.model, this.editModel);
			this.editorModal.hide();
			this.sampleService.listSamples().subscribe(samples => {
				this.activateSampleRows = samples;
				this.activateSampleRowsCache = [...samples];
			});
			this.sampleService.listDistributionSamples().subscribe(samples => {
				this.distributionSampleRows = samples;
				this.distributionSampleRowsCache = [...samples];
			});
		};

		this.sampleEditor.changesCancelledCallback = () => {
			this.importing = false;
			// this.model = null;
			this.editModel = null;
			this.editorModal.hide();
		};

		this.sampleEditor.deleteSampleCallback = () => {
			this.editorModal.hide();
			//this.deleteSample(this.model);
		};
	}

	//Sample Action
	public sampleStateAction(): void {
		if (this.model.state == "")
			return;

		for (var i in this.activateSampleRows) {
			this.activateSampleRows[i].state = this.model.state;
		}
		this.activateSampleRows = [...this.activateSampleRows];
	}

	//Sample Status
	public onStatusChanged(): void {
		if (this.model.status != "Select Status") {
			this.activateSampleRowsCache = this.samplesArray;
			this.activateSampleRows = this.activateSampleRowsCache.filter(r => r.status == this.model.status);
			this.activateSampleRows = [...this.activateSampleRows];
		}
		else {
			this.activateSampleRows = this.samplesArray;
			this.activateSampleRows = [...this.activateSampleRows];
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
				this.sampleService.listSamples().subscribe((distributionSamples: Sample[]) => {
					this.userGroupService
						.listUserGroups()
						.subscribe(
							userGroups => this.onDataLoadSuccessful(activeSamples, distributionSamples, userGroups),
							error => this.onDataLoadFailed(error)
						);
				});
			},
			error => this.onDataLoadFailed(error)
		);
	}

	public onDataLoadSuccessful(activeSamples: Sample[], distributionSamples: Sample[],
		groups: UserGroup[]): void {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.activateSampleRows = activeSamples;
		this.activateSampleRowsCache = [...activeSamples];

		this.distributionSampleRows = distributionSamples;
		this.distributionSampleRowsCache = [...distributionSamples];

		this.allGroups = groups;
		this.sampleEditor.groupsOptions = [];
		this.allGroups.forEach(group => {
			this.sampleEditor.groupsOptions.push({ text: group.name, id: group.name });
		});
		if (this.allGroups.length > 0) {
			this.sampleEditor.selectedGroup = this.sampleEditor.groupsOptions[0].id;
		}
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
			this.activateSampleRows = this.samplesArray;
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
		//console.log(csvArray);
		this.samplesArray = [...this.samplesArray];
		this.activateSampleRows = this.samplesArray;
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

}