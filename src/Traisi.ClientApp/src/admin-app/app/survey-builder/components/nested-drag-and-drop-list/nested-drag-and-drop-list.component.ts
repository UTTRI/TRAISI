import {
	Component,
	OnInit,
	ViewChild,
	Input,
	HostListener,
	ElementRef,
	AfterViewInit,
	Output,
	EventEmitter,
} from '@angular/core';
import { SurveyBuilderService } from '../../services/survey-builder.service';
import { Observable, Subject, forkJoin } from 'rxjs';
import { AlertService, DialogType, MessageSeverity } from '../../../../../shared/services/alert.service';
import { Utilities } from '../../../../../shared/services/utilities';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { QuestionConfigurationComponent } from '../question-configuration/question-configuration.component';
import { QuestionTypeDefinition } from '../../models/question-type-definition';
import { QuestionPartView } from '../../models/question-part-view.model';
import { QuestionPart } from '../../models/question-part.model';
import { QuestionPartViewLabel } from '../../models/question-part-view-label.model';
import { Order } from '../../models/order.model';
import { TreeviewItem } from 'ngx-treeview';
import { fadeInOut } from '../../../services/animations';
import { SurveyBuilderClient, SBPageStructureViewModel } from '../../services/survey-builder-client.service';
import { RealTimeNotificationServce } from '../../../services/real-time-notification.service';
import { ContainerComponent, DraggableComponent, DropResult } from 'ngx-smooth-dnd';
import { SurveyBuilderEditorData } from 'app/survey-builder/services/survey-builder-editor-data.service';
@Component({
	selector: 'app-nested-drag-and-drop-list',
	templateUrl: './nested-drag-and-drop-list.component.html',
	styleUrls: ['./nested-drag-and-drop-list.component.scss'],
	animations: [fadeInOut],
})
export class QuestionPageDisplayComponent implements OnInit, AfterViewInit {
	public qPartQuestions: Map<number, QuestionPartView> = new Map<number, QuestionPartView>();

	public currentPage: QuestionPartView = new QuestionPartView();
	public configurationModalShowing: boolean = false;
	public addingNewQuestion: boolean = true;
	public dealingWithPart: boolean = false;
	public questionBeingEdited: QuestionPartView;
	public partsLeftToLoad: number = 0;

	private dragResult: Subject<boolean>;
	private dragOverContainer: Object = new Object();
	private lastDragEnter: string[] = [];
	private lastDragLeave: string[] = [];
	private dragDidNotOriginateFromChooser: boolean = false;
	private updateStructure: boolean = true;
	private fullStructure: TreeviewItem[] = [];
	private startingNumber: number = 0;
	private _questionStructure: SBPageStructureViewModel[] = [];
	@Input()
	public surveyId: number;
	@Input()
	public currentLanguage: string;
	@Input()
	public catiEnabled: boolean;

	@Input()
	public householdAdded: boolean = false;
	@Output()
	public householdAddedChange: EventEmitter<boolean> = new EventEmitter();

	@ViewChild('configurationModal', { static: true })
	public configurationModal: ModalDirective;
	@ViewChild('qConfiguration', { static: true })
	public qConfiguration: QuestionConfigurationComponent;

	@HostListener('touchmove', ['$event'])
	public onTouchMove(e: MouseEvent): void {
		// e.preventDefault();
	}

	constructor(
		private _client: SurveyBuilderClient,
		private alertService: AlertService,
		private surveyBuilderService: SurveyBuilderService,
		private elementRef: ElementRef,
		private notificationService: RealTimeNotificationServce,
		private _editorData: SurveyBuilderEditorData
	) {
		this.getQuestionPayload = this.getQuestionPayload.bind(this);
		this.getQuestionInPartPayload = this.getQuestionInPartPayload.bind(this);
	}

	public ngOnInit(): void {
		const sectionType: QuestionTypeDefinition = {
			typeName: 'Survey Part',
			icon: 'fas fa-archive',
			questionOptions: {},
			questionConfigurations: {},
			responseType: null,
			customBuilderViewName: '',
			hasCustomBuilderView: false,
			typeNameLocales: { en: 'Section', fr: 'Section' },
		};
		this._editorData.questionTypeMap.set('Survey Part', sectionType);
	}

	public ngAfterViewInit(): void {
		// this.elementRef.nativeElement.addEventListener('touchmove', event => event.preventDefault());

		this._client.getSurveyViewPagesWithQuestionsAndOptions(this.surveyId, 'Standard', 'en').subscribe({
			next: (model) => {
				this._questionStructure = model;
			},
			error: (error) => {
				console.log(error);
			},
		});
	}

	public updateFullStructure(forceUpdate: boolean = false): void {
		if (this.updateStructure || forceUpdate) {
			forkJoin(
				this.surveyBuilderService.getStandardViewPagesStructureAsTreeItemsWithQuestionsOptions(
					this.surveyId,
					'en'
				),
				this._editorData.updateSurveyStructure()
			).subscribe(([treelist, structure]) => {
				this.fullStructure = this.surveyBuilderService.convertSurveyQuestionsStructureToTreeItems(treelist);
				this._editorData.surveyStructure = <any>structure;
				this.processHouseholdCheck();
				this.householdAddedChange.emit(this.householdAdded);
				this.updateStructure = false;
				this.updateQuestionOffset();
				this._editorData.currentPage = this.currentPage;
			});
		} else {
			this.updateQuestionOffset();
		}
	}

	private updateQuestionOffset(): void {
		this.startingNumber = 0;
		let pageIndex: number = 0;

		while (this.fullStructure[pageIndex].text !== this.currentPage.label.value) {
			if (this.fullStructure[pageIndex].children) {
				this.startingNumber += this.fullStructure[pageIndex].children.length;
			}
			pageIndex++;
		}
	}

	/**
	 *
	 *
	 * @memberof NestedDragAndDropListComponent
	 */
	public processHouseholdCheck(): void {
		this.fullStructure.forEach((page) => {
			if (this.householdAdded === false) {
				this.processHouseholdCheckItems(page.children);
			}
		});
	}

	/**
	 *
	 *
	 * @param {TreeviewItem[]} items
	 * @memberof NestedDragAndDropListComponent
	 */
	public processHouseholdCheckItems(items: TreeviewItem[]): void {
		if (items) {
			items.forEach((item) => {
				if (this.householdAdded === false) {
					if (item.value.split('~')[1] === 'household') {
						this.householdAdded = true;
					} else if (item.children && item.children.length > 0) {
						this.processHouseholdCheckItems(item.children);
					}
				}
			});
		}
	}

	/**
	 *
	 *
	 * @memberof NestedDragAndDropListComponent
	 */
	public configurationShown(): void {
		this.qConfiguration.surveyId = this.surveyId;

		this.qConfiguration.questionBeingEdited = new QuestionPartView();
		this.qConfiguration.questionBeingEdited = JSON.parse(JSON.stringify(this.questionBeingEdited));
		if (!this.qConfiguration.questionBeingEdited.descriptionLabel) {
			this.qConfiguration.questionBeingEdited.descriptionLabel = new QuestionPartViewLabel();
		}
		this.qConfiguration.questionBeingEdited.questionPartViewChildren = this.getQuestionPartViewChildren(
			this.qConfiguration.questionBeingEdited.id
		);
		this.qConfiguration.editing = true;
		this.qConfiguration.newQuestion = this.addingNewQuestion;
		this.qConfiguration.isSaving = false;
		this.qConfiguration.cursorPosition = undefined;
		if (this.questionBeingEdited.questionPart === undefined || this.questionBeingEdited.questionPart === null) {
			this.qConfiguration.questionType = this._editorData.questionTypeMap.get('Survey Part');
		} else {
			this.qConfiguration.questionType = this._editorData.questionTypeMap.get(
				this.questionBeingEdited.questionPart.questionType
			);
		}
		this.configurationModalShowing = true;
		this.qConfiguration.configurationShown();
		this.surveyBuilderService
			.getStandardViewPagesStructureAsTreeItemsWithQuestionsOptions(this.surveyId, 'en')
			.subscribe((treelist) => {
				this.fullStructure = this.surveyBuilderService.convertSurveyQuestionsStructureToTreeItems(treelist);
				this.qConfiguration.fullStructure = this.fullStructure;
				this.qConfiguration.questionStructure = this._questionStructure;
				this.qConfiguration.processConfigurations();
			});
	}

	/**
	 *
	 *
	 * @param {ModalDirective} event
	 * @memberof NestedDragAndDropListComponent
	 */
	public configurationHidden(event: ModalDirective): void {
		if (event.dismissReason === 'esc') {
			this.processConfiguration('cancel');
		}
		this.qConfiguration.editing = false;
		this.qConfiguration.questionBeingEdited = undefined;
		this.qConfiguration.configurations = [];
		this.qConfiguration.questionType = null;
		this.qConfiguration.conditionalsLoaded = false;
	}

	/**
	 *
	 *
	 * @param {*} event
	 * @param {*} question
	 * @memberof NestedDragAndDropListComponent
	 */
	public editQuestionConfiguration(event: any, question: any): void {
		event.stopPropagation();
		this.questionBeingEdited = question;
		this.dragResult = new Subject<boolean>();
		this.addingNewQuestion = false;
		if (question.questionPart === undefined || question.questionPart === null) {
			this.dealingWithPart = true;
		} else {
			this.dealingWithPart = false;
		}
		this.qConfiguration.reset();
		this.configurationModal.show();
	}

	public addQuestionTypeToList(qType: QuestionTypeDefinition): void {
		this.dragResult = new Subject<boolean>();
		this.addingNewQuestion = true;
		if (qType.typeName === 'Survey Part') {
			this.dealingWithPart = true;
		} else {
			this.dealingWithPart = false;
		}
		this.questionBeingEdited = this.generateQuestionViewFromType(qType);
		this.configurationModal.show();
		this.dragResult.asObservable().subscribe((proceed) => {
			if (proceed) {
				this.questionBeingEdited.order = this.currentPage.questionPartViewChildren.length;
				this.addNewQuestionPartView(this.questionBeingEdited, this.currentPage, true);
			}
		});
	}

	public generateQuestionViewFromType(qType: QuestionTypeDefinition): QuestionPartView {
		let newQPart: QuestionPart;
		if (qType.typeName !== 'Survey Part') {
			newQPart = new QuestionPart(0, qType.typeName);
		}
		let newQPartLabel: QuestionPartViewLabel = new QuestionPartViewLabel(0, '', this.currentLanguage);

		let newDescriptionLabel: QuestionPartViewLabel = new QuestionPartViewLabel(0, '', this.currentLanguage);
		let newQPartView: QuestionPartView = new QuestionPartView(
			0,
			newQPartLabel,
			newDescriptionLabel,
			null,
			0,
			[],
			0,
			newQPart
		);
		if (this.catiEnabled) {
			let newCatiQPartLabel: QuestionPartViewLabel = new QuestionPartViewLabel(0, '', this.currentLanguage);
			newQPartView.catiDependent = new QuestionPartView(
				0,

				newCatiQPartLabel
			);
		}
		return newQPartView;
	}

	public addNewQuestionPartView(
		newPartView: QuestionPartView,
		parentView: QuestionPartView,
		addToList: boolean
	): void {
		this.surveyBuilderService
			.addStandardQuestionPartView(this.surveyId, parentView.id, this.currentLanguage, newPartView)
			.subscribe(
				(newQuestion) => {
					this.dragResult.unsubscribe();
					newPartView.id = newQuestion.id;
					newPartView.parentViewId = newQuestion.parentViewId;
					if (newQuestion.catiDependent) {
						newPartView.catiDependent.id = newQuestion.catiDependent.id;
						newPartView.catiDependent.parentViewId = newQuestion.catiDependent.parentViewId;
					}
					if (
						(newQuestion.questionPart === undefined || newQuestion.questionPart === null) &&
						!this.qPartQuestions.has(newQuestion.id)
					) {
						this.qPartQuestions.set(newQuestion.id, newQuestion);
						this.notificationService.indicateSurveyChange(this.surveyId);
					} else {
						newPartView.questionPart = newQuestion.questionPart;
						if (newQuestion.questionPart.questionType === 'household') {
							this.householdAdded = true;
							this.householdAddedChange.emit(this.householdAdded);
						}
						// send advanced configuration
						this.surveyBuilderService
							.updateQuestionPartConfigurations(
								this.surveyId,
								newQuestion.questionPart.id,
								this.qConfiguration.configurationValues
							)
							.subscribe((result) => {
								this.notificationService.indicateSurveyChange(this.surveyId);
							});
					}
					if (addToList) {
						if (parentView === this.currentPage) {
							this.currentPage.questionPartViewChildren.push(newQuestion);
						}
					}
					this.updateStructure = true;
					this.configurationModal.hide();
				},
				(error) => {
					this.alertService.showStickyMessage(
						'Update Error',
						`Unable to add question.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
						MessageSeverity.error,
						error
					);
					this.qConfiguration.isSaving = false;
				}
			);
	}

	public getIcon(questionTypeName: string): string {
		let qType: QuestionTypeDefinition = this._editorData.questionTypeMap.get(questionTypeName);
		return qType.icon;
	}

	public getQuestionPayload(index: number): QuestionPartView {
		// $('.smooth-dnd-draggable-wrapper .collapse.details').collapse('hide');
		// $('.collapse:not(.details)').collapse('show');
		return this.currentPage.questionPartViewChildren[index];
	}

	public getQuestionInPartPayload(part: QuestionPartView): (index: any) => QuestionPartView {
		// $('.smooth-dnd-draggable-wrapper .collapse.details').collapse('hide');
		// $('.collapse:not(.details)').collapse('show');
		return (index) => {
			let test = this.qPartQuestions;
			return this.qPartQuestions.get(part.id).questionPartViewChildren[index];
		};
	}

	public getQuestionPartViewChildren(partId: number): QuestionPartView[] {
		if (this.qPartQuestions.has(partId)) {
			return this.qPartQuestions.get(partId).questionPartViewChildren;
		} else {
			return [];
		}
	}

	public processConfiguration(result: string): void {
		if (result === 'save') {
			Object.assign(this.questionBeingEdited, this.qConfiguration.questionBeingEdited);
			this.saveConfiguration();
		} else if (result === 'cancel') {
			this.configurationModalShowing = false;
			this.cancelConfiguration();
		} else if (result === 'delete') {
			this.configurationModalShowing = false;
			this.deleteQuestion();
		}
	}

	public saveConfiguration(): void {
		if (this.addingNewQuestion) {
			this.dragResult.next(true);
		} else {
			let cleanedQuestion = new QuestionPartView();
			Object.assign(cleanedQuestion, this.questionBeingEdited);
			cleanedQuestion.questionPartViewChildren = null;
			if (this.questionBeingEdited.catiDependent) {
				cleanedQuestion.catiDependent = new QuestionPartView();
				Object.assign(cleanedQuestion.catiDependent, this.questionBeingEdited.catiDependent);
				cleanedQuestion.catiDependent.questionPartViewChildren = null;
			}
			cleanedQuestion.conditionals = this.qConfiguration.getUpdatedConditionals();
			this.surveyBuilderService.updateQuestionPartViewData(this.surveyId, cleanedQuestion).subscribe(
				(result) => {
					this._client
						.updateQuestionConditionals(
							this.surveyId,
							this.questionBeingEdited.id,
							this.qConfiguration.getUpdatedConditionals()
						)
						.subscribe({
							complete: () => {
								this.alertService.showMessage(
									'Success',
									`Question data and configurations updated successfully!`,
									MessageSeverity.success
								);
								this.configurationModal.hide();
							},
							error: (error) => console.error('conditionals not saved'),
						});

					if (this.qConfiguration.configurationValues.length > 0) {
						this.surveyBuilderService
							.updateQuestionPartConfigurations(
								this.surveyId,
								this.questionBeingEdited.questionPart.id,
								this.qConfiguration.configurationValues
							)
							.subscribe(
								(configResult) => {
									// if (
									// 	this.qConfiguration
									// 		.conditionalsComponent
									// ) {
									// 	let [
									// 		qConditionals,
									// 		qoConditionals
									// 	] = this.qConfiguration.getUpdatedConditionals();
									// 	this.surveyBuilderService
									// 		.setQuestionPartConditionals(
									// 			this.surveyId,
									// 			this.questionBeingEdited
									// 				.questionPart.id,
									// 			qConditionals
									// 		)
									// 		.subscribe(
									// 			condResult => {
									// 				this.surveyBuilderService
									// 					.setQuestionPartOptionConditionals(
									// 						this.surveyId,
									// 						this
									// 							.questionBeingEdited
									// 							.questionPart
									// 							.id,
									// 						qoConditionals
									// 					)
									// 					.subscribe(
									// 						oCondResult => {
									// 							this.alertService.showMessage(
									// 								"Success",
									// 								`Question data, configurations and conditionals updated successfully!`,
									// 								MessageSeverity.success
									// 							);
									// 							this.configurationModal.hide();
									// 							this.notificationService.indicateSurveyChange(
									// 								this
									// 									.surveyId
									// 							);
									// 						},
									// 						error => {
									// 							this.alertService.showStickyMessage(
									// 								"Update Error",
									// 								`Unable to update question configurations.\r\nErrors: "${Utilities.getHttpResponseMessage(
									// 									error
									// 								)}"`,
									// 								MessageSeverity.error,
									// 								error
									// 							);
									// 							this.qConfiguration.isSaving = false;
									// 							this.notificationService.indicateSurveyChange(
									// 								this
									// 									.surveyId
									// 							);
									// 						}
									// 					);
									// 			},
									// 			error => {
									// 				this.alertService.showStickyMessage(
									// 					"Update Error",
									// 					`Unable to update question configurations.\r\nErrors: "${Utilities.getHttpResponseMessage(
									// 						error
									// 					)}"`,
									// 					MessageSeverity.error,
									// 					error
									// 				);
									// 				this.qConfiguration.isSaving = false;
									// 				this.notificationService.indicateSurveyChange(
									// 					this.surveyId
									// 				);
									// 			}
									// 		); */
									// } else {
									// 	this.alertService.showMessage(
									// 		"Success",
									// 		`Question data and configurations updated successfully!`,
									// 		MessageSeverity.success
									// 	);
									// 	this.configurationModal.hide();
									// 	this.notificationService.indicateSurveyChange(
									// 		this.surveyId
									// 	);
									// } */
								},
								(error) => {
									this.alertService.showStickyMessage(
										'Update Error',
										`Unable to update question configurations.\r\nErrors: "${Utilities.getHttpResponseMessage(
											error
										)}"`,
										MessageSeverity.error,
										error
									);
									this.qConfiguration.isSaving = false;
									this.notificationService.indicateSurveyChange(this.surveyId);
								}
							);
					} else {
						// if (this.qConfiguration.conditionalsComponent) {
						// 	let [
						// 		qConditionals,
						// 		qoConditionals
						// 	] = this.qConfiguration.getUpdatedConditionals();
						// 	this.surveyBuilderService
						// 		.setQuestionPartConditionals(
						// 			this.surveyId,
						// 			this.questionBeingEdited.questionPart
						// 				.id,
						// 			qConditionals
						// 		)
						// 		.subscribe(
						// 			condResult => {
						// 				this.surveyBuilderService
						// 					.setQuestionPartOptionConditionals(
						// 						this.surveyId,
						// 						this.questionBeingEdited
						// 							.questionPart.id,
						// 						qoConditionals
						// 					)
						// 					.subscribe(
						// 						oCondResult => {
						// 							this.alertService.showMessage(
						// 								"Success",
						// 								`Question data, configurations and conditionals updated successfully!`,
						// 								MessageSeverity.success
						// 							);
						// 							this.configurationModal.hide();
						// 							this.notificationService.indicateSurveyChange(
						// 								this.surveyId
						// 							);
						// 						},
						// 						error => {
						// 							this.alertService.showStickyMessage(
						// 								"Update Error",
						// 								`Unable to update question configurations.\r\nErrors: "${Utilities.getHttpResponseMessage(
						// 									error
						// 								)}"`,
						// 								MessageSeverity.error,
						// 								error
						// 							);
						// 							this.qConfiguration.isSaving = false;
						// 							this.notificationService.indicateSurveyChange(
						// 								this.surveyId
						// 							);
						// 						}
						// 					);
						// 			},
						// 			error => {
						// 				this.alertService.showStickyMessage(
						// 					"Update Error",
						// 					`Unable to update question configurations.\r\nErrors: "${Utilities.getHttpResponseMessage(
						// 						error
						// 					)}"`,
						// 					MessageSeverity.error,
						// 					error
						// 				);
						// 				this.qConfiguration.isSaving = false;
						// 				this.notificationService.indicateSurveyChange(
						// 					this.surveyId
						// 				);
						// 			}
						// 		);
						// } else {
						// 	this.alertService.showMessage(
						// 		"Success",
						// 		`Question data and configurations updated successfully!`,
						// 		MessageSeverity.success
						// 	);
						// 	this.configurationModal.hide();
						// 	this.notificationService.indicateSurveyChange(
						// 		this.surveyId
						// 	);
						// }
					}
				},
				(error) => {
					this.alertService.showStickyMessage(
						'Update Error',
						`Unable to update question data.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
						MessageSeverity.error,
						error
					);
					this.qConfiguration.isSaving = false;
				}
			);
		}
	}

	public cancelConfiguration(): void {
		if (this.addingNewQuestion) {
			this.dragResult.next(false);
		}
		this.configurationModal.hide();
	}

	public deleteQuestion(): void {
		this.alertService.showDialog('Are you sure you want to delete the question?', DialogType.confirm, () =>
			this.continueDelete()
		);
		this.configurationModal.hide();
	}

	public continueDelete(): void {
		this.surveyBuilderService
			.deleteQuestionPartView(this.surveyId, this.questionBeingEdited.parentViewId, this.questionBeingEdited.id)
			.subscribe((result) => {
				let dropResult = {
					removedIndex: this.questionBeingEdited.order,
					addedIndex: null,
					payload: this.questionBeingEdited,
				};
				if (this.currentPage.id === this.questionBeingEdited.parentViewId) {
					this.currentPage.questionPartViewChildren = Utilities.applyDrag(
						this.currentPage.questionPartViewChildren,
						dropResult
					);
					if (
						this.questionBeingEdited.questionPart &&
						this.questionBeingEdited.questionPart.questionType === 'household'
					) {
						this.householdAdded = false;
						this.householdAddedChange.emit(this.householdAdded);
					}
					this.updateQuestionOrder(this.currentPage);
				} else {
					let parentView = this.qPartQuestions.get(this.questionBeingEdited.parentViewId);
					parentView.questionPartViewChildren = Utilities.applyDrag(
						parentView.questionPartViewChildren,
						dropResult
					);
					this.updateQuestionOrder(parentView);
				}
				this.notificationService.indicateSurveyChange(this.surveyId);
			});
	}

	public updateQuestionOrder(parentView: QuestionPartView): void {
		parentView.questionPartViewChildren.forEach((q, index) => (q.order = index));
		this.updateStructure = true;
	}

	public onDragEnd(event: { isSource: boolean; payload: any; willAcceptDrop: boolean }): void {
		if (this.lastDragEnter.length !== this.lastDragLeave.length) {
			this.dragResult = new Subject<boolean>();
			if (!this.dragDidNotOriginateFromChooser) {
				this.addingNewQuestion = true;
				this.questionBeingEdited = this.generateQuestionViewFromType(event.payload);
				if (event.payload.typeName === 'Survey Part') {
					this.dealingWithPart = true;
				} else {
					this.dealingWithPart = false;
				}
				this.configurationModal.show();
			} else {
				this.addingNewQuestion = false;
				this.questionBeingEdited = event.payload;
				setTimeout(() => {
					this.dragResult.next(true);
				}, 0);
			}
		}
		this.lastDragEnter = [];
		this.lastDragLeave = [];
		this.dragDidNotOriginateFromChooser = false;
		this.dragOverContainer = new Object();
	}

	public onDragStart(event: { isSource: boolean; payload: any; willAcceptDrop: boolean }): void {
		this.dragDidNotOriginateFromChooser = this.dragDidNotOriginateFromChooser || event.isSource;
	}

	public onDragEnter(containerName: string): void {
		this.lastDragEnter.push(containerName);
		this.dragOverContainer[containerName] = true;
	}

	public onDragLeave(containerName: string): void {
		this.lastDragLeave.push(containerName);
		this.dragOverContainer[containerName] = false;
	}

	public getCharFromIndex(index: number): string {
		return String.fromCharCode(65 + index);
	}

	public onDrop(dropResult: DropResult): void {
		if (this.dragResult) {
			// create shadow list to give illusion of transfer before decision made
			let pageQuestionsCache = [...this.currentPage.questionPartViewChildren];
			this.proceedWithDrop(dropResult);
			this.dragResult.subscribe((proceed) => {
				if (proceed === false) {
					this.currentPage.questionPartViewChildren = pageQuestionsCache;
					this.questionBeingEdited = undefined;
					this.dragResult.unsubscribe();
				} else if (dropResult.addedIndex !== null) {
					this.updateQuestionOrder(this.currentPage);
					if (dropResult.removedIndex === null && dropResult.addedIndex !== null) {
						this.questionBeingEdited.order = dropResult.addedIndex;
						this.addNewQuestionPartView(this.questionBeingEdited, this.currentPage, false);
					} else if (dropResult.addedIndex !== null) {
						this.dragResult.unsubscribe();
						let questionsOrder: Order[] = this.currentPage.questionPartViewChildren.map(
							(q) => new Order(q.id, q.order)
						);
						this.surveyBuilderService
							.updateStandardQuestionPartViewOrder(
								this.surveyId,
								this.currentPage.id,
								questionsOrder,
								this.questionBeingEdited.id
							)
							.subscribe((result) => {
								this.notificationService.indicateSurveyChange(this.surveyId);
							});
						if (this.catiEnabled) {
							questionsOrder = this.currentPage.questionPartViewChildren.map(
								(q) => new Order(q.catiDependent.id, q.order)
							);
							this.surveyBuilderService
								.updateCATIQuestionPartViewOrder(
									this.surveyId,
									this.currentPage.catiDependent.id,
									questionsOrder,
									this.questionBeingEdited.catiDependent.id
								)
								.subscribe();
						}
					}
				}
			});
		}
	}

	public proceedWithDrop(dropResult: DropResult): void {
		dropResult.payload = this.questionBeingEdited;
		this.currentPage.questionPartViewChildren = Utilities.applyDrag(
			this.currentPage.questionPartViewChildren,
			dropResult
		);
	}

	/**
	 *
	 * @param partId
	 * @param dropResult
	 */
	public onDropInPart(partId: number, dropResult: DropResult): void {
		if (this.dragResult) {
			if (partId !== dropResult.payload.id) {
				let questionPart = this.qPartQuestions.get(partId);
				let partQuestionsCache = [...questionPart.questionPartViewChildren];
				dropResult.payload = this.questionBeingEdited;
				questionPart.questionPartViewChildren = Utilities.applyDrag(
					questionPart.questionPartViewChildren,
					dropResult
				);
				this.dragResult.subscribe((proceed) => {
					if (proceed === false) {
						questionPart.questionPartViewChildren = partQuestionsCache;
						this.dragResult.unsubscribe();
					} else {
						this.updateQuestionOrder(questionPart);
						if (dropResult.removedIndex === null && dropResult.addedIndex !== null) {
							this.questionBeingEdited.order = dropResult.addedIndex;
							this.addNewQuestionPartView(this.questionBeingEdited, questionPart, false);
						} else if (dropResult.addedIndex !== null) {
							this.dragResult.unsubscribe();
							let questionsOrder: Order[] = questionPart.questionPartViewChildren.map(
								(q) => new Order(q.id, q.order)
							);
							this.surveyBuilderService
								.updateStandardQuestionPartViewOrder(
									this.surveyId,
									partId,
									questionsOrder,
									this.questionBeingEdited.id
								)
								.subscribe((result) => {
									this.notificationService.indicateSurveyChange(this.surveyId);
								});
							if (this.catiEnabled) {
								questionsOrder = questionPart.questionPartViewChildren.map(
									(q) => new Order(q.catiDependent.id, q.order)
								);
								this.surveyBuilderService
									.updateCATIQuestionPartViewOrder(
										this.surveyId,
										questionPart.catiDependent.id,
										questionsOrder,
										this.questionBeingEdited.catiDependent.id
									)
									.subscribe();
							}
						}
					}
				});
			}
		}
	}

	public shouldAcceptDrop(sourceContainerOptions: any, payload: any): boolean {
		if (sourceContainerOptions.groupName.indexOf('optionlist') >= 0) {
			return false;
		}
		return true;
	}

	public shouldAcceptDropPart(sourceContainerOptions: any, payload: any): boolean {
		if (sourceContainerOptions.groupName.indexOf('optionlist') >= 0) {
			return false;
		}
		if (sourceContainerOptions.behaviour === 'copy') {
			if (payload.typeName === 'Survey Part' || payload.typeName === 'household') {
				return false;
			} else {
				return true;
			}
		} else {
			if (payload.questionPart === undefined || payload.questionPart === null) {
				return false;
			} else if (payload.questionPart.questionType === 'household') {
				return false;
			} else {
				return true;
			}
		}
	}
}
