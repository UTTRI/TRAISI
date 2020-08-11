import { Component, ViewEncapsulation, OnInit, AfterViewInit, Injector, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';

import { AlertService, DialogType, MessageSeverity } from '../../../../shared/services/alert.service';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { AppTranslationService } from '../../../../shared/services/app-translation.service';
import { BootstrapSelectDirective } from '../../directives/bootstrap-select.directive';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../../../shared/services/utilities';
import { Select2OptionData } from 'ng-select2';

import { User } from '../../../../shared/models/user.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../../../shared/models/permission.model';
import { UserGroup } from '../../models/user-group.model';
import { GroupMember } from '../../models/group-member.model';
import { UserEdit } from '../../models/user-edit.model';
import { UserInfoComponent } from '../../account-management/user-info/user-info.component';
import { UserGroupService } from '../../services/user-group.service';

@Component({
	selector: 'app-users-management',
	templateUrl: './users-management.component.html',
	styleUrls: ['./users-management.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class UsersManagementComponent implements OnInit, AfterViewInit {
	public soloUserColumns: any[] = [];
	public soloUserRows: User[] = [];
	public soloUserRowsCache: User[] = [];
	public soloUserSelected: User[] = [];

	public groupUserColumns: any[] = [];
	public groupUserRows: GroupMember[] = [];
	public groupUserRowsCache: GroupMember[] = [];
	public groupUserSelected: GroupMember[] = [];

	public editedUser: UserEdit;
	public sourceUser: UserEdit;
	public editingUserName: { name: string };
	public loadingIndicator: boolean;

	public allRoles: Role[] = [];
	public allGroups: UserGroup[] = [];

	public groupNameOptions: Array<Select2OptionData> = [];
	public selectedGroup: string;
	public selectedGroupName: string;
	public select2Options: any = {
		theme: 'bootstrap'
	};

	public newGroupName: string;

	public groupBeingViewed: boolean = false;
	public groupActive: string;

	@ViewChild('indexTemplate', { static: true }) indexTemplate: TemplateRef<any>;

	@ViewChild('userNameTemplate', { static: true }) userNameTemplate: TemplateRef<any>;

	@ViewChild('rolesTemplate', { static: true }) rolesTemplate: TemplateRef<any>;

	@ViewChild('actionsTemplate', { static: true }) actionsTemplate: TemplateRef<any>;

	@ViewChild('indexTemplateG', { static: true }) indexTemplateG: TemplateRef<any>;

	@ViewChild('userNameTemplateG', { static: true }) userNameTemplateG: TemplateRef<any>;

	@ViewChild('rolesTemplateG', { static: true }) rolesTemplateG: TemplateRef<any>;

	@ViewChild('actionsTemplateG', { static: true }) actionsTemplateG: TemplateRef<any>;

	@ViewChild('editorModal', { static: true }) editorModal: ModalDirective;

	@ViewChild('userEditor', { static: true }) userEditor: UserInfoComponent;

	constructor(
		private alertService: AlertService,
		private translationService: AppTranslationService,
		private accountService: AccountService,
		private userGroupService: UserGroupService
	) {}

	ngOnInit() {
		const gT = (key: string) => this.translationService.getTranslation(key);

		this.soloUserColumns = [
			{
				width: 30,
				sortable: false,
				canAutoResize: false,
				draggable: false,
				resizable: false,
				headerCheckboxable: false,
				checkboxable: false
			},
			{
				prop: 'index',
				name: '#',
				width: 30,
				cellTemplate: this.indexTemplate,
				canAutoResize: false
			},
			{
				prop: 'userName',
				name: gT('users.management.UserName'),
				minWidth: 180,
				flexGrow: 200,
				cellTemplate: this.userNameTemplate
			},
			{
				prop: 'fullName',
				name: gT('users.management.FullName'),
				minWidth: 180,
				flexGrow: 220
			},
			{
				prop: 'email',
				name: gT('users.management.Email'),
				minWidth: 220,
				flexGrow: 240
			},
			{
				prop: 'roles',
				name: gT('users.management.Roles'),
				minWidth: 220,
				flexGrow: 240,
				cellTemplate: this.rolesTemplate
			}
		];

		this.groupUserColumns = [
			{
				width: 30,
				sortable: false,
				canAutoResize: false,
				draggable: false,
				resizable: false,
				headerCheckboxable: false,
				checkboxable: true
			},
			{
				prop: 'index',
				name: '#',
				width: 30,
				cellTemplate: this.indexTemplateG,
				canAutoResize: false
			},
			{
				prop: 'user.userName',
				name: gT('users.management.UserName'),
				minWidth: 180,
				flexGrow: 200,
				cellTemplate: this.userNameTemplateG
			},
			{
				prop: 'user.fullName',
				name: gT('users.management.FullName'),
				minWidth: 180,
				flexGrow: 220
			},
			{
				prop: 'user.email',
				name: gT('users.management.Email'),
				minWidth: 220,
				flexGrow: 240
			},
			{
				prop: 'user.roles',
				name: gT('users.management.Roles'),
				minWidth: 220,
				flexGrow: 260
			}
		];

		if (this.canManageUsers) {
			this.soloUserColumns.push({
				name: 'Actions',
				width: 150,
				cellTemplate: this.actionsTemplate,
				resizeable: false,
				canAutoResize: false,
				sortable: false,
				draggable: false
			});
		}

		this.loadData();
	}

	ngAfterViewInit() {
		this.userEditor.changesSavedCallback = () => {
			this.addNewUserToList();
			this.editorModal.hide();
		};

		this.userEditor.changesCancelledCallback = () => {
			this.editedUser = null;
			this.sourceUser = null;
			this.editorModal.hide();
		};
	}

	addNewUserToList() {
		if (this.sourceUser) {
			Object.assign(this.sourceUser, this.editedUser);

			let sourceIndex = this.soloUserRowsCache.indexOf(this.sourceUser, 0);
			if (sourceIndex > -1) {
				Utilities.moveArrayItem(this.soloUserRowsCache, sourceIndex, 0);
			}

			sourceIndex = this.soloUserRows.indexOf(this.sourceUser, 0);
			if (sourceIndex > -1) {
				Utilities.moveArrayItem(this.soloUserRows, sourceIndex, 0);
			}
			this.editedUser = null;
			this.sourceUser = null;
		} else {
			let user = new User();
			Object.assign(user, this.editedUser);
			this.editedUser = null;

			let maxIndex = 0;
			for (let u of this.soloUserRowsCache) {
				if ((<any>u).index > maxIndex) {
					maxIndex = (<any>u).index;
				}
			}

			(<any>user).index = maxIndex + 1;

			this.soloUserRowsCache.splice(0, 0, user);
			this.soloUserRows.splice(0, 0, user);
			this.soloUserRows = [...this.soloUserRows];
		}
	}

	/**
	 * Load initial user info (solo users and group list)
	 */
	loadData() {
		this.alertService.startLoadingMessage();
		this.loadingIndicator = true;

		if (this.accountService.userHasPermission(Permission.manageUsersPermission)) {
			if (this.canViewRoles) {
				this.accountService.getSoloUsersAndRoles().subscribe(
					results => {
						this.userGroupService
							.listUserGroupsWhereAdmin()
							.subscribe(
								userGroups => this.onDataLoadSuccessful(results[0], results[1], userGroups),
								error => this.onDataLoadFailed(error)
							);
					},
					error => this.onDataLoadFailed(error)
				);
			} else {
				this.accountService.getSoloUsers().subscribe(
					users => {

						this.userGroupService
							.listUserGroupsWhereAdmin()
							.subscribe(
								userGroups =>
									this.onDataLoadSuccessful(
										users,
										this.accountService.currentUser.roles.map(x => new Role(x)),
										userGroups
									),
								error => this.onDataLoadFailed(error)
							);
					},
					error => this.onDataLoadFailed(error)
				);
			}
		} else {
			this.userGroupService.listUserGroupsWhereAdmin().subscribe(
				userGroups => {
					this.onDataLoadSuccessful([], [], userGroups);
					this.switchGroup(userGroups[0].name);
					setTimeout(() => this.navigateToFirst());
				},
				error => this.onDataLoadFailed(error)
			);
		}
	}

	onDataLoadSuccessful(users: User[], roles: Role[], groups: UserGroup[]) {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		users.forEach((user, index) => {
			(<any>user).index = index + 1;
		});
		console.log(users);
		this.soloUserRowsCache = [...users];
		this.soloUserRows = users;

		this.allRoles = roles;
		this.allGroups = groups;
		this.loadGroupNamesSectionOptions();

		if (this.canManageGroupUsers) {
			this.groupUserColumns.push({
				name: '',
				width: 150,
				cellTemplate: this.actionsTemplateG,
				resizeable: false,
				canAutoResize: false,
				sortable: false,
				draggable: false
			});
		}
	}

	private loadGroupNamesSectionOptions(skipGroup?: string): void {
		this.groupNameOptions = [];
		this.allGroups.forEach(g => {
			if (g.name !== skipGroup) {
				this.groupNameOptions.push({
					text: g.name,
					id: g.id.toString()
				});
			}
		});
		if (this.groupNameOptions.length > 0) {
			this.selectedGroup = this.groupNameOptions[0].id;
		}
	}

	onDataLoadFailed(error: any) {
		this.alertService.stopLoadingMessage();
		this.loadingIndicator = false;

		this.alertService.showStickyMessage(
			'Load Error',
			`Unable to retrieve users from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
			MessageSeverity.error,
			error
		);
	}

	onSearchChanged(value: string) {
		if (this.groupBeingViewed) {
			this.groupUserRows = this.groupUserRowsCache.filter(r =>
				Utilities.searchArray(value, false, r.userName, r.user.fullName, r.user.email, r.user.jobTitle, r.user.roles)
			);
		} else {
			this.soloUserRows = this.soloUserRowsCache.filter(r =>
				Utilities.searchArray(value, false, r.userName, r.fullName, r.email, r.jobTitle, r.roles)
			);
		}
	}

	onEditorModalHidden() {
		this.editingUserName = null;
		this.userEditor.resetForm(true);
	}

	newUser() {
		this.editingUserName = null;
		this.sourceUser = null;
		this.editedUser = this.userEditor.newUser(this.allRoles);
		this.editorModal.show();
	}

	createGroup(value: string) {
		let newGroup = new UserGroup(0, value, null);
		this.userGroupService.createUserGroup(newGroup).subscribe(
			result => {
				this.userGroupService.listUserGroupsWhereAdmin().subscribe(
					userGroups => {
						this.allGroups = userGroups;
						this.loadGroupNamesSectionOptions();
						if (this.groupBeingViewed) {
							// ideally stay on same group and activate tab..
							// but for now, just switch to the solo tab
							this.switchGroup('unGrouped');
							this.navigateToFirst();
						}
					},
					error => {}
				);
			},
			error => {}
		);
		this.newGroupName = null;
	}

	editUser(row: UserEdit) {
		this.editingUserName = { name: row.userName };
		this.sourceUser = row;
		this.editedUser = this.userEditor.editUser(row, this.allRoles);
		this.editorModal.show();
	}

	editGroupUser(row: GroupMember) {
		this.editingUserName = { name: row.userName };
		this.sourceUser = row.user as UserEdit;
		this.editedUser = this.userEditor.editUser(row.user, this.allRoles);
		this.userEditor.groupMemberInfo = row;
		this.userEditor.groupMemberInfo.user = this.sourceUser;
		this.editorModal.show();
	}

	deleteGroup() {
		this.alertService.showDialog('Are you sure you want to delete "' + this.groupActive + '"?', DialogType.confirm, () => {
			let groupDelete = this.allGroups.filter(g => g.name === this.groupActive)[0];
			this.userGroupService.deleteUserGroup(groupDelete.id).subscribe(
				result => {
					this.userGroupService.listUserGroupsWhereAdmin().subscribe(
						userGroups => {
							this.allGroups = userGroups;
							this.loadGroupNamesSectionOptions();
							this.switchGroup('unGrouped');
							this.navigateToFirst();
						},
						error => {}
					);
				},
				error => {}
			);
		});
	}

	private navigateToFirst(): void {
		let test = <any>$('#myTab li:first-child a');
		test.tab('show');
	}

	deleteUser(row: UserEdit) {
		this.alertService.showDialog('Are you sure you want to delete "' + row.userName + '"?', DialogType.confirm, () =>
			this.deleteUserHelper(row)
		);
	}

	deleteGroupUser(row: GroupMember) {
		this.alertService.showDialog('Are you sure you want to delete "' + row.user.userName + '"?', DialogType.confirm, () =>
			this.deleteGroupUserHelper(row)
		);
	}

	deleteUserHelper(row: UserEdit) {
		this.alertService.startLoadingMessage('Deleting...');
		this.loadingIndicator = true;

		this.accountService.deleteUser(row).subscribe(
			results => {
				this.alertService.stopLoadingMessage();
				this.loadingIndicator = false;

				this.soloUserRowsCache = this.soloUserRowsCache.filter(item => item !== row);
				this.soloUserRows = this.soloUserRows.filter(item => item !== row);
			},
			error => {
				this.alertService.stopLoadingMessage();
				this.loadingIndicator = false;

				this.alertService.showStickyMessage(
					'Delete Error',
					`An error occured whilst deleting the user.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error,
					error
				);
			}
		);
	}

	deleteGroupUserHelper(row: GroupMember) {
		this.alertService.startLoadingMessage('Deleting...');
		this.loadingIndicator = true;

		this.accountService.deleteUser(row.user as UserEdit).subscribe(
			results => {
				this.alertService.stopLoadingMessage();
				this.loadingIndicator = false;
				this.groupUserRowsCache = this.groupUserRowsCache.filter(item => item !== row);
				this.groupUserRows = this.groupUserRows.filter(item => item !== row);
			},
			error => {
				this.alertService.stopLoadingMessage();
				this.loadingIndicator = false;

				this.alertService.showStickyMessage(
					'Delete Error',
					`An error occured whilst deleting the user.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error,
					error
				);
			}
		);
	}

	switchGroup(name: string) {
		if (name === 'unGrouped') {
			this.groupBeingViewed = false;
			this.groupActive = '';
			this.loadGroupNamesSectionOptions();
		} else {
			this.alertService.startLoadingMessage('Loading ' + name + ' members...');
			this.loadingIndicator = true;
			const group = this.allGroups.filter(u => u.name === name)[0];
			this.userGroupService.getUserGroupMembers(group.id).subscribe(
				result => {
					let userInfo = result.map(u => u);
					userInfo.forEach((user, index) => {
						(<any>user).index = index + 1;
					});
					this.groupUserRowsCache = [...userInfo];
					this.groupUserRows = userInfo;
					this.groupBeingViewed = true;
					this.groupActive = name;
					this.loadGroupNamesSectionOptions(name);
					this.groupUserSelected = [];
					this.alertService.stopLoadingMessage();
					this.loadingIndicator = false;
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.loadingIndicator = false;
					this.alertService.showStickyMessage(
						'Load Error',
						`An error occured whilst loading the group members.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
		}
	}

	public displayCheck(row: User) {
		return !row.roles.includes('super administrator');
	}

	public updateGroupSelect(e: any): void {
		this.selectedGroup = e.value;
		this.selectedGroupName = e.data[0].text;
	}

	addUsersToGroup() {
		let groupSelect = this.selectedGroupName;
		let groupMemberList: GroupMember[] = this.soloUserSelected.map(
			r => new GroupMember(0, r.userName, r, groupSelect, new Date(), false)
		);

		groupMemberList.forEach(m => {
			this.userGroupService.addMemberToGroup(m).subscribe(
				result => {
					this.soloUserRowsCache = this.soloUserRowsCache.filter(item => item !== m.user);
					this.soloUserRows = this.soloUserRows.filter(item => item !== m.user);
				},
				error => {}
			);
		});
		this.soloUserSelected = [];
	}

	addGroupUsersToGroup() {
		let groupSelect = this.selectedGroupName;
		let groupMemberList: GroupMember[] = this.groupUserSelected.map(
			r => new GroupMember(0, r.userName, r.user, groupSelect, new Date(), false)
		);

		groupMemberList.forEach(m => {
			this.userGroupService.addMemberToGroup(m).subscribe(
				result => {},
				error => {
					this.alertService.showStickyMessage(
						'Add Error',
						`Unable to add user(s).\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
		});
		this.groupUserSelected = [];
	}

	removeUsersFromGroup() {
		this.userGroupService.removeMembersFromGroup(this.groupUserSelected).subscribe(
			result => {
				this.loadData();
				this.switchGroup(this.groupActive);
			},
			error => {}
		);

		this.groupUserSelected = [];
	}

	public get canAssignRoles(): boolean {
		return this.accountService.userHasPermission(Permission.assignRolesPermission);
	}

	public get canViewRoles(): boolean {
		return this.accountService.userHasPermission(Permission.viewRolesPermission);
	}

	public get canManageUsers(): boolean {
		return this.accountService.userHasPermission(Permission.manageUsersPermission);
	}

	public get canManageGroups(): boolean {
		return this.accountService.userHasPermission(Permission.manageGroupsPermission);
	}

	public get canManageGroupUsers(): boolean {
		return this.allGroups.length > 0;
	}
}
