import { Component, ViewEncapsulation, OnInit, ViewChild, Input, Output, AfterViewInit, EventEmitter, Directive } from '@angular/core';

import { AlertService, MessageSeverity } from '../../../../shared/services/alert.service';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../../../shared/services/utilities';
import { User } from '../../../../shared/models/user.model';
import { UserEdit } from '../../models/user-edit.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../../../shared/models/permission.model';
import { AppTranslationService } from '../../../../shared/services/app-translation.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Select2OptionData } from 'ng-select2';
import { GroupMember } from '../../models/group-member.model';
import { UserGroupService } from '../../services/user-group.service';

declare let jQuery: any;

@Component({
	selector: 'user-info',
	templateUrl: './user-info.component.html',
	styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit, AfterViewInit {
	public isEditMode = false;
	public isNewUser = false;
	public isSaving = false;
	public isChangePassword = false;
	public isEditingSelf = false;
	public showValidationErrors = false;
	public editingUserName: string;
	public uniqueId: string = Utilities.uniqueId();
	public user: User = new User();
	public userEdit: UserEdit = new UserEdit();
	public allRoles: Role[] = [];
	public rolesOptions: Array<Select2OptionData>;
	public selectedRole: string;
	public select2Options: any = {
		theme: 'bootstrap'
	};
	public formResetToggle = true;
	public groupMemberInfo: GroupMember;

	public changesSavedCallback: () => void;
	public changesFailedCallback: () => void;
	public changesCancelledCallback: () => void;

	@Input() public isViewOnly: boolean;

	@Input() public isGeneralEditor: boolean = false;

	@Input() public inGroupMode: boolean = false;

	@ViewChild('f') private form;

	// ViewChilds Required because ngIf hides template variables from global scope
	@ViewChild('userName') private userName;

	@ViewChild('userPassword') private userPassword;

	@ViewChild('email') private email;

	@ViewChild('currentPassword') private currentPassword;

	@ViewChild('newPassword') private newPassword;

	@ViewChild('confirmPassword') private confirmPassword;

	@ViewChild('roles') private roles;

	@ViewChild('rolesSelector') private rolesSelector;

	constructor(
		private alertService: AlertService,
		private accountService: AccountService,
		private translationService: AppTranslationService,
		private authService: AuthService,
		private userGroupService: UserGroupService
	) {
		translationService.addLanguages(['en', 'fr', 'de', 'pt', 'ar', 'ko']);
		translationService.setDefaultLanguage('en');
	}

	public ngOnInit() {
		if (!this.isGeneralEditor) {
			this.loadCurrentUserData();
		}
		this.rolesOptions = [];
		this.accountService.getRoles().subscribe(
			roles => {
				for (const role of roles) {
					this.rolesOptions.push({ text: role.description, id: role.name });
				}
				this.selectedRole = 'user';
			},
			error => {}
		);
	}

	public ngAfterViewInit(): void {
		jQuery('.parsleyjs').parsley();
	}

	private loadCurrentUserData() {
		this.alertService.startLoadingMessage();

		if (this.canViewAllRoles) {
			this.accountService
				.getUserAndRoles()
				.subscribe(
					results => this.onCurrentUserDataLoadSuccessful(results[0], results[1]),
					error => this.onCurrentUserDataLoadFailed(error)
				);
		} else {
			this.accountService
				.getUser()
				.subscribe(
					user => this.onCurrentUserDataLoadSuccessful(user, user.roles.map(x => new Role(x))),
					error => this.onCurrentUserDataLoadFailed(error)
				);
		}
	}

	private onCurrentUserDataLoadSuccessful(user: User, roles: Role[]) {
		this.alertService.stopLoadingMessage();
		this.user = user;
		this.allRoles = roles;
		this.rolesOptions = [];

		for (const role of this.allRoles) {
			this.rolesOptions.push({ text: role.description, id: role.name });
		}
		this.selectedRole = this.user.roles[0];
	}

	public updateRole(e: any): void {
		if (this.isEditingSelf) {
			this.user.roles = [];
			this.user.roles.push(e.value);
		} else {
			this.userEdit.roles = [];
			this.userEdit.roles.push(e.value);
		}
	}

	private onCurrentUserDataLoadFailed(error: any) {
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Load Error',
			`Unable to retrieve user data from the server.
											Errors: "${Utilities.getHttpResponseMessage(error)}"`,
			MessageSeverity.error,
			error
		);

		this.logout();
	}

	private getRoleByName(name: string) {
		return this.allRoles.find(r => r.name === name);
	}

	private showErrorAlert(caption: string, message: string) {
		this.alertService.showMessage(caption, message, MessageSeverity.error);
	}

	public deletePasswordFromUser(user: UserEdit | User) {
		const userEdit = <UserEdit>user;

		delete userEdit.currentPassword;
		delete userEdit.newPassword;
		delete userEdit.confirmPassword;
	}

	private edit() {
		if (!this.isGeneralEditor) {
			this.isEditingSelf = true;
			this.userEdit = new UserEdit();
			Object.assign(this.userEdit, this.user);
		} else {
			if (!this.userEdit) {
				this.userEdit = new UserEdit();
			}

			this.isEditingSelf = this.accountService.currentUser ? this.userEdit.id === this.accountService.currentUser.id : false;
		}
		this.isEditMode = true;
		this.showValidationErrors = true;
		this.isChangePassword = false;
	}

	private save(): void {
		this.isSaving = true;
		this.alertService.startLoadingMessage('Saving changes...');
		this.userEdit.roles.push(this.selectedRole);
		if (this.isNewUser) {
			this.accountService
				.newUser(this.userEdit)
				.subscribe(user => this.saveSuccessHelper(user), error => this.saveFailedHelper(error));
		} else {
			this.accountService.updateUser(this.userEdit).subscribe(
				response => {
					if (this.inGroupMode) {
						// update user name in group member (one edited is only in userEdit object)
						this.groupMemberInfo.userName = this.groupMemberInfo.user.userName;
						this.userGroupService
							.updateGroupMember(this.groupMemberInfo)
							.subscribe(mresponse => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
					} else {
						this.saveSuccessHelper(null);
					}
				},
				error => this.saveFailedHelper(error)
			);
		}
	}

	private saveSuccessHelper(user?: User) {
		this.testIsRoleUserCountChanged(this.user, this.userEdit);

		if (user) {
			Object.assign(this.userEdit, user);
		}

		this.isSaving = false;
		this.alertService.stopLoadingMessage();
		this.isChangePassword = false;
		this.showValidationErrors = false;

		this.deletePasswordFromUser(this.userEdit);
		Object.assign(this.user, this.userEdit);

		if (this.isGeneralEditor) {
			if (this.isNewUser) {
				this.alertService.showMessage(
					'Success',
					`User \"${this.user.userName}\" was created successfully`,
					MessageSeverity.success
				);
			} else if (!this.isEditingSelf) {
				this.alertService.showMessage(
					'Success',
					`Changes to user \"${this.user.userName}\" were saved successfully`,
					MessageSeverity.success
				);
			}
		}

		this.userEdit = new UserEdit();

		this.groupMemberInfo = new GroupMember();
		this.resetForm();

		if (this.isEditingSelf) {
			this.alertService.showMessage('Success', 'Changes to your User Profile was saved successfully', MessageSeverity.success);
			this.refreshLoggedInUser();
		}

		this.isEditMode = false;

		if (this.changesSavedCallback) {
			this.changesSavedCallback();
		}
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
		this.userEdit = new UserEdit();
		this.isNewUser = true;
		this.groupMemberInfo = new GroupMember();
		if (this.changesFailedCallback) {
			this.changesFailedCallback();
		}
	}

	private testIsRoleUserCountChanged(currentUser: User, editedUser: User) {
		const rolesAdded = this.isNewUser ? editedUser.roles : editedUser.roles.filter(role => currentUser.roles.indexOf(role) === -1);
		const rolesRemoved = this.isNewUser ? [] : currentUser.roles.filter(role => editedUser.roles.indexOf(role) === -1);

		const modifiedRoles = rolesAdded.concat(rolesRemoved);

		if (modifiedRoles.length) {
			setTimeout(() => this.accountService.onRolesUserCountChanged(modifiedRoles));
		}
	}

	private cancel() {
		if (this.isGeneralEditor) {
			this.userEdit = this.user = new UserEdit();
		} else {
			this.userEdit = new UserEdit();
		}
		this.groupMemberInfo = new GroupMember();
		this.showValidationErrors = false;
		this.resetForm();

		this.alertService.showMessage('Cancelled', 'Operation cancelled by user', MessageSeverity.default);
		this.alertService.resetStickyMessage();

		if (!this.isGeneralEditor) {
			this.isEditMode = false;
		}

		if (this.changesCancelledCallback) {
			this.changesCancelledCallback();
		}
	}

	private close() {
		this.userEdit = this.user = new UserEdit();
		this.showValidationErrors = false;
		this.resetForm();
		this.isEditMode = false;
		this.isNewUser = true;
		this.groupMemberInfo = new GroupMember();
		if (this.changesSavedCallback) {
			this.changesSavedCallback();
		}
	}

	private refreshLoggedInUser() {
		this.accountService.refreshLoggedInUser().subscribe(
			user => {
				this.loadCurrentUserData();
			},
			error => {
				this.alertService.resetStickyMessage();
				this.alertService.showStickyMessage(
					'Refresh failed',
					'An error occured whilst refreshing logged in user information from the server',
					MessageSeverity.error,
					error
				);
			}
		);
	}

	private changePassword() {
		this.isChangePassword = true;
	}

	private unlockUser() {
		this.isSaving = true;
		this.alertService.startLoadingMessage('Unblocking user...');

		this.accountService.unblockUser(this.userEdit.id).subscribe(
			response => {
				this.isSaving = false;
				this.userEdit.isLockedOut = false;
				this.alertService.stopLoadingMessage();
				this.alertService.showMessage('Success', 'User has been successfully unblocked', MessageSeverity.success);
			},
			error => {
				this.isSaving = false;
				this.alertService.stopLoadingMessage();
				this.alertService.showStickyMessage(
					'Unblock Error',
					'The below errors occured whilst unblocking the user:',
					MessageSeverity.error,
					error
				);
				this.alertService.showStickyMessage(error, null, MessageSeverity.error);
			}
		);
	}

	public resetForm(replace = false) {
		this.isChangePassword = false;

		if (!replace) {
			this.form.reset();
		} else {
			this.formResetToggle = false;

			setTimeout(() => {
				this.formResetToggle = true;
			});
		}
	}

	public newUser(allRoles: Role[]) {
		this.isGeneralEditor = true;
		this.isNewUser = true;

		this.allRoles = [...allRoles];
		this.editingUserName = null;
		this.user = this.userEdit = new UserEdit();
		this.user.roles = [];
		this.user.roles.push(this.selectedRole);
		this.userEdit.isEnabled = true;
		this.edit();

		return this.userEdit;
	}

	public editUser(user: User, allRoles: Role[]) {
		if (user) {
			this.isGeneralEditor = true;
			this.isNewUser = false;

			this.setRoles(user, allRoles);
			this.editingUserName = user.userName;
			this.user = new User();
			this.userEdit = new UserEdit();
			Object.assign(this.user, user);
			Object.assign(this.userEdit, user);
			this.rolesOptions = [];

			for (const role of this.allRoles) {
				this.rolesOptions.push({ text: role.description, id: role.name });
			}
			this.selectedRole = this.userEdit.roles[0];
			this.edit();

			return this.userEdit;
		} else {
			return this.newUser(allRoles);
		}
	}
	public displayUser(user: User, allRoles?: Role[]) {
		this.user = new User();
		Object.assign(this.user, user);
		this.deletePasswordFromUser(this.user);
		this.setRoles(user, allRoles);

		this.isEditMode = false;
	}

	public logout() {
		this.authService.logout();
		this.authService.redirectLogoutUser();
	}

	private setRoles(user: User, allRoles?: Role[]) {
		this.allRoles = allRoles ? [...allRoles] : [];

		if (user.roles) {
			for (const ur of user.roles) {
				if (!this.allRoles.some(r => r.name === ur)) {
					this.allRoles.unshift(new Role(ur));
				}
			}
		}

		if (allRoles === null || this.allRoles.length !== allRoles.length) {
			setTimeout(() => this.rolesSelector.refresh());
		}
	}

	get canViewAllRoles() {
		return this.accountService.userHasPermission(Permission.viewRolesPermission);
	}

	get canAssignRoles() {
		return this.accountService.userHasPermission(Permission.assignRolesPermission);
	}
}
