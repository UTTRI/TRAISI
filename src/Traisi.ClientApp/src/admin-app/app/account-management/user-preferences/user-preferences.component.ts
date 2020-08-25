import { Component, ViewEncapsulation, OnInit, Injector, OnDestroy, ViewChild } from '@angular/core';

import { AlertService, DialogType, MessageSeverity } from '../../../../shared/services/alert.service';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { AppTranslationService } from '../../../../shared/services/app-translation.service';
import { BootstrapSelectDirective } from '../../directives/bootstrap-select.directive';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../../../shared/services/utilities';
import { Permission } from '../../../../shared/models/permission.model';
import { Select2OptionData } from 'ng-select2';

@Component({
	selector: 'user-preferences',
	templateUrl: './user-preferences.component.html',
	styleUrls: ['./user-preferences.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class UserPreferencesComponent implements OnInit, OnDestroy {

	themeSelectorToggle = true;

	languageChangedSubscription: any;
	domSharedStylesHost: any;
	public languages: Array<Select2OptionData>;
	language: string;
	private languagesReloaded: boolean;

	select2Options: any = {
		theme: 'bootstrap'
	};
	selected: any;

	constructor(private alertService: AlertService, private translationService: AppTranslationService,
		private accountService: AccountService, public configurations: ConfigurationService, injector: Injector) {

	}

	ngOnInit() {
		this.languageChangedSubscription = this.translationService.languageChangedEvent().subscribe(data => {
			this.themeSelectorToggle = false;

			setTimeout(() => {
				this.themeSelectorToggle = true;
				this.updateLanguagesList();
			});
		});
		this.updateLanguagesList();
		this.language = this.configurations.language;
		this.languagesReloaded = false;
	}

	private updateLanguagesList() {
		const gT = (key: string) => this.translationService.getTranslation(key);
		this.languages = [
			{text: gT('preferences.English'), id: 'en'},
			{text: gT('preferences.French'), id: 'fr'}// ,
			/*{text: gT('preferences.German'), id: 'de'},
			{text: gT('preferences.Portuguese'), id: 'pt'},
			{text: gT('preferences.Arabic'), id: 'ar'},
			{text: gT('preferences.Korean'), id: 'ko'}*/
		];
		this.language = this.configurations.language;
		this.languagesReloaded = true;
	}

	ngOnDestroy() {
		this.languageChangedSubscription.unsubscribe();
	}

	public updateLanguage(e: any): void {
		if (this.languagesReloaded) {
			this.languagesReloaded = false;
		} else {
			this.configurations.language = e.value;
		}
	}


	reloadFromServer() {
		this.alertService.startLoadingMessage();

		this.accountService.getUserPreferences()
			.subscribe(results => {
				this.alertService.stopLoadingMessage();

				this.configurations.import(results);

				this.alertService.showMessage('Defaults loaded!', '', MessageSeverity.info);

			},
			error => {
				this.alertService.stopLoadingMessage();
				this.alertService.showStickyMessage('Load Error',
					`Unable to retrieve user preferences from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error, error);
			});
	}

	setAsDefault() {
		this.alertService.showDialog('Are you sure you want to set the current configuration as your new defaults?', DialogType.confirm,
			() => this.setAsDefaultHelper(),
			() => this.alertService.showMessage('Operation Cancelled!', '', MessageSeverity.default));
	}

	setAsDefaultHelper() {
		this.alertService.startLoadingMessage('', 'Saving new defaults');

		this.accountService.updateUserPreferences(this.configurations.export())
			.subscribe(response => {
				this.alertService.stopLoadingMessage();
				this.alertService.showMessage('New Defaults', 'Account defaults updated successfully', MessageSeverity.success);
			},
			error => {
				this.alertService.stopLoadingMessage();
				this.alertService.showStickyMessage('Save Error',
					`An error occured whilst saving configuration defaults.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error, error);
			});
	}


	resetDefault() {

		this.alertService.showDialog('Are you sure you want to reset your defaults?', DialogType.confirm,
			() => this.resetDefaultHelper(),
			() => this.alertService.showMessage('Operation Cancelled!', '', MessageSeverity.default));
	}

	resetDefaultHelper() {
		this.alertService.startLoadingMessage('', 'Resetting defaults');

		this.accountService.updateUserPreferences(null)
			.subscribe(response => {
				this.alertService.stopLoadingMessage();
				this.configurations.import(null);
				this.alertService.showMessage('Defaults Reset', 'Account defaults reset completed successfully', MessageSeverity.success);

			},
			error => {
				this.alertService.stopLoadingMessage();
				this.alertService.showStickyMessage('Save Error',
					`An error occured whilst resetting configuration defaults.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error, error);
			});
	}

}
