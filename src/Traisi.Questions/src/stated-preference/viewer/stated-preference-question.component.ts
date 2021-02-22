import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as dot from 'dot';
import { Observable, ReplaySubject, zip, forkJoin, EMPTY, of } from 'rxjs';
import {
	OnSaveResponseStatus,
	OnVisibilityChanged,
	QuestionOption,
	ResponseData,
	ResponseTypes,
	ResponseValidationState,
	SurveyQuestion,
	SurveyViewer,
	SurveyRespondentService,
} from 'traisi-question-sdk';
import { StatedPreferenceConfig } from '../stated-preference-config.model';
import { StatedPreferenceTemplateContext } from './stated-preference-template-context.model';
import { flatMap, concatMap, mergeMap, merge, concat, take, map } from 'rxjs/operators';

import template from './stated-preference-question.component.html';
import style from './stated-preference-question.component.scss';
/**
 * Base question component definition for the question type "Stated Preference"
 *
 * @export
 * @class StatedPreferenceQuestionComponent
 * @extends {SurveyQuestion<ResponseTypes.String>}
 * @implements {OnInit}
 * @implements {OnVisibilityChanged}
 * @implements {OnSaveResponseStatus}
 */
@Component({
	selector: 'traisi-stated-preference-question',
	template: '' + template,
	styles: ['' + style],
})
export class StatedPreferenceQuestionComponent extends SurveyQuestion<ResponseTypes.OptionSelect[]>
	implements OnInit, OnVisibilityChanged, OnSaveResponseStatus, AfterViewInit {
	public options: QuestionOption[];
	public model: ReplaySubject<StatedPreferenceConfig>;
	public hasError: boolean = false;
	public displayModel: ReplaySubject<Array<any>>;
	public displayModelColumns: ReplaySubject<Array<string>>;
	public inputModel: { value?: string };
	public context: StatedPreferenceTemplateContext;

	@ViewChild('spForm', { static: true })
	public spForm: NgForm;

	/**
	 *
	 * @param _surveyViewerService
	 * @param _responderService
	 */
	constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewer,
		@Inject('SurveyResponderService') private _responderService: SurveyRespondentService,
		@Inject('SurveyViewerApiEndpointService') private _viewerApi
	) {
		super();
		this.model = new ReplaySubject<StatedPreferenceConfig>(1);
		this.displayModel = new ReplaySubject<Array<any>>(1);
		this.displayModelColumns = new ReplaySubject<Array<string>>(1);
		this.inputModel = {};
		this.context = {
			response: this.responseValue,
			isResponsesLoaded: false,
			responsesToLoad: [],
			component: this,
			distanceMatrixQueries: {
				origins: new Set(),
				destinations: new Set(),
			},
			distanceMatrixQuestionQueries: {
				origins: new Set(),
				destinations: new Set(),
			},
			distanceMatrixMap: {},
		};
	}

	public onQuestionShown(): void {}
	public onQuestionHidden(): void {}
	public onResponseSaved(): void {}

	/**
	 * @private
	 * @param {QuestionOption} value
	 * @memberof StatedPreferenceQuestionComponent
	 */
	private parseSpModel(value: any): void {
		try {
			let spModel = JSON.parse(value.label);
			this.model.next(spModel);
			this.transformToDisplayableData(spModel).subscribe((modelResult) => {
				this.displayModel.next(modelResult);
			});
		} catch (exception) {
			console.error(exception);
			this.hasError = true;
		}
	}

	/**
	 * Tells the responder service to load / cache all respones for this respondent.
	 * @private
	 * @memberof StatedPreferenceQuestionComponent
	 */
	private prepareResponses() {
		// this._responderService.preparePreviousSurveyResponses(this.respondent);
	}

	/**
	 * @memberof StatedPreferenceQuestionComponent
	 */
	public ngOnInit(): void {
		this.questionOptions.subscribe((options) => {
			if (options.length > 0) {
				this.parseSpModel(options[0]);
			}
		});

		this.savedResponse.subscribe(this.onSavedResponseData);
	}

	/**
	 * Converts the SP question configuration into a displayable array consumable
	 * by the cdk-table component. This involves flattening the information into
	 * a rectangular array representing row/column cell data.
	 * @private
	 * @param {StatedPreferenceConfig} config
	 * @returns {Array<any>}
	 * @memberof StatedPreferenceQuestionComponent
	 */
	private transformToDisplayableData(config: StatedPreferenceConfig): Observable<any> {
		return null;
		/*let columnArray = [];
		let spDataArray: Array<any> = [];
		columnArray.push('row');
		columnArray = columnArray.concat(config.headers);
		for (let r = 0; r < config.rowHeaders.length; r++) {
			for (let c = 1; c < config.choices.length + 1; c++) {
				dot.template(config.choices[c - 1].items[r].label)(this.context);
			}
		}
		return Observable.create(o => {
			(<Observable<any>>(<any>this._responderService.listResponsesForQuestionsByName(this.context.responsesToLoad, this.respondent)))
				.pipe(
					concatMap(value => {
						this.displayModelColumns.next(columnArray);
						for (let o of Array.from(this.context.distanceMatrixQuestionQueries.origins.values())) {
							let responseValue = this._responderService.getResponseValue(o, this.respondent);
							if (responseValue[0] !== undefined) {
								this.context.distanceMatrixQueries.origins.add(
									this._responderService.getResponseValue(o, this.respondent)[0].address
								);
								this.context.distanceMatrixMap[o] = responseValue[0].address;
							}
							else {
								// console.log(responseValue);
							}

						}
						for (let o of Array.from(this.context.distanceMatrixQuestionQueries.destinations.values())) {
							let responseValue = this._responderService.getResponseValue(o, this.respondent);
							if (responseValue[0] !== undefined) {
								this.context.distanceMatrixQueries.destinations.add(
									responseValue[0].address
								);
								this.context.distanceMatrixMap[o] = responseValue[0].address;
							}
						}

						let originsArray = Array.from(this.context.distanceMatrixQueries.origins.values());
						let destinationsArray = Array.from(this.context.distanceMatrixQueries.destinations.values());
						if (originsArray.length === 0 && destinationsArray.length === 0) {
							return of({});
						}
						else {
							return <Observable<any>>(
								this._viewerApi.getDistanceMatrixEndpoint(
									originsArray,
									destinationsArray
								)
							);
						}
					})
				)
				.subscribe(results => {
					this.context.isResponsesLoaded = true;
					for (let key in results) {
						results[key] = JSON.parse(results[key]);
					}
					this.context.distanceMatrixResults = results;
					for (let r = 0; r < config.rowHeaders.length; r++) {
						let spDataRow: {} = {};
						spDataRow[0] = config.rowHeaders[r];
						for (let c = 1; c < config.choices.length + 1; c++) {
							let templateFn = dot.template(config.choices[c - 1].items[r].label);
							spDataRow[c] = templateFn(this.context);
						}
						spDataArray.push(spDataRow);
					}
					o.next(spDataArray);
					o.complete();
				});
		});*/
	}

	/**
	 * @private
	 * @memberof StatedPreferenceQuestionComponent
	 */
	private onSavedResponseData: (response: ResponseData<any>[] ) => void = (
		response: ResponseData<any>[] 
	) => {
		if (response.length > 0) {
			let r = JSON.parse(response[0]['value']).value;
			this.inputModel.value = r;
			this.validationState.emit(ResponseValidationState.VALID);
		}
	};

	/**
	 * @param {*} $event
	 * @param {*} col
	 * @memberof StatedPreferenceQuestionComponent
	 */
	public selectChoice($event, col, index): void {
		this.inputModel.value = col;

		this.response.emit({ value: '{ "value": "' + this.inputModel.value + '"}' });
		this.validationState.emit(ResponseValidationState.VALID);
	}

	/**
	 * @param {string} questionId
	 * @returns {string}
	 * @memberof StatedPreferenceQuestionComponent
	 */
	public responseValue(this: StatedPreferenceTemplateContext, questionName: string, type?: string): string {
		if (this.isResponsesLoaded) {
			// let value = this.component._responderService.getResponseValue(questionName, this.component.respondent);
			let value = null;
			if (type == undefined) {
				return value[0] === undefined ? 'NULL' : value[0].value;
			} else if (type === 'distance') {
				return String(this.component.parseDistance.call(this.component, value, arguments));
			} else if (type === 'time') {
				return String(this.component.parseTime.call(this.component, value, arguments));
			} else if (type === 'duration') {
				return String(this.component.parseTime.call(this.component, value, arguments));
			}
		} else {
			if (type === 'distance' || type === 'duration' || type === 'time') {
				if (this.responsesToLoad.indexOf(arguments[2]) < 0) {
					this.responsesToLoad.push(arguments[2]);
					this.distanceMatrixQuestionQueries.destinations.add(arguments[2]);
				}
				if (this.responsesToLoad.indexOf(arguments[0]) < 0) {
					this.responsesToLoad.push(arguments[0]);
				}

				if (!(arguments[0] in this.distanceMatrixQuestionQueries.origins)) {
					this.distanceMatrixQuestionQueries.origins.add(arguments[0]);
				}
				if (!(arguments[2] in this.distanceMatrixQuestionQueries.destinations)) {
					this.distanceMatrixQuestionQueries.destinations.add(arguments[2]);
				}
			}
			if (this.responsesToLoad.indexOf(questionName) < 0) {
				this.responsesToLoad.push(questionName);
			}
		}
		return questionName;
	}

	public parseDistance(responseValue): string {
		if (responseValue[arguments[1][2] || 0] !== undefined) {
			let jValue = JSON.parse(responseValue[arguments[1][2] || 0].value);
			if (jValue['_tripLegs'] !== undefined) {
				return String(this.parseTripRouteDistance(jValue, arguments[1][2]));
			}
		} else {
			return this.parseMatrix(
				this.context.distanceMatrixResults,
				arguments[1][2],
				arguments[1][0],
				arguments[1][1],
				arguments[1].length > 3 ? arguments[1][3] : 'driving'
			);
		}
		return 'ERROR';
	}

	/**
	 *
	 * @param {*} results
	 * @param {*} to
	 * @param {*} from
	 * @param {*} type
	 * @param {string} [mode='driving']
	 * @returns {string}
	 * @memberof StatedPreferenceQuestionComponent
	 */
	public parseMatrix(results, to, from, type, mode = 'driving'): string {
		if (results[mode] === undefined) {
			return 'NULL';
		}
		let rowIndex = results[mode].origin_addresses.findIndex((e) => e === this.context.distanceMatrixMap[from]);
		let colIndex = results[mode].destination_addresses.findIndex((e) => e === this.context.distanceMatrixMap[to]);

		if (rowIndex >= 0 && colIndex >= 0) {
			let val = results[mode].rows[rowIndex].elements[colIndex][type].value;
			return val;
		} else {
			return 'N/A (No Information)';
		}
	}

	/**
	 *
	 * @param {*} responseValue
	 * @returns {string}
	 * @memberof StatedPreferenceQuestionComponent
	 */
	public parseTime(responseValue): string {
		if (responseValue[arguments[1][2] || 0] !== undefined) {
			let jValue = JSON.parse(responseValue[arguments[1][2] || 0].value);
			if (jValue['_tripLegs'] !== undefined) {
				return String(this.parseTripRouteTime(jValue, arguments[1][2]));
			}
		} else {
			return this.parseMatrix(
				this.context.distanceMatrixResults,
				arguments[1][2],
				arguments[1][0],
				'duration',
				arguments[1].length > 3 ? arguments[1][3] : 'driving'
			);
		}
		return 'ERROR';
	}

	private parseTripRouteDistance(responseValue, routeIndex: number): number {
		let tripLegs = responseValue['_tripLegs'];
		let distance: number = 0;
		for (let leg of tripLegs) {
			for (let instruction of leg['_instructions']) {
				distance += Number.parseInt(instruction['distance']);
			}
		}
		return distance;
	}

	private parseTripRouteTime(responseValue, routeIndex: number): number {
		let tripLegs = responseValue['_tripLegs'];
		let duration: number = 0;
		for (let leg of tripLegs) {
			for (let instruction of leg['_instructions']) {
				duration += Number.parseInt(instruction['time']);
			}
		}
		return duration;
	}

	/**
	 * @memberof StatedPreferenceQuestionComponent
	 */
	public ngAfterViewInit(): void {}
}
