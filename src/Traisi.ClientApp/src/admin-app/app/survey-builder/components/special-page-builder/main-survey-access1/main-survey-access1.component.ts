import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ConfigurationService } from '../../../../../../shared/services/configuration.service';
import { AuthService } from '../../../../../../shared/services';
import { AlertService, MessageSeverity, DialogType } from '../../../../../../shared/services/alert.service';
import { Utilities } from '../../../../../../shared/services/utilities';
import { SurveyBuilderService } from '../../../services/survey-builder.service';
import { UploadPath } from '../../../models/upload-path';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-main-survey-access1',
	templateUrl: './main-survey-access1.component.html',
	styleUrls: ['./main-survey-access1.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class MainSurveyAccess1Component implements OnInit {
	public quillVideoModules = {
		blotFormatter: {},
		toolbar: [
			['video'], // link and image, video
			[{ align: [] }]
		]
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

	private baseUrl: string;
	public videoEmbedded: boolean = false;
	public videoSource: string;
	public imageSource: string;

	public imageVideoDropZoneconfig: DropzoneConfigInterface = {
		// Change this to your upload POST address:
		maxFilesize: 50,
		maxFiles: 1,
		acceptedFiles: 'video/*, image/*',
		autoReset: 2000,
		errorReset: 2000,
		cancelReset: 2000,
		timeout: 3000000
	};

	public quillMinimalModules = {
		toolbar: []
	};

	public introTextHTML: string;
	public accessCodeHTML: string;
	public beginSurveyHTML: string;

	private pageHTMLJson: any;
	@Input()
	public previewMode: any;
	@Input()
	public pageHTML: string;
	@Input()
	public pageThemeInfo: any;
	@Output()
	public pageHTMLChange = new EventEmitter();
	@Output()
	public pageThemeInfoChange = new EventEmitter();

	@Output()
	public forceSave = new EventEmitter();

	constructor(
		private configurationService: ConfigurationService,
		private authService: AuthService,
		private alertService: AlertService,
		private surveyBuilderService: SurveyBuilderService,
		private sanitizer: DomSanitizer
	) {
		this.baseUrl = configurationService.baseUrl;
		this.imageVideoDropZoneconfig.url = this.baseUrl + '/api/Upload';
		this.imageVideoDropZoneconfig.headers = {
			Authorization: 'Bearer ' + this.authService.accessToken
		};
	}

	ngOnInit() {
		try {
			let pageData = JSON.parse(this.pageHTML);
			this.pageHTMLJson = pageData;
			if (this.pageHTMLJson.mediaType) {
				if (this.pageHTMLJson.mediaType === 'video') {
					this.videoSource = pageData.media;
				} else if (this.pageHTMLJson.mediaType === 'embededVideo') {
					this.videoSource = pageData.media;
					this.videoEmbedded = true;
				} else if (this.pageHTMLJson.mediaType === 'image') {
					this.imageSource = pageData.media;
				}
			}

			this.introTextHTML = pageData.introText;
			this.accessCodeHTML = pageData.accessCode;
			this.beginSurveyHTML = pageData.beginSurvey;
		} catch (e) {
			this.pageHTMLJson = {};
			this.videoSource = undefined;
			this.introTextHTML = '';
			this.accessCodeHTML = 'Enter Access Code';
			this.beginSurveyHTML = 'Begin Survey';
		}
	}

	private isAValidUrl(value: string): boolean {
		try {
			const url = new URL(value);
			return true;
		} catch (TypeError) {
			return false;
		}
	}

	embedVideo() {
		this.alertService.showDialog('Please enter the video embed url', DialogType.prompt, link => {
			if (this.isAValidUrl(link)) {
				this.videoSource = link;
				this.videoEmbedded = true;
				this.updateImageVideoContent();
			}
		});
	}

	onUploadError(error: any) {
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Generation Error',
			`An error occured while uploading the video.\r\nError: "${Utilities.getHttpResponseMessage(
				this.processDZError(error[1])
			)}"`,
			MessageSeverity.error
		);
	}

	private processDZError(errors: any): string {
		let errorString: string = '';
		for (const error of errors['']) {
			errorString += error + '\n';
		}
		return errorString;
	}

	onUploadSuccessIndiv(event: any) {
		console.log(event);
		if ((<string>event[0].type).startsWith('video')) {
			this.videoSource = event[1].link;
		} else {
			this.imageSource = event[1].link;
		}
		this.updateImageVideoContent();
	}

	deleteImageVideo() {
		let uploadPath;
		if (this.videoSource && this.videoEmbedded) {
			this.videoSource = undefined;
			this.imageSource = undefined;
			this.videoEmbedded = false;
			this.updateImageVideoContent();
		} else {
			if (this.videoSource && !this.videoEmbedded) {
				uploadPath = new UploadPath(this.videoSource);
				this.videoEmbedded = false;
			} else if (this.imageSource) {
				uploadPath = new UploadPath(this.imageSource);
			}
			if (uploadPath) {
				this.surveyBuilderService.deleteUploadedFile(uploadPath).subscribe();
				this.videoSource = undefined;
				this.imageSource = undefined;
				this.updateImageVideoContent();
			}
		}
	}

	clearUploads() {
		this.deleteImageVideo();
	}

	updateImageVideoContent() {
		this.pageHTMLJson.media = this.videoSource ? this.videoSource : this.imageSource;
		this.pageHTMLJson.mediaType = this.pageHTMLJson.media
			? this.videoSource
				? this.videoEmbedded
					? 'embededVideo'
					: 'video'
				: 'image'
			: undefined;
		this.updatePageHTML();
		this.forceSave.emit();
	}

	updateContent(contentInfo: any) {
		this.pageHTMLJson.introText = this.introTextHTML;
		this.updatePageHTML();
	}

	updateAccessCodeContent(contentInfo: any) {
		this.pageHTMLJson.accessCode = this.accessCodeHTML;
		this.updatePageHTML();
	}

	updateBeginSurveyContent(contentInfo: any) {
		this.pageHTMLJson.beginSurvey = this.beginSurveyHTML;
		this.updatePageHTML();
	}

	private updatePageHTML() {
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	pageBackgroundColourChange(newColour: string): void {
		this.pageThemeInfo.pageBackgroundColour = newColour;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	getBestPageBodyTextColor() {
		if (this.pageThemeInfo.pageBackgroundColour) {
			return Utilities.whiteOrBlackText(this.pageThemeInfo.pageBackgroundColour);
		} else {
			return 'rgb(0,0,0)';
		}
	}

	getBestBorderColor() {
		if (this.pageThemeInfo.pageBackgroundColour) {
			let borderColor = Utilities.whiteOrBlackText(this.pageThemeInfo.pageBackgroundColour);
			if (borderColor === 'rgb(255,255,255)') {
				return 'rgb(200,200,200)';
			} else {
				return borderColor;
			}
		} else {
			return 'rgb(0,0,0)';
		}
	}

	stripHTML(htmlString: string) {
		return $(htmlString).text();
	}
}
