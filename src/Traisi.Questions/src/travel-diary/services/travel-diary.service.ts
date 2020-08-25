import { Injectable, Inject, Injector } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Subject, BehaviorSubject, Observable, concat, of } from 'rxjs';
import { TravelDiaryConfiguration } from '../models/travel-diary-configuration.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap, map } from 'rxjs/operators';
import { formatRelative } from 'date-fns';
import {
	SurveyRespondentService,
	SurveyRespondent,
	SurveyResponseService,
	QuestionResponseType,
	ResponseTypes,
	TraisiValues,
	LocationResponseData,
	SurveyViewQuestion,
	SurveyViewerLogicRuleViewModel,
	TimelineResponseData,
	SurveyResponseViewModel,
} from 'traisi-question-sdk';
import { Console } from 'console';
import { TravelDiaryEditDialogComponent } from '../components/travel-diary-edit-dialog.component';
import { colors, SurveyRespondentUser } from '../models/consts';
import { url } from 'inspector';
import { get } from 'http';
import { NumberQuestionConfiguration } from 'general/viewer/number-question/number-question.configuration';
import { TravelDiaryEditor } from './travel-diary-editor.service';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

@Injectable()
export class TravelDiaryService {
	public diaryEvents$: BehaviorSubject<CalendarEvent[]>;

	public configuration: TravelDiaryConfiguration = {
		purpose: [],
		mode: [],
		homeAllDay: undefined,
		homeDeparture: undefined,
		returnHome: undefined,
		workOutside: undefined,
		schoolOutside: undefined,
	};

	public addresses$: Observable<string[]>;

	public addressInput$: Subject<string> = new Subject<string>();

	public addressesLoading: boolean = false;

	public respondents = [];

	public isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	public users: BehaviorSubject<SurveyRespondentUser[]> = new BehaviorSubject<SurveyRespondentUser[]>([]);

	public surveyId: number;

	public responseData: { [userId: number]: ResponseTypes.Location };

	private _diaryEvents: CalendarEvent[] = [];

	public userMap: { [id: number]: SurveyRespondentUser } = {};

	public constructor(
		private _http: HttpClient,
		private _edtior: TravelDiaryEditor,
		@Inject(TraisiValues.SurveyRespondentService) private _respondentService: SurveyRespondentService,
		@Inject(TraisiValues.SurveyResponseService) private _responseService: SurveyResponseService,
		@Inject(TraisiValues.SurveyId) private _surveyId: number,
		@Inject(TraisiValues.Configuration) private _configuration: any,
		@Inject(TraisiValues.Respondent) private _respondent: SurveyRespondent,
		private _injector: Injector
	) {
		this.diaryEvents$ = new BehaviorSubject<CalendarEvent[]>([]);
	}

	/**
	 *
	 *
	 * @param {SurveyRespondent} respondent
	 * @param {*} configuration
	 */
	public initialize(): void {
		this.configuration = Object.assign({}, this._configuration);
		this.configuration.purpose = this._configuration.purpose ?? [];
		this.configuration.mode = this._configuration.mode ?? [];
		this.loadAddresses();

		this._respondentService.getSurveyGroupMembers(this._respondent).subscribe((respondents) => {
			for (let x of respondents) {
				let respondentUser = {
					id: x.id,
					name: x.name,
					color: colors.blue,
				};
				this.respondents.push(respondentUser);
				this.userMap[respondentUser.id] = respondentUser;
			}
			this.users.next(this.respondents);
			this.loadPriorResponseData();
			this.isLoaded.next(true);
		});
		this.loadPreviousLocations();
	}

	/**
	 *
	 */
	public resetAddressQuery(): void {
		this.addressInput$.next('');
		this.loadAddresses();
	}

	public loadPreviousLocations(): void {
		this._responseService
			.listSurveyResponsesOfType(this._surveyId, QuestionResponseType.Location)
			.subscribe((x) => {
				let rValues = x.responseValues;
				// console.log(x[0]);
			});
	}

	/**
	 * Loads prior response data for questions for initializing timeline
	 */
	private loadPriorResponseData(): void {
		let questionIds: SurveyViewQuestion[] = [];
		let homeAllDayId = 0;
		let homeDepartureId = 0;
		let returnHomeId = 0;
		let madeWorkTripId = 0;
		let workLocationId = 0;
		let madeSchoolTripId = 0;
		let schoolLocationId = 0;
		if (this.configuration.homeAllDay) {
			let homeAllDayQuestionModel = <SurveyViewQuestion>(
				this._injector.get('question.' + this.configuration.homeAllDay[0].label)
			);
			homeAllDayId = homeAllDayQuestionModel.questionId;
			questionIds.push(homeAllDayQuestionModel);
		}
		if (this.configuration.homeDeparture) {
			let homeDepartureModel = <SurveyViewQuestion>(
				(<SurveyViewQuestion>this._injector.get('question.' + this.configuration.homeDeparture[0].label))
			);
			questionIds.push(homeDepartureModel);
			homeDepartureId = homeDepartureModel.questionId;
		}
		if (this.configuration.returnHome) {
			let homeReturnModel = <SurveyViewQuestion>(
				(<SurveyViewQuestion>this._injector.get('question.' + this.configuration.returnHome[0].label))
			);
			questionIds.push(homeReturnModel);
			returnHomeId = homeReturnModel.questionId;
		}
		if (this.configuration.workOutside) {
			if (this.configuration.workOutside.length > 1) {
				let workOutsideModel1 = <SurveyViewQuestion>(
					(<SurveyViewQuestion>this._injector.get('question.' + this.configuration.workOutside[0].label))
				);
				let workOutsideModel2 = <SurveyViewQuestion>(
					(<SurveyViewQuestion>this._injector.get('question.' + this.configuration.workOutside[1].label))
				);

				if (workOutsideModel1.questionType === 'location') {
					workLocationId = workOutsideModel1.questionId;
					madeWorkTripId = workOutsideModel2.questionId;
				} else {
					workLocationId = workOutsideModel2.questionId;
					madeWorkTripId = workOutsideModel1.questionId;
				}
				questionIds.push(workOutsideModel1);
				questionIds.push(workOutsideModel2);
			} else {
				console.warn(
					'Unable to initialize diary for respondent, not enough information exists in configuration.'
				);
			}
		}
		if (this.configuration.schoolOutside) {
			if (this.configuration.workOutside.length > 1) {
				let schoolModel1 = <SurveyViewQuestion>(
					(<SurveyViewQuestion>this._injector.get('question.' + this.configuration.workOutside[0].label))
				);
				let schoolModel2 = <SurveyViewQuestion>(
					(<SurveyViewQuestion>this._injector.get('question.' + this.configuration.workOutside[1].label))
				);

				if (schoolModel1.questionType === 'location') {
					schoolLocationId = schoolModel1.questionId;
					madeSchoolTripId = schoolModel2.questionId;
				} else {
					workLocationId = schoolModel2.questionId;
					madeWorkTripId = schoolModel1.questionId;
				}
				questionIds.push(schoolModel1);
				questionIds.push(schoolModel2);
			} else {
				console.warn(
					'Unable to initialize diary for respondent, not enough information exists in configuration.'
				);
			}
		}
		this._responseService.loadSavedResponsesForRespondents(questionIds, this.respondents).subscribe((res) => {
			this._initializeSmartFill(
				res,
				homeAllDayId,
				homeDepartureId,
				returnHomeId,
				madeWorkTripId,
				workLocationId,
				madeSchoolTripId,
				schoolLocationId
			);
		});
	}

	/**
	 * Initializes the smart fill feature, will pass the appropriate information to diary editor to add appropriate events.
	 * @param res
	 * @param homeAllDayId
	 * @param homeDepartureId
	 * @param returnHomeId
	 */
	private _initializeSmartFill(
		res: SurveyResponseViewModel[],
		homeAllDayId: number,
		homeDepartureId: number,
		returnHomeId: number,
		workDepartureId: number,
		workLocationId: number,
		schoolDepartureId: number,
		schoolLocationId: number
	): void {
		for (let r of this.respondents) {
			let responseMatches = res.filter((x) => x.respondent.id === r.id);
			// responses belonging to a specific user
			const isHomeAllDay =
				responseMatches.find((x) => x.questionId === homeAllDayId)?.responseValues[0].code?.toUpperCase() ===
				'YES';
			const workDeparture =
				responseMatches.find((x) => x.questionId === workDepartureId)?.responseValues[0].code?.toUpperCase() ===
				'YES';
			const schoolDeparture =
				responseMatches
					.find((x) => x.questionId === schoolDepartureId)
					?.responseValues[0].code?.toUpperCase() === 'YES';

			const workLocation = responseMatches.find((x) => x.questionId === workLocationId)?.responseValues[0];
			const schoolLocation = responseMatches.find((x) => x.questionId === schoolLocationId)?.responseValues[0];

			let events = this._edtior.createDefaultTravelDiaryforRespondent(
				this.userMap[r.id],
				isHomeAllDay,
				workDeparture,
				schoolDeparture, // school dept,
				true, // returned h ome
				workLocation, // work loc,
				schoolLocation //school loc
			);
			this.addEvents(events);
		}
	}

	public loadAddresses(): void {
		this.addresses$ = <any>concat(
			of(['']), // default items
			this.addressInput$.pipe(
				distinctUntilChanged(),
				debounceTime(500),
				tap(() => (this.addressesLoading = true)),
				switchMap((term) =>
					this.queryAddresses(term).pipe(
						map((v) => {
							return v['features'];
						}),
						catchError(() => of([])), // empty list on error
						tap((v) => {
							this.addressesLoading = false;
						})
					)
				)
			)
		);
	}

	///geocoding/v5/{endpoint}/{search_text}.json
	private queryAddresses(input: string): Observable<Object> {
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${input}.json`;
		const options = {
			params: new HttpParams()
				.set(
					'access_token',
					'pk.eyJ1IjoiYnJlbmRhbmJlbnRpbmciLCJhIjoiY2s4Y3IwN3U3MG1obzNsczJjMGhoZWc4MiJ9.OCDfSypjueUF_gKejRr6Og'
				)
				.set('country', 'ca'),
		};
		return this._http.get(url, options);
	}

	public get diaryEvents(): CalendarEvent[] {
		return this._diaryEvents;
	}

	/**
	 * Adds the new event data.
	 *
	 * @param {LocationResponseData} event
	 */
	public newEvent(event: TimelineResponseData & { users: SurveyRespondentUser[] }): void {
		let events: CalendarEvent[] = this._diaryEvents;
		for (let u of event.users) {
			let newEvent = {
				title: event.name,
				start: event.timeA,
				end: event.timeB,
				draggable: false,
				resizable: { afterEnd: true },
				meta: {
					purpose: event.purpose['label'],
					address: event.address['stnumber'] + ' ' + event.address['staddress'] + ' ' + event.address['city'],
					user: u,
					mode: event.mode['label'],
					model: event,
					id: Date.now(),
				},
				color: colors.blue,
			};
			this._edtior.insertEvent(this._diaryEvents,newEvent);
		}
		this.diaryEvents$.next(events);
		this._diaryEvents = events;
	}

	/**
	 * Adds a set of events to the existing diary events. No logic or other manipulation is done.
	 * This is run usually in the pregeneration of events.
	 * @param events 
	 */
	public addEvents(events: CalendarEvent[]): void {
		this._diaryEvents = this._diaryEvents.concat(events);
		this.diaryEvents$.next(this._diaryEvents);
	}

	// deletes the associated event
	public deleteEvent(event: TimelineResponseData & { id: number }): void {
		for (let i = 0; i < this._diaryEvents.length; i++) {
			let e = this._diaryEvents[i];
			if (e.meta.model.id === event.id) {
				console.log('deleted ');
				this._diaryEvents.splice(i, 1);
				console.log('event removed');
				break;
			}
		}
		this._diaryEvents = this._diaryEvents;
		this.diaryEvents$.next(this._diaryEvents);
	}
}
