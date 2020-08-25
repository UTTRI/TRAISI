import { Component, OnInit, Input, ViewEncapsulation, AfterViewInit } from '@angular/core';

@Component({
	selector: 'app-header1',
	templateUrl: './header1.component.html',
	styleUrls: ['./header1.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class Header1Component implements OnInit, AfterViewInit {
	private baseUrl: string = '';
	public imageSource: string;
	public imageTransform: any;
	private pageHTMLJson: any;

	@Input() public pageHTML: string;
	@Input() public pageThemeInfo: any;
	@Input() public pageObject: any;

	constructor() {}

	public ngOnInit(): void {
		try {
			let pageData = null;
			if (this.pageObject === undefined) {
				pageData = JSON.parse(this.pageHTML);

			}
			else
			{
				pageData = this.pageObject;
			}
			this.pageHTMLJson = pageData;
			this.imageSource = pageData.image;
			this.imageTransform = `translate(${this.pageHTMLJson.imageTransform.x}px,${this.pageHTMLJson.imageTransform.y}px)`;
		} catch (e) {
			this.pageHTMLJson = {};
			this.imageSource = undefined;
		}
		if (!('headerColour' in this.pageThemeInfo)) {
			this.pageThemeInfo.headerColour = 'rgb(240,239,240)';
		}
		if (!('headerMaxHeightScale' in this.pageThemeInfo)) {
			this.pageThemeInfo.headerMaxHeightScale = 1.0;
		}
		if (!('headerBackgroundHeight' in this.pageThemeInfo)) {
			this.pageThemeInfo.headerBackgroundHeight = 66;
		}
	}

	public ngAfterViewInit(): void {}
}
