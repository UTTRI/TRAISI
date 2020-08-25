import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Utilities } from '../../../../../../shared/services/utilities';

@Component({
	selector: 'app-footer1',
	templateUrl: './footer1.component.html',
	styleUrls: ['./footer1.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class Footer1Component implements OnInit {
	public quillMinimalModules = {
		toolbar: [['bold', 'italic', 'underline', 'strike'], [{ size: [] }], [{ align: [] }]]
	};

	public footerTextColour: string;

	private pageHTMLJson: any;

	@Input()
	public previewMode: any;
	@Input()
	public pageThemeInfo: any;
	@Input()
	public pageHTML: string;
	@Output()
	public pageThemeInfoChange = new EventEmitter();
	@Output()
	public pageHTMLChange = new EventEmitter();

	@Output()
	public forceSave = new EventEmitter();

	constructor() {}

	public ngOnInit(): void {
		try {
			let pageData = JSON.parse(this.pageHTML);
			this.pageHTMLJson = pageData;
		} catch (e) {
			this.pageHTMLJson = {};
			this.pageHTMLJson.html = '';
		}
		if (!('footerColour' in this.pageThemeInfo)) {
			this.pageThemeInfo.footerColour = 'rgb(36,36,36)';
		}
		this.footerTextColour = Utilities.whiteOrBlackText(this.pageThemeInfo.footerColour);
	}

	public quillEditorCreated(quillInstance: any): void {
		setTimeout(() => {
			if (this.pageHTMLJson.html === undefined || this.pageHTMLJson.html === '') {
				quillInstance.format('align', 'center', 'api');
			}
		}, 0);
	}

	public clearUploads(): void {}

	public updateFooterContent(contentInfo: any): void {
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	public footerColourChange(newColour: string): void {
		this.pageThemeInfo.footerColour = newColour;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
		this.footerTextColour = Utilities.whiteOrBlackText(this.pageThemeInfo.footerColour);
	}

	public traisiLogo(): string {
		if (this.pageThemeInfo.footerColour) {
			let lightOrDark = Utilities.whiteOrBlackText(this.pageThemeInfo.footerColour);
			if (lightOrDark === 'rgb(0,0,0)') {
				return 'assets/img/icon_light.png';
			} else {
				return 'assets/img/icon_dark.png';
			}
		} else {
			return 'assets/img/icon_dark.png';
		}
	}
}
