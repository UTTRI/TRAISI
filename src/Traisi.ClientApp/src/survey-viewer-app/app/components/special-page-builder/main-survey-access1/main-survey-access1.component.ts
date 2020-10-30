import {
	Component,
	OnInit,
	Input,
	ViewEncapsulation,
	Output,
	EventEmitter,
} from '@angular/core';
import { Utilities } from '../../../../../shared/services/utilities';
import { SurveyViewerService } from '../../../services/survey-viewer.service';
import { SurveyAccessComponent } from 'app/models/survey-access-component.interface';
import { SurveyStartPageComponent } from 'app/components/survey-start-page/survey-start-page.component';
import { SurveyViewerSession } from 'app/services/survey-viewer-session.service';

@Component({
	selector: 'app-main-survey-access1',
	templateUrl: './main-survey-access1.component.html',
	styleUrls: ['./main-survey-access1.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class MainSurveyAccess1Component
	implements OnInit, SurveyAccessComponent {
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

	public accessCode: string;

	public videoEmbedded: boolean = false;
	public videoSource: string;
	public imageSource: string;

	public pageTextColour: string;
	public borderColour: string;

	public quillMinimalModules: Object = {
		toolbar: [],
	};

	public isAdmin: boolean;

	public introTextHTML: string;
	public accessCodeHTML: string;
	public beginSurveyHTML: string;

	private pageHTMLJson: any;

	@Input()
	public pageHTML: string;
	@Input()
	public pageThemeInfo: any;
	@Output()
	public startSurveyPressed: EventEmitter<string> = new EventEmitter();

	@Input()
	public startPageComponent: SurveyStartPageComponent;

	public hasAccessError: boolean = false;

	public constructor(
		public surveyViewerService: SurveyViewerService,
		public surveySession: SurveyViewerSession
	) {
	}

	public ngOnInit(): void {
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
			this.isAdmin = this.surveyViewerService.isAdminUser();
		} catch (e) {
			this.pageHTMLJson = {};
			this.videoSource = undefined;
			this.introTextHTML = '';
			this.accessCodeHTML = 'Enter Access Code';
			this.beginSurveyHTML = 'Begin Survey';
		}
		this.pageTextColour = this.getBestPageBodyTextColor();
		this.borderColour = this.getBestBorderColor();
		this.accessCode = '';
		this.surveyViewerService.isLoggedIn.subscribe(
			(val) => {
				console.debug('logged in: ' + val);
			},
			(error) => {},
			() => {
			}
		);

		this.surveySession.data.subscribe((v) => {
			console.log(v);
		});
	}

	private getBestPageBodyTextColor(): string {
		if (this.pageThemeInfo.pageBackgroundColour) {
			return Utilities.whiteOrBlackText(
				this.pageThemeInfo.pageBackgroundColour
			);
		} else {
			return 'rgb(0,0,0)';
		}
	}

	public getBestBorderColor(): string {
		if (this.pageThemeInfo.pageBackgroundColour) {
			let borderColor = Utilities.whiteOrBlackText(
				this.pageThemeInfo.pageBackgroundColour
			);
			if (borderColor === 'rgb(255,255,255)') {
				return 'rgb(200,200,200)';
			} else {
				return borderColor;
			}
		} else {
			return 'rgb(0,0,0)';
		}
	}

	public stripHTML(htmlString: string): string {
		return $(htmlString).text();
	}

	public startSurvey(): void {
		this.hasAccessError = false;
		this.surveyViewerService.startPageComponent
			.startSurvey(this.accessCode)
			.subscribe({
				complete: () => {
					console.log('complete ');
				},
				error: (e) => {
					console.log(e);
					console.log('has error');
					this.hasAccessError = true;
				},
			});
		// this.startSurveyPressed.emit(this.accessCode);
	}

	public setShortcodeInput(shortcode: string): void {
		this.accessCode = shortcode;
	}
}
