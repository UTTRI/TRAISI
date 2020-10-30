import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SurveyBuilderService } from './services/survey-builder.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { UploadPath } from './models/upload-path';
import { QuestionTypeDefinition } from './models/question-type-definition';
import { AlertService, DialogType, MessageSeverity } from '../../../shared/services/alert.service';
import { QuestionPageDisplayComponent } from './components/nested-drag-and-drop-list/nested-drag-and-drop-list.component';
import { QuestionPartView } from './models/question-part-view.model';
import { WelcomePage } from './models/welcome-page.model';
import { TermsAndConditionsPage } from './models/terms-and-conditions-page.model';
import { ThankYouPage } from './models/thank-you-page.model';
import { Utilities } from '../../../shared/services/utilities';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { QuestionTypeChooserComponent } from './components/question-type-chooser/question-type-chooser.component';
import { QuestionPartViewLabel } from './models/question-part-view-label.model';
import { Order } from './models/order.model';
import { Survey } from '../models/survey.model';
import { SurveyService } from '../services/survey.service';
import Quill from 'quill';
import BlotFormatter from 'quill-blot-formatter';
import { SpecialPageBuilderComponent } from './components/special-page-builder/special-page-builder.component';
import { fadeInOut } from '../services/animations';
import { RealTimeNotificationServce } from '../services/real-time-notification.service';
import { SurveyNotification } from '../models/survey-notification';
import { ScreeningQuestions } from './models/screening-questions.model';
import { FormGroup, FormControl } from '@angular/forms';
import { SurveyBuilderEditorData } from './services/survey-builder-editor-data.service';
import { SurveyBuilderClient } from './services/survey-builder-client.service';

// override p with div tag
const Parchment = Quill.import('parchment');
let Block = Parchment.query('block');

class NewBlock extends Block { }
NewBlock['tagName'] = 'DIV';
Quill.register(NewBlock, true);
Quill.register('modules/blotFormatter', BlotFormatter);

// expand fonts available
// Add fonts to whitelist
let Font = Quill.import('formats/font');
// We do not add Sans Serif since it is the default
Font.whitelist = ['montserrat', 'sofia', 'roboto'];
Quill.register(Font, true);

@Component({
	selector: 'traisi-survey-builder',
	templateUrl: './survey-builder.component.html',
	styleUrls: ['./survey-builder.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [SurveyBuilderEditorData],
	animations: [fadeInOut],
})
export class SurveyBuilderComponent implements OnInit, OnDestroy {
	public surveyId: number;
	public survey: Survey = new Survey();

	public allPages: QuestionPartView[] = [];
	public newPageTitle: string;
	public newPageIcon: string;
	public currentLanguage: string = 'en';

	public pageThemeInfo: any = {};

	public catiExists: boolean = false;
	public enableCATI: boolean = false;

	public catiWelcomePage: WelcomePage = new WelcomePage();
	public catiTermsAndConditionsPage: TermsAndConditionsPage = new TermsAndConditionsPage();
	public catiThankYouPage: ThankYouPage = new ThankYouPage();
	public catiScreeningQuestions: ScreeningQuestions = new ScreeningQuestions();

	public welcomePage: WelcomePage = new WelcomePage();
	public termsAndConditionsPage: TermsAndConditionsPage = new TermsAndConditionsPage();
	public screeningQuestions: ScreeningQuestions = new ScreeningQuestions();
	public thankYouPage: ThankYouPage = new ThankYouPage();
	public loadedSpecialPages: boolean = false;
	public loadedIndividualPage: boolean = true;

	public welcomePagePreview: any = { value: false };
	public privacyPagePreview: any = { value: false };
	public thankYouPagePreview: any = { value: false };
	public questionViewerPreview: any = { value: false };
	public screeningPagePreview: any = { value: false };

	public currentSurveyPage: QuestionPartView;
	public currentSurveyPageEdit: QuestionPartView;

	public householdAdded: boolean = false;

	public qTypeDefinitions: Map<string, QuestionTypeDefinition> = new Map<string, QuestionTypeDefinition>();

	public currentPage: string = 'welcome';

	public ipIconPack: string[];

	public iconFormGroup: FormGroup;
	public iconCss = new FormControl();

	private lastDragEnter: string[] = [];
	private lastDragLeave: string[] = [];
	private dragResult: Subject<boolean>;
	private surveyUpdate: Subject<SurveyNotification>;

	@ViewChild('surveyPageDragAndDrop')
	public surveyPage: QuestionPageDisplayComponent;
	@ViewChild('questionChooser', { static: true })
	public questionChooser: QuestionTypeChooserComponent;
	@ViewChild('createPageModal', { static: true })
	public createPageModal: ModalDirective;
	@ViewChild('editPageModal', { static: true })
	public editPageModal: ModalDirective;
	@ViewChild('welcomeEditor')
	public welcomeEditor: SpecialPageBuilderComponent;
	@ViewChild('privacyPolicyEditor')
	public privacyPolicyEditor: SpecialPageBuilderComponent;
	@ViewChild('questionViewerEditor')
	public questionViewerEditor: SpecialPageBuilderComponent;
	@ViewChild('thankYouEditor')
	public thankYouEditor: SpecialPageBuilderComponent;
	@ViewChild('screeningEditor')
	public screeningEditor: SpecialPageBuilderComponent;

	constructor(
		private surveyBuilderService: SurveyBuilderService,
		private configurationService: ConfigurationService,
		private surveyService: SurveyService,
		private authService: AuthService,
		private route: ActivatedRoute,
		private alertService: AlertService,
		private cdRef: ChangeDetectorRef,
		private notificationService: RealTimeNotificationServce,
		private _editorData: SurveyBuilderEditorData
	) {
		this.route.params.subscribe((params) => {
			this.surveyId = params['id'];
			this.notificationService.surveyStatus(this.surveyId, true);
			this.surveyService.getSurvey(this.surveyId).subscribe((survey) => {
				this.survey = survey;
			});
		});
		this.getPagePayload = this.getPagePayload.bind(this);
		this.ipIconPack = ['fa5'];
	}

	public ngOnInit(): void {
		this._editorData.initialize(this.surveyId).subscribe({
			complete: () => {
				this.loadPageStructure();
				this.switchPage('welcome');
				this.iconFormGroup = new FormGroup({ iconCss: this.iconCss });
			},
		});
	}

	public ngOnDestroy(): void {
		if (
			this.welcomePagePreview.value === true ||
			this.privacyPagePreview.value === true ||
			this.thankYouPagePreview.value === true ||
			this.questionViewerPreview.value === true ||
			this.screeningPagePreview.value === true
		) {
			this.welcomePagePreview.value = false;
			this.privacyPagePreview.value = false;
			this.thankYouPagePreview.value = false;
			this.questionViewerPreview.value = false;
			this.screeningPagePreview.value = false;
			this.toggleSidebarForPreview();
		}
		this.notificationService.surveyStatus(this.surveyId, false);
		this.notificationService.deRegisterChannel(`survey-${this.surveyId}`);
	}

	public loadPageStructure(): void {
		this.loadedSpecialPages = false;
		this.surveyBuilderService.getSurveyStyles(this.surveyId).subscribe((styles) => {
			try {
				this.pageThemeInfo = JSON.parse(styles);
				if (this.pageThemeInfo === null) {
					this.pageThemeInfo = {};
					this.pageThemeInfo.viewerTemplate = '';
				}
			} catch (e) { }

			this.surveyBuilderService
				.getStandardViewPageStructure(this.surveyId, this.currentLanguage)
				.subscribe((page) => {
					this.allPages = page.pages;
					if (this.allPages.length > 0) {
						this.currentSurveyPage = this.allPages[0];
					}

					this.welcomePage = page.welcomePage === null ? new WelcomePage() : page.welcomePage;
					this.termsAndConditionsPage =
						page.termsAndConditionsPage === null
							? new TermsAndConditionsPage()
							: page.termsAndConditionsPage;
					this.thankYouPage =
						page.surveyCompletionPage === null ? new ThankYouPage() : page.surveyCompletionPage;
					this.screeningQuestions =
						page.screeningQuestions === null ? new ScreeningQuestions() : page.screeningQuestions;
					this.catiExists = false;
					this.enableCATI = false;
					this.refreshSurveyPage();
					if (this.allPages.length > 0 && this.allPages[0].catiDependent) {
						this.catiExists = true;
						this.enableCATI = false;
						this.surveyBuilderService
							.getCATIViewPageStructure(this.surveyId, this.currentLanguage)
							.subscribe((structure) => {
								this.catiWelcomePage = structure.welcomePage;
								this.catiTermsAndConditionsPage = structure.termsAndConditionsPage;
								this.catiThankYouPage = structure.surveyCompletionPage;
								this.catiScreeningQuestions = structure.screeningQuestions;
								this.loadedSpecialPages = true;
							});
					}
					this.loadedSpecialPages = true;
				});
		});
	}

	/**
	 * @param {QuestionPartView} page
	 */
	public onPageChange(page: QuestionPartView) {
		this.switchSurveyPage(page.id);
	}

	public createCATI(): void {
		this.surveyBuilderService.createCATIView(this.surveyId, this.currentLanguage).subscribe((catiStructure) => {
			this.loadPageStructure();
			this.notificationService.indicateSurveyChange(this.surveyId);
		});
	}

	public deleteCATI(): void {
		this.alertService.showDialog(
			'Are you sure you want to delete the CATI view for this language?',
			DialogType.confirm,
			() => {
				this.surveyBuilderService.deleteCATIView(this.surveyId, this.currentLanguage).subscribe((result) => {
					this.loadPageStructure();
					this.notificationService.indicateSurveyChange(this.surveyId);
				});
			}
		);
	}

	private refreshSurveyPage(): void {
		if (this.currentPage === 'surveyPage' || this.currentPage == 'builder') {
			this.switchSurveyPage(this.currentSurveyPage.id);
		}
	}

	public refreshSpecialPage(): void {
		/*this.loadedSpecialPages = false;
		setTimeout(() => {
			this.loadedSpecialPages = true;
		}, 100);
		//this.cdRef.detectChanges();*/
	}

	public mapQuestionTypeDefinitions(): void {
		this.questionChooser.questionTypeDefinitions.forEach((q) => {
			this.qTypeDefinitions.set(q.typeName, q);
		});
	}

	public saveWelcomePage(showMessage: boolean): void {
		this.welcomeEditor.updatePageData();
		let wPage: WelcomePage;
		if (this.enableCATI) {
			wPage = this.catiWelcomePage;
		} else {
			wPage = this.welcomePage;
		}

		this.surveyBuilderService.updateWelcomePage(this.surveyId, wPage).subscribe(
			(result) => {
				if (showMessage) {
					this.alertService.showMessage(
						'Success',
						`Welcome page was saved successfully!`,
						MessageSeverity.success
					);
				}
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => { }
		);
		this.surveyBuilderService.updateSurveyStyles(this.surveyId, JSON.stringify(this.pageThemeInfo)).subscribe();
	}

	public saveTAndCPage(showMessage: boolean): void {
		this.privacyPolicyEditor.updatePageData();
		let tcPage: TermsAndConditionsPage;
		if (this.enableCATI) {
			tcPage = this.catiTermsAndConditionsPage;
		} else {
			tcPage = this.termsAndConditionsPage;
		}
		this.surveyBuilderService.updateTermsAndConditionsPage(this.surveyId, tcPage).subscribe(
			(result) => {
				if (showMessage) {
					this.alertService.showMessage(
						'Success',
						`Terms and conditions page was saved successfully!`,
						MessageSeverity.success
					);
				}
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => { }
		);
		this.surveyBuilderService.updateSurveyStyles(this.surveyId, JSON.stringify(this.pageThemeInfo)).subscribe();
	}

	public saveQuestionViewerPage(showMessage: boolean): void {
		this.questionViewerEditor.updatePageData();
		this.surveyBuilderService.updateSurveyStyles(this.surveyId, JSON.stringify(this.pageThemeInfo)).subscribe(
			(result) => {
				if (showMessage) {
					this.alertService.showMessage(
						'Success',
						`Question viewer theme saved successfully!`,
						MessageSeverity.success
					);
				}
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => { }
		);
	}

	public saveThankYouPage(showMessage: boolean): void {
		this.thankYouEditor.updatePageData();
		let tPage: ThankYouPage;
		if (this.enableCATI) {
			tPage = this.catiThankYouPage;
		} else {
			tPage = this.thankYouPage;
		}
		this.surveyBuilderService.updateThankYouPage(this.surveyId, tPage).subscribe(
			(result) => {
				if (showMessage) {
					this.alertService.showMessage(
						'Success',
						`Thank you page was saved successfully!`,
						MessageSeverity.success
					);
				}
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => { }
		);
		this.surveyBuilderService.updateSurveyStyles(this.surveyId, JSON.stringify(this.pageThemeInfo)).subscribe();
	}

	public saveScreeningPage(showMessage: boolean): void {
		this.screeningEditor.updatePageData();
		let sPage: ScreeningQuestions;
		if (this.enableCATI) {
			sPage = this.catiScreeningQuestions;
		} else {
			sPage = this.screeningQuestions;
		}
		this.surveyBuilderService.updateScreeningQuestions(this.surveyId, sPage).subscribe(
			(result) => {
				if (showMessage) {
					this.alertService.showMessage(
						'Success',
						`Screening questions were saved successfully!`,
						MessageSeverity.success
					);
				}
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => { }
		);
	}

	public resetThemeColors(): void {
		this.alertService.showDialog('Are you sure you want to reset all custom colours?', DialogType.confirm, () => {
			this.pageThemeInfo = {};
			this.surveyBuilderService.updateSurveyStyles(this.surveyId, JSON.stringify(this.pageThemeInfo)).subscribe();
		});
	}

	public addQuestionTypeToList(qType: QuestionTypeDefinition): void {
		this.surveyPage.addQuestionTypeToList(qType);
	}

	public switchPage(pageName: string): void {
		this.currentPage = pageName;
		let priorPageId = this.currentSurveyPage ? this.currentSurveyPage.id : -1;

		if (this.surveyPage) {
			this.surveyPage.currentPage = new QuestionPartView();
		}
		if (pageName === 'builder' && this.allPages.length > 0) {
			this.switchSurveyPage(this.allPages[0].id);
		} else if (pageName === 'logic') {
			this._editorData.updateSurveyStructure().subscribe();
		}
		setTimeout(() => {
			if (priorPageId !== -1) {
				let thisPage = <any>$('#' + priorPageId + '-tab');
				thisPage.removeClass('active');
				thisPage.removeClass('show');
			}
		}, 0);
	}

	public switchSurveyPage(pageId: number): void {
		this.currentPage = 'surveyPage';
		let priorPageId = this.currentSurveyPage ? this.currentSurveyPage.id : -1;
		setTimeout(() => {
			if (priorPageId !== -1) {
				let thisPage = <any>$('#' + priorPageId + '-tab');
				thisPage.removeClass('active');
				thisPage.removeClass('show');
			}
			let nextPage = <any>$('#' + pageId + '-tab');
			nextPage.tab('show');
		}, 0);

		this.loadedIndividualPage = false;
		this.surveyBuilderService
			.getQuestionPartViewPageStructure(this.surveyId, pageId, this.currentLanguage)
			.subscribe((page) => {
				console.log(page); 
				this.currentSurveyPage = page;
				this.surveyPage.currentPage = page;
				this.surveyPage.partsLeftToLoad = 1;
				this.surveyPage.updateFullStructure(false);
				this.surveyPage.qPartQuestions = new Map<number, QuestionPartView>();
				page.questionPartViewChildren.forEach((qc) => {
					if (qc.questionPart === null) {
						this.surveyPage.partsLeftToLoad++;
						this.surveyPage.qPartQuestions.set(qc.id, qc);
						this.surveyPage.partsLeftToLoad--;
						/*this.surveyBuilderService
							.getQuestionPartViewPageStructure(this.surveyId, qc.id, this.currentLanguage)
							.subscribe(qPart => {
								qc.questionPartViewChildren = qPart.questionPartViewChildren;
								this.surveyPage.partsLeftToLoad--;
							});*/
					}
				});
				this.loadedIndividualPage = true;
			});
	}

	private navigateToFirst(): void {
		let firstTab = <any>$('#welcome-tab');
		firstTab.tab('show');
		this.currentSurveyPage = undefined;
		this.currentPage = 'welcome';
	}

	public editCurrentPage(): void {
		this.currentSurveyPageEdit = new Survey();
		Object.assign(this.currentSurveyPageEdit, this.currentSurveyPage);
		this.editPageModal.show();
	}

	public savePage(): void {
		// set cati label as the same as standard
		if (this.catiExists) {
			this.currentSurveyPageEdit.catiDependent.label.value = this.currentSurveyPageEdit.label.value;
		}

		this.surveyBuilderService.updateQuestionPartViewData(this.surveyId, this.currentSurveyPageEdit).subscribe(
			(result) => {
				Object.assign(this.currentSurveyPage, this.currentSurveyPageEdit);
				let pageTab = this.allPages.filter((p) => p.id === this.currentSurveyPageEdit.id)[0];
				pageTab.label.value = this.currentSurveyPageEdit.label.value;
				pageTab.icon = this.currentSurveyPageEdit.icon;
				this.editPageModal.hide();
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => {
				this.alertService.showMessage(
					'Error',
					`Problem updating page!\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error
				);
			}
		);
	}

	public deletePage(pageId: number): void {
		this.alertService.showDialog('Are you sure you want to delete the page?', DialogType.confirm, () =>
			this.continueDelete(pageId)
		);
	}

	public continueDelete(pageId: number): void {
		this.surveyBuilderService.deleteStandardPage(this.surveyId, pageId).subscribe(
			(result) => {
				this.loadPageStructure();
				if (pageId === this.currentSurveyPage.id) {
					this.navigateToFirst();
				}
				this.alertService.showMessage('Success', `Page was removed successfully!`, MessageSeverity.success);
				this.editPageModal.hide();
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => {
				this.alertService.showMessage(
					'Error',
					`Problem removing page!\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error
				);
			}
		);
	}

	public createPage(title: string, icon: string): void {
		let newlabel: QuestionPartViewLabel = new QuestionPartViewLabel(0, title, this.currentLanguage);
		let newPage: QuestionPartView = new QuestionPartView(0, newlabel, new QuestionPartViewLabel(0, null, this.currentLanguage), icon);

		this.surveyBuilderService.addStandardPage(this.surveyId, this.currentLanguage, newPage).subscribe(
			(result) => {
				this.loadPageStructure();
				if (this.surveyPage) {
					this.surveyPage.updateFullStructure(true);
				}
				this.alertService.showMessage('Success', `Page was added successfully!`, MessageSeverity.success);
				this.createPageModal.hide();
				this.notificationService.indicateSurveyChange(this.surveyId);
			},
			(error) => {
				this.alertService.showMessage(
					'Error',
					`Problem adding page!\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
					MessageSeverity.error
				);
			}
		);
	}

	public updatePageOrder(): void {
		this.allPages.forEach((page, index) => {
			page.order = index;
		});
	}

	public onDragEnd(event: any): void {
		if (this.lastDragEnter.length !== this.lastDragLeave.length) {
			this.dragResult = new Subject<boolean>();
		}
		this.lastDragEnter = [];
		this.lastDragLeave = [];
	}

	public onDragEnter(): void {
		this.lastDragEnter.push('page-container');
	}

	public onDragLeave(): void {
		this.lastDragLeave.push('page-container');
	}

	public onDrop(dropResult: any): void {
		if (dropResult.addedIndex !== dropResult.removedIndex) {
			this.alertService.showDialog(
				'Are you sure you want to move the page?',
				DialogType.confirm,
				() => this.dragResult.next(true),
				() => this.dragResult.next(false)
			);

			if (this.dragResult) {
				// create shadow list to give illusion of transfer before decision made
				let pageCache = [...this.allPages];
				this.allPages = Utilities.applyDrag(this.allPages, dropResult);
				this.dragResult.subscribe((proceed) => {
					this.dragResult.unsubscribe();
					if (proceed === false) {
						this.allPages = pageCache;
					} else {
						this.updatePageOrder();
						let pagesOrder: Order[] = this.allPages.map((ap) => new Order(ap.id, ap.order));
						this.surveyBuilderService
							.updateStandardViewPageOrder(this.surveyId, pagesOrder, dropResult.payload.id)
							.subscribe(
								(result) => {
									this.surveyPage.updateFullStructure(true);
								},
								(error) => {
									this.allPages = pageCache;
									this.surveyPage.updateFullStructure(true);
								}
							);
						if (this.catiExists) {
							pagesOrder = this.allPages.map((ap) => new Order(ap.catiDependent.id, ap.order));
							this.surveyBuilderService
								.updateCATIViewPageOrder(this.surveyId, pagesOrder, dropResult.payload.id)
								.subscribe(
									(result) => { },
									(error) => {
										this.allPages = pageCache;
									}
								);
						}
					}
					this.dragResult = undefined;
				});
			}
		}
	}

	public getPagePayload(index: number): QuestionPartView {
		return this.allPages[index];
	}

	public toggleSidebarForPreview(): void {
		if (
			this.welcomePagePreview.value === true ||
			this.privacyPagePreview.value === true ||
			this.thankYouPagePreview.value === true ||
			this.questionViewerPreview.value === true
		) {
			$('.content-wrap-builder').addClass('ml-0');
			$('.content-wrap-builder').addClass('remove-left-margin');
			$('.page-controls').addClass('ml-0');
			$('.page-controls').addClass('hide-using-height');
			$('.navbar-brand').addClass('invisible');
			$('.content').addClass('eliminate-content-padding');
			$('.tab-pane').css('margin-top', '-49px');
			$('.tab-pane').addClass('remove-padding');
			$('.nav').addClass('hide-using-height');
			$('.sidebar-toggle-button').addClass('invisible');
			$('.nav-user').addClass('invisible');
			$('.survey-builder-header').addClass('hide-overflow');
			setTimeout(() => {
				$('.sidebar').addClass('d-none');
			}, 500);
		} else {
			$('.content-wrap-builder').removeClass('ml-0');
			$('.content-wrap-builder').removeClass('remove-left-margin');
			$('.page-controls').removeClass('ml-0');
			$('.page-controls').removeClass('hide-using-height');
			$('.navbar-brand').removeClass('invisible');
			$('.content').removeClass('eliminate-content-padding');
			$('.tab-pane').css('margin-top', 'unset');
			$('.tab-pane').removeClass('remove-padding');
			$('.nav').removeClass('hide-using-height');
			$('.sidebar-toggle-button').removeClass('invisible');
			$('.nav-user').removeClass('invisible');
			$('.survey-builder-header').removeClass('hide-overflow');
			$('.sidebar').removeClass('d-none');
		}
	}

	/**
	 *
	 */
	public previewSurvey(event: any): void {
		window.open(`/survey/${this.survey.code}/start`, '_blank');
		event.stopPropagation();
	}
}
