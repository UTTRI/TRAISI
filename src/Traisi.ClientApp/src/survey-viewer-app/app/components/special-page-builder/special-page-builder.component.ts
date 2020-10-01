import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ViewEncapsulation,
	ComponentRef,
	ViewChild,
	ComponentFactoryResolver,
	TemplateRef,
	ViewContainerRef,
	AfterContentInit,
	AfterViewInit,
	ViewChildren,
	QueryList, ChangeDetectorRef
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
import { NgTemplateOutlet } from '@angular/common';

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
export class SpecialPageBuilderComponent implements OnInit, AfterContentInit, AfterViewInit {
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

	public accessComponent: ComponentRef<any>;

	@ViewChild('headerTemplate', { static: false, read: ViewContainerRef })
	public headerTemplate: ViewContainerRef;

	@ViewChild('surveyAccessTemplate', { static: false, read: ViewContainerRef })
	public surveyAccessTemplate: ViewContainerRef;

	@ViewChild('mainTemplate', { static: false, read: ViewContainerRef })
	public mainTemplate: ViewContainerRef;

	public interval: any;

	constructor(private _componentFactoryResolver: ComponentFactoryResolver,private _cd: ChangeDetectorRef) {}

	public ngAfterViewInit(): void {
		try {
			let pageData = JSON.parse(this.pageHTML);
			(<any[]>pageData).forEach((sectionInfo) => {
				if (sectionInfo.sectionType.startsWith('header')) {
					this.headerComponent = this.getComponent(sectionInfo.sectionType, this.headerTemplate);
					this.headerTemplate.clear();
					this.headerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType.startsWith('mainSurveyAccess')) {
					this.surveyAccessHTML = sectionInfo.html;
					this.surveyAccessComponent = this.getComponent(sectionInfo.sectionType, this.surveyAccessTemplate);
					this.accessComponent = <any>this.surveyAccessComponent;
				} else if (sectionInfo.sectionType.startsWith('footer')) {
					this.footerComponent = this.getComponent(sectionInfo.sectionType);
					this.footerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType === 'termsFooter') {
					this.termsFooterHTML = sectionInfo.html;
				} else {

					let component = this.getComponent(sectionInfo.sectionType, this.mainTemplate, sectionInfo.html);
					// this.componentList.push(this.getComponent(sectionInfo.sectionType));
					// this.componentHTML.push(sectionInfo.html);
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
	}
	public ngAfterContentInit(): void {}

	public ngAfterContentChecked(): void {
		this._cd.detectChanges();
	}

	public ngOnInit(): void {
		try {
			let pageData = JSON.parse(this.pageHTML);

			(<any[]>pageData).forEach((sectionInfo) => {
				if (sectionInfo.sectionType.startsWith('header')) {
					this.headerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType.startsWith('mainSurveyAccess')) {
					this.surveyAccessHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType.startsWith('footer')) {
					this.footerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType === 'termsFooter') {
					this.termsFooterHTML = sectionInfo.html;
				} else {
					// this.componentList.push(this.getComponent(sectionInfo.sectionType));
					this.componentHTML.push(sectionInfo.html);
				}
			});
		} catch (e) {
			if (this.pageType === 'welcome') {
			} else if (this.pageType === 'privacyPolicy') {
				// this.componentList.push(this.getComponent('textBlock1'));
				this.componentHTML.push('');
			} else if (this.pageType === 'thankYou') {
				// this.componentList.push(this.getComponent('textBlock1'));
				this.componentHTML.push('');
			}
		}
		// deserailize page data

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

	private getComponent(componentName: string, ref?: ViewContainerRef , pageHTML?: string): any {
		let factory;
		let component: ComponentRef<any>;
		switch (componentName) {
			case 'header1':
				factory = this._componentFactoryResolver.resolveComponentFactory(Header1Component);
				return ref.createComponent(factory);
				break;
			case 'header2':
				return Header2Component;
				break;
			case 'mainSurveyAccess1':
				factory = this._componentFactoryResolver.resolveComponentFactory(MainSurveyAccess1Component);
				component = ref.createComponent<MainSurveyAccess1Component>(factory, undefined, undefined);
				component.instance['pageHTML'] = this.surveyAccessHTML;
				component.instance['pageThemeInfo'] = this.pageThemeInfo;
				return component;
				break;
			case 'textBlock1':
				factory = this._componentFactoryResolver.resolveComponentFactory(TextBlock1Component);
				component = ref.createComponent<TextBlock1Component>(factory, undefined, undefined);
				component.instance['pageHTML'] = pageHTML;
				return component;
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
		if (this.accessComponent !== undefined) {
			this.accessComponent.instance.setShortcodeInput(shortcode);
		}
	}
}
