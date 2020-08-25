import {
	Component,
	OnInit,
	Input,
	ViewChild,
	AfterViewInit,
	EventEmitter,
	Output,
	ChangeDetectorRef
} from "@angular/core";
import {
	TreeviewItem,
	DownlineTreeviewItem,
	TreeviewEventParser,
	OrderDownlineTreeviewEventParser,
	DropdownTreeviewComponent,
	TreeviewSelection,
	TreeviewI18nDefault,
	TreeviewConfig
} from "ngx-treeview";
import { QuestionConditionalSourceGroup } from "../../../../models/question-conditional-source-group.model";
import { QuestionConditional } from "../../../../models/question-conditional.model";
import { QuestionOptionConditional } from "../../../../models/question-option-conditional.model";
import { BsDaterangepickerConfig } from "ngx-bootstrap/datepicker";
import { QuestionOptionValue } from "../../../../models/question-option-value.model";
import {
	SBQuestionPartViewModel,
	SBPageStructureViewModel,
	SurveyBuilderClient
} from "app/survey-builder/services/survey-builder-client.service";
import { QuestionTypeDefinition } from "app/survey-builder/models/question-type-definition";
import { SurveyBuilderEditorData } from "app/survey-builder/services/survey-builder-editor-data.service";
import { QuestionResponseType } from "app/survey-builder/models/question-response-type.enum";
import { QuestionConditionalType } from 'app/survey-builder/models/question-conditional-type.enum';
import { QuestionPartView } from 'app/survey-builder/models/question-part-view.model';

interface ConditionalOptionItem {
	name: string;
	code: string;
}

@Component({
	selector: "app-conditional",
	templateUrl: "./conditional.component.html",
	styleUrls: ["./conditional.component.scss"],
	providers: [
		{
			provide: TreeviewEventParser,
			useClass: OrderDownlineTreeviewEventParser
		}
	]
})
export class SourceConditionalComponent implements OnInit, AfterViewInit {
	public dropDownListItems: Array<string> = [];

	public treedropdownConfig: TreeviewConfig = {
		hasAllCheckBox: false,
		hasFilter: false,
		hasDivider: false,
		hasCollapseExpand: false,
		decoupleChildFromParent: false,
		maxHeight: 500
	};

	public treedropdownSingleConfig: TreeviewConfig = {
		hasAllCheckBox: false,
		hasFilter: false,
		hasDivider: false,
		hasCollapseExpand: false,
		decoupleChildFromParent: false,
		maxHeight: 500
	};

	public bsConfig: Partial<BsDaterangepickerConfig> = Object.assign(
		{},
		{
			containerClass: "theme-default",
			dateInputFormat: "YYYY-MM-DD"
		}
	);

	public copiedOptionList: any[] = [];
	public sourceQuestionConditionalsList: QuestionConditional[] = [];
	public sourceQuestionOptionConditionalsList: QuestionOptionConditional[] = [];

	private checkedWithParents: DownlineTreeviewItem[] = [];

	public dateRange: Date[] = [];

	public sourceQuestion: QuestionPartView;

	@Input()
	public sourceQuestionList: QuestionPartView[] = [];

	@Input()
	public responseType: QuestionResponseType;

	@Input()
	public questionType: string;

	@Input()
	public questionPartId: number;

	@Input()
	public sourceGroup: QuestionConditional;

	@Input()
	public optionList: TreeviewItem[];

	@Input()
	public questionOptions: Map<string, QuestionOptionValue[]> = new Map<
		string,
		QuestionOptionValue[]
	>();

	public questionOptionsList: Array<any> = [];

	@Output()
	public setBoundsSelected: EventEmitter<
		QuestionConditionalSourceGroup
	> = new EventEmitter<QuestionConditionalSourceGroup>();

	@ViewChild("optionTargets", { static: true })
	public optionTargetsTreeDropdown: DropdownTreeviewComponent;

	public optionSelectValues: any[] = [];
	public questionResponseTypes = QuestionResponseType;
	public optionModel: any;
	constructor(
		private changeDetectRef: ChangeDetectorRef,
		private _editor: SurveyBuilderEditorData,
		private _client: SurveyBuilderClient
	) {}

	public ngOnInit(): void {
		/* get the reference to the question */
		let sourceQuestion = this.sourceQuestionList.find(
			s => Number(s.id) === this.sourceGroup.sourceQuestionId
		);
		this.sourceQuestion = sourceQuestion;
		this.setConditionsForQuestionType();
		if (this.sourceGroup.condition === null) {
			this.sourceGroup.condition = QuestionConditionalType[this.dropDownListItems[0]];
		}
		if (
			this.responseType === QuestionResponseType.OptionList ||
			this.responseType === QuestionResponseType.OptionSelect
		) {
			this.optionModel = JSON.parse(this.sourceGroup.value);
			this._client.getQuestionPartOptions(this._editor.surveyId,sourceQuestion.questionPart?.id,'en').subscribe(options => {
				this.questionOptionsList = options;
			});
			/*this.optionList.forEach(element => {
				let valueSplit: string[] = element.value.split("~"); // [0] - 'option', [1] - option group name, [2] - option id
				let codeFromId = this.questionOptions
					.get(valueSplit[1])
					.filter(o => o.id === +valueSplit[2])[0].code;
				let valueCheck = `"name":"${valueSplit[1]}","code":"${codeFromId}"`;
				let copiedItem = new TreeviewItem({
					value: element.value,
					text: element.text,
					checked: this.sourceGroup.value.includes(valueCheck)
				});
				this.copiedOptionList.push(copiedItem);
			});*/
		} else if (this.responseType === QuestionResponseType.DateTime) {
			this.dateRange = JSON.parse(this.sourceGroup.value);
		}
		this.changeDetectRef.detectChanges();
		console.log(this.sourceGroup);
	}

	/**
	 * When the source question drop down is changed
	 * @param event
	 */
	public onChange(event: QuestionPartView): void {
		this._client.getQuestionPartOptions(this._editor.surveyId,event.questionPart?.id,'en').subscribe(options => {
			this.questionOptionsList = options;
		});
		this.sourceQuestion = event;
		this.setConditionsForQuestionType();
		this.sourceGroup.sourceQuestionId = Number(event.id);
		this.changeDetectRef.detectChanges();
	}

	public optionConditionalValueChanged(event): void {
		console.log('here'); 
		this.optionModel = event;
		this.sourceGroup.value = JSON.stringify(event);
	}

	public ngAfterViewInit(): void {
		/*this.optionTargetsTreeDropdown.i18n = new TreeviewI18nDefault();
		this.optionTargetsTreeDropdown.i18n.getText = e =>
			this.targetsDropdown(e); */
		this.changeDetectRef.detectChanges();
		this.setConditionsForQuestionType();
	}

	public showBoundsModal(): void {
		this.setBoundsSelected.emit(this.sourceGroup);
	}


	private getQuestionOptionLabel(item: TreeviewItem): string {
		let itemType = this.getItemType(item.value);
		if (itemType === "question") {
			return `Q:${item.text}`;
		} else if (itemType === "option") {
			return `O:${item.text}`;
		}
	}

	private setConditionsForQuestionType(): void {
		if(this.sourceQuestion === null) {
			return;
		}
		var type = this.sourceQuestion?.questionPart?.questionType;


		this.responseType = this._editor.questionTypeMap.get(
			type
		)?.responseType;
		if (this.responseType === QuestionResponseType.String) {
			this.dropDownListItems = ["Contains", "Does Not Contain"];
		} else if (this.responseType === QuestionResponseType.Boolean) {
			this.dropDownListItems = ["Is Equal To"];
		} else if (
			this.responseType === QuestionResponseType.Number
		) {
			this.dropDownListItems = [
				"Is Equal To",
				"Is Not Equal To",
				"Greater Than",
				"Less Than"
			];
		} else if (this.responseType === QuestionResponseType.Location) {
			this.dropDownListItems = ["In Bounds", "Out Of Bounds"];
		} else if (this.responseType === QuestionResponseType.Json) {
			this.dropDownListItems = ["Contains", "Does Not Contain"];
		} else if (
			this.responseType === QuestionResponseType.OptionSelect ||
			this.responseType === QuestionResponseType.OptionList
		) {
			this.dropDownListItems = ["Is Any Of", "Is All Of"];
			this.copiedOptionList = [];
			/*for(let option of this.questionOptionsList) {
				this.copiedOptionList.push({
					'label': option.optionLabel.value
				})
			}
			// this.copiedOptionList = this.sourceQuestion.questionPartViewChildren ?? [];
			// console.log(this); */
		} else if (this.responseType === QuestionResponseType.DateTime) {
			this.dropDownListItems = ["In Range", "Outside Range"];
		}
	}

	public conditionValueChanged(e: string): void {
		this.sourceGroup.condition = QuestionConditionalType[this.dropDownListItems.filter(
			dd => dd === e
		)[0]];
		// update condition value in conditionals lists
		this.sourceQuestionConditionalsList.forEach(conditional => {
			conditional.condition = this.sourceGroup.condition;
		});
		this.sourceQuestionOptionConditionalsList.forEach(conditional => {
			conditional.condition = this.sourceGroup.condition;
		});
	}

	public updateConditionalsValues(): void {
		this.sourceQuestionConditionalsList.forEach(conditional => {
			conditional.value = this.sourceGroup.value;
		});
		this.sourceQuestionOptionConditionalsList.forEach(conditional => {
			conditional.value = this.sourceGroup.value;
		});
	}

	public onSelectedChangeTargets(
		downlineItems: DownlineTreeviewItem[]
	): void {
		// this.checkedWithParents = downlineItems;
		// let priorSourceQuestionConditionals = this
		// 	.sourceQuestionConditionalsList;
		// let priorSourceQuestionOptionConditionals = this
		// 	.sourceQuestionOptionConditionalsList;
		// this.sourceQuestionConditionalsList = [];
		// this.sourceQuestionOptionConditionalsList = [];

		// downlineItems.forEach(selectedTarget => {
		// 	// if option, add only if parent question is unchecked
		// 	if ((<string>selectedTarget.item.value).startsWith("option")) {
		// 		if (!selectedTarget.parent.item.checked) {
		// 			let id = +selectedTarget.item.value.split("~")[2];
		// 			let existing: QuestionOptionConditional = priorSourceQuestionOptionConditionals.filter(
		// 				o => o.targetOptionId === id
		// 			)[0];
		// 			if (existing) {
		// 				this.sourceQuestionOptionConditionalsList.push(
		// 					existing
		// 				);
		// 			} else {
		// 				let newOptionConditional: QuestionOptionConditional = new QuestionOptionConditional(
		// 					0,
		// 					id,
		// 					this.questionPartId,
		// 					this.sourceGroup.condition,
		// 					this.sourceGroup.value
		// 				);
		// 				this.sourceQuestionOptionConditionalsList.push(
		// 					newOptionConditional
		// 				);
		// 			}
		// 		} else {
		// 			let idSplit = selectedTarget.parent.item.value.split("~");
		// 			let id = +idSplit[2];
		// 			let existingPrevious: QuestionConditional = priorSourceQuestionConditionals.filter(
		// 				o => o.targetQuestionId === id
		// 			)[0];
		// 			let existingAlready: QuestionConditional = this.sourceQuestionConditionalsList.filter(
		// 				o => o.targetQuestionId === id
		// 			)[0];
		// 			if (existingAlready === undefined) {
		// 				if (existingPrevious) {
		// 					this.sourceQuestionConditionalsList.push(
		// 						existingPrevious
		// 					);
		// 				} else {
		// 					let newConditional: QuestionConditional = new QuestionConditional(
		// 						0,
		// 						id,
		// 						this.questionPartId,
		// 						this.sourceGroup.condition,
		// 						this.sourceGroup.value
		// 					);
		// 					this.sourceQuestionConditionalsList.push(
		// 						newConditional
		// 					);
		// 				}
		// 			}
		// 		}
		// 	} else if (
		// 		(<string>selectedTarget.item.value).startsWith("question")
		// 	) {
		// 		// if question, always add, after searching for existing
		// 		let idSplit = selectedTarget.item.value.split("~");
		// 		let id = +idSplit[2];
		// 		let existing: QuestionConditional = priorSourceQuestionConditionals.filter(
		// 			o => o.targetQuestionId === id
		// 		)[0];
		// 		if (existing) {
		// 			this.sourceQuestionConditionalsList.push(existing);
		// 		} else {
		// 			let newConditional: QuestionConditional = new QuestionConditional(
		// 				0,
		// 				id,
		// 				this.questionPartId,
		// 				this.sourceGroup.condition,
		// 				this.sourceGroup.value
		// 			);
		// 			this.sourceQuestionConditionalsList.push(newConditional);
		// 		}
		// 	}
		// });
	}

	public onSelectedChangeOptions(
		downlineItems: DownlineTreeviewItem[]
	): void {
		// split value into json structure and stringify
		let valueStructure: Object = {};
		this.sourceGroup.value = JSON.stringify(
			downlineItems.map(i => {
				let split: string[] = i.item.value.split("~"); // [0] - 'option', [1] - option group name, [2] - option id
				let codeFromId = this.questionOptions
					.get(split[1])
					.filter(o => o.id === +split[2])[0].code;
				let conditionalOptionSelect: ConditionalOptionItem = {
					name: split[1],
					code: codeFromId
				};
				return conditionalOptionSelect;
			})
		);
		this.sourceQuestionConditionalsList.forEach(conditional => {
			conditional.value = this.sourceGroup.value;
		});
		this.sourceQuestionOptionConditionalsList.forEach(conditional => {
			conditional.value = this.sourceGroup.value;
		});
	}

	// property conversions based on type

	public getItemType(value: string): string {
		return value.split("~")[0];
	}

	get booleanValue(): boolean {
		return this.sourceGroup.value === "true";
	}
	set booleanValue(value: boolean) {
		if (value === true) {
			this.sourceGroup.value = "true";
		} else {
			this.sourceGroup.value = "false";
		}
	}

	get numberValue(): number {
		return +this.sourceGroup.value;
	}
	set numberValue(value: number) {
		this.sourceGroup.value = `${value}`;
	}

	get optionSelectValue(): any {
		return this.sourceGroup.value;
	}
	set optionSelectValue(value: any) {
		this.sourceGroup.value = value;
	}

	public onDateChange(newRange: Date[]): void {
		this.sourceGroup.value = JSON.stringify(newRange);
	}
}
