import { EndpointFactory } from '../../../../shared/services/endpoint-factory.service';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../../shared/services/configuration.service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Observable } from 'rxjs';
import { UploadPath } from '../models/upload-path';
import { WelcomePage } from '../models/welcome-page.model';
import { QuestionPartView } from '../models/question-part-view.model';
import { QuestionConfigurationValue } from '../models/question-configuration-value.model';
import { QuestionOptionValue } from '../models/question-option-value.model';
import { Order } from '../models/order.model';
import { QuestionConditional } from '../models/question-conditional.model';
import { QuestionOptionConditional } from '../models/question-option-conditional.model';

@Injectable()
export class SurveyBuilderEndpointService extends EndpointFactory {
	private readonly _surveyBuilderUrl: string = '/api/SurveyBuilder';
	private readonly _deleteUploadedUrl: string = '/api/Upload/delete';
	private readonly _questionsUrl: string = '/api/Question';

	get surveyBuilderUrl(): string {
		return this.configurations.baseUrl + this._surveyBuilderUrl;
	}

	get deleteUploadedUrl(): string {
		return this.configurations.baseUrl + this._deleteUploadedUrl;
	}

	get customBuilderClientCodeUrl(): string {
		return this._questionsUrl + '/client-code/builder';
	}

	get getSurveyBuilderQuestionTypesUrl(): string {
		return this.configurations.baseUrl + this._surveyBuilderUrl + '/question-types';
	}
	constructor(http: HttpClient, configurations: ConfigurationService, injector: Injector) {
		super(http, configurations, injector);
	}

	public getQuestionTypesEndpoint<T>(): Observable<T> {
		let endpointUrl = this.getSurveyBuilderQuestionTypesUrl;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getQuestionTypesEndpoint());
			})
		);
	}

	public getDeleteUploadedFileEndopint<T>(filePath: UploadPath): Observable<T> {
		let endpointUrl = this.deleteUploadedUrl;
		return this.http.post<T>(endpointUrl, JSON.stringify(filePath), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getDeleteUploadedFileEndopint(filePath));
			})
		);
	}

	public getSurveyStylesEndpoint<T>(surveyId: number): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/Styles`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders('text')).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getSurveyStylesEndpoint(surveyId));
			})
		);
	}

	public getStandardWelcomePageEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/WelcomePage/Standard/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getStandardWelcomePageEndpoint(surveyId, language));
			})
		);
	}

	public getStandardTermsAndConditionsPageEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/TermsAndConditionsPage/Standard/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getStandardTermsAndConditionsPageEndpoint(surveyId, language)
				);
			})
		);
	}

	public getStandardScreeningQuestionsEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/ScreeningQuestions/Standard/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getStandardScreeningQuestionsEndpoint(surveyId, language)
				);
			})
		);
	}

	public getStandardThankYouPageEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/ThankYouPage/Standard/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getStandardWelcomePageEndpoint(surveyId, language));
			})
		);
	}

	public getUpdateSurveyStylesEndpoint<T>(surveyId: number, updatedStyles: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/Styles`;

		return this.http.put<T>(endpointUrl, JSON.stringify(updatedStyles), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getUpdateSurveyStylesEndpoint(surveyId, updatedStyles));
			})
		);
	}

	public getUpdateWelcomePageEndpoint<T>(surveyId: number, welcomePage: WelcomePage): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/WelcomePage`;

		return this.http.put<T>(endpointUrl, JSON.stringify(welcomePage), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getUpdateWelcomePageEndpoint(surveyId, welcomePage));
			})
		);
	}

	public getUpdateTermsAndConditionsPageEndpoint<T>(
		surveyId: number,
		welcomePage: WelcomePage
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/TermsAndConditionsPage`;

		return this.http.put<T>(endpointUrl, JSON.stringify(welcomePage), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateTermsAndConditionsPageEndpoint(surveyId, welcomePage)
				);
			})
		);
	}

	public getUpdateScreeningQuestionsEndpoint<T>(
		surveyId: number,
		welcomePage: WelcomePage
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/ScreeningQuestions`;

		return this.http.put<T>(endpointUrl, JSON.stringify(welcomePage), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateScreeningQuestionsEndpoint(surveyId, welcomePage)
				);
			})
		);
	}

	public getUpdateThankYouPageEndpoint<T>(surveyId: number, welcomePage: WelcomePage): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/ThankYouPage`;

		return this.http.put<T>(endpointUrl, JSON.stringify(welcomePage), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getUpdateThankYouPageEndpoint(surveyId, welcomePage));
			})
		);
	}

	public getStandardViewPageStructureEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/PageStructure/Standard/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getStandardViewPageStructureEndpoint(surveyId, language));
			})
		);
	}

	public getCATIViewPageStructureEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/PageStructure/CATI/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getStandardViewPageStructureEndpoint(surveyId, language));
			})
		);
	}

	public getStandardViewPagesStructureWithQuestionsOptionsEndpoint<T>(
		surveyId: number,
		language: string
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/PageStructure/Standard/${language}/QuestionsOptions`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getStandardViewPagesStructureWithQuestionsOptionsEndpoint(surveyId, language)
				);
			})
		);
	}

	public getAddStandardPageEndpoint<T>(
		surveyId: number,
		language: string,
		pageInfo: QuestionPartView
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/Page/Standard/${language}`;

		return this.http.post<T>(endpointUrl, JSON.stringify(pageInfo), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getAddStandardPageEndpoint(surveyId, language, pageInfo));
			})
		);
	}

	public getDeleteStandardPageEndpoint<T>(surveyId: number, pageId: number): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/Page/Standard/${pageId}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getDeleteStandardPageEndpoint(surveyId, pageId));
			})
		);
	}

	public getUpdateStandardViewPageOrderEndpoint<T>(
		surveyId: number,
		pageOrder: Order[],
		movedPagedId: number
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/PageStructure/Standard/UpdateOrder/${movedPagedId}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(pageOrder), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateStandardViewPageOrderEndpoint(surveyId, pageOrder, movedPagedId)
				);
			})
		);
	}

	public getUpdateCATIViewPageOrderEndpoint<T>(
		surveyId: number,
		pageOrder: Order[],
		movedPagedId: number
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/PageStructure/CATI/UpdateOrder/${movedPagedId}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(pageOrder), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateCATIViewPageOrderEndpoint(surveyId, pageOrder, movedPagedId)
				);
			})
		);
	}

	public getCreateCATIViewEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/GenerateCATIView/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getCreateCATIViewEndpoint(surveyId, language));
			})
		);
	}

	public getDeleteCATIViewEndpoint<T>(surveyId: number, language: string): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/DeleteCATIView/${language}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getDeleteCATIViewEndpoint(surveyId, language));
			})
		);
	}

	public getQuestionPartViewPageStructureEndpoint<T>(
		surveyId: number,
		questionPartViewId: number,
		language: string
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/PartStructure/${questionPartViewId}/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getQuestionPartViewPageStructureEndpoint(surveyId, questionPartViewId, language)
				);
			})
		);
	}

	public getUpdateStandardQuestionPartViewOrderEndpoint<T>(
		surveyId: number,
		questionPartViewId: number,
		childrenViewOrder: Order[],
		movedQuestionPartViewId: number
	): Observable<T> {
		// tslint:disable-next-line:max-line-length
		const endpointUrl = `${
			this.surveyBuilderUrl
			}/${surveyId}/PartStructure/Standard/${questionPartViewId}/UpdateOrder/${movedQuestionPartViewId}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(childrenViewOrder), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateStandardQuestionPartViewOrderEndpoint(
						surveyId,
						questionPartViewId,
						childrenViewOrder,
						movedQuestionPartViewId
					)
				);
			})
		);
	}

	public getUpdateCATIQuestionPartViewOrderEndpoint<T>(
		surveyId: number,
		questionPartViewId: number,
		childrenViewOrder: Order[],
		movedQuestionPartViewId: number
	): Observable<T> {
		// tslint:disable-next-line:max-line-length
		const endpointUrl = `${
			this.surveyBuilderUrl
			}/${surveyId}/PartStructure/CATI/${questionPartViewId}/UpdateOrder/${movedQuestionPartViewId}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(childrenViewOrder), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateCATIQuestionPartViewOrderEndpoint(
						surveyId,
						questionPartViewId,
						childrenViewOrder,
						movedQuestionPartViewId
					)
				);
			})
		);
	}

	public getAddStandardQuestionPartViewEndpoint<T>(
		surveyId: number,
		questionPartViewId: number,
		language: string,
		newPart: QuestionPartView
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/Part/Standard/${questionPartViewId}/${language}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(newPart), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getAddStandardQuestionPartViewEndpoint(surveyId, questionPartViewId, language, newPart)
				);
			})
		);
	}

	public getDeleteQuestionPartViewEndpoint<T>(
		surveyId: number,
		questionPartViewId: number,
		childQuestionPartViewId: number
	): Observable<T> {
		const endpointUrl = `${
			this.surveyBuilderUrl
			}/${surveyId}/Part/${questionPartViewId}/${childQuestionPartViewId}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getDeleteQuestionPartViewEndpoint(surveyId, questionPartViewId, childQuestionPartViewId)
				);
			})
		);
	}

	/**
	 *
	 *
	 * @template T
	 * @param {number} surveyId
	 * @param {QuestionPartView} updatedInfo
	 * @returns
	 * @memberof SurveyBuilderEndpointService
	 */
	public getUpdateQuestionPartViewDataEndpoint<T>(surveyId: number, updatedInfo: QuestionPartView): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/Part`;
		return this.http.put<T>(endpointUrl, JSON.stringify(updatedInfo), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () => this.getUpdateQuestionPartViewDataEndpoint(surveyId, updatedInfo));
			})
		);
	}

	public getQuestionPartConfigurationsEndpoint<T>(surveyId: number, questionPartId: number): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionConfigurations/${questionPartId}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getQuestionPartConfigurationsEndpoint(surveyId, questionPartId)
				);
			})
		);
	}

	public getUpdateQuestionPartConfigurationsEndpoint<T>(
		surveyId: number,
		questionPartId: number,
		updatedConfigurations: QuestionConfigurationValue[]
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionConfigurations/${questionPartId}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(updatedConfigurations), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateQuestionPartConfigurationsEndpoint(surveyId, questionPartId, updatedConfigurations)
				);
			})
		);
	}

	public getQuestionPartOptionsEndpoint<T>(
		surveyId: number,
		questionPartId: number,
		language: string
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionOptions/${questionPartId}/${language}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getQuestionPartOptionsEndpoint(surveyId, questionPartId, language)
				);
			})
		);
	}

	public getQuestionPartConditionalsEndpoint<T>(surveyId: number, questionPartId: number): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionConditionals/${questionPartId}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getQuestionPartConditionalsEndpoint(surveyId, questionPartId)
				);
			})
		);
	}

	public getQuestionPartOptionConditionalsEndpoint<T>(surveyId: number, questionPartId: number): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionOptionConditionals/${questionPartId}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getQuestionPartOptionConditionalsEndpoint(surveyId, questionPartId)
				);
			})
		);
	}

	public getSetQuestionPartOptionEndpoint<T>(
		surveyId: number,
		questionPartId: number,
		optionInfo: QuestionOptionValue
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionOptions/${questionPartId}`;

		return this.http.post<T>(endpointUrl, JSON.stringify(optionInfo), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getSetQuestionPartOptionEndpoint(surveyId, questionPartId, optionInfo)
				);
			})
		);
	}

	public getSetQuestionPartConditionalsEndpoint<T>(
		surveyId: number,
		questionPartId: number,
		conditionals: QuestionConditional[]
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionConditionals/${questionPartId}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(conditionals), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getSetQuestionPartConditionalsEndpoint(surveyId, questionPartId, conditionals)
				);
			})
		);
	}

	public getSetQuestionPartOptionConditionalsEndpoint<T>(
		surveyId: number,
		questionPartId: number,
		conditionals: QuestionOptionConditional[]
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionOptionConditionals/${questionPartId}`;

		return this.http.put<T>(endpointUrl, JSON.stringify(conditionals), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getSetQuestionPartOptionConditionalsEndpoint(surveyId, questionPartId, conditionals)
				);
			})
		);
	}

	public getDeleteQuestionPartOptionEndpoint<T>(
		surveyId: number,
		questionPartId: number,
		optionId: number
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionOptions/${questionPartId}/${optionId}`;

		return this.http.delete<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getDeleteQuestionPartOptionEndpoint(surveyId, questionPartId, optionId)
				);
			})
		);
	}

	/**
	 *
	 *
	 * @readonly
	 * @type {string}
	 * @memberof SurveyBuilderEndpointService
	 */
	private get getClientBuilderCodeUrl(): string {
		return this._questionsUrl + '/client-builder-code';
	}

	/**
	 * Returns the endpoint of the server method that returns the client side custom builder code
	 * with the specified custom builder name.
	 *
	 * @template T
	 * @param {string} customBuilderName
	 * @returns {Observable<T>}
	 * @memberof SurveyBuilderEndpointService
	 */
	public getSurveyBuilderClientBuilderCodeUrl(customBuilderName: string): string {
		const endpointUrl = `${this.getClientBuilderCodeUrl}/${customBuilderName}`;

		return endpointUrl;
	}

	public getUpdateQuestionPartOptionsOrderEndpoint<T>(
		surveyId: number,
		questionPartId: number,
		updatedOrder: Order[]
	): Observable<T> {
		const endpointUrl = `${this.surveyBuilderUrl}/${surveyId}/QuestionOptions/${questionPartId}/Order`;

		return this.http.put<T>(endpointUrl, JSON.stringify(updatedOrder), this.getRequestHeaders()).pipe(
			catchError((error) => {
				return this.handleError(error, () =>
					this.getUpdateQuestionPartOptionsOrderEndpoint(surveyId, questionPartId, updatedOrder)
				);
			})
		);
	}

	/**
	 *
	 * @param {string} questionType
	 * @returns {string}
	 * @memberof SurveyBuilderEndpointService
	 */
	public getCustomBuilderClientCodeEndpointUrl(questionType: string): string {
		return `${this.customBuilderClientCodeUrl}/${questionType}`;
	}

	/**
	 * Returns the endpoint for retrieving client code related to builder.
	 * @template T
	 * @param {string} questionType
	 * @returns {Observable<T>}
	 * @memberof QuestionLoaderEndpointService
	 */
	public getCustomBuilderClientCodeEndpoint<T>(questionType: string): Observable<T> {
		let endpointUrl = `${this.customBuilderClientCodeUrl}/${questionType}`;

		return this.http.get<T>(endpointUrl, this.getRequestHeaders()).pipe(
			catchError(error => {
				return this.handleError(error, () => this.getCustomBuilderClientCodeEndpoint(questionType));
			})
		);
	}
}
