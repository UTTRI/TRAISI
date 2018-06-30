import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Survey } from '../../models/survey.model';
import { SurveyService } from '../../services/survey.service';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ConfigurationService } from '../../services/configuration.service';
import { ShortCode } from '../../models/short-code.model';
import { CodeGenerator } from '../../models/code-generator.model';
import { SurveyExecuteService } from '../../services/survey-execute.service';
import { AlertService, DialogType, MessageSeverity } from '../../services/alert.service';
import { Utilities } from '../../services/utilities';

@Component({
	selector: 'app-test-survey',
	templateUrl: './test-survey.component.html',
	styleUrls: ['./test-survey.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class TestSurveyComponent implements OnInit {
	public surveyId: number;
	public survey: Survey;
	public codeGenParams: CodeGenerator;

	public codeProperties = 'pattern';
	public generateType: string = 'numberCodes';
	public baseUrl: string = '';
	public loadingIndicator: boolean = false;
	public generatingIndicator: boolean = false;
	public pageLimit: number = 20;

	public individualCodeBeingViewed: boolean = true;
	public groupCodeBeingViewed: boolean = false;
	public emailBeingViewed: boolean = false;
	public scheduleBeingViewed: boolean = false;

	public indivCodeRows: ShortCode[];
	public indivCodeColumns: any[] = [];

	public totalIndivCodes: number = 0;
	public currentIndivPage: number = 0;

	public groupCodeRows: ShortCode[];
	public groupCodeColumns: any[] = [];
	public totalGroupCodes: number = 0;
	public currentGroupPage: number = 0;


	config: DropzoneConfigInterface = {
		// Change this to your upload POST address:
		url: 'https://traisi.dmg.utoronto.ca',
		maxFilesize: 50,
		maxFiles: 1,
		acceptedFiles: '.csv',
		addRemoveLinks: true
	};

	@ViewChild('dateTemplate') dateTemplate: TemplateRef<any>;

	constructor(
		private surveyService: SurveyService,
		private surveyExecuteService: SurveyExecuteService,
		private route: ActivatedRoute,
		private configurationService: ConfigurationService,
		private alertService: AlertService
	) {
		this.survey = new Survey();
		this.codeGenParams = new CodeGenerator();
		this.baseUrl = configurationService.baseUrl;
		this.route.params.subscribe(params => {
			this.surveyId = params['id'];
			this.codeGenParams.surveyId = this.surveyId;
			this.codeGenParams.isGroupCode = false;
			this.codeGenParams.isTest = true;
		});
	}

	ngOnInit() {
		this.indivCodeColumns = [
			{
				prop: 'index',
				name: '#',
				width: 50,
				canAutoResize: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'code',
				name: 'code',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'createdDate',
				name: 'Creation Date',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellTemplate: this.dateTemplate,
				cellClass: 'remove-padding'
			}
		];

		this.groupCodeColumns = [
			{
				prop: 'index',
				name: '#',
				width: 50,
				canAutoResize: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'code',
				name: 'code',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellClass: 'remove-padding'
			},
			{
				prop: 'name',
				name: 'Group Name',
				minWidth: 90,
				flexGrow: 60,
				sortable: false,
				cellClass: 'remove-padding'
			}
		];

		this.survey = this.surveyService.getLastSurvey();
		if (!this.survey || this.survey == null) {
			this.survey = new Survey();
			this.surveyService.getSurvey(this.surveyId).subscribe(
				result => {
					this.survey = result;
				},
				error => {}
			);
		}
		this.loadIndivCodeData(0);
		this.loadIndivCodeCount();
	}

	switchTab(tab: string): void
	{
		if (tab === 'indivCode') {
			this.individualCodeBeingViewed = true;
			this.groupCodeBeingViewed = false;
			this.emailBeingViewed = false;
			this.scheduleBeingViewed = false;
			this.generateType = 'numberCodes';
			this.loadIndivCodeData(0);
			this.loadIndivCodeCount();
		} else if (tab === 'groupCode') {
			this.individualCodeBeingViewed = false;
			this.groupCodeBeingViewed = true;
			this.emailBeingViewed = false;
			this.scheduleBeingViewed = false;
			this.generateType = 'single';
			this.loadGroupCodeData(0);
			this.loadGroupCodeCount();
		} else if (tab === 'email') {
			this.individualCodeBeingViewed = false;
			this.groupCodeBeingViewed = false;
			this.emailBeingViewed = true;
			this.scheduleBeingViewed = false;
		} else {
			this.individualCodeBeingViewed = false;
			this.groupCodeBeingViewed = false;
			this.emailBeingViewed = false;
			this.scheduleBeingViewed = true;
		}
	}

	setIndivPage(pageInfo: any) {
		this.loadIndivCodeData(pageInfo.offset);
		this.currentIndivPage = pageInfo.offset;
	}

	setGroupPage(pageInfo: any) {
		this.loadGroupCodeData(pageInfo.offset);
		this.currentGroupPage = pageInfo.offset;
	}

	loadGroupCodeData(pageNum: number)
	{
		this.alertService.startLoadingMessage('Loading codes...');
		this.loadingIndicator = true;

		this.surveyExecuteService.listSurveyGroupCodes(this.surveyId, 'test', pageNum, this.pageLimit).subscribe(
			results => {
				this.groupCodeRows = results;
				this.groupCodeRows.forEach((code, index) => {
					(<any>code).index = (pageNum * this.pageLimit) + index + 1;
				});
				this.alertService.stopLoadingMessage();
			},
			error => {
				this.alertService.stopLoadingMessage();
				this.generatingIndicator = false;

				this.alertService.showStickyMessage(
					'Loading Error',
					`An error occured whilst loading the codes.\r\nError: "${Utilities.getHttpResponseMessage(
						error
					)}"`,
					MessageSeverity.error,
					error
				);
			}
		);
	}

	loadIndivCodeData(pageNum: number)
	{
		this.alertService.startLoadingMessage('Loading codes...');
		this.loadingIndicator = true;

		this.surveyExecuteService.listSurveyShortCodes(this.surveyId, 'test', pageNum, this.pageLimit).subscribe(
			results => {
				this.indivCodeRows = results;
				this.indivCodeRows.forEach((code, index) => {
					(<any>code).index = (pageNum * this.pageLimit) + index + 1;
				});
				this.alertService.stopLoadingMessage();
			},
			error => {
				this.alertService.stopLoadingMessage();
				this.generatingIndicator = false;

				this.alertService.showStickyMessage(
					'Loading Error',
					`An error occured whilst loading the codes.\r\nError: "${Utilities.getHttpResponseMessage(
						error
					)}"`,
					MessageSeverity.error,
					error
				);
			}
		);
	}

	loadIndivCodeCount()
	{
		this.surveyExecuteService.totalSurveyShortCodes(this.surveyId, 'test').subscribe(
			result => {
				this.totalIndivCodes = result;
			}
		);
	}

	loadGroupCodeCount()
	{
		this.surveyExecuteService.totalSurveyGroupCodes(this.surveyId, 'test').subscribe(
			result => {
				this.totalGroupCodes = result;
			}
		);
	}

	generateIndivCodes() {
		this.generatingIndicator = true;
		this.alertService.startLoadingMessage('Generating codes...');

		this.codeGenParams.isGroupCode = false;
		this.codeGenParams.usePattern = this.codeProperties === 'pattern';

		if (this.generateType === 'numberCodes') {
			this.surveyExecuteService.createSurveyShortCodes(this.codeGenParams).subscribe(
				results => {
					this.alertService.stopLoadingMessage();
					this.alertService.showMessage('Success', 'Successfully generated codes', MessageSeverity.success);
					this.generatingIndicator = false;
					this.loadIndivCodeData(0);
					this.currentIndivPage = 0;
					this.loadIndivCodeCount();
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Generation Error',
						`An error occured whilst generating the codes.\r\nError: "${Utilities.getHttpResponseMessage(
							error
						)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
		} else {
			this.alertService.stopLoadingMessage();
			this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Generation Error',
						`Importing via CSV is not yet available.`,
						MessageSeverity.error
					);
		}
	}

	generateGroupCodes() {
		this.generatingIndicator = true;
		this.alertService.startLoadingMessage('Generating group codes...');

		this.codeGenParams.isGroupCode = true;
		this.codeGenParams.usePattern = this.codeProperties === 'pattern';

		if (this.generateType === 'single') {
			this.surveyExecuteService.createSurveyGroupCodes(this.codeGenParams).subscribe(
				results => {
					this.alertService.stopLoadingMessage();
					this.alertService.showMessage('Success', 'Successfully generated codes', MessageSeverity.success);
					this.generatingIndicator = false;
					this.loadGroupCodeData(0);
					this.currentGroupPage = 0;
					this.loadGroupCodeCount();
				},
				error => {
					this.alertService.stopLoadingMessage();
					this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Generation Error',
						`An error occured whilst generating the codes.\r\nError: "${Utilities.getHttpResponseMessage(
							error
						)}"`,
						MessageSeverity.error,
						error
					);
				}
			);
		} else {
			this.alertService.stopLoadingMessage();
			this.generatingIndicator = false;

					this.alertService.showStickyMessage(
						'Generation Error',
						`Importing via CSV is not yet available.`,
						MessageSeverity.error
					);
		}
	}

}
