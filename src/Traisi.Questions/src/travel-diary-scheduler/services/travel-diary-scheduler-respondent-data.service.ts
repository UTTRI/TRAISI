import { Inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, from, Observable, of, ReplaySubject, Subject } from 'rxjs';
import {
	TraisiValues,
	SurveyRespondent,
	SurveyResponseService,
	SurveyRespondentService,
	Address,
	SurveyRespondentViewModel,
	SurveyResponseViewModel,
} from 'traisi-question-sdk';
import { TravelDiarySchedulerConfiguration } from 'travel-diary-scheduler/models/config.model';
import {
	HOME_DEFINED_PURPOSE,
	HOME_PURPOSE,
	SCHOOL_DEFINED_PURPOSE,
	SCHOOL_PURPOSE,
	WORK_DEFINED_PURPOSE,
	WORK_PURPOSE,
} from 'travel-diary-scheduler/models/consts';
import { PurposeLocation } from 'travel-diary-scheduler/models/purpose-location.model';
import { RespondentData, RespondentsData } from 'travel-diary-scheduler/models/respondent-data.model';

@Injectable()
export class TravelDiaryScheduleRespondentDataService {
	public respondentsData: RespondentsData;

	private _respondents: SurveyRespondent[] = [];

	public get respondents(): SurveyRespondent[] {
		return this._respondents;
	}

	private _respondents$: ReplaySubject<SurveyRespondent[]> = new ReplaySubject<SurveyRespondent[]>();

	public get respondents$(): Observable<SurveyRespondent[]> {
		return this._respondents$;
	}

	/**
	 *
	 * @param _primaryRespondent
	 * @param _respondent
	 * @param _configuration
	 * @param _responseService
	 * @param _respondentService
	 * @param _injector
	 */
	public constructor(
		@Inject(TraisiValues.PrimaryRespondent) private _primaryRespondent: SurveyRespondent,
		@Inject(TraisiValues.Respondent) private _respondent: SurveyRespondent,
		@Inject(TraisiValues.Configuration) private _configuration: TravelDiarySchedulerConfiguration,
		@Inject(TraisiValues.SurveyResponseService) private _responseService: SurveyResponseService,
		@Inject(TraisiValues.SurveyRespondentService) private _respondentService: SurveyRespondentService,
		private _injector: Injector
	) {
		this.initialize();
	}

	public initialize(): void {
		this.respondentsData = {
			homeLocation: undefined,
			respondent: {},
		};

		let workLocations = [];
		let schoolLocations = [];
		// load work locations
		for (let workLocation of this._configuration.workLocations) {
			let workQuestion = this._injector.get('question.' + workLocation.label);
			workLocations.push(workQuestion);
		}

		for (let schoolLocation of this._configuration.schoolLocations) {
			let schoolQuestion = this._injector.get('question.' + schoolLocation.label);
			schoolLocations.push(schoolQuestion);
		}
		// get the primary home address

		this._respondentService.getSurveyGroupMembers(this._respondent).subscribe((respondents) => {
			let primaryHomeAddress: Address = {};
			let primaryHomeLat = 0;
			let primaryHomeLng = 0;
			if (respondents.length > 0) {
				primaryHomeAddress = respondents[0].homeAddress;
				primaryHomeLat = respondents[0].homeLatitude;
				primaryHomeLng = respondents[0].homeLongitude;
			}
			this.respondentsData.homeLocation = {
				address: primaryHomeAddress,
				purpose: {
					id: HOME_DEFINED_PURPOSE,
					label: 'Primary Home',
					icon: '',
					allowFirstLocation: true,
					askIfOtherPassengers: false,
					isDropOffOrPickup: true,
				},
				latitide: primaryHomeLat,
				longitude: primaryHomeLng,
			};
			for (let respondent of respondents) {
				this._respondents.push(respondent);
			}

			this._responseService
				.loadSavedResponsesForRespondents(schoolLocations.concat(workLocations), this._respondents)
				.subscribe((results: SurveyResponseViewModel[]) => {
					console.log(results);
					for (let respondent of this._respondents) {
						this.respondentsData.respondent[respondent.id] = {
							schoolLocations: [],
							workLocations: [],
						};
						this.respondentsData.respondent[respondent.id].schoolLocations = results
							.filter((r) =>
								schoolLocations.some(
									(x) => x.questionId == r.questionId && r.respondent.id === respondent.id
								)
							)
							.map((x) => {
								return {
									purpose: {
										id: SCHOOL_DEFINED_PURPOSE,
										label: 'School',
										icon: '',
										allowFirstLocation: true,
										askIfOtherPassengers: false,
										respondentId: respondent.id,
									},
									address: x.responseValues[0].address,
									latitide: x.responseValues[0].latitude,
									longitude: x.responseValues[0].longitude,
								};
							}) as any[];
						this.respondentsData.respondent[respondent.id].workLocations = results
							.filter((r) =>
								workLocations.some(
									(x) => x.questionId === r.questionId && r.respondent.id === respondent.id
								)
							)
							.map((x) => {
								return {
									purpose: {
										id: WORK_DEFINED_PURPOSE,
										label: 'Work',
										icon: '',
										allowFirstLocation: true,
										askIfOtherPassengers: false,
										respondentId: respondent.id,
									},
									address: x.responseValues[0].address,
									latitide: x.responseValues[0].latitude,
									longitude: x.responseValues[0].longitude,
								};
							}) as any[];
					}
					this._respondents$.next(this._respondents);
				});
		});
	}
}
