import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { of as observableOf, Subject } from 'rxjs';

@Injectable()
export class SurveyViewerTranslationService {
	private _languageChanged: Subject<string> = new Subject<string>();
	public readonly defaultLanguage: string = 'en';

	/**
	 *
	 * @param translate
	 */
	constructor(private translate: TranslateService) {
		this.setDefaultLanguage(this.defaultLanguage);
	}

	/**
	 *
	 * @param lang
	 */
	public setDefaultLanguage(lang: string): void {
		this.translate.setDefaultLang(lang);
	}

	/**
	 *
	 */
	public getDefaultLanguage(): string {
		return this.translate.defaultLang;
	}

	/**
	 *
	 */
	public getBrowserLanguage(): string {
		return this.translate.getBrowserLang();
	}

	/**
	 *
	 * @param language
	 */
	public changeLanguage(language: string = 'en'): string {
		if (!language) {
			language = this.translate.defaultLang;
		}

		if (language !== this.translate.currentLang) {
			setTimeout(() => {
				this.translate.use(language);
				this._languageChanged.next(language);
			});
		}

		return language;
	}

	/**
	 *
	 */
	public useBrowserLanguage(): string | void {
		let browserLang = this.getBrowserLanguage();

		if (browserLang.match(/en|fr|de|ar|ko|pt/)) {
			this.changeLanguage(browserLang);
			return browserLang;
		}
	}
}

export class SurveyViewerTranslateLanguageLoader implements TranslateLoader {
	/**
	 * Gets the translations from webpack
	 * @param lang
	 * @returns {any}
	 */
	public getTranslation(lang: string): any {
		// Note Dynamic require(variable) will not work. Require is always at compile time

		switch (lang) {
			case 'en':
				return observableOf(require('../../assets/locale/en.json'));

			default:
		}
	}
}
