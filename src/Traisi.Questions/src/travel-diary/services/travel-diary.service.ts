import { Injectable, Inject, Injector } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Subject, BehaviorSubject, Observable, concat, of, forkJoin } from 'rxjs';
import { TravelDiaryConfiguration, TravelMode } from '../models/travel-diary-configuration.model';
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
	ValidationError,
} from 'traisi-question-sdk';
import { Console } from 'console';
import { TravelDiaryEditDialogComponent } from '../components/travel-diary-edit-dialog.component';
import { colors, SurveyRespondentUser, TimelineLineResponseDisplayData, TravelDiaryEvent } from '../models/consts';
import { url } from 'inspector';
import { get } from 'http';
import { NumberQuestionConfiguration } from 'general/viewer/number-question/number-question.configuration';
import { TravelDiaryEditor } from './travel-diary-editor.service';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { eventNames } from 'process';

@Injectable()
export class TravelDiaryService {
	public diaryEvents$: BehaviorSubject<TravelDiaryEvent[]>;

	public inactiveDiaryEvents$: Subject<TravelDiaryEvent[]>;

	public userTravelDiaries: { [id: number]: TravelDiaryEvent[] };

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

	public respondents: SurveyRespondentUser[] = [];

	public activeRespondents: SurveyRespondentUser[] = [];

	public isLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	public activeUsers: BehaviorSubject<SurveyRespondentUser[]> = new BehaviorSubject<SurveyRespondentUser[]>([]);

	public users: BehaviorSubject<SurveyRespondentUser[]> = new BehaviorSubject<SurveyRespondentUser[]>([]);

	public activeUser: SurveyRespondentUser;

	public surveyId: number;

	public responseData: { [userId: number]: ResponseTypes.Location };

	private _diaryEvents: TravelDiaryEvent[] = [];

	private _inactiveDiaryEvents: TravelDiaryEvent[] = [];

	public userMap: { [id: number]: SurveyRespondentUser } = {};

	public modeMap: { [id: string]: TravelMode } = {};

	public purposeMap: { [id: string]: TravelMode } = {};

	public isActiveUserDisabled: boolean = false;

	public get viewDate(): Date {
		return this._surveyAccessTime;
	}

	public constructor(
		private _http: HttpClient,
		private _edtior: TravelDiaryEditor,
		@Inject(TraisiValues.SurveyRespondentService) private _respondentService: SurveyRespondentService,
		@Inject(TraisiValues.SurveyResponseService) private _responseService: SurveyResponseService,
		@Inject(TraisiValues.SurveyId) private _surveyId: number,
		@Inject(TraisiValues.Configuration) private _configuration: any,
		@Inject(TraisiValues.Respondent) private _respondent: SurveyRespondent,
		@Inject(TraisiValues.SurveyQuestion) private _question: SurveyViewQuestion,
		@Inject(TraisiValues.SurveyAccessTime) private _surveyAccessTime: Date,
		private _injector: Injector
	) {
		this.diaryEvents$ = new BehaviorSubject<TravelDiaryEvent[]>([]);
		this.inactiveDiaryEvents$ = new Subject<TravelDiaryEvent[]>();
		this.isLoaded.next(false);
		this.userTravelDiaries = {};
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
		this._initializeConfigurationMaps();
		this.loadAddresses();
		this._respondentService.getSurveyGroupMembers(this._respondent).subscribe((respondents) => {
			let primaryHomeAddress: any = {};
			let primaryHomeLat = 0;
			let primaryHomeLng = 0;
			if (respondents.length > 0) {
				primaryHomeAddress = respondents[0].homeAddress;
				primaryHomeLat = respondents[0].homeLatitude;
				primaryHomeLng = respondents[0].homeLongitude;
			}
			for (let x of respondents) {
				let respondentUser = {
					id: x.id,
					name: x.name,
					color: colors.blue,
					homeAddress: primaryHomeAddress,
					homeLatitude: primaryHomeLat,
					homeLongitude: primaryHomeLng,
				};
				if (respondentUser.id === this._respondent.id) {
					this.activeUser = respondentUser;
					this.activeRespondents.push(respondentUser);
				}
				this.userMap[respondentUser.id] = respondentUser;
				this.respondents.push(respondentUser);
				this.userTravelDiaries[respondentUser.id] = [];
			}
			this.userTravelDiaries[this.activeUser.id] = this._diaryEvents;
			this.loadSavedResponses().subscribe({
				next: (v: SurveyResponseViewModel[]) => {
					for (let result of v) {
						this._edtior.createDiaryFromResponseData(
							this.userMap[result.respondent.id],
							result.responseValues as TimelineResponseData[],
							this.userTravelDiaries[result.respondent.id]
						);
						this._edtior.reAlignTimeBoundaries(
							[this.userMap[result.respondent.id]],
							this.userTravelDiaries[result.respondent.id]
						);
					}

					// find respondents with 0 events
					let respondentsToLoad = [];
					for (let r of this.respondents) {
						if (!this._diaryEvents.some((x) => x.meta.user.id === r.id)) {
							respondentsToLoad.push(r);
						}
					}
					if (respondentsToLoad.length > 0) {
						this.loadPriorResponseData(respondentsToLoad).subscribe({
							complete: () => {
								// this._diaryEvents = [].concat(this._diaryEvents);
								this.isLoaded.next(true);
								this.diaryEvents$.next(this._diaryEvents);
								this.activeUsers.next([].concat(this.activeUser));
								this.users.next([].concat(this.respondents));
							},
						});
					} else {
						this.isLoaded.next(true);
						this.users.next([].concat(this.respondents));
						this.activeUsers.next([].concat(this.activeUser));
						this.diaryEvents$.next(this._diaryEvents);
					}
				},
				complete: () => console.log('complete'),
			});
			// this.users.next(this.respondents);
		});

		this.loadPreviousLocations();
	}

	/**
	 *
	 */
	private _initializeConfigurationMaps(): void {
		for (let mode of this.configuration.mode) {
			this.modeMap[mode.id] = mode;
		}
		for (let purpose of this.configuration.purpose) {
			this.purposeMap[purpose.id] = purpose;
		}
	}

	private loadSavedResponses(): Observable<any> {
		return <Observable<any>>(
			(<any>this._responseService.loadSavedResponsesForRespondents([this._question], this.respondents))
		);
	}

	/**
	 *
	 * @param respondent
	 */
	private _removeRespondent(respondent: SurveyRespondentUser) {
		let idx = this.respondents.findIndex((x) => x.id === respondent.id);
		if (idx >= 0 && !this._hasValues(respondent)) {
			this.respondents.splice(idx, 1);
		}
	}

	private _hasValues(respondent: SurveyRespondentUser): boolean {
		return this._diaryEvents.some((x) => x.meta.user.id === respondent.id);
	}

	public get isTravelDiaryValid(): boolean {
		for (let r of this.activeRespondents) {
			let filter = this._diaryEvents.filter((x) => x.meta.user.id === r.id);
			if (filter.length === 0) {
				return false;
			}
			if (!this._validateNoOverlappingEvents(filter)) {
				return false;
			}
			if (!this._validateConsecutiveHomeEvents(filter)) {
				return false;
			}
		}
		return !this._diaryEvents.some((x) => x.meta.model.isValid === false);
	}

	public reportErrors(): ValidationError[] {
		let errors: ValidationError[] = [];

		//for (let r of this.respondents) {
		let filter = this._diaryEvents.filter((x) => x.meta.user.id === this.activeUser.id);
		filter = filter.sort((v1, v2) => v1.start.getTime() - v2.start.getTime());
		if (filter.length === 0) {
			errors.push({
				message: 'You cannot have an empty travel diary.',
			});
		}
		if (!this._validateNoOverlappingEvents(filter)) {
			errors.push({
				message: 'Activities cannot be overlapping.',
			});
		}
		if (!this._validateConsecutiveHomeEvents(filter)) {
			errors.push({
				message: 'You cannot have two home events in a row.',
			});
		}
		for (let i = 0; i < filter.length; i++) {
			let event = filter[i];
			if (event.meta.model.mode === undefined && i > 0) {
				errors.push({
					message: `Activity <strong>${event.meta.model.name}</strong> has no mode assigned.`,
				});
			}
		}
		//}
		return errors;
	}

	/**
	 * Determines if there are any overlapping events for a specific user.
	 * @param userEvents
	 */
	private _validateNoOverlappingEvents(userEvents: TravelDiaryEvent[]): boolean {
		for (let i = 0; i < userEvents.length - 1; i++) {
			if (userEvents[i].end > userEvents[i + 1].start) {
				return false;
			}
			for (let j = i + 1; j < userEvents.length - 1; j++) {
				if (userEvents[i].start >= userEvents[j].start) {
					return false;
				}
			}
		}

		return true;
	}

	private _validateAtLeastOneHOme(userEvents: TravelDiaryEvent[]): boolean {
		return userEvents.some((x) => x.meta.model.purpose.toLowerCase().includes('home'));
	}

	/**
	 *
	 * @param userEvents
	 */
	private _validateConsecutiveHomeEvents(userEvents: TravelDiaryEvent[]): boolean {
		for (let i = 0; i < userEvents.length - 1; i++) {
			if (userEvents[i].meta.model.purpose === 'home' && userEvents[i + 1].meta.model.purpose === 'home') {
				return false;
			}
		}
		return true;
	}

	/**
	 * Resets the travel diary to use the prior and piped information.
	 */
	public resetTravelDiary(): Observable<void> {
		this._diaryEvents.splice(0, this._diaryEvents.length);
		return new Observable((obs) => {
			this.loadPriorResponseData([this.activeUser]).subscribe({
				complete: () => {
					console.log('complete');
					obs.complete();
				},
			});
		});
	}

	public collectFirstTripOfDay(): void {}

	public clearTravelDiary(): void {
		this._diaryEvents.splice(0, this._diaryEvents.length);
		this.diaryEvents$.next(this._diaryEvents);
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
	private loadPriorResponseData(respondents: SurveyRespondentUser[]): Observable<void> {
		return new Observable((obs) => {
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
				if (this.configuration.schoolOutside.length > 1) {
					let schoolModel1 = <SurveyViewQuestion>(
						(<SurveyViewQuestion>(
							this._injector.get('question.' + this.configuration.schoolOutside[0].label)
						))
					);
					let schoolModel2 = <SurveyViewQuestion>(
						(<SurveyViewQuestion>(
							this._injector.get('question.' + this.configuration.schoolOutside[1].label)
						))
					);

					if (schoolModel1.questionType === 'location') {
						schoolLocationId = schoolModel1.questionId;
						madeSchoolTripId = schoolModel2.questionId;
					} else {
						schoolLocationId = schoolModel2.questionId;
						madeSchoolTripId = schoolModel1.questionId;
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
					respondents,
					res,
					homeAllDayId,
					homeDepartureId,
					returnHomeId,
					madeWorkTripId,
					workLocationId,
					madeSchoolTripId,
					schoolLocationId
				);
				obs.complete();
			});
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
		respondents: SurveyRespondentUser[],
		res: SurveyResponseViewModel[],
		homeAllDayId: number,
		homeDepartureId: number,
		returnHomeId: number,
		workDepartureId: number,
		workLocationId: number,
		schoolDepartureId: number,
		schoolLocationId: number
	): void {
		let toRemove = [];
		let added = [];

		for (let r of respondents) {
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

			const homeDeparture =
				responseMatches.find((x) => x.questionId === homeDepartureId)?.responseValues[0].code?.toUpperCase() ===
				'YES';

			const homeReturn =
				responseMatches.find((x) => x.questionId === returnHomeId)?.responseValues[0].code?.toUpperCase() ===
				'YES';
			const workLocation = responseMatches.find((x) => x.questionId === workLocationId)?.responseValues[0];
			const schoolLocation = responseMatches.find((x) => x.questionId === schoolLocationId)?.responseValues[0];

			if (responseMatches.length === 0) {
				toRemove.push(r);
				break;
			}
			added.push(r);

			let events = this._edtior.createDefaultTravelDiaryforRespondent(
				this.userMap[r.id],
				isHomeAllDay,
				homeDeparture,
				workDeparture,
				schoolDeparture, // school dept,
				homeReturn, // returned h ome
				workLocation, // work loc,
				schoolLocation //school loc
			);
			if (this.activeRespondents.some((x) => x.id === r.id)) {
				this.addEvents(events.sort((x1, x2) => x1.start.getTime() - x2.start.getTime()));
			} else {
				this.addInactiveEvents(
					r,
					events.sort((x1, x2) => x1.start.getTime() - x2.start.getTime())
				);
			}
		}
		// let toRemove = [];
		for (let r of this.respondents) {
			if (!added.some((x) => x.id === r.id)) {
				toRemove.push(r);
			}
		}
		for (let r of toRemove) {
			this._removeRespondent(r);
			if (r.id === this.activeUser.id && this.userTravelDiaries[this.activeUser.id].length === 0) {
				this.isActiveUserDisabled = true;
			}
		}

		this.respondents = this.respondents;
	}

	/**
	 * Loads addresses
	 */
	public loadAddresses(): void {
		this.addresses$ = <any>concat(
			of(null), // default items
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

	public get diaryEvents(): TravelDiaryEvent[] {
		return this._diaryEvents;
	}

	/**
	 * Converts the timeline events and model data into timeline response data that can be saved
	 * @param respondent
	 */
	public getTimelineResponseDataForRespondent(respondent: SurveyRespondent): TimelineResponseData[] {
		let events = this.userTravelDiaries[respondent.id];
		let timelineData = [];
		for (let event of events) {
			timelineData.push(event.meta.model);
		}
		return timelineData;
	}

	/**
	 * Adds the new event data.
	 *
	 * @param {LocationResponseData} event
	 */
	public newEvent(event: TimelineLineResponseDisplayData): void {
		let events = this._splitEvent(event);
		for (let splitEvent of events) {
			this._edtior.insertEvent(this.userTravelDiaries[splitEvent.users[0].id], splitEvent);
			if (splitEvent.users[0].id !== this.activeUser.id) {
				this.inactiveDiaryEvents$.next(this.userTravelDiaries[splitEvent.users[0].id]);
			}
		}
		// update the active user
		this.diaryEvents$.next(this._diaryEvents);
	}

	/**
	 * Splits the event in multiple events, one for each user
	 * @param event
	 */
	private _splitEvent(event: TimelineLineResponseDisplayData): TimelineLineResponseDisplayData[] {
		let events: TimelineLineResponseDisplayData[] = [];
		for (let user of event.users) {
			let splitEvent = Object.assign({}, event);
			splitEvent.users = [user];
			// set the mode to undefined
			if (user.id !== this.activeUser.id) {
				splitEvent.mode = undefined;
			}
			events.push(splitEvent);
		}
		return events;
	}

	/**
	 *
	 * @param event
	 */
	public updateEvent(event: TimelineLineResponseDisplayData, oldEvent: TimelineLineResponseDisplayData): void {
		// update for the main respondent
		let events = this._splitEvent(event);
		for (let splitEvent of events) {
			this._edtior.updateEvent(splitEvent, oldEvent, this.userTravelDiaries[splitEvent.users[0].id]);
			if (splitEvent.users[0].id !== this.activeUser.id) {
				this.inactiveDiaryEvents$.next(this.userTravelDiaries[splitEvent.users[0].id]);
			}
		}
		// update events for active user
		this.diaryEvents$.next(this._diaryEvents);
	}

	/**
	 * Adds a set of events to the existing diary events. No logic or other manipulation is done.
	 * This is run usually in the pregeneration of events.
	 * @param events
	 */
	public addEvents(events: TravelDiaryEvent[]): void {
		if (this._diaryEvents.length === 0) {
			this._diaryEvents.push(...events);
		}

		// = this._diaryEvents.concat(events);
		this.diaryEvents$.next(this._diaryEvents);
	}

	/**
	 *
	 * @param user
	 * @param events
	 */
	public addInactiveEvents(user: SurveyRespondentUser, events: TravelDiaryEvent[]): void {
		if (this.userTravelDiaries[user.id].length === 0) {
			this.userTravelDiaries[user.id].push(...events);
		}

		this.inactiveDiaryEvents$.next(this.userTravelDiaries[user.id]);
	}

	/**
	 * Deletes the event from all applicable travel diaries
	 * @param event
	 */
	public deleteEvent(event: TimelineLineResponseDisplayData): void {
		let events = this._splitEvent(event);
		for (let splitEvent of events) {
			this._edtior.deleteEvent(splitEvent, this.userTravelDiaries[splitEvent.users[0].id]);
			if (splitEvent.users[0].id !== this.activeUser.id) {
				this.inactiveDiaryEvents$.next(this.userTravelDiaries[splitEvent.users[0].id]);
			}
		}

		this.diaryEvents$.next(this._diaryEvents);
	}
}
