import {
	Component,
	OnInit,
	Output,
	EventEmitter,
	ViewChildren,
	ViewContainerRef,
	QueryList,
	ComponentFactoryResolver,
	ChangeDetectorRef,
	AfterViewInit,
	ViewChild,
	ViewEncapsulation,
	Input,
} from '@angular/core';
import { QuestionTypeDefinition } from '../../models/question-type-definition';
import { QuestionPartView } from '../../models/question-part-view.model';
import { AuthService } from '../../../../../shared/services/auth.service';
import { ConfigurationService } from '../../../../../shared/services/configuration.service';
import { CheckboxComponent } from './checkbox-field/checkbox.component';
import { QuestionConfigurationDefinition } from '../../models/question-configuration-definition.model';
import { DateInputComponent } from './date-input-field/date-input.component';
import { DropdownListComponent } from './dropdown-list-field/dropdown-list.component';
import { MultiSelectComponent } from './multi-select-field/multi-select.component';
import { TextboxComponent } from './textbox-field/textbox.component';
import { TextAreaComponent } from './textarea-field/textarea.component';
import { NumericTextboxComponent } from './numeric-textbox-field/numeric-textbox.component';
import { SliderComponent } from './slider-field/slider.component';
import { SwitchComponent } from './switch-field/switch.component';
import { TimeInputComponent } from './time-input-field/time-input.component';
import { LocationFieldComponent } from './location-field/location.component';
import { RadioComponent } from './radio-field/radio.component';
import { SurveyBuilderService } from '../../services/survey-builder.service';
import { QuestionConfigurationValue } from '../../models/question-configuration-value.model';
import { TreeviewItem, TreeviewI18nDefault, TreeviewSelection } from 'ngx-treeview';
import { QuestionConditional } from '../../models/question-conditional.model';
import { QuestionOptionConditional } from '../../models/question-option-conditional.model';
import { QuestionConditionalsComponent } from './question-conditionals/question-conditionals.component';
import Quill from 'quill';
import { DropdownTreeviewSelectComponent } from '../../../shared/dropdown-treeview-select/dropdown-treeview-select.component';
import { DropdownTreeviewSelectI18n } from '../../../shared/dropdown-treeview-select/dropdown-treeview-select-i18n';
import { QuestionOptionValue } from '../../models/question-option-value.model';
import { Router } from '@angular/router';
import {
	SBPageStructureViewModel,
	SurveyLogicRulesModel,
	SurveyBuilderClient,
} from 'app/survey-builder/services/survey-builder-client.service';
import { QuestionResponseType } from 'app/survey-builder/models/question-response-type.enum';
import { SurveyBuilderEditorData } from 'app/survey-builder/services/survey-builder-editor-data.service';
import { QuestionConditionalOperator } from 'app/survey-builder/models/question-conditional-operator.model';
import { SurveyLogic } from 'app/survey-builder/models/survey-logic.model';
import { Observable, of, from } from 'rxjs';
import { SurveyLogicQueryBuilderComponent } from '../survey-logic-query-builder/survey-logic-query-builder.component';
import { filter, tap, toArray } from 'rxjs/operators';

// override p with div tag
const Parchment = Quill.import('parchment');
let Block = Parchment.query('block');

class NewBlock extends Block {}
NewBlock['tagName'] = 'DIV';
Quill.register(NewBlock, true);

@Component({
	selector: 'app-question-configuration',
	templateUrl: './question-configuration.component.html',
	styleUrls: ['./question-configuration.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class QuestionConfigurationComponent implements OnInit, AfterViewInit {
	public surveyId: number;

	public questionType: QuestionTypeDefinition;
	public questionBeingEdited: QuestionPartView;
	public editing: boolean = false;

	public newQuestion: boolean = true;

	public configurations: QuestionConfigurationDefinition[] = [];

	public configurationValues: QuestionConfigurationValue[] = [];

	public sourceQuestionConditionals: QuestionConditional[] = [];

	public conditionalOperators: QuestionConditionalOperator[] = [];

	public sourceQuestionOptionConditionals: QuestionOptionConditional[] = [];
	public questionStructure: SBPageStructureViewModel[] = [];

	public questionOptions: Map<string, QuestionOptionValue[]> = new Map<string, QuestionOptionValue[]>();

	public childrenComponents = [];

	public fullStructure: TreeviewItem[] = [];
	public questionOptionsAfter: TreeviewItem[] = [];
	public questionsBefore: QuestionPartView[] = [];
	public repeatSourcesBefore: TreeviewItem[] = [];
	public thisQuestion: TreeviewItem[] = [];
	public householdExistsBefore: boolean = false;

	public treedropdownSingleConfig = {
		hasAllCheckBox: false,
		hasFilter: false,
		hasCollapseExpand: false,
		decoupleChildFromParent: false,
		maxHeight: 500,
	};

	public cursorPosition: number;
	public catiCursorPosition: number;

	public conditionalsLoaded: boolean = false;
	public isSaving: boolean = false;

	public conditionalSource: Observable<SurveyLogicRulesModel[]>;

	public quillQuestionTextModules = {
		toolbar: [
			['bold', 'italic', 'underline'], // toggled buttons
			[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
			[{ header: [1, 2, 3, 4, 5, 6, false] }],
			[{ color: [] }], // dropdown with defaults from theme
			[{ align: [] }],
			['clean'], // remove formatting button
		],
	};

	@Input()
	public language: string;

	@Output()
	public configResult = new EventEmitter<string>();

	@ViewChild('conditionals', { static: false })
	public conditionalsComponent: QuestionConditionalsComponent;

	@ViewChild('pipeTreeSelect')
	public pipeTreeSelect: DropdownTreeviewSelectComponent;

	@ViewChild('catiPipeTreeSelect')
	public catiPipeTreeSelect: DropdownTreeviewSelectComponent;

	private questionQuillEditor: any;
	private catiQuestionQuillEditor: any;

	protected sourceQuestionList: Array<QuestionPartView> = [];

	@ViewChildren('dynamic', { read: ViewContainerRef })
	public configTargets: QueryList<ViewContainerRef>;

	@ViewChild('queryBuilder')
	public queryBuilder: SurveyLogicQueryBuilderComponent;

	public repeatQuestionList: Observable<QuestionPartView[]>;

	constructor(
		private builderService: SurveyBuilderService,
		private componentFactoryResolver: ComponentFactoryResolver,
		private cDRef: ChangeDetectorRef,
		private _router: Router,
		private _editorData: SurveyBuilderEditorData,
		private _builder: SurveyBuilderClient
	) {}

	public ngOnInit(): void {
		// this.conditionalSource = this._builder.getQuestionLogic(this._editorData.surveyId, this.questionBeingEdited.id, this._editorData.activeLanguage);
		this.repeatQuestionList = from([]);
	}

	public reset(): void {
		//  this._router.navigate( ['#basic']);
	}

	public pipeDropdown(e: TreeviewSelection): string {
		let selected = (<DropdownTreeviewSelectI18n>this.pipeTreeSelect.i18n).selectedItem;
		return selected !== undefined && selected !== null ? selected.text : 'Pipe Question';
	}

	public catiPipeDropdown(e: TreeviewSelection): string {
		let selected = (<DropdownTreeviewSelectI18n>this.catiPipeTreeSelect.i18n).selectedItem;
		return selected !== undefined && selected !== null ? selected.text : 'Pipe Question';
	}

	public ngAfterViewInit() {
		// this.updateAdvancedParams();
		setTimeout(() => {
			this.configTargets.changes.subscribe((item) => {
				this.updateAdvancedParams();
			});
		}, 200);
	}

	public questiontextEditorCreated(quillInstance: any) {
		this.questionQuillEditor = quillInstance;
	}

	public catiQuestiontextEditorCreated(quillInstance: any) {
		this.catiQuestionQuillEditor = quillInstance;
	}

	public updateAdvancedParams() {
		const paramComponents = this.parameterComponents();
		this.childrenComponents = [];
		if (this.configurations.length > 0) {
			this.builderService
				.getQuestionPartConfigurations(this.surveyId, this.questionBeingEdited.questionPart.id)
				.subscribe((configurationValues) => {
					for (let i = 0; i < this.configTargets.toArray().length; i++) {
						let conf = this.configurations[i];
						let component = paramComponents.find((c) => c.id === conf.builderType)?.component;

						if (component) {
							let target = this.configTargets.toArray()[i];
							target.clear();
							let paramComponent = this.componentFactoryResolver.resolveComponentFactory(component);

							let cmpRef: any = target.createComponent(paramComponent);

							cmpRef.instance.id = i;
							cmpRef.instance.questionConfiguration = conf;

							if (configurationValues.has(conf.name)) {
								cmpRef.instance.processPriorValue(configurationValues.get(conf.name));
							}
							this.childrenComponents.push(cmpRef);
						}
					}
				});
		}
	}

	public repeatSourceChanged(event: QuestionPartView): void {
		console.log(event);
		if (event) {
			this.questionBeingEdited.repeatSourceQuestionName = event.questionPart.name + '~' + event.questionPart.id;
		} else {
			this.questionBeingEdited.repeatSourceQuestionName = null;
		}
	}

	public parameterComponents(): Array<any> {
		let widgetComponents = [
			{ id: 'Checkbox', component: CheckboxComponent },
			{ id: 'DateInput', component: DateInputComponent },
			{ id: 'SingleSelect', component: DropdownListComponent },
			{ id: 'MultiSelect', component: MultiSelectComponent },
			{ id: 'Textbox', component: TextboxComponent },
			{ id: 'TextAreaa', component: TextAreaComponent },
			{ id: 'NumericText', component: NumericTextboxComponent },
			{ id: 'Slider', component: SliderComponent },
			{ id: 'Switch', component: SwitchComponent },
			{ id: 'TimeInput', component: TimeInputComponent },
			{ id: 'LocationField', component: LocationFieldComponent },
			{ id: 'Radio', component: RadioComponent },
		];

		return widgetComponents;
	}

	public advancedConfig() {
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 0);
	}

	public saveConfiguration(): void {
		this.configurationValues = [];
		this.childrenComponents.forEach((compRef) => {
			let config = new QuestionConfigurationValue(
				compRef.instance.questionConfiguration.name,
				compRef.instance.getValue()
			);
			this.configurationValues.push(config);
		});
		this.isSaving = true;
		this.configResult.emit('save');
	}

	public getUpdatedConditionals(): QuestionConditionalOperator[] {
		if (this.conditionalsComponent) {
			return this.conditionalsComponent.getUpdatedConditionals();
		} else {
			return [];
		}
	}

	public cancel() {
		this.configResult.emit('cancel');
	}

	public delete() {
		this.configResult.emit('delete');
	}

	public pipeQuestion() {
		let pipeQSelected = (<DropdownTreeviewSelectI18n>this.pipeTreeSelect.i18n).selectedItem;
		if (pipeQSelected) {
			let currentCursorPosition = this.cursorPosition;
			if (currentCursorPosition === undefined) {
				currentCursorPosition = this.questionQuillEditor.getLength() - 1;
			}
			this.questionQuillEditor.insertText(currentCursorPosition, `{{ ${pipeQSelected.text} }}`);
			this.cursorPosition += pipeQSelected.text.length + 6;
			this.questionQuillEditor.setSelection(this.cursorPosition);
			this.questionQuillEditor.focus();
			(<DropdownTreeviewSelectI18n>this.pipeTreeSelect.i18n).selectedItem = undefined;
			this.pipeTreeSelect.value = undefined;
		}
	}

	public pipeCatiQuestion() {
		let pipeQSelected = (<DropdownTreeviewSelectI18n>this.catiPipeTreeSelect.i18n).selectedItem;
		if (pipeQSelected) {
			let currentCursorPosition = this.catiCursorPosition;
			if (currentCursorPosition === undefined) {
				currentCursorPosition = this.catiQuestionQuillEditor.getLength() - 1;
			}
			this.catiQuestionQuillEditor.insertText(currentCursorPosition, `{{ ${pipeQSelected.text} }}`);
			this.catiCursorPosition += pipeQSelected.text.length + 6;
			this.catiQuestionQuillEditor.setSelection(this.catiCursorPosition);
			this.catiQuestionQuillEditor.focus();
			(<DropdownTreeviewSelectI18n>this.catiPipeTreeSelect.i18n).selectedItem = undefined;
			this.catiPipeTreeSelect.value = undefined;
		}
	}

	public repeatQuestion(enabled: boolean) {
		if (!enabled) {
			this.questionBeingEdited.repeatSourceQuestionName = null;
		} else {
			//let repeatQSelected = (<DropdownTreeviewSelectI18n>this.repeatTreeSelect.i18n).selectedItem;
			//if (repeatQSelected) {
			//	this.questionBeingEdited.repeatSourceQuestionName = repeatQSelected.value;
			//} else {
			//	this.questionBeingEdited.repeatSourceQuestionName = null;
			//}
		}
	}

	public recordCursor(selection: any) {
		let newPosition = selection.range;
		if (newPosition !== null) {
			this.cursorPosition = newPosition.index;
		}
	}

	public recordCatiCursor(selection: any) {
		let newPosition = selection.range;
		if (newPosition !== null) {
			this.catiCursorPosition = newPosition.index;
		}
	}

	public updateCursorOnType() {
		if (this.questionQuillEditor === undefined) {
			return;
		}
		let selection = this.questionQuillEditor.getSelection();
		if (selection) {
			this.cursorPosition = this.questionQuillEditor.getSelection().index;
		}
	}

	public updateCatiCursorOnType() {
		let selection = this.catiQuestionQuillEditor.getSelection();
		if (selection) {
			this.catiCursorPosition = this.catiQuestionQuillEditor.getSelection().index;
		}
	}

	public processConfigurations() {
		this.configurations = Object.values(this.questionType.questionConfigurations);

		this.processQuestionTree();
		if (this.questionType.typeName !== 'Survey Part') {
			if (!this.newQuestion) {
				this.loadPastConditionals();
			}
		}
		// this.repeatTreeSelect.value = this.questionBeingEdited.repeatSourceQuestionName;
		setTimeout(() => {
			if (this.pipeTreeSelect) {
				this.pipeTreeSelect.i18n.getText = (e) => this.pipeDropdown(e);
			}
			if (this.catiPipeTreeSelect) {
				this.catiPipeTreeSelect.i18n.getText = (e) => this.pipeDropdown(e);
			}
		}, 0);

		this.questionOptions = new Map<string, QuestionOptionValue[]>();

		if (this.questionBeingEdited.questionPart) {
			let qOptions = this._editorData.questionTypeMap.get(this.questionBeingEdited.questionPart.questionType)
				.questionOptions;
			Object.keys(qOptions).forEach((q) => {
				this.questionOptions.set(q, []);
			});

			this.builderService
				.getQuestionPartOptions(this.surveyId, this.questionBeingEdited.questionPart.id, this.language)
				.subscribe(
					(options) => {
						if (options !== null) {
							options.forEach((option) => {
								this.questionOptions.get(option.name).push(option);
							});
						}
					},
					(error) => {}
				);
		}
	}

	private loadPastConditionals() {
		this.builderService
			.getQuestionPartConditionals(this.surveyId, this.questionBeingEdited.id)
			.subscribe((conditionals) => {
				this.conditionalOperators = conditionals;
				this.conditionalsLoaded = true;
				// this.builderService
				// 	.getQuestionPartOptionConditionals(
				// 		this.surveyId,
				// 		this.questionBeingEdited.questionPart.id
				// 	)
				// 	.subscribe(oConditionals => {

				// 		this.sourceQuestionConditionals = conditionals.filter(
				// 			c =>
				// 				c.sourceQuestionId ===
				// 				this.questionBeingEdited.questionPart.id
				// 		);
				// 		this.sourceQuestionOptionConditionals = oConditionals.filter(
				// 			c =>
				// 				c.sourceQuestionId ===
				// 				this.questionBeingEdited.questionPart.id
				// 		);
				// 		this.conditionalsLoaded = true;
				// 	});
			});
	}

	private getQuestionResponseType(typeValue: string): QuestionResponseType {
		let questionType = typeValue.split('~')[1];
		return this._editorData.questionTypeMap.get(questionType).responseType;
	}

	private getQuestionType(typeValue: string): string {
		let questionType = typeValue.split('~')[1];
		return this._editorData.questionTypeMap.get(questionType).typeName;
	}

	private allowAsRepeatSource(typeValue: string): boolean {
		let responseType = this._editorData.questionTypeMap.get(typeValue)?.responseType;
		if (responseType === QuestionResponseType.Number) {
			return true;
		} else if (responseType === QuestionResponseType.Timeline) {
			return true;
		} else {
			return false;
		}
	}

	private isHouseholdSource(typeValue: string): boolean {
		let questionType = this.getQuestionType(typeValue);
		if (questionType === 'household') {
			return true;
		} else {
			return false;
		}
	}

	/**
	 *
	 */
	public allowConditionals(): boolean {
		if (this.questionType.typeName === 'Survey Part') {
			return false;
		} else if (
			this.questionType.responseType === QuestionResponseType.OptionSelect ||
			this.questionType.responseType === QuestionResponseType.OptionList
		) {
			if (this.thisQuestion[0] && this.thisQuestion[0].children) {
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	}

	// private getOptionResponseType(questionTypeValue: string, optionTypeValue: string): string {}

	private processQuestionTree() {
		this.questionsBefore = [];
		this.questionOptionsAfter = [];
		this.repeatSourcesBefore = [];
		this.householdExistsBefore = false;
		this.sourceQuestionList = [];
		this.thisQuestion = [];
		let questionHitThisPage: boolean = false;
		let questionBreak = '';
		if (
			this.questionType.typeName === 'Survey Part' &&
			this.questionBeingEdited.questionPartViewChildren.length > 0
		) {
			questionBreak = `question~${this.questionBeingEdited.questionPartViewChildren[0].questionPart.questionType}~${this.questionBeingEdited.questionPartViewChildren[0].questionPart.id}`;
		} else if (this.questionType.typeName !== 'Survey Part') {
			questionBreak = `question~${this.questionType.typeName}~${this.questionBeingEdited.questionPart.id}`;
		}

		this.fullStructure.forEach((treeElement) => {
			let page = {
				value: treeElement.value,
				text: treeElement.text,
				checked: false,
				children: [],
			};

			if (treeElement.children) {
				let sectionName = '';
				if (this.questionType.typeName === 'Survey Part') {
					sectionName = `part~${this.questionBeingEdited.id}`;
				}
				let { pageReturn, questionHitReturn } = this.processQuestionPageIntoTree(
					page,
					treeElement,
					questionHitThisPage,
					questionBreak,
					sectionName
				);
				page = pageReturn;
				questionHitThisPage = questionHitReturn;
			}
			if (questionHitThisPage && page.children.length > 0) {
				this.questionOptionsAfter.push(new TreeviewItem(page));
			} else if (page.children.length > 0) {
				// this.questionsBefore.push(new TreeviewItem(page));
			}
		});

		for (let page of this._editorData.surveyStructure.pages) {
			this.processSourceConditionalsPage(page, 0);
		}
	}

	/**
	 * Processes the survey questions and creates a candidate list of source conditionals
	 */
	private processSourceConditionalsPage(view: QuestionPartView, depth: number): void {
		// loop through the question structure and add to a list of possible questions
		if (this.questionBeingEdited.id === view.id) {
			return;
		}
		if (depth > 0) {
			this.sourceQuestionList.push(view);
		}
		if (view.questionPartViewChildren !== null) {
			for (let childView of view.questionPartViewChildren) {
				this.processSourceConditionalsPage(childView, depth + 1);
			}
		}
	}
	private processQuestionPageIntoTree(
		page: any,
		treeElement: TreeviewItem,
		questionHit: boolean,
		questionBreak: string,
		sectionBreak: string
	) {
		let repeatSources = [];
		for (let element of treeElement.children) {
			if (element.value === questionBreak) {
				this.thisQuestion = [element];

				this.repeatSourcesBefore = repeatSources;
				if (page.children.length > 0) {
					//this.questionsBefore.push(new TreeviewItem(page));
					page = {
						value: treeElement.value,
						text: treeElement.text,
						checked: false,
						children: [],
					};
				}
				questionHit = true;
			} else {
				if (element.value === sectionBreak) {
					this.repeatSourcesBefore = repeatSources;
					if (page.children.length > 0) {
						//this.questionsBefore.push(new TreeviewItem(page));
						page = {
							value: treeElement.value,
							text: treeElement.text,
							checked: false,
							children: [],
						};
					}
					questionHit = true;
				}

				if (!questionHit && element.children) {
					if ((<string>element.children[0].value).startsWith('option')) {
						this.clearOptionsFromElement(element);
					}
				}

				let elementCopy = {
					value: element.value,
					text: element.text,
					checked: false,
					children: [],
				};
				if (element.children) {
					let { pageReturn, partReturn, questionHitReturn } = this.processQuestionPartIntoTree(
						page,
						element,
						elementCopy,
						questionHit,
						questionBreak,
						element.value === sectionBreak
					);
					page = pageReturn;
					elementCopy = partReturn;
					questionHit = questionHitReturn;
				}
				if (!((<string>element.value).startsWith('part') && elementCopy.children.length === 0)) {
					page.children.push(new TreeviewItem(elementCopy));
				}
				if (
					!(<string>element.value).startsWith('part') &&
					!questionHit &&
					this.allowAsRepeatSource(element.value)
				) {
					repeatSources.push(new TreeviewItem(elementCopy));
				}
				if (
					!(<string>element.value).startsWith('part') &&
					!questionHit &&
					this.isHouseholdSource(element.value)
				) {
					this.householdExistsBefore = true;
				}
			}
		}
		return { pageReturn: page, questionHitReturn: questionHit };
	}

	private processQuestionPartIntoTree(
		page: any,
		partSource: TreeviewItem,
		part,
		questionHit: boolean,
		questionBreak: string,
		ignoreRepeat: boolean
	) {
		let repeatSources = [];
		for (let element of partSource.children) {
			if (element.value === questionBreak) {
				this.thisQuestion = [element];
				if (!ignoreRepeat) {
					this.repeatSourcesBefore = repeatSources;
				}
				if (page.children.length > 0 || part.children.length > 0) {
					if (part.children.length > 0) {
						page.children.push(part);
					}
					//this.questionsBefore.push(new TreeviewItem(page));
					page = {
						value: page.value,
						text: page.text,
						checked: false,
						children: [],
					};
					part = {
						value: partSource.value,
						text: partSource.text,
						checked: false,
						children: [],
					};
				}
				questionHit = true;
			} else {
				if (!questionHit && element.children) {
					if ((<string>element.children[0].value).startsWith('option')) {
						this.clearOptionsFromElement(element);
					}
				}
				part.children.push(element);
				if (!questionHit && this.allowAsRepeatSource(element.value)) {
					repeatSources.push(element);
				}
			}
		}
		return {
			pageReturn: page,
			partReturn: part,
			questionHitReturn: questionHit,
		};
	}

	private clearOptionsFromElement(element: TreeviewItem) {
		if (element.children && element.children.length > 0) {
			if ((<string>element.children[0].value).startsWith('option')) {
				element.children = undefined;
			} else {
				element.children.forEach((child) => {
					this.clearOptionsFromElement(child);
				});
			}
		}
	}

	/**
	 *
	 * @param model
	 */
	public onConditionalLogicChanged(model: SurveyLogic) {
		this._builder
			.updateQuestionLogic(
				this._editorData.surveyId,
				this.questionBeingEdited.id,
				this._editorData.activeLanguage,
				model
			)
			.subscribe((v) => {
				this.queryBuilder.updateIds(v, model);
			});
	}

	/**
	 * Called when the configuration dialog is shown and input properties set
	 */
	public configurationShown(): void {
		this.repeatQuestionList = from(this._editorData.questionList).pipe(
			filter((x) => this.allowAsRepeatSource(x.questionPart.questionType) && x.questionPart !== undefined),
			toArray()
		);

		this.repeatQuestionList.subscribe((x) => {
			console.log(x);
		});

		this.conditionalSource = this._builder.getQuestionLogic(
			this._editorData.surveyId,
			this.questionBeingEdited.id,
			this._editorData.activeLanguage
		);
	}
}
