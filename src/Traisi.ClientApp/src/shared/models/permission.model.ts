export type PermissionNames =
	| 'Access Admin'
	| 'View All Users'
	| 'Manage All Users'
	| 'Manage All Groups'
	| 'View Group Users'
	| 'Manage Group Users'
	| 'View Roles'
	| 'Manage Roles'
	| 'Assign Roles'
	| 'View All User Surveys'
	| 'Manage All Surveys'
	| 'View Group Surveys'
	| 'Manage Group Surveys'
	| 'View All Samples'
	| 'View Phone Data'
	| 'Create Group Surveys';

export type PermissionValues =
	| 'system.accessadmin'
	| 'users.view'
	| 'users.manage'
	| 'groups.manage'
	| 'users.viewgroup'
	| 'users.managegroup'
	| 'roles.view'
	| 'roles.manage'
	| 'roles.assign'
	| 'surveys.view'
	| 'surveys.manage'
	| 'surveys.viewgroup'
	| 'surveys.managegroup'
	| 'surveys.create'
	| 'phonedata.view'
	| 'samples.view';

export class Permission {
	public static readonly accessAdminPermission: PermissionValues = 'system.accessadmin';
	public static readonly viewUsersPermission: PermissionValues = 'users.view';
	public static readonly manageUsersPermission: PermissionValues = 'users.manage';
	public static readonly manageGroupsPermission: PermissionValues = 'groups.manage';
	public static readonly viewGroupUsersPermission: PermissionValues = 'users.viewgroup';
	public static readonly manageGroupUsersPermission: PermissionValues = 'users.managegroup';

	public static readonly viewRolesPermission: PermissionValues = 'roles.view';
	public static readonly manageRolesPermission: PermissionValues = 'roles.manage';
	public static readonly assignRolesPermission: PermissionValues = 'roles.assign';

	public static readonly viewSurveysPermission: PermissionValues = 'surveys.view';
	public static readonly manageSurveysPermission: PermissionValues = 'surveys.manage';
	public static readonly viewGroupSurveysPermission: PermissionValues = 'surveys.viewgroup';
	public static readonly manageGroupSurveysPermission: PermissionValues = 'surveys.managegroup';
	public static readonly createSurveysPermission: PermissionValues = 'surveys.create';

	public static readonly viewSamplesPermission: PermissionValues = 'samples.view';

	public static readonly viewPhonedataPermission: PermissionValues = 'phonedata.view';

	constructor(name?: PermissionNames, value?: PermissionValues, groupName?: string, description?: string) {
		this.name = name;
		this.value = value;
		this.groupName = groupName;
		this.description = description;
	}

	public name: PermissionNames;
	public value: PermissionValues;
	public groupName: string;
	public description: string;
}
