import { Injectable } from "@angular/core";
import { SurveyBuilderEndpointService } from "./survey-builder-endpoint.service";
import { Observable, Subject } from "rxjs";
import { QuestionTypeDefinition } from "../models/question-type-definition";
import { UploadPath } from "../models/upload-path";
import { WelcomePage } from "../models/welcome-page.model";
import { TermsAndConditionsPage } from "../models/terms-and-conditions-page.model";
import { ThankYouPage } from "../models/thank-you-page.model";
import { SurveyViewStructure } from "../models/survey-view-structure.model";
import { QuestionPartView } from "../models/question-part-view.model";
import { Order } from "../models/order.model";
import { QuestionConfigurationValue } from "../models/question-configuration-value.model";
import { map } from "rxjs/operators";
import { QuestionOptionValue } from "../models/question-option-value.model";
import { QuestionConditional } from "../models/question-conditional.model";
import { QuestionOptionConditional } from "../models/question-option-conditional.model";
import { SurveyQuestionOptionStructure } from "../models/survey-question-option-structure.model";
import { TreeviewItem, TreeItem } from "ngx-treeview";
import { ScreeningQuestions } from "../models/screening-questions.model";
import { SurveyBuilderClient } from "./survey-builder-client.service";
import { QuestionConditionalOperator } from '../models/question-conditional-operator.model';

@Injectable()
export class SurveyBuilderService {
	public questionTypeDefinitions: QuestionTypeDefinition[];

	constructor(
		private surveyBuilderEndpointService: SurveyBuilderEndpointService
	) {}

	/**
	 * Returns a list of question types that are available on the server.
	 */
	public getQuestionTypes(): Observable<QuestionTypeDefinition[]> {
		return this.surveyBuilderEndpointService
			.getQuestionTypesEndpoint<QuestionTypeDefinition[]>()
			.pipe(
				map(definitions => {
					this.questionTypeDefinitions = definitions;
					return definitions;
				})
			);
	}

	public deleteUploadedFile(filePath: UploadPath): Observable<UploadPath> {
		return this.surveyBuilderEndpointService.getDeleteUploadedFileEndopint<
			UploadPath
		>(filePath);
	}

	public getSurveyStyles(surveyId: number): Observable<string> {
		return this.surveyBuilderEndpointService.getSurveyStylesEndpoint<
			string
		>(surveyId);
	}

	public createCATIView(
		surveyId: number,
		language: string
	): Observable<SurveyViewStructure> {
		return this.surveyBuilderEndpointService.getCreateCATIViewEndpoint<
			SurveyViewStructure
		>(surveyId, language);
	}

	public deleteCATIView(
		surveyId: number,
		language: string
	): Observable<SurveyViewStructure> {
		return this.surveyBuilderEndpointService.getDeleteCATIViewEndpoint<
			SurveyViewStructure
		>(surveyId, language);
	}

	public getStandardWelcomePage(
		surveyId: number,
		language: string
	): Observable<WelcomePage> {
		return this.surveyBuilderEndpointService.getStandardWelcomePageEndpoint<
			WelcomePage
		>(surveyId, language);
	}

	public getStandardTermsAndConditionsPage(
		surveyId: number,
		language: string
	): Observable<TermsAndConditionsPage> {
		return this.surveyBuilderEndpointService.getStandardTermsAndConditionsPageEndpoint<
			TermsAndConditionsPage
		>(surveyId, language);
	}

	public getStandardScreeningQuestions(
		surveyId: number,
		language: string
	): Observable<ScreeningQuestions> {
		return this.surveyBuilderEndpointService.getStandardScreeningQuestionsEndpoint<
			TermsAndConditionsPage
		>(surveyId, language);
	}

	public getStandardThankYouPage(
		surveyId: number,
		language: string
	): Observable<ThankYouPage> {
		return this.surveyBuilderEndpointService.getStandardThankYouPageEndpoint<
			ThankYouPage
		>(surveyId, language);
	}

	public updateSurveyStyles(
		surveyId: number,
		updatedStyles: string
	): Observable<string> {
		return this.surveyBuilderEndpointService.getUpdateSurveyStylesEndpoint<
			string
		>(surveyId, updatedStyles);
	}

	public updateWelcomePage(
		surveyId: number,
		welcomePage: WelcomePage
	): Observable<WelcomePage> {
		return this.surveyBuilderEndpointService.getUpdateWelcomePageEndpoint<
			WelcomePage
		>(surveyId, welcomePage);
	}

	public updateTermsAndConditionsPage(
		surveyId: number,
		tAndCPage: TermsAndConditionsPage
	): Observable<TermsAndConditionsPage> {
		return this.surveyBuilderEndpointService.getUpdateTermsAndConditionsPageEndpoint<
			TermsAndConditionsPage
		>(surveyId, tAndCPage);
	}

	public updateThankYouPage(
		surveyId: number,
		thankYouPage: ThankYouPage
	): Observable<ThankYouPage> {
		return this.surveyBuilderEndpointService.getUpdateThankYouPageEndpoint<
			ThankYouPage
		>(surveyId, thankYouPage);
	}

	public updateScreeningQuestions(
		surveyId: number,
		screeningQuestions: ScreeningQuestions
	): Observable<ScreeningQuestions> {
		return this.surveyBuilderEndpointService.getUpdateScreeningQuestionsEndpoint<
			ScreeningQuestions
		>(surveyId, screeningQuestions);
	}

	public getStandardViewPageStructure(
		surveyId: number,
		language: string
	): Observable<SurveyViewStructure> {
		return this.surveyBuilderEndpointService.getStandardViewPageStructureEndpoint<
			SurveyViewStructure
		>(surveyId, language);
	}

	public getCATIViewPageStructure(
		surveyId: number,
		language: string
	): Observable<SurveyViewStructure> {
		return this.surveyBuilderEndpointService.getCATIViewPageStructureEndpoint<
			SurveyViewStructure
		>(surveyId, language);
	}

	public getStandardViewPagesStructureWithQuestionsOptions(
		surveyId: number,
		language: string
	): Observable<SurveyQuestionOptionStructure[]> {
		return this.surveyBuilderEndpointService.getStandardViewPagesStructureWithQuestionsOptionsEndpoint<
			SurveyQuestionOptionStructure[]
		>(surveyId, language);
	}

	public getStandardViewPagesStructureAsTreeItemsWithQuestionsOptions(
		surveyId: number,
		language: string
	): Observable<SurveyQuestionOptionStructure[]> {
		return this.surveyBuilderEndpointService
			.getStandardViewPagesStructureWithQuestionsOptionsEndpoint<
				SurveyQuestionOptionStructure[]
			>(surveyId, language);
	}

	public convertSurveyQuestionsStructureToTreeItems(
		items: SurveyQuestionOptionStructure[]
	): TreeviewItem[] {
		if (items !== null) {
			let tree: TreeviewItem[] = items.map(item => {
				let prefix = `${item.label}`;
				let treeItem: TreeItem = {
					text: `${prefix}`,
					value: `${item.type}~${item.id}`,
					children: this.convertSurveyQuestionsStructureToTreeItems(
						item.children
					),
					checked: false
				};
				let viewItem = new TreeviewItem(treeItem);
				(<any>viewItem).type = item.type;
				return viewItem;
			});
			return tree;
		} else {
			return null;
		}
	}

	public updateStandardViewPageOrder(
		surveyId: number,
		pageOrder: Order[],
		movedPagedId: number
	): Observable<Order[]> {
		return this.surveyBuilderEndpointService.getUpdateStandardViewPageOrderEndpoint<
			Order[]
		>(surveyId, pageOrder, movedPagedId);
	}

	public updateCATIViewPageOrder(
		surveyId: number,
		pageOrder: Order[],
		movedPagedId: number
	): Observable<Order[]> {
		return this.surveyBuilderEndpointService.getUpdateCATIViewPageOrderEndpoint<
			Order[]
		>(surveyId, pageOrder, movedPagedId);
	}

	public addStandardPage(
		surveyId: number,
		language: string,
		pageInfo: QuestionPartView
	): Observable<QuestionPartView> {
		return this.surveyBuilderEndpointService.getAddStandardPageEndpoint<
			QuestionPartView
		>(surveyId, language, pageInfo);
	}

	public deleteStandardPage(
		surveyId: number,
		pageId: number
	): Observable<number> {
		return this.surveyBuilderEndpointService.getDeleteStandardPageEndpoint<
			number
		>(surveyId, pageId);
	}

	public getQuestionPartViewPageStructure(
		surveyId: number,
		questionPartViewId: number,
		language: string
	): Observable<QuestionPartView> {
		return this.surveyBuilderEndpointService.getQuestionPartViewPageStructureEndpoint<
			QuestionPartView
		>(surveyId, questionPartViewId, language);
	}

	public updateStandardQuestionPartViewOrder(
		surveyId: number,
		questionPartViewId: number,
		childrenViewOrder: Order[],
		movedQuestionPartViewId: number
	): Observable<Order[]> {
		return this.surveyBuilderEndpointService.getUpdateStandardQuestionPartViewOrderEndpoint<
			Order[]
		>(
			surveyId,
			questionPartViewId,
			childrenViewOrder,
			movedQuestionPartViewId
		);
	}

	public updateCATIQuestionPartViewOrder(
		surveyId: number,
		questionPartViewId: number,
		childrenViewOrder: Order[],
		movedQuestionPartViewId: number
	): Observable<Order[]> {
		return this.surveyBuilderEndpointService.getUpdateCATIQuestionPartViewOrderEndpoint<
			Order[]
		>(
			surveyId,
			questionPartViewId,
			childrenViewOrder,
			movedQuestionPartViewId
		);
	}

	public addStandardQuestionPartView(
		surveyId: number,
		questionPartViewId: number,
		language: string,
		newPart: QuestionPartView
	): Observable<QuestionPartView> {
		return this.surveyBuilderEndpointService.getAddStandardQuestionPartViewEndpoint<
			QuestionPartView
		>(surveyId, questionPartViewId, language, newPart);
	}

	public deleteQuestionPartView(
		surveyId: number,
		questionPartViewId: number,
		childQuestionPartViewId: number
	): Observable<number> {
		return this.surveyBuilderEndpointService.getDeleteQuestionPartViewEndpoint<
			number
		>(surveyId, questionPartViewId, childQuestionPartViewId);
	}

	public updateQuestionPartViewData(
		surveyId: number,
		updatedInfo: QuestionPartView
	): Observable<QuestionPartView> {
		return this.surveyBuilderEndpointService.getUpdateQuestionPartViewDataEndpoint<
			QuestionPartView
		>(surveyId, updatedInfo);
	}

	public getQuestionPartConfigurations(
		surveyId: number,
		questionPartId: number
	): Observable<Map<string, string>> {
		return this.surveyBuilderEndpointService
			.getQuestionPartConfigurationsEndpoint<
				QuestionConfigurationValue[]
			>(surveyId, questionPartId)
			.pipe(
				map(configValuesArray => {
					let configValuesMap: Map<string, string> = new Map<
						string,
						string
					>();
					if (configValuesArray !== null) {
						configValuesArray.forEach(configValue => {
							configValuesMap.set(
								configValue.name,
								configValue.value
							);
						});
					}
					return configValuesMap;
				})
			);
	}

	public updateQuestionPartConfigurations(
		surveyId: number,
		questionPartId: number,
		updatedConfigurations: QuestionConfigurationValue[]
	): Observable<QuestionConfigurationValue[]> {
		return this.surveyBuilderEndpointService.getUpdateQuestionPartConfigurationsEndpoint<
			QuestionConfigurationValue[]
		>(surveyId, questionPartId, updatedConfigurations);
	}

	public getQuestionPartOptions(
		surveyId: number,
		questionPartId: number,
		language: string
	): Observable<QuestionOptionValue[]> {
		return this.surveyBuilderEndpointService.getQuestionPartOptionsEndpoint<
			QuestionOptionValue[]
		>(surveyId, questionPartId, language);
	}

	public getQuestionPartConditionals(
		surveyId: number,
		questionPartId: number
	): Observable<QuestionConditionalOperator[]> {
		return this.surveyBuilderEndpointService.getQuestionPartConditionalsEndpoint<
		QuestionConditionalOperator[]
		>(surveyId, questionPartId);
	}

	public getQuestionPartOptionConditionals(
		surveyId: number,
		questionPartId: number
	): Observable<QuestionOptionConditional[]> {
		return this.surveyBuilderEndpointService.getQuestionPartOptionConditionalsEndpoint<
			QuestionOptionConditional[]
		>(surveyId, questionPartId);
	}

	public setQuestionPartOption(
		surveyId: number,
		questionPartId: number,
		optionInfo: QuestionOptionValue
	): Observable<QuestionOptionValue> {
		return this.surveyBuilderEndpointService.getSetQuestionPartOptionEndpoint<
			QuestionOptionValue
		>(surveyId, questionPartId, optionInfo);
	}

	public setQuestionPartConditionals(
		surveyId: number,
		questionPartId: number,
		conditionals: QuestionConditional[]
	): Observable<QuestionConditional[]> {
		return this.surveyBuilderEndpointService.getSetQuestionPartConditionalsEndpoint<
			QuestionConditional[]
		>(surveyId, questionPartId, conditionals);
	}

	public setQuestionPartOptionConditionals(
		surveyId: number,
		questionPartId: number,
		conditionals: QuestionOptionConditional[]
	): Observable<QuestionOptionConditional[]> {
		return this.surveyBuilderEndpointService.getSetQuestionPartOptionConditionalsEndpoint<
			QuestionOptionConditional[]
		>(surveyId, questionPartId, conditionals);
	}

	public deleteQuestionPartOption(
		surveyId: number,
		questionPartId: number,
		optionId: number
	): Observable<number> {
		return this.surveyBuilderEndpointService.getDeleteQuestionPartOptionEndpoint<
			number
		>(surveyId, questionPartId, optionId);
	}

	/**
	 *
	 *
	 * @param {number} surveyId
	 * @param {number} questionPartId
	 * @param {Order[]} updatedOrder
	 * @returns {Order[]}
	 * @memberof SurveyBuilderService
	 */
	public updateQuestionPartOptionsOrder(
		surveyId: number,
		questionPartId: number,
		updatedOrder: Order[]
	): Observable<Order[]> {
		return this.surveyBuilderEndpointService.getUpdateQuestionPartOptionsOrderEndpoint<
			Order[]
		>(surveyId, questionPartId, updatedOrder);
	}
}
