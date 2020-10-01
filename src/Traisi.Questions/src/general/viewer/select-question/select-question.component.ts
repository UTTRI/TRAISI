import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	Inject,
	OnInit,
	ViewChild,
	AfterViewInit,
	ViewEncapsulation,
} from '@angular/core';
import {
	SurveyQuestion,
	ResponseTypes,
	QuestionConfiguration,
	SurveyViewer,
	OnSurveyQuestionInit,
	OnVisibilityChanged,
	OnSaveResponseStatus,
	StringResponseData,
	OnOptionsLoaded,
	QuestionOption,
	ResponseValidationState,
	ResponseData,
	OptionSelectResponseData,
} from 'traisi-question-sdk';
import templateString from './select-question.component.html';
import styleString from './select-question.component.scss';
import selectStyleString from '@ng-select/ng-select/themes/default.theme.css';
declare var $: any;

@Component({
	selector: 'traisi-select-question',
	template: '' + templateString,
	styles: ['' + styleString + selectStyleString],
	encapsulation: ViewEncapsulation.None,
})
export class SelectQuestionComponent extends SurveyQuestion<ResponseTypes.OptionSelect>
	implements OnInit, OnOptionsLoaded, AfterViewInit {
	public readonly QUESTION_TYPE_NAME: string = 'Select Question';

	public typeName: string;
	public icon: string;
	public selectOptions: QuestionOption[];
	public selectedOptionId: string;

	@ViewChild('select', { static: true })
	public selectElement: ElementRef;

	/**
	 *
	 * @param surveyViewerService
	 * @param surveyResponderService
	 * @param cdr
	 */
	constructor(@Inject('SurveyViewerService') private surveyViewerService: SurveyViewer) {
		super();
		this.typeName = this.QUESTION_TYPE_NAME;
		this.icon = 'select';
		this.selectOptions = [];
		this.surveyViewerService.configurationData.subscribe(this.loadConfigurationData);
	}

	/**
	 * Loads configuration data once it is available.
	 * @param data
	 */
	public loadConfigurationData(data: QuestionConfiguration[]): void {}

	public ngOnInit(): void {}

	public ngAfterViewInit(): void {
		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	/**
	 * Determines whether saved response data on
	 */
	private onSavedResponseData: (response: ResponseData<ResponseTypes.OptionSelect>[] | 'none') => void = (
		response: ResponseData<ResponseTypes.OptionSelect>[] | 'none'
	) => {
		if (response !== 'none') {
			let optionResponse = <OptionSelectResponseData>response[0];
			this.selectedOptionId = optionResponse.code;
			this.validationState.emit(ResponseValidationState.VALID);
		}
	};

	/**
	 * This is called as soon as any options are ready (even if later queried).
	 * @param options
	 */
	public onOptionsLoaded(options: QuestionOption[]): void {
		this.selectOptions = options;
	}

	public onModelChanged(option: OptionSelectResponseData): void {
		if (option) {
			option.value = option.code;
			// this.validationState.emit(ResponseValidationState.VALID);
			this.response.emit([option]);
		}
	}

	public onResponseSaved(): void {}
}
