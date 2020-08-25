import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewEncapsulation, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ConfigurationService } from '../../../../../../shared/services/configuration.service';
import { AuthService } from '../../../../../../shared/services';
import { AlertService, MessageSeverity } from '../../../../../../shared/services/alert.service';
import { Utilities } from '../../../../../../shared/services/utilities';
import { SurveyBuilderService } from '../../../services/survey-builder.service';
import { UploadPath } from '../../../models/upload-path';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';


@Component({
  selector: 'app-header2',
  templateUrl: './header2.component.html',
	styleUrls: ['./header2.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class Header2Component implements OnInit, AfterViewInit {

	private baseUrl: string = '';
	private draggingImage: boolean = false;
	private dragStart: any;
	public disableMenu: boolean = false;

	public imageSource1: string;
	public imageSource2: string;
	public imageTransform1: any;
	public imageTransform2: any;

	public imageDropZoneconfig: DropzoneConfigInterface = {
		// Change this to your upload POST address:
		maxFilesize: 50,
		maxFiles: 1,
		acceptedFiles: 'image/*',
		autoReset: 2000,
		errorReset: 2000,
		cancelReset: 2000,
		timeout: 3000000,
		createImageThumbnails: false
	};

	private pageHTMLJson: any;

	@Input()
	public previewMode: any;
	@Input() public pageHTML: string;
	@Input() public pageThemeInfo: any;
	@Output() public pageHTMLChange = new EventEmitter();
	@Output()	public pageThemeInfoChange = new EventEmitter();
	@Output() public forceSave = new EventEmitter();
	@Output()
	public deleteComponent = new EventEmitter();

	@ViewChild('imageMenu', { static: true })
	public imageMenu: ContextMenuComponent;

  constructor(
		private configurationService: ConfigurationService,
		private authService: AuthService,
		private alertService: AlertService,
		private surveyBuilderService: SurveyBuilderService,
		private contextMenuService: ContextMenuService,
		private elementRef: ElementRef,
		private cdRef: ChangeDetectorRef

	) {
		this.baseUrl = configurationService.baseUrl;
		this.imageDropZoneconfig.url = this.baseUrl + '/api/Upload';
		this.imageDropZoneconfig.headers = {
			Authorization: 'Bearer ' + this.authService.accessToken
		};
	}

  ngOnInit() {
		try {
			let pageData = JSON.parse(this.pageHTML);
			this.pageHTMLJson = pageData;
			this.imageSource1 = pageData.image1;
			this.imageSource2 = pageData.image2;
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

	public ngAfterViewInit(): void {
		this.elementRef.nativeElement.addEventListener('touchmove', event => event.preventDefault());
		this.imageTransform1 = this.pageHTMLJson.imageTransform1;
		this.imageTransform2 = this.pageHTMLJson.imageTransform2;
		this.cdRef.detectChanges();
	}

	public onImage1MoveEnd(event: any): void {
		event.x = 0;
		this.imageTransform1 = event;
		this.pageHTMLJson.imageTransform1 = this.imageTransform1;
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	public onImage2MoveEnd(event: any): void {
		event.x = 0;
		this.imageTransform2 = event;
		this.pageHTMLJson.imageTransform2 = this.imageTransform2;
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}


	onUploadError(error: any) {
		this.alertService.stopLoadingMessage();
		this.alertService.showStickyMessage(
			'Generation Error',
			`An error occured while uploading the logo.\r\nError: "${Utilities.getHttpResponseMessage(
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

	onUploadSuccess(event: any, imageIndex: number) {
		if (imageIndex === 1) {
			this.imageSource1 = event[1].link;
			this.pageHTMLJson.image1 = this.imageSource1;
		} else if (imageIndex === 2) {
			this.imageSource2 = event[1].link;
			this.pageHTMLJson.image2 = this.imageSource2;
		}
		this.updateImageContent();
		this.forceSave.emit();
	}

	public deleteHeader(): void {
		this.deleteComponent.emit();
	}

	public onImageMenu($event: MouseEvent, item: any): void {
		if (!this.draggingImage) {
			this.contextMenuService.show.next({
				// Optional - if unspecified, all context menu components will open
				contextMenu: this.imageMenu,
				event: $event,
				item: item
			});
			$event.preventDefault();
			$event.stopPropagation();
		} else {
			this.draggingImage = false;
		}
	}

	public startDrag(event: any): void {
		this.draggingImage = true;
		let dStart: any = {};
		dStart.x = event.x;
		dStart.y = event.y;
		this.dragStart = JSON.stringify(dStart);
	}

	public endDrag(event: any): void {
		let dragEnd: any = {};
		dragEnd.x = event.x;
		dragEnd.y = event.y;
		if (this.dragStart === JSON.stringify(dragEnd)) {
			this.draggingImage = false;
		}
	}


	public enableContextMenu(): void {
		this.disableMenu = false;
	}

	public disableContextMenu(): void {
		this.disableMenu = true;
	}


	deleteImage(imageIndex: number) {
		if (imageIndex === 1) {
			let uploadPath = new UploadPath(this.imageSource1);
			this.surveyBuilderService.deleteUploadedFile(uploadPath).subscribe();
			this.imageSource1 = undefined;
			this.pageHTMLJson.image1 = undefined;
		} else if (imageIndex === 2) {
			let uploadPath = new UploadPath(this.imageSource2);
			this.surveyBuilderService.deleteUploadedFile(uploadPath).subscribe();
			this.imageSource2 = undefined;
			this.pageHTMLJson.image2 = undefined;
		}
		this.updateImageContent();
		this.forceSave.emit();
	}

	updateImageContent() {
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	headerColourChange(newColour: string) {
		this.pageThemeInfo.headerColour = newColour;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	headerMaxHeightChange1(newHeight: any) {
		this.pageThemeInfo.headerMaxHeightScale1 = newHeight.newValue;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	headerMaxHeightChange2(newHeight: any) {
		this.pageThemeInfo.headerMaxHeightScale2 = newHeight.newValue;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	headerBackgroundHeightChange(newHeight: any) {
		this.pageThemeInfo.headerBackgroundHeight = newHeight.newValue;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	clearUploads() {
		if (this.imageSource1) {
			this.deleteImage(1);
		}
		if (this.imageSource2) {
			this.deleteImage(2);
		}
	}

	whiteDragHandle(): boolean {
		if (this.pageThemeInfo.headerColour) {
			let handleColour = Utilities.whiteOrBlackText(this.pageThemeInfo.headerColour);
			if (handleColour === 'rgb(255,255,255)') {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
}
