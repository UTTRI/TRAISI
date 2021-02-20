import { Inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, from, Observable, of, ReplaySubject, Subject } from 'rxjs';
import {
	TraisiValues,
	SurveyRespondent,
	SurveyResponseService,
	SurveyRespondentService,
	Address,
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
import { RespondentData } from 'travel-diary-scheduler/models/respondent-data.model';

@Injectable()
export class TravelDiaryScheduleRespondentDataService {
	public respondentData: RespondentData;

	private _respondents: SurveyRespondent[] = [];

	private _respondents$: ReplaySubject<SurveyRespondent[]> = new ReplaySubject<SurveyRespondent[]>();

	public get respondents(): Observable<SurveyRespondent[]> {
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
		this.respondentData = {
			workLocations: [],
			schoolLocations: [],
			homeLocation: undefined,
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
		this._responseService
			.loadSavedResponsesForRespondents(schoolLocations.concat(workLocations), [this._respondent])
			.subscribe((results) => {
				this.respondentData.schoolLocations = results
					.filter((r) => schoolLocations.some((x) => x.questionId == r.questionId))
					.map((x) => {
						return {
							purpose: {
								id: SCHOOL_DEFINED_PURPOSE,
								label: 'School',
								icon: '',
								allowFirstLocation: true,
								askIfOtherPassengers: false,
							},
							address: x.responseValues[0].address,
						};
					}) as any[];
				this.respondentData.workLocations = results
					.filter((r) => workLocations.some((x) => x.questionId == r.questionId))
					.map((x) => {
						return {
							purpose: {
								id: WORK_DEFINED_PURPOSE,
								label: 'Work',
								icon: '',
								allowFirstLocation: true,
								askIfOtherPassengers: false,
							},
							address: x.responseValues[0].address,
						};
					}) as any[];
				console.log(this.respondentData);
			});

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
			this.respondentData.homeLocation = {
				address: primaryHomeAddress,
				purpose: {
					id: HOME_DEFINED_PURPOSE,
					label: 'Home',
					icon: '',
					allowFirstLocation: true,
					askIfOtherPassengers: false,
				},
			};
			for (let respondent of respondents) {
				this._respondents.push(respondent);
			}
			this._respondents$.next(this._respondents);
		});
	}
}
