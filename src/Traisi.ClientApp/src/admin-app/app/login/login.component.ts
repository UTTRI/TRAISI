import { Component, HostBinding, OnInit, OnDestroy, Input } from '@angular/core';

import { AlertService, MessageSeverity, DialogType } from '../../../shared/services/alert.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { Utilities } from '../../../shared/services/utilities';
import { UserLogin } from '../models/user-login.model';
import { Permission } from '../../../shared/models/permission.model';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
	selector: 'app-login',
	styleUrls: ['./login.style.scss'],
	templateUrl: './login.template.html'
})
export class LoginComponent implements OnInit, OnDestroy {
	@HostBinding('class')
	classes = 'login-page app';

	userLogin = new UserLogin();
	isLoading = false;
	formResetToggle = true;
	modalClosedCallback: () => void;
	loginStatusSubscription: any;
	loginError = false;

	@Input()
	isModal = false;

	constructor(
		private alertService: AlertService,
		private authService: AuthService,
		private configurations: ConfigurationService,
		private router: Router,
	) {}

	ngOnInit() {
		this.userLogin.rememberMe = this.authService.rememberMe;

		if (this.getShouldRedirect()) {
			this.authService.redirectLoginUser();
		} else {
			this.loginStatusSubscription = this.authService.getLoginStatusEvent().subscribe((isLoggedIn) => {
				if (this.getShouldRedirect()) {
					this.authService.redirectLoginUser();
				}
			});
		}
	}

	ngOnDestroy() {
		if (this.loginStatusSubscription) {
			this.loginStatusSubscription.unsubscribe();
		}
	}

	getShouldRedirect() {
		return !this.isModal && this.authService.isLoggedIn && !this.authService.isSessionExpired;
	}

	showErrorAlert(caption: string, message: string) {
		this.alertService.showMessage(caption, message, MessageSeverity.error);
	}

	closeModal() {
		if (this.modalClosedCallback) {
			this.modalClosedCallback();
		}
	}

	login() {
		this.isLoading = true;
		this.alertService.startLoadingMessage('', 'Attempting login...');

		this.authService.login(this.userLogin.email, this.userLogin.password, this.userLogin.rememberMe).subscribe(
			(user) => {
				setTimeout(() => {
					console.log(user);
					this.alertService.stopLoadingMessage();
					this.isLoading = false;
					this.reset();

					if (!this.isModal) {
						this.alertService.showMessage('Login', `Welcome ${user.userName}!`, MessageSeverity.success);
						if (!this.authService.userPermissions.some((p) => p === Permission.accessAdminPermission)) {
							this.alertService.showStickyMessage(
								'Insufficient Privileges',
								'You do not have access!',
								MessageSeverity.warn
							);
						} else {
							this.router.navigate(['app', 'dashboard']);
						}
					} else {
						this.alertService.showMessage(
							'Login',
							`Session for ${user.userName} restored!`,
							MessageSeverity.success
						);
						setTimeout(() => {
							this.alertService.showStickyMessage(
								'Session Restored',
								'Please try your last operation again',
								MessageSeverity.default
							);
						}, 500);

						this.closeModal();
					}
				}, 500);
			},
			(error) => {
				this.alertService.stopLoadingMessage();

				if (error.error.error === 'invalid_grant') {
					this.alertService.showStickyMessage(
						'Unable to login',
						error.error.error_description,
						MessageSeverity.error,
						error
					);
				} else if (Utilities.checkNoNetwork(error)) {
					this.alertService.showStickyMessage(
						Utilities.noNetworkMessageCaption,
						Utilities.noNetworkMessageDetail,
						MessageSeverity.error,
						error
					);
					this.offerAlternateHost();
				} else {
					const errorMessage = Utilities.findHttpResponseMessage('error_description', error);

					if (errorMessage) {
						this.alertService.showStickyMessage(
							'Unable to login',
							errorMessage,
							MessageSeverity.error,
							error
						);
						this.loginError = true;
					} else {
						this.alertService.showStickyMessage(
							'Unable to login',
							'An error occured whilst logging in, please try again later.\nError: ' + error.statusText ||
								error.status,
							MessageSeverity.error,
							error
						);
					}
				}

				setTimeout(() => {
					this.isLoading = false;
				}, 500);
			}
		);
	}

	offerAlternateHost() {
		if (Utilities.checkIsLocalHost(location.origin) && Utilities.checkIsLocalHost(this.configurations.baseUrl)) {
			this.alertService.showDialog(
				'Dear Developer!\nIt appears your backend Web API service is not running...\n' +
					'Would you want to temporarily switch to the online Demo API below?(Or specify another)',
				DialogType.prompt,
				(value: string) => {
					this.configurations.baseUrl = value;
					this.alertService.showStickyMessage(
						'API Changed!',
						'The target Web API has been changed to: ' + value,
						MessageSeverity.warn
					);
				},
				null,
				null,
				null,
				this.configurations.fallbackBaseUrl
			);
		}
	}

	reset() {
		this.formResetToggle = false;

		setTimeout(() => {
			this.formResetToggle = true;
		});
	}
}
