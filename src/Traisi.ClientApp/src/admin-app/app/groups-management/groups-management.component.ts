import {
	Component,
	ViewEncapsulation,
	OnInit,
	Injector,
	OnDestroy,
	ViewChild,
	TemplateRef,
	AfterViewInit,
	ChangeDetectorRef
} from '@angular/core';

import { AlertService, DialogType, MessageSeverity } from '../../../shared/services/alert.service';
import { AccountService } from '../services/account.service';
import { AppTranslationService } from '../../../shared/services/app-translation.service';
import { Utilities } from '../../../shared/services/utilities';
import { UserGroupService } from '../services/user-group.service';
import { UserGroup } from '../models/user-group.model';
import { UserGroupAPIKeys } from '../models/user-group-apikeys.model';
import { EmailTemplate } from '../models/email-template.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';



@Component({
	selector: 'app-groups-management',
	templateUrl: './groups-management.component.html',
	styleUrls: ['./groups-management.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class GroupsManagementComponent implements OnInit {
	public emailColumns: any[] = [];
	public emailRows: EmailTemplate[] = [];

	public loadingIndicator: boolean;

	public apiModel: UserGroupAPIKeys;

	public allGroups: UserGroup[] = [];
	public groupActive: string;

	public isSaving: boolean = false;
	public isNewTemplate: boolean = false;

	public editingTemplate: boolean;

	public selectedTemplate: EmailTemplate;

	editorOptions = {theme: 'vs-dark', language: 'html', automaticLayout: true};

	@ViewChild('indexTemplate', { static: true }) indexTemplate: TemplateRef<any>;
	@ViewChild('actionsTemplate', { static: true }) actionsTemplate: TemplateRef<any>;

	@ViewChild('editorModal', { static: true }) editorModal: ModalDirective;

	constructor(
		private alertService: AlertService,
		private translationService: AppTranslationService,
		private accountService: AccountService,
		private userGroupService: UserGroupService,
		private changeDetect: ChangeDetectorRef,
		private sanitizer: DomSanitizer
	) {
		this.apiModel = new UserGroupAPIKeys();
		this.selectedTemplate = new EmailTemplate();
	}

	ngOnInit(): void {
		this.emailColumns = [
			{
				prop: 'index',
				name: '#',
				width: 30,
				cellTemplate: this.indexTemplate,
				canAutoResize: false
			},
			{
				prop: 'name',
				name: 'Name',
				minWidth: 90,
				flexGrow: 60
			},
			{
				name: 'Actions',
				width: 150,
				cellTemplate: this.actionsTemplate,
				resizeable: false,
				canAutoResize: false,
				sortable: false,
				draggable: false
			}
		];


		this.loadData();
	}

	/**
	 * Load initial survey info (surveys for user and group list)
	 */
	loadData() {
		this.alertService.startLoadingMessage();
		this.loadingIndicator = true;

		this.userGroupService
			.listUserGroupsWhereAdmin()
			.subscribe(userGroups => this.onDataLoadSuccessful(userGroups), error => this.onDataLoadFailed(error));
	}


	onDataLoadSuccessful(groups: UserGroup[]) {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.allGroups = groups;
		this.groupActive = this.allGroups[0].name;
		this.switchGroup(this.groupActive);
	}

	onDataLoadFailed(error: any) {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.alertService.showStickyMessage(
			'Load Error',
			`Unable to retrieve info from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
			MessageSeverity.error,
			error
		);
	}

	switchGroup(name: string) {
		this.alertService.startLoadingMessage('Loading ' + name + ' info ...');
		this.loadingIndicator = true;
		const group = this.allGroups.filter(u => u.name === name)[0];
		this.userGroupService.getUserGroupApiKeys(group.id).subscribe(
			result => {
				this.apiModel = result;
				this.groupActive = name;
				this.alertService.stopLoadingMessage();
				this.loadingIndicator = false;
			},
			error => {
				this.alertService.stopLoadingMessage();
				this.loadingIndicator = false;
				this.alertService.showStickyMessage(
					'Load Error',
					`An error occured whilst loading group information.\r\nError: "${Utilities.getHttpResponseMessage(
						error
					)}"`,
					MessageSeverity.error,
					error
				);
			}
		);
		this.userGroupService.getUserGroupEmailTemplates(group.id).subscribe(
			result => {
				this.emailRows = result;
				this.groupActive = name;
				this.loadingIndicator = false;
			},
			error => {
				this.alertService.stopLoadingMessage();
				this.loadingIndicator = false;
				this.alertService.showStickyMessage(
					'Load Error',
					`An error occured whilst loading group templates.\r\nError: "${Utilities.getHttpResponseMessage(
						error
					)}"`,
					MessageSeverity.error,
					error
				);
			}
		);
	}

	public saveKeys() {
		this.isSaving = true;
		this.userGroupService
			.updateUserGroupApiKeys(this.apiModel)
			.subscribe(value => this.saveKeysSuccessHelper(), error => this.saveFailedHelper(error));
	}

	private saveKeysSuccessHelper() {
		this.alertService.stopLoadingMessage();
		this.isSaving = false;

		this.alertService.showMessage(
			'Success',
			`API Keys updated for group \"${this.groupActive}\"`,
			MessageSeverity.success
		);

	}

	private saveFailedHelper(error: any) {
		this.isSaving = false;
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Save Error',
			'The below errors occured whilst saving your changes:',
			MessageSeverity.error,
			error
		);
		this.alertService.showStickyMessage(error, null, MessageSeverity.error);
	}

	editTemplate(row: EmailTemplate) {
		Object.assign(this.selectedTemplate, row);
		this.isNewTemplate = false;
		this.editingTemplate = true;
		this.editorModal.show();

	}
	onEditorModalShow() {

	}

	onEditorModalHidden() {
		this.editingTemplate = false;
	}

	cancel() {
		this.editorModal.hide();
	}

	save() {
		if (this.isNewTemplate) {
			this.userGroupService.addUserGroupEmailTemplate(this.selectedTemplate).subscribe(
				result => {
					this.saveTemplateSuccessHelper();
					this.switchGroup(this.groupActive);
				},
				error => {
					this.saveFailedHelper(error);
				});
		} else {
			this.userGroupService.updateUserGroupEmailTemplate(this.selectedTemplate).subscribe(
				result => {
					this.saveTemplateSuccessHelper();
					this.switchGroup(this.groupActive);
				},
				error => {
					this.saveFailedHelper(error);
				});
		}
	}

	private saveTemplateSuccessHelper() {
		this.alertService.stopLoadingMessage();
		this.isSaving = false;
		this.editorModal.hide();
		this.alertService.showMessage(
			'Success',
			`Template updated for group \"${this.groupActive}\"`,
			MessageSeverity.success
		);

	}

	newTemplate() {
		this.isNewTemplate = true;
		this.selectedTemplate = new EmailTemplate();
		this.selectedTemplate.groupName = this.groupActive;
		this.selectedTemplate.html =
			`<!DOCTYPE html>
<html>
<head>
</head>
<body>
</body>
</html>`;
		this.editingTemplate = true;
		this.editorModal.show();
	}

	public delete() {
		this.alertService.showDialog(
			'Are you sure you want to delete "' + this.selectedTemplate.name + '"?',
			DialogType.confirm,
			() => this.deleteSurveyHelper()
		);
	}

	/**
	 * Deletes the survey with the associated id.
	 * @param surveyId
	 */
	private deleteSurveyHelper(): void {
		this.userGroupService.deleteUserGroupEmailTemplate(this.selectedTemplate.id).subscribe(
			value => {
				this.switchGroup(this.groupActive);
			},
			error => {
				this.deleteFailedHelper(error);
			}
		);
		this.editorModal.hide();
	}

	private deleteFailedHelper(error: any) {
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Save Error',
			'The below errors occured whilst deleting the template:',
			MessageSeverity.error,
			error
		);
		this.alertService.showStickyMessage(error, null, MessageSeverity.error);
	}

}
