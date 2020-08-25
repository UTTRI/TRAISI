import { Component, OnInit, HostListener, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { AlertService, AlertDialog, DialogType, AlertMessage, MessageSeverity } from '../../shared/services/alert.service';
import { AppTranslationService } from '../../shared/services/app-translation.service';
import { LocalStoreManager } from '../../shared/services/local-store-manager.service';
import { AppTitleService } from './services/app-title.service';
import { AuthService } from '../../shared/services/auth.service';
import { ConfigurationService } from '../../shared/services/configuration.service';

declare let alertify: any;
declare const SystemJS;
declare let Theme: any;

@Component({
	selector: 'app-root',
	template: `
		<router-outlet><div toastContainer></div></router-outlet>
	`
})
export class AppComponent implements OnInit, AfterViewInit, AfterContentInit {
	public isAppLoaded: boolean;
	public isUserLoggedIn: boolean;

	public appTitle = 'TRAISI';
	public stickyToasties: number[] = [];

	@ViewChild(ToastContainerDirective, { static: true })
	public toastContainer: ToastContainerDirective;

	@HostListener('window:beforeunload', ['$event'])
	public beforeUnloadHander(): void {}

	public constructor(
		storageManager: LocalStoreManager,
		private _toastrService: ToastrService,
		private alertService: AlertService,
		private appTitleService: AppTitleService,
		private authService: AuthService,
		translationService: AppTranslationService,
		public configurations: ConfigurationService,
		public router: Router
	) {
		storageManager.initialiseStorageSyncListener();

		translationService.addLanguages(['en', 'fr', 'de', 'pt', 'ar', 'ko']);
		translationService.setDefaultLanguage('en');

		this.appTitleService.appName = this.appTitle;
	}

	/**
	 *
	 */
	public ngAfterViewInit(): void {}

	public ngAfterContentInit(): void {
		new Theme().init();
	}

	public ngOnInit(): void {
		this.isUserLoggedIn = this.authService.isLoggedIn;

		this._toastrService.overlayContainer = this.toastContainer;

		// 1 sec to ensure all the effort to get the css animation working is appreciated :|, Preboot screen is removed .5 sec later
		setTimeout(() => (this.isAppLoaded = true), 1000);

		this.alertService.getDialogEvent().subscribe(alert => this.showDialog(alert));
		this.alertService.getMessageEvent().subscribe(message => this.showToast(message, false));
		this.alertService.getStickyMessageEvent().subscribe(message => this.showToast(message, true));

		setTimeout(() => {
			if (this.isUserLoggedIn) {
				this.alertService.resetStickyMessage();

				if (!this.authService.currentUser.roles.includes('respondent')) {
					if (!this.authService.isSessionExpired) {
						this.alertService.showMessage('Login', `Welcome back ${this.userName}!`, MessageSeverity.default);
					} else {
						this.alertService.showStickyMessage(
							'Session Expired',
							'Your Session has expired. Please log in again',
							MessageSeverity.warn
						);
						this.authService.logout();
						this.authService.redirectLogoutUser();
					}
				}
			}
		}, 2000);

		this.authService.reLoginDelegate = () => this.router.navigate(['/login']);

		this.authService.getLoginStatusEvent().subscribe(isLoggedIn => {
			this.isUserLoggedIn = isLoggedIn;

			setTimeout(() => {
				if (!this.isUserLoggedIn) {
					this.alertService.showMessage('Session Ended!', '', MessageSeverity.default);
				}
			}, 500);
		});

		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				const url = (<NavigationStart>event).url;

				if (url !== url.toLowerCase()) {
					this.router.navigateByUrl((<NavigationStart>event).url.toLowerCase());
				}
			}
		});

		SystemJS.config({
			meta: {
				'./assets/monaco/vs/loader.js': {
					format: 'amd'
				}
			}
		});
	}

	/**
	 *
	 * @param dialog
	 */
	public showDialog(dialog: AlertDialog): void {
		alertify.set({
			labels: {
				ok: dialog.okLabel || 'OK',
				cancel: dialog.cancelLabel || 'Cancel'
			}
		});

		switch (dialog.type) {
			case DialogType.alert:
				alertify.alert(dialog.message);
				break;
			case DialogType.confirm:
				alertify.confirm(dialog.message, e => {
					if (e) {
						dialog.okCallback();
					} else {
						if (dialog.cancelCallback) {
							dialog.cancelCallback();
						}
					}
				});

				break;
			case DialogType.prompt:
				alertify.prompt(
					dialog.message,
					(e, val) => {
						if (e) {
							dialog.okCallback(val);
						} else {
							if (dialog.cancelCallback) {
								dialog.cancelCallback();
							}
						}
					},
					dialog.defaultValue
				);

				break;
		}
	}

	/**
	 *
	 * @param message
	 * @param isSticky
	 */
	public showToast(message: AlertMessage, isSticky: boolean): void {
		if (message == null) {
			for (const id of this.stickyToasties.slice(0)) {
				this._toastrService.clear(id);
			}

			return;
		}

		const toastOptions = {
			timeOut: isSticky ? 0 : 4000
		};

		let toast;
		switch (message.severity) {
			case MessageSeverity.default:
				toast = this._toastrService.info(message.detail, message.summary, toastOptions);
				toast.toastId;
				break;
			case MessageSeverity.info:
				toast = this._toastrService.info(message.detail, message.summary, toastOptions);
				break;
			case MessageSeverity.success:
				toast = this._toastrService.success(message.detail, message.summary, toastOptions);
				break;
			case MessageSeverity.error:
				toast = this._toastrService.error(message.detail, message.summary, toastOptions);
				break;
			case MessageSeverity.warn:
				toast = this._toastrService.warning(message.detail, message.summary, toastOptions);
				break;
			case MessageSeverity.wait:
				toast = this._toastrService.info(message.detail, message.summary, toastOptions);
				break;
		}

		if (isSticky) {
			this.stickyToasties.push(toast.toastId);
			toast.onHidden.subscribe(() => {
				const index = this.stickyToasties.findIndex(id => id === toast.toastId);
				if (index >= 0) {
					this.stickyToasties.splice(index);
				}
			});
		}
	}

	public getYear(): number {
		return new Date().getUTCFullYear();
	}

	get userName(): string {
		return this.authService.currentUser ? this.authService.currentUser.userName : '';
	}

	get fullName(): string {
		return this.authService.currentUser ? this.authService.currentUser.fullName : '';
	}
}
