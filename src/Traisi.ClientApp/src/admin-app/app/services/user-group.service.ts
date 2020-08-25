import { Injectable } from '@angular/core';
import { UserGroupEndpointService } from './user-group-endpoint.service';
import { UserGroup } from '../models/user-group.model';
import { GroupMember } from '../models/group-member.model';
import { UserGroupAPIKeys } from '../models/user-group-apikeys.model';
import { EmailTemplate } from '../models/email-template.model';

@Injectable({ providedIn: 'root' })
export class UserGroupService {
	constructor(private _userGroupEndpointService: UserGroupEndpointService) {}

	/**
	 * Lists all user groups.
	 */
	public listUserGroups() {
		return this._userGroupEndpointService.getListUserGroupsEndpoint<UserGroup[]>();
	}

	/**
	 * Lists all user groups where user is admin.
	 */
	public listUserGroupsWhereAdmin() {
		return this._userGroupEndpointService.getListUserGroupsWhereAdminEndpoint<UserGroup[]>();
	}

	public isGroupAdmin() {
		return this._userGroupEndpointService.getWhetherGroupAdminEndpoint<boolean>();
	}

	/**
	 * Creates a new user group with the passed user group details.
	 * @param  {UserGroup} userGroup
	 */
	public createUserGroup(userGroup: UserGroup) {
		return this._userGroupEndpointService.getCreateUserGroupEndpoint<UserGroup>(userGroup);
	}

	/**
	 * Edits (submits) updated user group information.
	 * @param  {UserGroup} userGroup UserGroup object with updated data.
	 */
	public editUserGroup(userGroup: UserGroup) {
		return this._userGroupEndpointService.getEditUserGroupEndpoint<UserGroup>(userGroup);
	}

	/**
	 * Deletes the indicated user group.
	 * @param  {number} id
	 */
	public deleteUserGroup(id: number) {
		return this._userGroupEndpointService.getDeleteUserGroupEndpoint<number>(id);
	}

	/**
	 * Retrieves user group with specified id.
	 * @param id
	 */
	public getUserGroup(id: number) {
		return this._userGroupEndpointService.getUserGroupEndpoint<UserGroup>(id);
	}

	public getUserGroupMembers(id: number) {
		return this._userGroupEndpointService.getUserGroupMembersEndpoint<GroupMember[]>(id);
	}

	/**
	 * Adds member to a group, specified in passed in object
	 * @param {GroupMember} memberInfo
	 */
	public addMemberToGroup(memberInfo: GroupMember) {
		return this._userGroupEndpointService.getAddMemberToUserGroupEndpoint<GroupMember>(memberInfo);
	}

	/**
	 * Updates group member info, specified in passed in object
	 * @param {GroupMember} memberInfo
	 */
	public updateGroupMember(memberInfo: GroupMember) {
		return this._userGroupEndpointService.getUpdateGroupMemberEndpoint<GroupMember>(memberInfo);
	}

	public removeMemberFromGroup(memberInfo: GroupMember) {
		return this._userGroupEndpointService.removeMemberFromGroupEndpoint<number>(memberInfo.id);
	}

	public removeMembersFromGroup(memberInfo: GroupMember[]) {
		return this._userGroupEndpointService.removeMembersFromGroupEndpoint<number>(memberInfo.map(m => m.id));
	}

	public getUserGroupApiKeys(id: number) {
		return this._userGroupEndpointService.getUserGroupAPIKeysEndpoint<UserGroupAPIKeys>(id);
	}

	public updateUserGroupApiKeys(apiKeys: UserGroupAPIKeys) {
		return this._userGroupEndpointService.getUpdateUserGroupAPIKeysEndpoint<UserGroupAPIKeys>(apiKeys);
	}

	public getUserGroupEmailTemplates(id: number) {
		return this._userGroupEndpointService.getUserGroupEmailTemplatesEndpoint<EmailTemplate[]>(id);
	}

	public addUserGroupEmailTemplate(templateInfo: EmailTemplate) {
		return this._userGroupEndpointService.getAddUserGroupEmailTemplateEndpoint<EmailTemplate>(templateInfo);
	}

	public updateUserGroupEmailTemplate(templateInfo: EmailTemplate) {
		return this._userGroupEndpointService.getUpdateUserGroupEmailTemplateEndpoint<EmailTemplate>(templateInfo);
	}
	public deleteUserGroupEmailTemplate(id: number) {
		return this._userGroupEndpointService.getDeleteUserGroupEmailTemplateEndpoint<number>(id);
	}
}
