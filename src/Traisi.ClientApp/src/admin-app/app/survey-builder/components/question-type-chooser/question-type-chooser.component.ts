import {
	Component,
	OnInit,
	ViewEncapsulation,
	ElementRef,
	Output,
	EventEmitter,
	HostListener,
	Input,
	AfterViewInit,
	ViewChild
} from '@angular/core';
import { SurveyBuilderService } from '../../services/survey-builder.service';
import { QuestionTypeDefinition } from '../../models/question-type-definition';
import { AppConfig } from '../../../app.config';
import { ConfigurationService } from '../../../../../shared/services/configuration.service';
import { ContainerComponent } from 'ngx-smooth-dnd';
import { QuestionResponseType } from 'app/survey-builder/models/question-response-type.enum';

@Component({
	selector: 'traisi-question-type-chooser',
	templateUrl: './question-type-chooser.component.html',
	styleUrls: ['./question-type-chooser.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class QuestionTypeChooserComponent implements OnInit, AfterViewInit {
	public questionTypeDefinitions: QuestionTypeDefinition[];
	public config: any;
	public $el: any;
	public dragItemIndex: number = 0;
	public wasDragging: boolean = false;

	@Input()
	householdAdded: boolean = false;
	@Input()
	disabled: boolean = false;
	@Output()
	addQuestionType: EventEmitter<QuestionTypeDefinition> = new EventEmitter<QuestionTypeDefinition>();
	@Output()
	loadedQuestionTypes: EventEmitter<any> = new EventEmitter();

	@ViewChild('element')
	public element: ContainerComponent;

	constructor(
		private surveyBuilderService: SurveyBuilderService,
		config: AppConfig,
		private el: ElementRef,
		private configurationService: ConfigurationService
	) {
		this.config = config.getConfig();
		this.$el = jQuery(el.nativeElement);
		this.getQuestionPayload = this.getQuestionPayload.bind(this);
	}

	/**
	 * Component initialization
	 */
	ngOnInit() {
		this.questionTypeDefinitions = [];

		// retrieve all question types from the server
		this.surveyBuilderService.getQuestionTypes().subscribe((value: QuestionTypeDefinition[]) => {
			this.questionTypeDefinitions = value;
			this.loadedQuestionTypes.emit();
		});

		jQuery(window).on('sn:resize', this.initSidebarScroll.bind(this));
		this.initSidebarScroll();
	}

	ngAfterViewInit() {
		this.el.nativeElement.addEventListener('touchmove', event => event.preventDefault());
		// this.element.

		// this.element.getGhostParent = this.getGhostParent;
	}


	public getGhostParent(): HTMLElement {
		console.log('in get ghost parent')
		return document.body;
	}


	initSidebarScroll(): void {
		const $sidebarContent = this.$el.find('.js-builder-sidebar-content');
		if (this.$el.find('.slimScrollDiv').length !== 0) {
			$sidebarContent.slimscroll({
				destroy: true
			});
		}
		$sidebarContent.slimscroll({
			height: window.innerHeight,
			size: '4px'
		});
	}

	toggleSidebarOverflow($event) {
		jQuery('#builderSidebar').css('z-index', $event ? '2' : '0');
		jQuery('.js-builder-sidebar-content, .slimScrollDiv').css('overflow', $event ? 'visible' : 'hidden');
	}

	addQuestionTypeToList(qType: QuestionTypeDefinition) {
		if (!this.wasDragging) {
			this.addQuestionType.emit(qType);
		}
	}

	public addSectionToList(): void {
		if (!this.wasDragging) {
			let surveyPart: QuestionTypeDefinition = {
				typeName: 'Survey Part',
				icon: 'fas fa-archive',
				questionOptions: {},
				questionConfigurations: {},
				responseType: QuestionResponseType.None,
				customBuilderViewName: '',
				hasCustomBuilderView: false,
				typeNameLocales: { en: 'Section', fr: 'Section' }
			};
			this.addQuestionType.emit(surveyPart);
		}
	}

	onDragStart(event: any) {
		// $('.collapse.details').collapse('hide');
		/*if (event.payload.typeName !== 'Survey Part') {
			$('.collapse:not(.details)').collapse('show');
		}*/
		if (event.isSource) {
			this.wasDragging = true;
		}
	}

	onDragEnd(event: any) {
		if (event.isSource) {
			setTimeout(() => {
				this.wasDragging = false;
			}, 0);
		}
	}

	getQuestionPayload(index) {
		$('.collapse.details').collapse('hide');
		$('.collapse:not(.details)').collapse('show');
		if (index === 0) {
			let surveyPart = {
				typeName: 'Survey Part',
				icon: 'fas fa-archive',
				questionOptions: {},
				questionConfigurations: {},
				responseType: '',
				typeNameLocales: { en: 'Section', fr: 'Section' }
			};
			return surveyPart;
		} else {
			return this.questionTypeDefinitions[index - 1];
		}
	}

	getPageHeaderPayload(index) {
		return 'header' + (index + 1);
	}

	getPageSurveyAccessPayload(index) {
		return 'mainSurveyAccess' + (index + 1);
	}

	getPageContentPayload(index) {
		if (index === 0) {
			return 'textBlock1';
		}
	}

	getPageFooterPayload(index) {
		return 'footer' + (index + 1);
	}

	getQuestionTypeName(typeDef: QuestionTypeDefinition) {
		return typeDef.typeNameLocales[this.configurationService.language];
	}

}
