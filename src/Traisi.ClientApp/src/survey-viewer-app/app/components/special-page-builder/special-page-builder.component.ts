import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ViewEncapsulation,
	ComponentRef,
	ViewChild,
} from '@angular/core';
import { Header1Component } from './header1/header1.component';
import { MainSurveyAccess1Component } from './main-survey-access1/main-survey-access1.component';
import { TextBlock1Component } from './text-block1/text-block1.component';
import { Header2Component } from './header2/header2.component';

import { Footer1Component } from './footer1/footer1.component';

import Quill from 'quill';
import BlotFormatter from 'quill-blot-formatter';
import { Utilities } from '../../../../shared/services/utilities';
import { SurveyAccessComponent } from 'app/models/survey-access-component.interface';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';

// override p with div tag
const Parchment = Quill.import('parchment');
let Block = Parchment.query('block');

class NewBlock extends Block {
	public static tagName: string;
}
NewBlock.tagName = 'DIV';
Quill.register(NewBlock, true);
Quill.register('modules/blotFormatter', BlotFormatter);

// expand fonts available
// Add fonts to whitelist
let Font = Quill.import('formats/font');
// We do not add Sans Serif since it is the default
Font.whitelist = ['montserrat', 'sofia', 'roboto'];
Quill.register(Font, true);

interface SpecialPageDataInput {
	pageHTML: string;
	pageThemeInfo: string;
}

@Component({
	selector: 'app-special-page-builder',
	templateUrl: './special-page-builder.component.html',
	styleUrls: ['./special-page-builder.component.scss'],
	encapsulation: ViewEncapsulation.None,
	entryComponents: [MainSurveyAccess1Component, TextBlock1Component, Header1Component, Footer1Component],
})
export class SpecialPageBuilderComponent implements OnInit {
	public loadedComponents: boolean = false;

	public headerComponent: any;
	public headerHTML: string;
	public headerInputs: SpecialPageDataInput;

	public surveyAccessComponent: SurveyAccessComponent;
	public surveyAccessHTML: string;
	public surveyAccessInputs: SpecialPageDataInput;
	public surveyAccessOutputs: any;

	public componentList: any[] = [];
	public componentHTML: string[] = [];

	public footerComponent: any;
	public footerHTML: string;
	public footerInputs: SpecialPageDataInput;

	public termsFooterHTML: string;

	public dragOverContainer: Object = new Object();
	public bestSectionTextColour: any[] = [];

	@Input()
	public pageType: string;
	@Input()
	public pageHTML: string;
	@Input()
	public pageThemeInfo: any;
	@Output()
	public startSurveyPressed: EventEmitter<string> = new EventEmitter();
	@Output() public termsAccepted: EventEmitter<void> = new EventEmitter();

	@Input()
	public startPageComponent: SurveyStartPageComponent;

	@ViewChild('accessComponent')
	public accessComponent: any;

	constructor() {}

	public ngOnInit(): void {
		// deserailize page data
		try {
			let pageData = JSON.parse(this.pageHTML);
			(<any[]>pageData).forEach((sectionInfo) => {
				if (sectionInfo.sectionType.startsWith('header')) {
					this.headerComponent = this.getComponent(sectionInfo.sectionType);
					this.headerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType.startsWith('mainSurveyAccess')) {
					this.surveyAccessComponent = this.getComponent(sectionInfo.sectionType);
					this.surveyAccessHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType.startsWith('footer')) {
					this.footerComponent = this.getComponent(sectionInfo.sectionType);
					this.footerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType === 'termsFooter') {
					this.termsFooterHTML = sectionInfo.html;
				} else {
					this.componentList.push(this.getComponent(sectionInfo.sectionType));
					this.componentHTML.push(sectionInfo.html);
				}
			});
		} catch (e) {
			if (this.pageType === 'welcome') {
			} else if (this.pageType === 'privacyPolicy') {
				this.componentList.push(this.getComponent('textBlock1'));
				this.componentHTML.push('');
			} else if (this.pageType === 'thankYou') {
				this.componentList.push(this.getComponent('textBlock1'));
				this.componentHTML.push('');
			}
		}
		if (!this.pageThemeInfo) {
			this.pageThemeInfo = {};
		}
		if (!this.pageThemeInfo.pageBackgroundColour) {
			this.pageThemeInfo.pageBackgroundColour = 'rgb(255,255,255)';
		}
		if (!this.pageThemeInfo.sectionBackgroundColour) {
			this.pageThemeInfo.sectionBackgroundColour = {};
		}
		if (!this.pageThemeInfo.sectionBackgroundColour[this.pageType]) {
			this.pageThemeInfo.sectionBackgroundColour[this.pageType] = [];
		} else {
			(<string[]>this.pageThemeInfo.sectionBackgroundColour[this.pageType]).forEach((i, index) => {
				this.bestSectionTextColour[index] = this.getBestSectionBodyTextColor(index);
			});
		}
		this.setComponentInputs();
		this.loadedComponents = true;
	}

	private setComponentInputs(): void {
		this.headerInputs = {
			pageHTML: this.headerHTML,
			pageThemeInfo: this.pageThemeInfo,
		};

		this.surveyAccessInputs = {
			pageHTML: this.surveyAccessHTML,
			pageThemeInfo: this.pageThemeInfo,
		};

		this.surveyAccessOutputs = {
			startSurveyPressed: (code: string) => this.startSurvey(code),
		};

		this.footerInputs = {
			pageHTML: this.footerHTML,
			pageThemeInfo: this.pageThemeInfo,
		};
	}

	private startSurvey(code: string): void {
		this.startSurveyPressed.emit(code);
	}

	public acceptTerms(): void {
		this.termsAccepted.emit();
	}

	private getComponent(componentName: string): any {
		switch (componentName) {
			case 'header1':
				return Header1Component;
				break;
			case 'header2':
				return Header2Component;
				break;
			case 'mainSurveyAccess1':
				return MainSurveyAccess1Component;
				break;
			case 'textBlock1':
				return TextBlock1Component;
				break;
			case 'footer1':
				return Footer1Component;
				break;
			default:
				return null;
				break;
		}
	}

	public getComponentInputs(index: number): SpecialPageDataInput {
		let inputs = {
			pageHTML: this.componentHTML[index],
			pageThemeInfo: this.pageThemeInfo,
		};
		return inputs;
	}

	private getBestSectionBodyTextColor(index: number): string {
		return Utilities.whiteOrBlackText(
			this.pageThemeInfo.sectionBackgroundColour[this.pageType][index],
			this.pageThemeInfo.pageBackgroundColour
		);
	}

	/**
	 *
	 * @param shortcode
	 */
	public setShortcodeInput(shortcode: string): void {
		if (this.accessComponent.componentRef !== undefined) {
			this.accessComponent.componentRef.instance.setShortcodeInput(shortcode);
		}
	}
}
