import {
	Component,
	OnInit,
	ViewChild,
	ViewContainerRef,
	Inject,
	ViewEncapsulation,
	ElementRef,
	ComponentFactoryResolver,
	ComponentRef,
	TemplateRef
} from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyStart } from '../../models/survey-start.model';
import { User } from 'shared/models/user.model';
import { AlertComponent } from 'ngx-bootstrap/alert';
import { TranslateService } from '@ngx-translate/core';
import { SurveyShortcodePageComponent } from '../survey-shortcode-page/survey-shortcode-page.component';
import { SurveyGroupcodePageComponent } from '../survey-groupcode-page/survey-groupcode-page.component';

@Component({
	selector: 'traisi-survey-start-page',
	templateUrl: './survey-start-page.component.html',
	styleUrls: ['./survey-start-page.component.scss'],
	entryComponents: [SurveyShortcodePageComponent, SurveyGroupcodePageComponent],
	encapsulation: ViewEncapsulation.None
})
export class SurveyStartPageComponent implements OnInit {
	public finishedLoading: boolean = false;
	public pageThemeInfo: any = {};

	public surveyName: string;

	public isLoading: boolean = false;

	public shortcode: string;

	public isAdmin: boolean = false;

	public surveyStartConfig: SurveyStart;

	public isError: boolean = false;

	@ViewChild('codeComponent', { read: ViewContainerRef })
	public codeComponent: ViewContainerRef;

	/**
	 *Creates an instance of SurveyStartPageComponent.
	 * @param {SurveyViewerService} _surveyViewerService
	 * @param {ActivatedRoute} _route
	 * @param {Router} _router
	 * @param {ElementRef} _elementRef
	 * @memberof SurveyStartPageComponent
	 */
	constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewerService,
		private _route: ActivatedRoute,
		private _router: Router,
		private _elementRef: ElementRef,
		private _componentFactoryResolver: ComponentFactoryResolver
	) {}

	public ngOnInit(): void {
		this.isAdmin = this._surveyViewerService.isAdminUser();
		this._route.params.subscribe((params) => {
			this.surveyName = params['surveyName'];
			this._surveyViewerService.welcomeModel.subscribe((surveyStartModel: SurveyStart) => {
				this.surveyStartConfig = surveyStartModel;
				console.log(surveyStartModel);
				this.loadCodeEntryComponent();
			});
		});
	}

	/**
	 *
	 *
	 * @private
	 * @memberof SurveyStartPageComponent
	 */
	private loadCodeEntryComponent(): void {
		if (!this.surveyStartConfig.hasGroupCodes) {
			this.loadShortcodeComponent();
		} else {
			this.loadGroupcodeComponent();
		}
	}

	private loadGroupcodeComponent(): void {
		let componentFactory = this._componentFactoryResolver.resolveComponentFactory(SurveyGroupcodePageComponent);
		this.codeComponent.clear();
		let componentRef = this.codeComponent.createComponent(componentFactory);
		(<SurveyGroupcodePageComponent>componentRef.instance).startPageComponent = this;
	}

	private loadShortcodeComponent(): void {
		let componentFactory = this._componentFactoryResolver.resolveComponentFactory(SurveyShortcodePageComponent);
		this.codeComponent.clear();
		let componentRef = this.codeComponent.createComponent(componentFactory);
		(<SurveyShortcodePageComponent>componentRef.instance).startPageComponent = this;
	}

	public groupcodeStartSurvey(): void {
		this.loadShortcodeComponent();
	}

	/**
	 * Starts the survey - this will authorize the current user with the associated
	 * short code. This will create a new survey user if one does not exist.
	 */
	public startSurvey(code: string): void {
		this.shortcode = code;
		this.isLoading = true;
		this.isError = false;

		console.log(this.isAdmin);
		this._surveyViewerService.surveyStart(this.surveyStartConfig.id, this.shortcode).subscribe(
			(value) => {
				this.isLoading = false;
				if (!this.isAdmin) {
					this._surveyViewerService.surveyLogin(this.surveyStartConfig.id, this.shortcode).subscribe((user: User) => {
						this._router.navigate([this.surveyName, 'terms']);
					});
				} else {
					this._router.navigate([this.surveyName, 'terms']);
				}
			},
			(error) => {
				console.error(error);
				this.isLoading = false;
				this.isError = true;
			}
		);
	}
}
