import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ComponentRef } from '@angular/core';
import { Header1Component } from './header1/header1.component';
import { MainSurveyAccess1Component } from './main-survey-access1/main-survey-access1.component';
import { TextBlock1Component } from './text-block1/text-block1.component';
import { Header2Component } from './header2/header2.component';
import { Footer1Component } from './footer1/footer1.component';
import { Utilities } from '../../../../../shared/services/utilities';
import { AlertService, DialogType } from '../../../../../shared/services/alert.service';
import { QuestionPartView } from '../../models/question-part-view.model';
import { fadeInOut } from '../../../services/animations';
import { ContainerOptions } from 'smooth-dnd';

@Component({
	selector: 'app-special-page-builder',
	templateUrl: './special-page-builder.component.html',
	styleUrls: ['./special-page-builder.component.scss'],
	encapsulation: ViewEncapsulation.None,
	animations: [fadeInOut]
})
export class SpecialPageBuilderComponent implements OnInit {
	public loadedComponents: boolean = false;

	public headerKey: string;
	public headerComponent: any;
	private headerComponentInstance: any;
	public headerHTML: string;
	public headerInputs: any;
	public headerOutputs: any;

	public surveyAccessKey: string;
	public surveyAccessComponent: any;
	private surveyAccessComponentInstance: any;
	public surveyAccessHTML: string;
	public surveyAccessInputs: any;
	public surveyAccessOutputs: any;

	public componentKeys: string[] = [];
	public componentList: any[] = [];
	public componentHTML: string[] = [];

	public footerKey: string;
	public footerComponent: any;
	private footerComponentInstance: any;
	public footerHTML: string;
	public footerInputs: any;
	public footerOutputs: any;

	public termsFooterHTML: string;
	public screeningQuestionsHTML: string;

	public dragOverContainer: Object = new Object();
	public bestSectionTextColour: string[] = [];

	@Input()
	public pageType: string;
	@Input()
	public pageHTML: string;
	@Input()
	public pageThemeInfo: any;
	@Input()
	public allPages: QuestionPartView;
	@Input()
	public previewMode: any;
	@Output()
	public pageHTMLChange: EventEmitter<string> = new EventEmitter();
	@Output()
	public pageThemeInfoChange: EventEmitter<any> = new EventEmitter();

	@Output()
	public forceSave: EventEmitter<void> = new EventEmitter();

	constructor(private alertService: AlertService) {
		this.headerShouldAcceptDrop = this.headerShouldAcceptDrop.bind(this);
		this.surveyAccessShouldAcceptDrop = this.surveyAccessShouldAcceptDrop.bind(this);
		this.footerShouldAcceptDrop = this.footerShouldAcceptDrop.bind(this);
		this.getContentComponentPayload = this.getContentComponentPayload.bind(this);
	}

	public ngOnInit(): void {
		// deserailize page data
		try {
			let pageData = JSON.parse(this.pageHTML);
			(<any[]>pageData).forEach(sectionInfo => {
				if (sectionInfo.sectionType.startsWith('header')) {
					this.headerKey = sectionInfo.sectionType;
					this.headerComponent = this.getComponent(sectionInfo.sectionType);
					this.headerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType.startsWith('mainSurveyAccess')) {
					this.surveyAccessKey = sectionInfo.sectionType;
					this.surveyAccessComponent = this.getComponent(sectionInfo.sectionType);
					this.surveyAccessHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType.startsWith('footer')) {
					this.footerKey = sectionInfo.sectionType;
					this.footerComponent = this.getComponent(sectionInfo.sectionType);
					this.footerHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType === 'termsFooter') {
					this.termsFooterHTML = sectionInfo.html;
				} else if (sectionInfo.sectionType === 'screeningQuestions') {
					this.screeningQuestionsHTML = sectionInfo.html;
				} else {
					this.componentKeys.push(sectionInfo.sectionType);
					this.componentList.push(this.getComponent(sectionInfo.sectionType));
					this.componentHTML.push(sectionInfo.html);
				}
			});
		} catch (e) {
			if (this.pageType === 'welcome') {
			} else if (this.pageType === 'privacyPolicy') {
				this.componentKeys.push('textBlock1');
				this.componentList.push(this.getComponent('textBlock1'));
				this.componentHTML.push('');
			} else if (this.pageType === 'thankYou') {
				this.componentKeys.push('textBlock1');
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
			previewMode: this.previewMode
		};
		this.headerOutputs = {
			pageHTMLChange: (value: string) => (this.headerHTML = value),
			pageThemeInfoChange: (value: any) => {
				this.pageThemeInfo = value;
				this.pageThemeInfoChange.emit(this.pageThemeInfo);
			},
			forceSave: () => this.forcePageSave(),
			deleteComponent: () => this.deleteHeaderComponent()
		};
		this.surveyAccessInputs = {
			pageHTML: this.surveyAccessHTML,
			pageThemeInfo: this.pageThemeInfo,
			previewMode: this.previewMode
		};
		this.surveyAccessOutputs = {
			pageHTMLChange: (value: string) => (this.surveyAccessHTML = value),
			pageThemeInfoChange: (value: any) => {
				this.pageThemeInfo = value;
				this.pageThemeInfoChange.emit(this.pageThemeInfo);
			},
			forceSave: () => this.forcePageSave()
		};
		this.footerInputs = {
			pageHTML: this.footerHTML,
			pageThemeInfo: this.pageThemeInfo,
			previewMode: this.previewMode
		};
		this.footerOutputs = {
			pageHTMLChange: (value: string) => (this.footerHTML = value),
			pageThemeInfoChange: (value: any) => {
				this.pageThemeInfo = value;
				this.pageThemeInfoChange.emit(this.pageThemeInfo);
			},
			forceSave: () => this.forcePageSave()
		};
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

	public getComponentInputs(index: number): any {
		let inputs = {
			pageHTML: this.componentHTML[index],
			pageThemeInfo: this.pageThemeInfo,
			previewMode: this.previewMode
		};
		return inputs;
	}

	public getComponentOutputs(index: number): any {
		let outputs = {
			pageHTMLChange: (value: string) => (this.componentHTML[index] = value),
			forceSave: () => this.forcePageSave()
		};
		return outputs;
	}

	public updatePageData(): void {
		let pageJson = [];
		if (this.headerKey) {
			// pageJson[this.headerKey] = this.headerHTML;
			pageJson.push({
				sectionType: this.headerKey,
				html: this.headerHTML
			});
		}
		if (this.surveyAccessKey) {
			// pageJson[this.surveyAccessKey] = this.surveyAccessHTML;
			pageJson.push({
				sectionType: this.surveyAccessKey,
				html: this.surveyAccessHTML
			});
		}
		this.componentKeys.forEach((componentName, index) => {
			// pageJson[`${componentName}|${index}`] = this.componentHTML[index];
			pageJson.push({
				sectionType: componentName,
				html: this.componentHTML[index]
			});
		});
		if (this.pageType === 'privacyPolicy') {
			pageJson.push({
				sectionType: 'termsFooter',
				html: this.termsFooterHTML
			});
		}
		if (this.pageType === 'screeningQuestions') {
			pageJson.push({
				sectionType: 'screeningQuestions',
				html: this.screeningQuestionsHTML
			});
		}

		if (this.footerKey) {
			// pageJson[this.footerKey] = this.footerHTML;
			pageJson.push({
				sectionType: this.footerKey,
				html: this.footerHTML
			});
		}

		this.pageHTML = JSON.stringify(pageJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	public deleteComponent(index: number): void {
		this.alertService.showDialog('Are you sure you want to delete this section?', DialogType.confirm, () => {
			let dropResult: any = {
				removedIndex: index,
				addedIndex: null,
				payload: this.componentKeys[index]
			};
			let componentKey = dropResult.payload;
			this.componentKeys = Utilities.applyDrag(this.componentKeys, dropResult);
			dropResult.payload = this.getComponent(componentKey);
			this.componentList = Utilities.applyDrag(this.componentList, dropResult);
			dropResult.payload = '';
			this.componentHTML = Utilities.applyDrag(this.componentHTML, dropResult);

			this.pageThemeInfo.sectionBackgroundColour[this.pageType] = Utilities.applyDrag(
				this.pageThemeInfo.sectionBackgroundColour[this.pageType],
				dropResult
			);
			this.forcePageSave();
		});
	}

	public forcePageSave(): void {
		this.forceSave.emit();
	}

	public headerComponentCreated(compRef: ComponentRef<any>): void {
		this.headerComponentInstance = compRef.instance;
	}

	public surveyAccessComponentCreated(compRef: ComponentRef<any>): void {
		this.surveyAccessComponentInstance = compRef.instance;
	}

	public footerComponentCreated(compRef: ComponentRef<any>): void {
		this.footerComponentInstance = compRef.instance;
	}

	public headerShouldAcceptDrop(sourceContainerOptions: any, payload: any): boolean {
		if (sourceContainerOptions.groupName === 'special-header' && this.headerComponent === undefined) {
			return true;
		}
		return false;
	}

	public surveyAccessShouldAcceptDrop(sourceContainerOptions: any, payload: any): boolean {
		if (sourceContainerOptions.groupName === 'special-surveyAccess' && this.surveyAccessComponent === undefined) {
			return true;
		}
		return false;
	}

	public footerShouldAcceptDrop(sourceContainerOptions: any , payload: any): boolean {
		if (sourceContainerOptions.groupName === 'special-footer' && this.footerComponent === undefined) {
			return true;
		}
		return false;
	}

	public onDragEnter(containerName: string): void {
		this.dragOverContainer[containerName] = true;
	}

	public onDragLeave(containerName: string): void {
		this.dragOverContainer[containerName] = false;
	}

	public getContentComponentPayload(index: number): string {
		return this.componentKeys[index];
	}

	public onHeaderDrop(dropResult: any): void {
		if (dropResult.addedIndex !== null) {
			this.headerKey = dropResult.payload;
			this.headerComponent = this.getComponent(this.headerKey);
			this.headerHTML = '';
			this.headerInputs = {
				pageHTML: this.headerHTML,
				pageThemeInfo: this.pageThemeInfo,
				previewMode: this.previewMode
			};
			this.dragOverContainer = new Object();
			this.forcePageSave();
		}
	}

	public onSurveyAccessDrop(dropResult: any): void {
		if (dropResult.addedIndex !== null) {
			this.surveyAccessKey = dropResult.payload;
			this.surveyAccessComponent = this.getComponent(this.surveyAccessKey);
			this.surveyAccessHTML = '';
			this.surveyAccessInputs = {
				pageHTML: this.surveyAccessHTML,
				pageThemeInfo: this.pageThemeInfo,
				previewMode: this.previewMode
			};
			this.dragOverContainer = new Object();
			this.forcePageSave();
		}
	}

	public onContentDrop(dropResult: any): void {
		if (dropResult.removedIndex !== dropResult.addedIndex) {
			let componentKey = dropResult.payload;
			this.componentKeys = Utilities.applyDrag(this.componentKeys, dropResult);
			dropResult.payload = this.getComponent(componentKey);
			this.componentList = Utilities.applyDrag(this.componentList, dropResult);
			dropResult.payload = '';
			this.componentHTML = Utilities.applyDrag(this.componentHTML, dropResult);
			// swap any background colour info
			dropResult.payload = this.pageThemeInfo.sectionBackgroundColour[this.pageType][dropResult.removedIndex];
			if (!dropResult.payload) {
				dropResult.payload = this.pageThemeInfo.pageBackgroundColour;
			}
			this.pageThemeInfo.sectionBackgroundColour[this.pageType] = Utilities.applyDrag(
				this.pageThemeInfo.sectionBackgroundColour[this.pageType],
				dropResult
			);
			dropResult.payload = this.bestSectionTextColour[dropResult.removedIndex];
			if (!dropResult.payload) {
				dropResult.payload = this.getBestSectionBodyTextColor(dropResult.addedIndex);
			}
			this.bestSectionTextColour = Utilities.applyDrag(this.bestSectionTextColour, dropResult);
		}
		this.dragOverContainer = new Object();
		this.forcePageSave();
	}

	public onFooterDrop(dropResult: any): void {
		if (dropResult.addedIndex !== null) {
			this.footerKey = dropResult.payload;
			this.footerComponent = this.getComponent(this.footerKey);
			this.footerHTML = '';
			this.footerInputs = {
				pageHTML: this.footerHTML,
				pageThemeInfo: this.pageThemeInfo,
				previewMode: this.previewMode
			};
			this.dragOverContainer = new Object();
			this.forcePageSave();
		}
	}

	public deleteHeaderComponent(): void {
		this.alertService.showDialog('Are you sure you want to delete this header?', DialogType.confirm, () => {
			this.headerKey = undefined;
			this.headerComponentInstance.clearUploads();
			this.headerComponentInstance = undefined;
			this.headerComponent = undefined;
			this.headerHTML = undefined;
			this.forcePageSave();
		});
	}

	public deleteSurveyAccessComponent(): void {
		this.alertService.showDialog('Are you sure you want to delete this section?', DialogType.confirm, () => {
			this.surveyAccessKey = undefined;
			this.surveyAccessComponentInstance.clearUploads();
			this.surveyAccessComponentInstance = undefined;
			this.surveyAccessComponent = undefined;
			this.surveyAccessHTML = undefined;
			this.forcePageSave();
		});
	}

	public deleteFooterComponent(): void {
		this.alertService.showDialog('Are you sure you want to delete this footer?', DialogType.confirm, () => {
			this.footerKey = undefined;
			this.footerComponentInstance.clearUploads();
			this.footerComponentInstance = undefined;
			this.footerComponent = undefined;
			this.footerHTML = undefined;
			this.forcePageSave();
		});
	}


	public shouldAnimateDrop(sourceContainerOptions: ContainerOptions, payload: any): boolean {
		if (sourceContainerOptions.groupName === 'special-content' && sourceContainerOptions.behaviour === 'move') {
			return true;
		}
		return false;
	}

	public pageBackgroundColourChange(newColour: string): void {
		this.pageThemeInfo.pageBackgroundColour = newColour;
		this.bestSectionTextColour.forEach(
			(v, i) => (this.bestSectionTextColour[i] = this.getBestSectionBodyTextColor(i))
		);
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	public sectionBackgroundColourChange(newColour: string, index: number): void {
		this.pageThemeInfo.sectionBackgroundColour[this.pageType][index] = newColour;
		this.bestSectionTextColour[index] = this.getBestSectionBodyTextColor(index);
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	public getBestSectionBodyTextColor(index: number): string {
		return Utilities.whiteOrBlackText(
			this.pageThemeInfo.sectionBackgroundColour[this.pageType][index],
			this.pageThemeInfo.pageBackgroundColour
		);
	}

}
