import { Component, ViewEncapsulation, OnInit, Injector, OnDestroy, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { AlertService, DialogType, MessageSeverity } from '../../../shared/services/alert.service';
import { AppTranslationService } from '../../../shared/services/app-translation.service';
import { BootstrapSelectDirective } from '../directives/bootstrap-select.directive';
import { AccountService } from '../services/account.service';

import { Select2OptionData } from 'ng-select2';

import { ItemListComponent } from '../shared/item-list/item-list.component';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { SurveyService } from '../services/survey.service';
import { Survey } from '../models/survey.model';
import { Utilities } from '../../../shared/services/utilities';

import { SurveysEditorComponent } from './surveys-editor/surveys-editor.component';

import { UserGroupService } from '../services/user-group.service';
import { UserGroup } from '../models/user-group.model';
import { GroupMember } from '../models/group-member.model';
import { SurveyPermissions } from '../models/survey-permissions.model';
import { DownloadNotification } from '../models/download-notification';
import { Subject } from 'rxjs';
import { RealTimeNotificationServce } from '../services/real-time-notification.service';
import { fadeInOut } from '../services/animations';

@Component({
	selector: 'app-surveys-management',
	templateUrl: './surveys-management.component.html',
	styleUrls: ['./surveys-management.component.scss'],
	encapsulation: ViewEncapsulation.None,
	animations: [fadeInOut]
})
export class SurveysManagementComponent implements OnInit, AfterViewInit {
	public soloSurveyColumns: any[] = [];
	public soloSurveyRows: Survey[] = [];
	public soloSurveyRowsCache: Survey[] = [];

	public sharedSurveyColumns: any[] = [];
	public sharedSurveyRows: Survey[] = [];
	public sharedSurveyRowsCache: Survey[] = [];

	public groupSurveyColumns: any[] = [];
	public groupSurveyRows: Survey[] = [];
	public groupSurveyRowsCache: Survey[] = [];

	public allGroups: UserGroup[] = [];

	public model: Survey;
	public editModel: Survey;

	public sharedSurvey: Survey;

	public surveyEditMode: boolean = false;
	public loadingIndicator: boolean;
	public sharedBeingViewed: boolean = false;
	public groupBeingViewed: boolean = false;
	public groupActive: string;

	public importing: boolean = false;

	private downloadProgress: DownloadNotification = null;
	private downloadNotifier: Subject<DownloadNotification>;
	public downloadIndicator: boolean = false;

	@ViewChild('soloTable')
	public table: any;

	@ViewChild('sharedTable')
	public sTable: any;

	@ViewChild('groupTable')
	public gTable: any;

	@ViewChild('editorModal', { static: true })
	public editorModal: ModalDirective;

	@ViewChild('shareModal', { static: true })
	public shareModal: ModalDirective;

	@ViewChild('surveyEditor', { static: true })
	public surveyEditor: SurveysEditorComponent;

	@ViewChild('actionsTemplate', { static: true })
	public actionsTemplate: TemplateRef<any>;

	@ViewChild('surveyTagTemplate', { static: true })
	public surveyTagTemplate: TemplateRef<any>;

	@ViewChild('dateTemplate', { static: true })
	public dateTemplate: TemplateRef<any>;

	@ViewChild('expandTemplate', { static: true })
	public expandTemplate: TemplateRef<any>;

	@ViewChild('textTemplate', { static: true })
	public textTemplate: TemplateRef<any>;

	/**
	 *
	 * @param {SurveyService} surveyService
	 */
	constructor(
		private surveyService: SurveyService,
		private alertService: AlertService,
		private translationService: AppTranslationService,
		private accountService: AccountService,
		private userGroupService: UserGroupService,
		private notificationService: RealTimeNotificationServce
	) {
		this.model = new Survey();
	}

	/**
	 * Initializer
	 */
	public ngOnInit(): void {
		// retrieve surveys

		const gT = (key: string) => this.translationService.getTranslation(key);
		// columns for the display data table
		this.soloSurveyColumns = [
			{
				width: 20,
				cellTemplate: this.expandTemplate,
				sortable: false,
				resizeable: false,
				draggable: false,
				canAutoResize: false
			},
			{ prop: 'code', name: 'Code', width: 60, cellTemplate: this.textTemplate, canAutoResize: false },
			{
				prop: 'name',
				name: 'Survey Title',
				minWidth: 200,
				flexGrow: 100,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'group',
				name: 'Group',
				minWidth: 30,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'startAt',
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'endAt',
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.surveyTagTemplate,
				name: 'Status',
				sortable: false,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			}
		];

		this.sharedSurveyColumns = [
			{
				width: 20,
				cellTemplate: this.expandTemplate,
				sortable: false,
				resizeable: false,
				draggable: false,
				canAutoResize: false
			},
			{
				prop: 'code',
				name: 'Code',
				width: 60,
				flexGrow: 20,
				cellTemplate: this.textTemplate,
				canAutoResize: false
			},
			{
				prop: 'name',
				name: 'Survey Title',
				minWidth: 200,
				flexGrow: 100,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'owner',
				name: 'Owner',
				minWidth: 30,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'group',
				name: 'Group',
				minWidth: 30,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'startAt',
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'endAt',
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.surveyTagTemplate,
				name: 'Status',
				sortable: false,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			}
		];

		this.groupSurveyColumns = [
			{
				width: 50,
				cellTemplate: this.expandTemplate,
				sortable: false,
				resizeable: false,
				draggable: false,
				canAutoResize: false
			},
			{
				prop: 'code',
				name: 'Code',
				width: 60,
				flexGrow: 20,
				cellTemplate: this.textTemplate,
				canAutoResize: false
			},
			{
				prop: 'name',
				name: 'Survey Title',
				minWidth: 200,
				flexGrow: 100,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'owner',
				name: 'Owner',
				minWidth: 30,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col',
				cellClass: 'col'
			},
			{
				prop: 'group',
				name: 'Group',
				minWidth: 30,
				flexGrow: 30,
				cellTemplate: this.textTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'startAt',
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				prop: 'endAt',
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.dateTemplate,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			},
			{
				minWidth: 50,
				flexGrow: 30,
				cellTemplate: this.surveyTagTemplate,
				name: 'Status',
				sortable: false,
				headerClass: 'col d-none d-md-block',
				cellClass: 'col d-none d-md-block'
			}
		];

		this.loadData();
	}

	public ngAfterViewInit(): void {
		this.surveyEditor.changesSavedCallback = () => {
			this.importing = false;
			Object.assign(this.model, this.editModel);
			this.editorModal.hide();
			this.surveyService.listSurveys().subscribe(surveys => {
				this.soloSurveyRows = surveys;
				this.soloSurveyRowsCache = [...surveys];
			});
			this.surveyService.listSharedSurveys().subscribe(surveys => {
				this.sharedSurveyRows = surveys;
				this.sharedSurveyRowsCache = [...surveys];
			});
		};

		this.surveyEditor.changesCancelledCallback = () => {
			this.importing = false;
			this.model = null;
			this.editModel = null;
			this.editorModal.hide();
		};

		this.surveyEditor.deleteSurveyCallback = () => {
			this.editorModal.hide();
			this.deleteSurvey(this.model);
		};
	}

	/**
	 * Load initial survey info (surveys for user and group list)
	 */
	public loadData(): void {
		this.alertService.startLoadingMessage();
		this.loadingIndicator = true;

		this.surveyService.listSurveys().subscribe(
			(soloSurveys: Survey[]) => {
				this.surveyService.listSharedSurveys().subscribe((sharedSurveys: Survey[]) => {
					this.userGroupService
						.listUserGroups()
						.subscribe(
							userGroups => this.onDataLoadSuccessful(soloSurveys, sharedSurveys, userGroups),
							error => this.onDataLoadFailed(error)
						);
				});
			},
			error => this.onDataLoadFailed(error)
		);
	}

	public onDataLoadSuccessful(soloSurveys: Survey[], sharedSurveys: Survey[], groups: UserGroup[]): void {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.soloSurveyRows = soloSurveys;
		this.soloSurveyRowsCache = [...soloSurveys];

		this.sharedSurveyRows = sharedSurveys;
		this.sharedSurveyRowsCache = [...sharedSurveys];

		this.allGroups = groups;
		this.surveyEditor.groupsOptions = [];
		this.allGroups.forEach(group => {
			this.surveyEditor.groupsOptions.push({ text: group.name, id: group.name });
		});
		if (this.allGroups.length > 0) {
			this.surveyEditor.selectedGroup = this.surveyEditor.groupsOptions[0].id;
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

	public showSurveyShareDialog(survey: Survey): void {
		this.sharedSurvey = survey;
		this.shareModal.show();
	}

	public closeShareModal(): void {
		this.shareModal.hide();
		this.sharedSurvey = undefined;
	}

	public onShareModalShow(): void {}

	public onShareModalHidden(): void {}

	public importSurvey(): void {
		this.surveyEditMode = false;
		this.surveyEditor.isNewSurvey = true;
		this.importing = true;
		this.editorModal.show();
	}

	public exportSurvey(): void {

		// return this.http.get('http://localhost:8080/employees/download', { responseType: ResponseContentType.Blob });
		window.open(`/api/Survey/${this.sharedSurvey.id}/export`);
		/*
		this.downloadProgress = new DownloadNotification('', 1);
		this.downloadIndicator = true;
		this.surveyService.exportSurvey(this.sharedSurvey.id).subscribe(
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
		);*/
	}

	private downloadSuccessHelper(update: DownloadNotification): void {
		this.downloadProgress = update;
		if (update.progress === 100) {
			this.downloadIndicator = false;
			// download file and unsubscribe
			window.open(this.downloadProgress.url, '_self');
			this.downloadNotifier.unsubscribe();
			this.notificationService.deRegisterChannel(update.id);
		}
	}

	private downloadErrorHelper(error: any): void {
		this.downloadIndicator = false;
		this.downloadNotifier.unsubscribe();
	}

	/**
	 * Launches the new survey modal.
	 */
	public newSurvey(): void {
		this.importing = false;
		this.surveyEditMode = false;
		this.surveyEditor.isNewSurvey = true;
		this.editorModal.show();
	}

	public editSurvey(survey: Survey): void {
		this.importing = false;
		this.surveyEditMode = true;
		this.surveyEditor.isNewSurvey = false;
		this.surveyEditor.canDeleteSurvey = survey.owner === this.accountService.currentUser.userName || this.canDelete(survey);
		this.model = survey;
		this.editModel = new Survey();
		Object.assign(this.editModel, this.model);
		this.surveyEditor.activePeriod = [this.editModel.startAt, this.editModel.endAt];
		this.editorModal.show();
	}

	public closeEditorModal(): void {
		this.editorModal.hide();
	}

	/**
	 *
	 */
	public onEditorModalHidden(): void {}

	/**
	 * Called before new survey modal is displayed. The input data and model will be reset.
	 */
	public onEditorModalShow(): void {
		if (!this.surveyEditMode) {
			this.model = new Survey();
			this.model.startAt = new Date();
			this.model.endAt = new Date();
			this.model.group = this.surveyEditor.selectedGroup;
			this.editModel = new Survey();
			Object.assign(this.editModel, this.model);
			this.surveyEditor.activePeriod = [this.editModel.startAt, this.editModel.endAt];
			this.surveyEditor.editMode = false;
		} else {
			this.surveyEditor.editMode = true;
		}
		this.surveyEditor.model = this.editModel;
	}

	/**
	 * Called when the new survey form is submitted.
	 */
	public onNewSurveyFormSubmit(): void {
		this.surveyService.createSurvey(this.model).subscribe(value =>
			this.surveyService.listSurveys().subscribe(surveys => {
				this.soloSurveyRows = surveys;
				this.soloSurveyRowsCache = [...surveys];
			})
		);

		this.editorModal.hide();
	}

	public deleteSurvey(row: Survey): void {
		this.alertService.showDialog('Are you sure you want to delete "' + row.name + '"?', DialogType.confirm, () =>
			this.deleteSurveyHelper(row.id)
		);
	}

	/**
	 * Deletes the survey with the associated id.
	 * @param surveyId
	 */
	private deleteSurveyHelper(surveyId: number): void {
		this.surveyService.deleteSurvey(surveyId).subscribe(value => {
			if (this.sharedBeingViewed) {
				this.surveyService.listSharedSurveys().subscribe(surveys => {
					this.sharedSurveyRows = surveys;
					this.sharedSurveyRowsCache = [...surveys];
				});
			} else if (this.groupBeingViewed) {
				this.switchGroup(this.groupActive);
			} else {
				this.surveyService.listSurveys().subscribe(surveys => {
					this.soloSurveyRows = surveys;
					this.soloSurveyRowsCache = [...surveys];
				});
			}
		});
	}

	/**
	 *
	 * @param name
	 */
	public switchGroup(name: string): void {
		if (name === 'unGrouped') {
			this.groupBeingViewed = false;
			this.sharedBeingViewed = false;
			this.groupActive = '';
		} else if (name === 'shared') {
			this.groupBeingViewed = false;
			this.sharedBeingViewed = true;
			this.groupActive = '';
		} else {
			this.alertService.startLoadingMessage('Loading ' + name + ' members...');
			this.loadingIndicator = true;
			const group = this.allGroups.filter(u => u.name === name)[0];
			this.surveyService.listGroupSurveys(group.id).subscribe(
				result => {
					let surveyInfo = result.map(u => u);
					this.groupSurveyRowsCache = [...surveyInfo];
					this.groupSurveyRows = surveyInfo;
					this.groupBeingViewed = true;
					this.sharedBeingViewed = false;
					this.groupActive = name;
					this.alertService.stopLoadingMessage();
					this.loadingIndicator = false;
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.loadingIndicator = false;
					this.alertService.showStickyMessage(
						'Load Error',
						`An error occured whilst loading the group surveys.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
		}
	}

	/**
	 *
	 * @param value
	 */
	public onSearchChanged(value: string): void {
		if (this.groupBeingViewed) {
			this.groupSurveyRows = this.groupSurveyRowsCache.filter(r => Utilities.searchArray(value, false, r.name));
		} else if (this.sharedBeingViewed) {
			this.sharedSurveyRows = this.sharedSurveyRowsCache.filter(r => Utilities.searchArray(value, false, r.name));
		} else {
			this.soloSurveyRows = this.soloSurveyRowsCache.filter(r => Utilities.searchArray(value, false, r.name));
		}
	}

	public toggleExpandRow(row: Survey): void {
		if (this.groupBeingViewed) {
			this.gTable.rowDetail.toggleExpandRow(row);
		} else if (this.sharedBeingViewed) {
			this.sTable.rowDetail.toggleExpandRow(row);
		} else {
			this.table.rowDetail.toggleExpandRow(row);
		}
	}

	/**
	 *
	 *
	 * @param {*} event
	 * @param {Survey} row
	 * @memberof SurveysManagementComponent
	 */
	public previewSurvey(row: Survey): void {
		window.open(`/survey/${row.code}/start`, '_blank');
		// event.stopPropagation();
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
	 *
	 * @param row
	 */
	public canEdit(row: Survey): boolean {
		return (
			this.accountService.currentUser.roles.includes('super administrator') ||
			(row.surveyPermissions && row.surveyPermissions.length > 0 && row.surveyPermissions[0].permissions.includes('survey.modify'))
		);
	}
	public canDelete(row: Survey): boolean {
		return (
			this.accountService.currentUser.roles.includes('super administrator') ||
			row.surveyPermissions[0].permissions.includes('survey.delete')
		);
	}
	public canAnalyze(row: Survey): boolean {
		return (
			this.accountService.currentUser.roles.includes('super administrator') ||
			(row.surveyPermissions && row.surveyPermissions.length > 0 && row.surveyPermissions[0].permissions.includes('survey.analyze'))
		);
	}
	public canShare(row: Survey): boolean {
		return (
			this.accountService.currentUser.roles.includes('super administrator') ||
			(row.surveyPermissions && row.surveyPermissions.length > 0 && row.surveyPermissions[0].permissions.includes('survey.share'))
		);
	}

	public noAccess(row: Survey): boolean {
		return false;
		//return !row.surveyPermissions || row.surveyPermissions.length === 0;
	}
}
