import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ViewEncapsulation,
	AfterViewInit,
	ElementRef,
	ViewChild,
	ChangeDetectorRef
} from '@angular/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ConfigurationService } from '../../../../../../shared/services/configuration.service';
import { AuthService } from '../../../../../../shared/services';
import { AlertService, MessageSeverity } from '../../../../../../shared/services/alert.service';
import { Utilities } from '../../../../../../shared/services/utilities';
import { SurveyBuilderService } from '../../../services/survey-builder.service';
import { UploadPath } from '../../../models/upload-path';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';

@Component({
	selector: 'app-header1',
	templateUrl: './header1.component.html',
	styleUrls: ['./header1.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class Header1Component implements OnInit, AfterViewInit {
	private baseUrl: string = '';
	private draggingImage: boolean = false;
	private dragStart: any;
	public imageSource: string;
	public imageTransform: any;
	public disableMenu: boolean = false;

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
	@Input()
	public pageHTML: string;
	@Input()
	public pageThemeInfo: any;
	@Output()
	public pageHTMLChange: EventEmitter<string> = new EventEmitter();
	@Output()
	public pageThemeInfoChange: EventEmitter<any> = new EventEmitter();
	@Output()
	public forceSave: EventEmitter<void> = new EventEmitter();
	@Output()
	public deleteComponent: EventEmitter<void> = new EventEmitter();

	@ViewChild('imageMenu', { static: true })
	public imageMenu: ContextMenuComponent;

	constructor(
		private configurationService: ConfigurationService,
		private authService: AuthService,
		private alertService: AlertService,
		private surveyBuilderService: SurveyBuilderService,
		private elementRef: ElementRef,
		private contextMenuService: ContextMenuService,
		private cdRef: ChangeDetectorRef
	) {
		this.baseUrl = configurationService.baseUrl;
		this.imageDropZoneconfig.url = this.baseUrl + '/api/Upload';
		this.imageDropZoneconfig.headers = {
			Authorization: 'Bearer ' + this.authService.accessToken
		};
	}

	public ngOnInit(): void {
		try {
			let pageData = JSON.parse(this.pageHTML);
			this.pageHTMLJson = pageData;
			this.imageSource = pageData.image;
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

	public onImageMoveEnd(event: any): void {
		event.x = 0;
		this.imageTransform = event;
		this.pageHTMLJson.imageTransform = this.imageTransform;
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
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

	public deleteHeader(): void {
		this.deleteComponent.emit();
	}

	public ngAfterViewInit(): void {
		this.elementRef.nativeElement.addEventListener('touchmove', event => event.preventDefault());
		this.imageTransform = this.pageHTMLJson.imageTransform;
		this.cdRef.detectChanges();
	}

	public disableScreenTouch(): void {}

	public enableScreenTouch(): void {}

	public onUploadError(error: any): void {
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

	public onUploadSuccess(event: any): void {
		this.imageSource = event[1].link;
		this.updateImageContent();
		this.forceSave.emit();
	}

	public deleteImage(): void {
		let uploadPath = new UploadPath(this.imageSource);
		this.surveyBuilderService.deleteUploadedFile(uploadPath).subscribe();
		this.imageSource = undefined;
		this.updateImageContent();
		this.forceSave.emit();
	}

	public updateImageContent(): void {
		this.pageHTMLJson.image = this.imageSource;
		this.pageHTML = JSON.stringify(this.pageHTMLJson);
		this.pageHTMLChange.emit(this.pageHTML);
	}

	public headerColourChange(newColour: string): void {
		this.pageThemeInfo.headerColour = newColour;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	public headerMaxHeightChange(newHeight: any): void {
		this.pageThemeInfo.headerMaxHeightScale = newHeight.newValue;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	public headerBackgroundHeightChange(newHeight: any): void {
		this.pageThemeInfo.headerBackgroundHeight = newHeight.newValue;
		this.pageThemeInfoChange.emit(this.pageThemeInfo);
	}

	public clearUploads(): void {
		if (this.imageSource) {
			this.deleteImage();
		}
	}

	public whiteDragHandle(): boolean {
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
