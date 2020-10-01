import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Utilities } from 'shared/services/utilities';

@Component({
	selector: 'app-privacy-confirmation',
	templateUrl: './privacy-confirmation.component.html',
	styleUrls: ['./privacy-confirmation.component.scss'],
})
export class PrivacyConfirmationComponent implements OnInit {
	public quillMinimalModules: Object = {
		toolbar: [],
	};

	public quillModules: Object = {
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

			['link'], // link and image, video
		],
	};

	public footerTextColour: string;

	public acceptTermsHTML: string;

	public pageHTMLJson: any;

	@Input()
	public pageHTML: string;
	@Input() public pageThemeInfo: any;
	@Output() public termsAccepted: EventEmitter<void> = new EventEmitter();

	constructor() {}

	public ngOnInit(): void {
		try {

			let pageData = JSON.parse(this.pageHTML);

			this.pageHTMLJson = pageData;
			this.acceptTermsHTML = pageData.acceptTerms;
		} catch (e) {
			console.log(e);
			this.pageHTMLJson = {};
		}
		if (!('termsAcceptColour' in this.pageThemeInfo)) {
			this.pageThemeInfo.termsAcceptColour = 'rgb(36,36,36)';
		}
		this.footerTextColour = Utilities.whiteOrBlackText(this.pageThemeInfo.termsAcceptColour);
	}

	public stripHTML(htmlString: string): string {
		return $(htmlString).text();
	}

	public acceptTerms(): void {
		this.termsAccepted.emit();
	}
}
