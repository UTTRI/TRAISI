import { Component, OnInit, Input} from '@angular/core';



@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
  styleUrls: ['./header2.component.scss']
})
export class Header2Component implements OnInit {

	public imageSource1: string;
	public imageSource2: string;
	public imageTransform1: any;
	public imageTransform2: any;

	private pageHTMLJson: any;

	@Input() public pageHTML: string;
	@Input() public pageThemeInfo: any;
	@Input() public pageObject: any;

  constructor(	) {	}

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
			this.imageSource1 = pageData.image1;
			this.imageSource2 = pageData.image2;
			this.imageTransform1 = `translate(${this.pageHTMLJson.imageTransform1.x}px,${this.pageHTMLJson.imageTransform1.y}px)`;
			this.imageTransform2 = `translate(${this.pageHTMLJson.imageTransform2.x}px,${this.pageHTMLJson.imageTransform2.y}px)`;
		} catch (e) {
			this.pageHTMLJson = {};
			this.imageSource1 = undefined;
			this.imageSource2 = undefined;
		}
		if (!('headerColour' in this.pageThemeInfo)) {
			this.pageThemeInfo.headerColour = 'rgb(240,239,240)';
		}
		if (!('headerMaxHeightScale1' in this.pageThemeInfo)) {
			this.pageThemeInfo.headerMaxHeightScale1 = 1.0;
		}
		if (!('headerMaxHeightScale2' in this.pageThemeInfo)) {
			this.pageThemeInfo.headerMaxHeightScale2 = 1.0;
		}
		if (!('headerBackgroundHeight' in this.pageThemeInfo)) {
			this.pageThemeInfo.headerBackgroundHeight = 66;
		}
	}
}
