import { forkJoin as observableForkJoin, Observable, Subject, BehaviorSubject } from 'rxjs';

import { tap, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AccountEndpoint } from './account-endpoint.service';
import { AuthService } from '../../../shared/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { Role } from '../models/role.model';
import { Permission, PermissionNames, PermissionValues } from '../../../shared/models/permission.model';
import { UserEdit } from '../models/user-edit.model';
import { UserAccountInfo } from 'app/models/user-account-info.model';

export type RolesChangedOperation = 'add' | 'delete' | 'modify';
export interface RolesChangedEventArg {
	roles: Role[] | string[];
	operation: RolesChangedOperation;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
	public static readonly roleAddedOperation: RolesChangedOperation = 'add';
	public static readonly roleDeletedOperation: RolesChangedOperation = 'delete';
	public static readonly roleModifiedOperation: RolesChangedOperation = 'modify';

	private _currentUserAccount: BehaviorSubject<UserAccountInfo>;

	private _rolesChanged = new Subject<RolesChangedEventArg>();

	/**
	 *
	 */
	public get currentUserAccount(): any {
		if (this._currentUserAccount.value.user === null) {
			this.accountEndpoint.getUserAccountByIdEndpoint(this.authService.currentUser.id).subscribe(
				account => {
					console.log(account);
					let info = { user: account['item1'], roles: account['item2'] };
					this._currentUserAccount.next(info);
				},
				error => {
					console.log(error);
				}
			);
		}

		return this._currentUserAccount.value;
	}

	/**
	 *
	 * @param router
	 * @param http
	 * @param authService
	 * @param accountEndpoint
	 */
	constructor(
		private router: Router,
		private http: HttpClient,
		private authService: AuthService,
		private accountEndpoint: AccountEndpoint
	) {
		this._currentUserAccount = new BehaviorSubject<any>({ user: null, roles: [] });
	}

	public getUser(userId?: string) {
		return this.accountEndpoint.getUserEndpoint<User>(userId);
	}

	public getUserAndRoles(userId?: string) {
		return observableForkJoin(this.accountEndpoint.getUserEndpoint<User>(userId), this.accountEndpoint.getRolesEndpoint<Role[]>());
	}

	public getUsers(page?: number, pageSize?: number) {
		return this.accountEndpoint.getUsersEndpoint<User[]>(page, pageSize);
	}

	public getSoloUsers(page?: number, pageSize?: number) {
		return this.accountEndpoint.getSoloUsersEndpoint<User[]>(page, pageSize);
	}

	public getUsersAndRoles(page?: number, pageSize?: number) {
		return observableForkJoin(
			this.accountEndpoint.getUsersEndpoint<User[]>(page, pageSize),
			this.accountEndpoint.getRolesEndpoint<Role[]>()
		);
	}

	public getSoloUsersAndRoles(page?: number, pageSize?: number) {
		return observableForkJoin(
			this.accountEndpoint.getSoloUsersEndpoint<User[]>(page, pageSize),
			this.accountEndpoint.getRolesEndpoint<Role[]>()
		);
	}

	public updateUser(user: UserEdit) {
		if (user.id) {
			return this.accountEndpoint.getUpdateUserEndpoint(user, user.id);
		} else {
			return this.accountEndpoint.getUserByUserNameEndpoint<User>(user.userName).pipe(
				mergeMap(foundUser => {
					user.id = foundUser.id;
					return this.accountEndpoint.getUpdateUserEndpoint(user, user.id);
				})
			);
		}
		// force refresh
		// this.currentUser = undefined;
	}

	public newUser(user: UserEdit) {
		return this.accountEndpoint.getNewUserEndpoint<User>(user);
	}

	public getUserPreferences() {
		return this.accountEndpoint.getUserPreferencesEndpoint<string>();
	}

	public updateUserPreferences(configuration: string) {
		return this.accountEndpoint.getUpdateUserPreferencesEndpoint(configuration);
	}

	public deleteUser(userOrUserId: string | UserEdit): Observable<User> {
		if (typeof userOrUserId === 'string' || userOrUserId instanceof String) {
			return this.accountEndpoint
				.getDeleteUserEndpoint<User>(<string>userOrUserId)
				.pipe(tap(data => this.onRolesUserCountChanged(data.roles)));
		} else {
			if (userOrUserId.id) {
				return this.deleteUser(userOrUserId.id);
			} else {
				return this.accountEndpoint
					.getUserByUserNameEndpoint<User>(userOrUserId.userName)
					.pipe(mergeMap(user => this.deleteUser(user.id)));
			}
		}
	}

	public unblockUser(userId: string) {
		return this.accountEndpoint.getUnblockUserEndpoint(userId);
	}

	public userHasPermission(permissionValue: PermissionValues): boolean {
		return this.permissions.some(p => p === permissionValue);
	}

	public refreshLoggedInUser() {
		return this.authService.refreshLogin();
	}

	public getRoles(page?: number, pageSize?: number) {
		return this.accountEndpoint.getRolesEndpoint<Role[]>(page, pageSize);
	}

	public getRolesAndPermissions(page?: number, pageSize?: number) {
		return observableForkJoin(
			this.accountEndpoint.getRolesEndpoint<Role[]>(page, pageSize),
			this.accountEndpoint.getPermissionsEndpoint<Permission[]>()
		);
	}

	public updateRole(role: Role) {
		if (role.id) {
			return this.accountEndpoint
				.getUpdateRoleEndpoint(role, role.id)
				.pipe(tap(data => this.onRolesChanged([role], AccountService.roleModifiedOperation)));
		} else {
			return this.accountEndpoint.getRoleByRoleNameEndpoint<Role>(role.name).pipe(
				mergeMap(foundRole => {
					role.id = foundRole.id;
					return this.accountEndpoint.getUpdateRoleEndpoint(role, role.id);
				}),
				tap(data => this.onRolesChanged([role], AccountService.roleModifiedOperation))
			);
		}
	}

	public newRole(role: Role) {
		return this.accountEndpoint
			.getNewRoleEndpoint<Role>(role)
			.pipe(tap(data => this.onRolesChanged([role], AccountService.roleAddedOperation)));
	}

	public deleteRole(roleOrRoleId: string | Role): Observable<Role> {
		if (typeof roleOrRoleId === 'string' || roleOrRoleId instanceof String) {
			return this.accountEndpoint
				.getDeleteRoleEndpoint<Role>(<string>roleOrRoleId)
				.pipe(tap(data => this.onRolesChanged([data], AccountService.roleDeletedOperation)));
		} else {
			if (roleOrRoleId.id) {
				return this.deleteRole(roleOrRoleId.id);
			} else {
				return this.accountEndpoint
					.getRoleByRoleNameEndpoint<Role>(roleOrRoleId.name)
					.pipe(mergeMap(role => this.deleteRole(role.id)));
			}
		}
	}

	public getUserAccount(userId: string) {
		return this.accountEndpoint.getUserAccountByIdEndpoint(userId);
	}

	public getPermissions() {
		return this.accountEndpoint.getPermissionsEndpoint<Permission[]>();
	}

	private onRolesChanged(roles: Role[] | string[], op: RolesChangedOperation) {
		this._rolesChanged.next({ roles: roles, operation: op });
	}

	public onRolesUserCountChanged(roles: Role[] | string[]) {
		return this.onRolesChanged(roles, AccountService.roleModifiedOperation);
	}

	public getRolesChangedEvent(): Observable<RolesChangedEventArg> {
		return this._rolesChanged.asObservable();
	}

	get permissions(): PermissionValues[] {
		return this.authService.userPermissions;
	}

	get currentUser() {
		return this.authService.currentUser;
	}
}
