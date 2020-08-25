import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Utilities } from '../../../../../../shared/services/utilities';

@Component({
  selector: 'app-privacy-confirmation',
  templateUrl: './privacy-confirmation.component.html',
  styleUrls: ['./privacy-confirmation.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PrivacyConfirmationComponent implements OnInit {

	public quillMinimalModules = {
		toolbar: []
	};

	public quillModules = {
		toolbar: [
			['bold', 'italic', 'underline', 'strike'], // toggled buttons
			['blockquote', 'code-block'],

			[{ list: 'ordered' }, { list: 'bullet' }],
			[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
			[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
			[{ direction: 'rtl' }], // text direction

			[{ header: [1, 2, 3, 4, 5, 6, false] }],

			[{ color: [] }], // dropdown with defaults from theme
			[{ font: ['montserrat', 'sofia', 'roboto'] }],
			[{ size: [] }],
			[{ align: [] }],

			['clean'], // remove formatting button

			['link'] // link and image, video
		]
	};

	public footerTextColour: string;

	public acceptTermsHTML: string = 'Accept Terms';

	private pageHTMLJson: any;

	@Input()
	public previewMode: any;
	@Input()
	public pageHTML: string;
	@Output()
	public pageHTMLChange = new EventEmitter();
	@Input() public pageThemeInfo: any;
	@Output()	public pageThemeInfoChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
		try {
			let pageData = JSON.parse(this.pageHTML);
			this.pageHTMLJson = pageData;
			this.acceptTermsHTML = pageData.acceptTerms;
		} catch (e) {
			this.pageHTMLJson = {};
		}
		if (!('termsAcceptColour' in this.pageThemeInfo)) {
			this.pageThemeInfo.termsAcceptColour = 'rgb(36,36,36)';
		}
		this.footerTextColour = Utilities.whiteOrBlackText(this.pageThemeInfo.termsAcceptColour);
	}

	public quillEditorCreated(quillInstance: any): void {
		setTimeout(() => {
			if (this.pageHTMLJson.html === undefined || this.pageHTMLJson.html === '') {
				quillInstance.format('align', 'center', 'api');
			}
		}, 0);
	}


	updateAcceptTermsContent(contentInfo: any) {
		this.pageHTMLJson.acceptTerms = this.acceptTermsHTML;
		this.updatePageHTML();
	}

	updateTermsHTML() {
		this.updatePageHTML();
	}

	private updatePageHTML() {
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	termsAcceptColourChange(newColour: string) {
		this.pageThemeInfo.termsAcceptColour = newColour;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
		this.footerTextColour = Utilities.whiteOrBlackText(this.pageThemeInfo.termsAcceptColour);
	}


}
