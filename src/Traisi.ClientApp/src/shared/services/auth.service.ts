import { map, share } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LocalStoreManager } from './local-store-manager.service';
import { EndpointFactory } from './endpoint-factory.service';
import { ConfigurationService } from './configuration.service';
import { DBkeys } from './db-keys';
import { JwtHelper } from './jwt-helper';
import { Utilities } from './utilities';
import { LoginResponse, IdToken } from '../models/login-response.model';
import { User } from '../models/user.model';
import { Permission, PermissionNames, PermissionValues } from '../models/permission.model';
import { SurveyUser } from '../models/survey-user.model';

@Injectable()
export class AuthService {
	public get loginUrl(): string {
		return this.configurations.loginUrl;
	}
	public get homeUrl(): string {
		return this.configurations.homeUrl;
	}

	public loginRedirectUrl: string;
	public logoutRedirectUrl: string;

	public reLoginDelegate: () => void;

	private previousIsLoggedInCheck: boolean = false;
	private _loginStatus: Subject<boolean> = new Subject<boolean>();

	/**
	 *Creates an instance of AuthService.
	 * @param {Router} router
	 * @param {ConfigurationService} configurations
	 * @param {EndpointFactory} endpointFactory
	 * @param {LocalStoreManager} localStorage
	 * @memberof AuthService
	 */
	constructor(
		private router: Router,
		private configurations: ConfigurationService,
		private endpointFactory: EndpointFactory,
		private localStorage: LocalStoreManager
	) {
		this.initializeLoginStatus();
	}

	public get isSuperAdministrator(): boolean {
		if (this.currentUser === undefined) {
			return false;
		}
		return this.currentUser.roles.findIndex(ele => ele === 'super administrator', 0) >= 0;
	}

	/**
	 *
	 *
	 * @private
	 * @memberof AuthService
	 */
	private initializeLoginStatus(): void {
		this.localStorage.getInitEvent().subscribe(() => {
			this.reevaluateLoginStatus();
		});
	}

	/**
	 *
	 *
	 * @param {string} page
	 * @param {boolean} [preserveParams=true]
	 * @memberof AuthService
	 */
	public gotoPage(page: string, preserveParams: boolean = true): void {
		const navigationExtras: NavigationExtras = {
			queryParamsHandling: preserveParams ? 'merge' : '',
			preserveFragment: preserveParams
		};

		this.router.navigate([page], navigationExtras);
	}

	/**
	 *
	 *
	 * @memberof AuthService
	 */
	public redirectLoginUser(): void {
		const redirect =
			this.loginRedirectUrl && this.loginRedirectUrl !== '/' && this.loginRedirectUrl !== ConfigurationService.defaultHomeUrl
				? this.loginRedirectUrl
				: this.homeUrl;
		this.loginRedirectUrl = null;

		const urlParamsAndFragment = Utilities.splitInTwo(redirect, '#');
		const urlAndParams = Utilities.splitInTwo(urlParamsAndFragment.firstPart, '?');

		const navigationExtras: NavigationExtras = {
			fragment: urlParamsAndFragment.secondPart,
			queryParams: Utilities.getQueryParamsFromString(urlAndParams.secondPart),
			queryParamsHandling: 'merge'
		};

		this.router.navigate([urlAndParams.firstPart], navigationExtras);
	}

	/**
	 *
	 *
	 * @memberof AuthService
	 */
	public redirectLogoutUser(): void {
		const redirect = this.logoutRedirectUrl ? this.logoutRedirectUrl : this.loginUrl;
		this.logoutRedirectUrl = null;

		this.router.navigate([redirect]);
	}

	/**
	 *
	 *
	 * @memberof AuthService
	 */
	public redirectForLogin(): void {
		this.loginRedirectUrl = this.router.url;
		this.router.navigate([this.loginUrl]);
	}

	public reLogin(): void {
		this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);

		if (this.reLoginDelegate) {
			this.reLoginDelegate();
		} else {
			this.redirectForLogin();
		}
	}

	public refreshLogin(): Observable<User> {
		return this.endpointFactory
			.getRefreshLoginEndpoint<LoginResponse>()
			.pipe(map(response => this.processLoginResponse(response, this.rememberMe)));
	}

	/**
	 *
	 *
	 * @param {string} userName
	 * @param {string} password
	 * @param {boolean} [rememberMe]
	 * @returns
	 * @memberof AuthService
	 */
	public login(userName: string, password: string, rememberMe?: boolean): Observable<User> {
		if (this.isLoggedIn) {
			this.logout();
		}

		return this.endpointFactory
			.getLoginEndpoint<LoginResponse>(userName, password)
			.pipe(map(response => this.processLoginResponse(response, rememberMe)));
	}

	/**
	 *
	 *
	 * @param {number} surveyId
	 * @param {string} shortcode
	 * @param {string} [groupcode]
	 * @param {boolean} [rememberMe]
	 * @returns {Observable<User>}
	 * @memberof AuthService
	 */
	public surveyLogin(surveyId: number, shortcode: string, groupcode?: string, rememberMe?: boolean): Observable<User> {
		if (this.isLoggedIn) {
			this.logout();
		}

		console.log('here');
		return this.endpointFactory
			.getSurveyLoginEndpoint<LoginResponse>(surveyId, shortcode)
			.pipe(map(response => this.processSurveyUserLoginResponse(response, rememberMe, surveyId, shortcode, groupcode)))
			.pipe(share());
	}

	/**
	 *
	 *
	 * @private
	 * @param {LoginResponse} response
	 * @param {boolean} rememberMe
	 * @returns {User}
	 * @memberof AuthService
	 */
	private processSurveyUserLoginResponse(
		response: LoginResponse,
		rememberMe: boolean,
		surveyId: number,
		shortcode: string,
		groupcode?: string
	): User {
		const accessToken = response.access_token;

		if (accessToken == null) {
			throw new Error('Received accessToken was empty');
		}

		const idToken = response.id_token;
		const refreshToken = response.refresh_token || this.refreshToken;
		const expiresIn = response.expires_in;

		const tokenExpiryDate = new Date();
		tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expiresIn);

		const accessTokenExpiry = tokenExpiryDate;

		const jwtHelper = new JwtHelper();
		const decodedIdToken = <IdToken>jwtHelper.decodeToken(response.id_token);

		const permissions: PermissionValues[] = Array.isArray(decodedIdToken.permission)
			? decodedIdToken.permission
			: [decodedIdToken.permission];

		if (!this.isLoggedIn) {
			this.configurations.import(decodedIdToken.configuration);
		}

		const user = new User(
			decodedIdToken.sub,
			decodedIdToken.name,
			decodedIdToken.fullname,
			decodedIdToken.email,
			decodedIdToken.jobtitle,
			decodedIdToken.phone,
			Array.isArray(decodedIdToken.role) ? decodedIdToken.role : [decodedIdToken.role]
		);
		user.isEnabled = true;

		if (user.roles.includes('respondent')) {
			(<SurveyUser>user).shortcode = shortcode;
			(<SurveyUser>user).surveyId = surveyId;
			(<SurveyUser>user).groupcode = groupcode;
		}

		this.saveUserDetails(user, permissions, accessToken, idToken, refreshToken, accessTokenExpiry, rememberMe);

		this.reevaluateLoginStatus(user);
		console.log(user);

		return user;
	}

	/**
	 *
	 *
	 * @private
	 * @param {LoginResponse} response
	 * @param {boolean} rememberMe
	 * @returns
	 * @memberof AuthService
	 */
	private processLoginResponse(response: LoginResponse, rememberMe: boolean): User {

		const accessToken = response.access_token;

		if (accessToken == null) {
			throw new Error('Received accessToken was empty');
		}

		const idToken = response.id_token;
		const refreshToken = response.refresh_token || this.refreshToken;
		const expiresIn = response.expires_in;

		const tokenExpiryDate = new Date();
		tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expiresIn);

		const accessTokenExpiry = tokenExpiryDate;

		const jwtHelper = new JwtHelper();
		const decodedIdToken = <IdToken>jwtHelper.decodeToken(response.id_token);

		const permissions: PermissionValues[] = Array.isArray(decodedIdToken.permission)
			? decodedIdToken.permission
			: [decodedIdToken.permission];

		if (!this.isLoggedIn) {
			this.configurations.import(decodedIdToken.configuration);
		}

		const user = new User(
			decodedIdToken.sub,
			decodedIdToken.name,
			decodedIdToken.fullname,
			decodedIdToken.email,
			decodedIdToken.jobtitle,
			decodedIdToken.phone,
			Array.isArray(decodedIdToken.role) ? decodedIdToken.role : [decodedIdToken.role]
		);
		user.isEnabled = true;

		this.saveUserDetails(user, permissions, accessToken, idToken, refreshToken, accessTokenExpiry, rememberMe);

		this.reevaluateLoginStatus(user);

		return user;
	}

	private saveUserDetails(
		user: User,
		permissions: PermissionValues[],
		accessToken: string,
		idToken: string,
		refreshToken: string,
		expiresIn: Date,
		rememberMe: boolean
	): void {
		if (rememberMe) {
			this.localStorage.savePermanentData(accessToken, DBkeys.ACCESS_TOKEN);
			this.localStorage.savePermanentData(idToken, DBkeys.ID_TOKEN);
			this.localStorage.savePermanentData(refreshToken, DBkeys.REFRESH_TOKEN);
			this.localStorage.savePermanentData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
			this.localStorage.savePermanentData(permissions, DBkeys.USER_PERMISSIONS);
			this.localStorage.savePermanentData(user, DBkeys.CURRENT_USER);
		} else {
			this.localStorage.saveSyncedSessionData(accessToken, DBkeys.ACCESS_TOKEN);
			this.localStorage.saveSyncedSessionData(idToken, DBkeys.ID_TOKEN);
			this.localStorage.saveSyncedSessionData(refreshToken, DBkeys.REFRESH_TOKEN);
			this.localStorage.saveSyncedSessionData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
			this.localStorage.saveSyncedSessionData(permissions, DBkeys.USER_PERMISSIONS);
			this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
		}

		this.localStorage.savePermanentData(rememberMe, DBkeys.REMEMBER_ME);
	}

	public logout(): void {
		this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
		this.localStorage.deleteData(DBkeys.ID_TOKEN);
		this.localStorage.deleteData(DBkeys.REFRESH_TOKEN);
		this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
		this.localStorage.deleteData(DBkeys.USER_PERMISSIONS);
		this.localStorage.deleteData(DBkeys.CURRENT_USER);

		this.configurations.clearLocalChanges();

		this.reevaluateLoginStatus();
	}

	private reevaluateLoginStatus(currentUser?: User): User {
		const user = currentUser || this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
		const isLoggedIn = user != null;

		if (this.previousIsLoggedInCheck !== isLoggedIn) {
			setTimeout(() => {
				this._loginStatus.next(isLoggedIn);
			});
		}

		this.previousIsLoggedInCheck = isLoggedIn;
		return user;
	}

	public getLoginStatusEvent(): Observable<boolean> {
		return this._loginStatus.asObservable();
	}

	/**
	 * Gets the active user as a Survey User type
	 */
	get currentSurveyUser(): SurveyUser {
		const user = this.reevaluateLoginStatus();
		return <SurveyUser>user;
	}

	get currentUser(): User {
		const user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
		this.reevaluateLoginStatus(user);

		return user;
	}

	get userPermissions(): PermissionValues[] {
		return this.localStorage.getDataObject<PermissionValues[]>(DBkeys.USER_PERMISSIONS) || [];
	}

	get accessToken(): string {
		this.reevaluateLoginStatus();
		let accessToken = this.localStorage.getData(DBkeys.ACCESS_TOKEN);
		return accessToken;
	}

	get accessTokenExpiryDate(): Date {
		this.reevaluateLoginStatus();
		return this.localStorage.getDataObject<Date>(DBkeys.TOKEN_EXPIRES_IN, true);
	}

	get isSessionExpired(): boolean {
		if (this.accessTokenExpiryDate == null) {
			return true;
		}

		return !(this.accessTokenExpiryDate.valueOf() > new Date().valueOf());
	}

	get idToken(): string {
		this.reevaluateLoginStatus();
		return this.localStorage.getData(DBkeys.ID_TOKEN);
	}

	get refreshToken(): string {
		this.reevaluateLoginStatus();
		return this.localStorage.getData(DBkeys.REFRESH_TOKEN);
	}

	get isLoggedIn(): boolean {
		return this.currentUser != null;
	}

	get rememberMe(): boolean {
		return this.localStorage.getDataObject<boolean>(DBkeys.REMEMBER_ME) === true;
	}
}
