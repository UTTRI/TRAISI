import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { Observable } from 'rxjs';
import { EndpointFactory } from '../../../shared/services/endpoint-factory.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { UserGroup } from '../models/user-group.model';
import { GroupMember } from '../models/group-member.model';
import { UserGroupAPIKeys } from '../models/user-group-apikeys.model';
import { EmailTemplate } from '../models/email-template.model';

@Injectable({ providedIn: 'root'})
export class UserGroupEndpointService extends EndpointFactory {
	private readonly _userGroupsUrl: string = '/api/UserGroup';
	private readonly _userGroupsAdminUrl: string = '/api/UserGroup/admin';
	private readonly _userGroupsCanAdminUrl: string = '/api/UserGroup/canAdmin';
	private readonly _userGroupMembersUrl: string = '/api/UserGroup/members';
	private readonly _userGroupTemplatesUrl: string = '/api/UserGroup/emailtemplates';

	get userGroupsUrl() {
		return this.configurations.baseUrl + this._userGroupsUrl;
	}
	get userGroupsAdminUrl() {
		return this.configurations.baseUrl + this._userGroupsAdminUrl;
	}
	get userGroupsCanAdminUrl() {
		return this.configurations.baseUrl + this._userGroupsCanAdminUrl;
	}
	get userGroupMembersUrl() {
		return this.configurations.baseUrl + this._userGroupMembersUrl;
	}
	get userGroupTemplatesUrl() {
		return this.configurations.baseUrl + this._userGroupTemplatesUrl;
	}

	/**
	 * @param  {HttpClient} http
	 * @param  {ConfigurationService} configurations
	 * @param  {Injector} injector
	 */
	constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
		super(http, configurations, injector);

	}

	public getListUserGroupsEndpoint<T>(): Observable<T> {
		const endpointUrl = this.userGroupsUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListUserGroupsEndpoint());
			})
		);
	}

	public getListUserGroupsWhereAdminEndpoint<T>(): Observable<T> {
		const endpointUrl = this.userGroupsAdminUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getListUserGroupsEndpoint());
			})
		);
	}

	public getWhetherGroupAdminEndpoint<T>(): Observable<T> {
		const endpointUrl = this.userGroupsCanAdminUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getWhetherGroupAdminEndpoint());
			})
		);
	}

	/**
	 * @param  {UserGroup} userGroup
	 * @returns Observable
	 */
	public getCreateUserGroupEndpoint<T>(userGroup: UserGroup): Observable<T> {
		const endpointUrl = this.userGroupsUrl;

		return this.http.post<T>(endpointUrl, JSON.stringify(userGroup), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCreateUserGroupEndpoint(userGroup));
			})
		);
	}

	/**
	 * @param  {UserGroup} userGroup
	 * @returns Observable
	 */
	public getEditUserGroupEndpoint<T>(userGroup: UserGroup): Observable<T> {
		const endpointUrl = this.userGroupsUrl;

		return this.http.put<T>(endpointUrl, JSON.stringify(userGroup), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getEditUserGroupEndpoint(userGroup));
			})
		);
	}

	/**
	 * @param  {number} id
	 * @returns Observable
	 */
	public getDeleteUserGroupEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.userGroupsUrl}/${id}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDeleteUserGroupEndpoint(id));
			})
		);
	}

	/**
	 * Generates the endpoint and URL for retrieving a survey object by id
	 * @param  {number} id
	 * @returns Observable
	 */
	public getUserGroupEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.userGroupsUrl}/${id}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getUserGroupEndpoint(id));
			})
		);
	}

	public getUserGroupEmailTemplatesEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.userGroupsUrl}/${id}/emailtemplates`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getUserGroupEmailTemplatesEndpoint(id));
			})
		);
	}

		/**
	 * Generates the endpoint and URL for updating group membership info
	 * @param {GroupMember} memberInfo
	 * @return Observable
	 */
	public getUpdateUserGroupEmailTemplateEndpoint<T>(templateInfo: EmailTemplate): Observable<T> {
		const endpointUrl = this.userGroupTemplatesUrl;

		return this.http.put<T>(endpointUrl, JSON.stringify(templateInfo), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getUpdateUserGroupEmailTemplateEndpoint(templateInfo));
			})
		);
	}

	public getAddUserGroupEmailTemplateEndpoint<T>(templateInfo: EmailTemplate): Observable<T> {
		const endpointUrl = this.userGroupTemplatesUrl;

		return this.http.post<T>(endpointUrl, JSON.stringify(templateInfo), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getAddUserGroupEmailTemplateEndpoint(templateInfo));
			})
		);
	}

	public getDeleteUserGroupEmailTemplateEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.userGroupTemplatesUrl}/${id}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getDeleteUserGroupEmailTemplateEndpoint(id));
			})
		);
	}


	public getUserGroupMembersEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.userGroupsUrl}/${id}/members`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getUserGroupMembersEndpoint(id));
			})
		);
	}

	/**
	 * Generates the endpoint and URL for adding a member to a group
	 * @param {GroupMember} memberInfo
	 * @return Observable
	 */
	public getAddMemberToUserGroupEndpoint<T>(memberInfo: GroupMember): Observable<T> {
		const endpointUrl = this.userGroupMembersUrl;

		return this.http.post<T>(endpointUrl, JSON.stringify(memberInfo), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getAddMemberToUserGroupEndpoint(memberInfo));
			})
		);
	}

	/**
	 * Generates the endpoint and URL for updating group membership info
	 * @param {GroupMember} memberInfo
	 * @return Observable
	 */
	public getUpdateGroupMemberEndpoint<T>(memberInfo: GroupMember): Observable<T> {
		const endpointUrl = this.userGroupMembersUrl;

		return this.http.put<T>(endpointUrl, JSON.stringify(memberInfo), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getUpdateGroupMemberEndpoint(memberInfo));
			})
		);
	}

	public removeMemberFromGroupEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.userGroupMembersUrl}/${id}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.removeMemberFromGroupEndpoint(id));
			})
		);
	}

	public removeMembersFromGroupEndpoint<T>(ids: number[]): Observable<T> {
		let endpointUrl = `${this.userGroupMembersUrl}?`;
		ids.forEach(id => {
			endpointUrl = `${endpointUrl}ids=${id}&`;
		});
		endpointUrl = endpointUrl.slice(0, endpointUrl.length - 1);

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.removeMembersFromGroupEndpoint(ids));
			})
		);
	}

	public getUserGroupAPIKeysEndpoint<T>(id: number): Observable<T> {
		const endpointUrl = `${this.userGroupsUrl}/${id}/apikeys`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getUserGroupAPIKeysEndpoint(id));
			})
		);
	}

	public getUpdateUserGroupAPIKeysEndpoint<T>(apiKeys: UserGroupAPIKeys): Observable<T> {
		const endpointUrl = `${this.userGroupsUrl}/${apiKeys.groupId}/apikeys`;

		return this.http.put<T>(endpointUrl, JSON.stringify(apiKeys), this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getUpdateGroupMemberEndpoint(apiKeys));
			})
		);
	}

}
