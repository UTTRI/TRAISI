// adds, moves etc travel diary

import { Inject, Injectable } from '@angular/core';
import { CalendarEvent } from 'calendar-utils';
import { start } from 'repl';
import { v4 as uuidv4 } from 'uuid';
import { SurveyResponseViewModel, LocationResponseData, TimelineResponseData, TraisiValues } from 'traisi-question-sdk';
import {
	SurveyRespondentUser,
	TimelineLineResponseDisplayData,
	TravelDiaryEvent,
	colors,
} from 'travel-diary/models/consts';

const TIME_DELTA: number = -4;

// events based on user input
@Injectable()
export class TravelDiaryEditor {
	private _idCounter: number = 0;

	public constructor(@Inject(TraisiValues.SurveyAccessTime) private _surveyAccessTime: Date) {}

	/**
	 * Will attempt to create, if  any, the appropriate initial events on the travel diary
	 * for this user.
	 * @param respondent
	 */
	public createDefaultTravelDiaryforRespondent(
		user: SurveyRespondentUser,
		homeAllDay: boolean,
		homeDeparture: boolean,
		workDeparture: boolean,
		schoolDeparture: boolean,
		returnedHome: boolean,
		workLocation?: any,
		schoolLoation?: any
	): TravelDiaryEvent[] {
		let events: TravelDiaryEvent[] = [];

		if (homeAllDay) {
			events = events.concat(this.createHomeAllDayEvent(user));
			return events;
		} else if ((workDeparture || schoolDeparture || returnedHome) && homeDeparture) {
			let homeEvent = this.createHomeStartEvent(user);
			events.push(homeEvent);
		}

		if (returnedHome) {
			let homeEndEvent = this.createHomeEndEvent(user);
			events.push(homeEndEvent);
		}

		if (workDeparture) {
			let workEvent = this.createHomeWorkHomeEvent(
				user,
				workLocation,
				returnedHome,
				schoolDeparture,
				homeDeparture
			);
			events.push(workEvent);
		}
		if (schoolDeparture) {
			let schoolEvent = this.createHomeSchoolHomeEvent(
				user,
				schoolLoation,
				returnedHome,
				workDeparture,
				homeDeparture
			);
			events.push(schoolEvent);
		}

		this.resetOrders(events);
		return events;
	}

	public resetOrders(event: TravelDiaryEvent[]): void {
		for (let i = 0; i < event.length; i++) {
			event[i].meta.model.order = i;
		}
	}

	public generateId(): string {
		return uuidv4();
	}

	private createHomeStartEvent(user: SurveyRespondentUser): TravelDiaryEvent {
		let homeEvent = this.createBaseEvent(user, 'At Home', 'home');
		homeEvent.end = new Date(new Date(this._surveyAccessTime).setHours(9 + TIME_DELTA, 0, 0, 0));
		homeEvent.meta.model.timeA = new Date(new Date(this._surveyAccessTime).setHours(0, 1, 0, 0));
		homeEvent.meta.model.isValid = true;
		homeEvent.meta.model.order = 0;
		homeEvent.meta.model.address = user.homeAddress ?? {};
		homeEvent.meta.model.latitude = user.homeLatitude;
		homeEvent.meta.model.longitude = user.homeLongitude;
		return homeEvent;
	}

	private createHomeEndEvent(user: SurveyRespondentUser): TravelDiaryEvent {
		let returnHomeEvent = this.createBaseEvent(user, 'Return Home', 'home');
		returnHomeEvent.start = new Date(new Date(this._surveyAccessTime).setHours(23 + TIME_DELTA, 59, 0, 0));
		returnHomeEvent.end = new Date(new Date(this._surveyAccessTime).setHours(23, 59, 0, 0));
		returnHomeEvent.meta.model.timeA = new Date(new Date(this._surveyAccessTime).setHours(23, 1, 0, 0));
		returnHomeEvent.meta.model.isValid = false;
		returnHomeEvent.meta.model.order = 2;
		returnHomeEvent.meta.model.address = user.homeAddress ?? {};
		returnHomeEvent.meta.model.latitude = user.homeLatitude;
		returnHomeEvent.meta.model.longitude = user.homeLongitude;
		return returnHomeEvent;
	}

	private createHomeWorkHomeEvent(
		user: SurveyRespondentUser,
		workLocation: LocationResponseData,
		returnedHome: boolean,
		hasSchoolTrip: boolean,
		startAtHome: boolean
	): TravelDiaryEvent {
		let workEvent = this.createBaseEvent(user, 'Work (Not Home)', 'work');
		workEvent.start = new Date(new Date(this._surveyAccessTime).setHours(9 + TIME_DELTA, 1, 0, 0));
		workEvent.end = new Date(
			new Date(this._surveyAccessTime).setHours(hasSchoolTrip ? 12 + TIME_DELTA : 17 + TIME_DELTA, 0, 0, 0)
		);
		workEvent.meta.model.timeA = new Date(new Date(this._surveyAccessTime).setHours(9, 1, 0, 0));
		workEvent.meta.model.timeB = new Date(
			new Date(this._surveyAccessTime).setHours(hasSchoolTrip ? 12 : 17, 0, 0, 0)
		);

		if (workLocation) {
			workEvent.meta.model.address = workLocation.address;
			workEvent.meta.model.latitude = workLocation.latitude;
			workEvent.meta.model.longitude = workLocation.longitude;
			workEvent.meta.model.order = 1;
		}
		return workEvent;
	}

	private createHomeSchoolHomeEvent(
		user: SurveyRespondentUser,
		schoolLocation: LocationResponseData,
		returnedHome: boolean,
		hasWorkTrip: boolean,
		startAtHome: boolean
	): TravelDiaryEvent {
		let homeEvent = this.createBaseEvent(user, 'At Home', 'home');
		let workEvent = this.createBaseEvent(user, 'School (Not Home)', 'school');
		homeEvent.end = new Date(new Date(this._surveyAccessTime).setHours(9 + TIME_DELTA, 0, 0, 0));
		workEvent.start = new Date(
			new Date(this._surveyAccessTime).setHours(hasWorkTrip ? 12 + TIME_DELTA : 9 + TIME_DELTA, 1, 0, 1)
		);
		workEvent.end = new Date(new Date(this._surveyAccessTime).setHours(17 + TIME_DELTA, 0, 0, 0));

		workEvent.meta.model.timeA = new Date(
			new Date(this._surveyAccessTime).setHours(hasWorkTrip ? 12 + TIME_DELTA : 9 + TIME_DELTA, 1, 0, 1)
		);
		workEvent.meta.model.timeB = new Date(new Date(this._surveyAccessTime).setHours(17 + TIME_DELTA, 0, 0, 0));
		workEvent.meta.model.address = schoolLocation.address;
		workEvent.meta.model.latitude = schoolLocation.latitude;
		workEvent.meta.model.longitude = schoolLocation.longitude;
		workEvent.meta.model.order = 1;

		return workEvent;
	}

	/**
	 * Inserts this event into the passed list of events. It assumes the event users have already
	 * beeen split.
	 *
	 * The source events are modified in place.
	 * @param eventData
	 */
	public insertEvent(events: TravelDiaryEvent[], event: TimelineLineResponseDisplayData): TravelDiaryEvent[] {
		let displayId: string;
		if (!event.identifier) {
			displayId = this.generateId();
		} else {
			displayId = event.identifier;
		}


		event.identifier = displayId;
		let u = event.users[0];
		if (!event.isInserted) {
			let startTime = new Date(event.timeA);
			startTime.setHours(startTime.getHours() + TIME_DELTA);

			if (event.isFirstEvent) {
				startTime = new Date(new Date(this._surveyAccessTime).setHours(0, 1, 0, 0));
				event.timeA = new Date(new Date(this._surveyAccessTime).setHours(0, 1, 0, 0));
			}
			let newEvent = {
				id: displayId,
				title: event.name,
				start: startTime,
				end: event.isFirstEvent
					? new Date(new Date(this._surveyAccessTime).setHours(9 + TIME_DELTA, 0, 0, 0))
					: undefined,
				draggable: false,
				resizable: { afterEnd: true },
				order: event.isFirstEvent ? 0 : 1,
				meta: {
					purpose: event.purpose['label'],
					address: event.address,
					user: u,
					mode: event.mode ? event.mode['label'] : undefined,
					model: event,
					id: displayId,
				},
				color: colors.blue,
			};
			newEvent.meta.model.identifier = displayId;
			newEvent.meta.model.isValid = true;
			events.push(newEvent);
		} else {
			// need to insert this event, but then find overalpping event
			let overlap = this.getOverlappingDeparture(event, events);
			let startTime = new Date(event.timeA);
			startTime.setHours(startTime.getHours() + TIME_DELTA);

			let endTime = new Date(event.insertedEndTime);
			endTime.setHours(endTime.getHours() + TIME_DELTA);
			if (overlap) {
				// set the overlap END to the start of this event
				overlap.end = event.timeA;
				// create a new event that
				let insertedEvent = {
					id: displayId,
					title: event.name,
					start: startTime,
					end: endTime,
					draggable: false,
					resizable: { afterEnd: true },
					meta: {
						purpose: event.purpose['label'],
						address: event.address,
						user: u,
						mode: event.mode?.['label'],
						model: event,
						id: displayId,
					},
					color: colors.blue,
				};
				displayId = this.generateId();
				let returnEvent = {
					id: displayId,
					title: overlap.title,
					start: endTime,
					end: overlap.end,
					draggable: false,
					resizable: { afterEnd: true },
					meta: {
						purpose: overlap.meta.purpose,
						address: overlap.meta.address,
						user: overlap.meta.user,
						mode: overlap.meta.mode,
						model: Object.assign({}, overlap.meta.model),
						id: displayId,
					},
					color: colors.blue,
				};
				returnEvent.meta.model.identifier = displayId;
				returnEvent.meta.model.timeA = event.insertedEndTime;
				returnEvent.meta.model.isValid = overlap.meta.model.isValid;

				if (returnEvent.meta.model.purpose === 'home') {
					returnEvent.end = new Date(new Date().setHours(23, 59, 0, 0));
				}

				insertedEvent.meta.model.isValid = true;
				events.push(insertedEvent);
				events.push(returnEvent);
			} else {
				// no overlap (case where other user has diferent condition than primary user)
				event.isInserted = false;
				return this.insertEvent(events, event);
			}
		}
		this.sortEvents(events);
		this.reAlignTimeBoundaries([].concat(u), events);
		this.sortEvents(events);
		this.updateHomeEvents(events);

		// determine if made insert home event
		let idx = events.findIndex((x) => x.meta.model.identifier === event.identifier);

		if (idx > 1) {
			let prevEvent = events[idx - 1];
			if (prevEvent.meta.model.purpose === 'home') {
				this.deleteEvent(prevEvent.meta.model, events);
			}
		}

		return events;
	}

	/**
	 *
	 * @param model
	 * @param events
	 */
	public getOverlappingDeparture(
		model: TimelineLineResponseDisplayData,
		events: TravelDiaryEvent[]
	): TravelDiaryEvent {
		if (!model.users || !model.timeA) {
			return undefined;
		}
		for (let respondent of model.users) {
			// get users for event
			let userEvents = events.filter((x) => x.meta.user.id === respondent.id);
			// find index of this event

			for (let i = 1; i < userEvents.length; i++) {
				let timeA = new Date(userEvents[i].start);
				timeA.setHours(timeA.getHours() - TIME_DELTA);
				let timeB = new Date(userEvents[i].end);
				timeB.setHours(timeB.getHours() - TIME_DELTA);

				if (userEvents[i].meta.model.identifier === model.identifier) {
					continue;
				}

				if (timeA.getTime() < model.timeA.getTime() && timeB.getTime() > model.timeA.getTime()) {
					return userEvents[i];
				}
			}
		}
		return undefined;
	}

	/**
	 *
	 * @param model
	 * @param events
	 */
	public getOverlappingLaterDeparture(
		model: TimelineLineResponseDisplayData,
		events: TravelDiaryEvent[]
	): TravelDiaryEvent {
		if (!model.users) {
			return undefined;
		}
		for (let respondent of model.users) {
			// get users for event
			let userEvents = events.filter((x) => x.meta.user.id === respondent.id);
			let thisEventIdx = userEvents.findIndex((x) => x.meta.model.identifier === model.identifier);
			for (let i = 1; i < userEvents.length; i++) {
				let timeA = new Date(userEvents[i].start);
				timeA.setHours(timeA.getHours() - TIME_DELTA);

				let timeB = new Date(userEvents[i].end);
				timeB.setHours(timeB.getHours() - TIME_DELTA);

				if (
					userEvents[i].meta.model.identifier !== model.identifier &&
					timeA.getTime() < model.timeA.getTime() &&
					timeB.getTime() > model.timeA.getTime() &&
					i > thisEventIdx
				) {
					return userEvents[i];
				}
			}
		}
		return undefined;
	}

	/**
	 *
	 * @param model
	 * @param events
	 */
	public getEventIndex(model: TimelineLineResponseDisplayData, events: TravelDiaryEvent[]): number {
		for (let x = 0; x < events.length; x++) {
			if (events[x].meta.model.identifier === model.identifier) {
				return x;
			}
		}
		return -1;
	}

	/**
	 *
	 * @param model
	 * @param events
	 */
	public getLaterEvent(model: TimelineLineResponseDisplayData, events: TravelDiaryEvent[]): TravelDiaryEvent {
		if (!model.users) {
			return undefined;
		}
		for (let respondent of model.users) {
			// get users for event
			let userEvents = events.filter((x) => x.meta.user.id === respondent.id);
			for (let i = 1; i < userEvents.length - 1; i++) {
				if (userEvents[i].start >= model.timeA && model.identifier !== userEvents[i].meta.model.identifier) {
					return userEvents[i];
				}
			}
		}
	}

	/**
	 *
	 * @param responses
	 */
	public createDiaryFromResponseData(
		respondent: SurveyRespondentUser,
		responses: TimelineResponseData[],
		events: TravelDiaryEvent[]
	) {
		for (let i = 0; i < responses.length; i++) {
			let response = responses[i];
			let event = this.createBaseEvent(respondent, response.name, response.purpose);
			event.meta.model = <any>response;
			event.meta.model.timeA = new Date(response.timeA);
			event.meta.model.users = [respondent];
			if (!event.meta.model.mode && i > 0) {
				event.meta.model.isValid = false;
			} else {
				event.meta.model.isValid = true;
			}
			if (response.identifier) {
				event.meta.model.identifier = response.identifier;
			} else {
				event.meta.model.identifier = uuidv4();
			}

			events.push(event);
			if (responses.length === 1 && responses[0].purpose.toLowerCase() === 'home') {
				event.meta.homeAllDay = true;
			}
		}
	}

	/**
	 * Updates the schedule with the updated data for an event that already exists
	 * @param update
	 * @param events
	 */
	public updateEvent(
		update: TimelineLineResponseDisplayData,
		oldEvent: TimelineResponseData,
		events: TravelDiaryEvent[]
	) {
		// find the event
		let evtIdx = events.findIndex((x) => x.meta.model.identifier === update.identifier);
		if (evtIdx > 0) {
			let evt = events[evtIdx];

			let laterOverlap = this.getOverlappingLaterDeparture(update, events);

			if (laterOverlap) {
				// need to determine if swap or compress
				if (update.isUpdateEventSwap) {
					let swapIdx = events.findIndex(
						(x) => x.meta.model.identifier === laterOverlap.meta.model.identifier
					);

					this.swapEvents(events, evtIdx, swapIdx, update.timeA);

					this.updateModel(evt.meta.model, update);
					// this.updateModel(evt.meta.model, update);
				} else {
					// get index of event being compressed

					this.compressEvents(
						events,
						update.timeA,
						evtIdx,
						this.hasEndHomeEvent(events) ? events.length - 2 : events.length - 1
					);
				}
			} else {
				let newModel = Object.assign(evt.meta.model, update);
				let displayTime = new Date(update.timeA);
				displayTime.setHours(displayTime.getHours() + TIME_DELTA);
				let endTime = new Date(update.insertedEndTime);
				endTime.setHours(endTime.getHours() + TIME_DELTA);
				evt.meta.model = newModel;
				evt.meta.model.isValid = true;
				evt.start = displayTime;
				if (update.hasEndTime) {
					evt.end = endTime;
				}
			}

			// if its an event time swap we take the overalpping event and place it in where this event is
		} else {
			this.updateModel(events[evtIdx].meta.model, update);
		}

		this.reAlignTimeBoundaries(update.users, events, update);
		this.sortEvents(events);
		this.updateHomeEvents(events);
		// this.reAlignTimeBoundaries(update.users, events, update);
	}

	/**
	 *
	 * @param events
	 */
	private sortEvents(events: TravelDiaryEvent[]): void {
		events = events.sort((x, y) => x.meta.model.timeA.getTime() - y.meta.model.timeA.getTime());
		for (let i = 0; i < events.length; i++) {
			events[i].meta.model.order = i;
			if (!events[i].meta.model.mode && i > 0) {
				events[i].meta.model.isValid = false;
			}
		}
	}

	/**
	 *
	 * @param modelTarget
	 * @param modelSource
	 */
	public updateModel(
		modelTarget: TimelineLineResponseDisplayData,
		modelSource: TimelineLineResponseDisplayData
	): void {
		modelTarget.name = modelSource.name;
		modelTarget.latitude = modelSource.latitude;
		modelTarget.longitude = modelSource.longitude;
		modelTarget.address = Object.assign({}, modelSource.address);
		modelTarget.purpose = modelSource.purpose;
		modelTarget.mode = modelSource.mode;
		modelTarget.users = [].concat(modelSource.users);
	}

	/**
	 *
	 * @param events
	 * @param event1Idx
	 * @param event2Idx
	 */
	public swapEvents(events: TravelDiaryEvent[], event1Idx: number, event2Idx: number, newStartTime: Date): void {
		let event1 = events[event1Idx];
		let event2 = events[event2Idx];

		let timeATemp = new Date(event1.meta.model.timeA);
		let timeEndTemp = new Date(event1.end);
		let timeStartTemp = new Date(event1.start);

		event1.meta.model.timeA = new Date(newStartTime);
		event1.start = new Date(newStartTime);
		event1.end = new Date(event2.end);

		event2.meta.model.timeA = new Date(timeATemp);
		event2.start = timeStartTemp;
		event2.end = timeEndTemp;
		event2.meta.model.isRequireDepartureConfirm = true;
		event2.meta.model.isValid = false;
	}
	/**
	 * Compresses the events within the index to all align between the start time of the first event and end at the
	 * end time of the final event.
	 * @param events C
	 * @param startIndex
	 * @param endIndex
	 */
	public compressEvents(events: TravelDiaryEvent[], startTime: Date, startIndex: number, endIndex: number): void {
		let endTime = new Date(events[endIndex].end);
		endTime.setHours(endTime.getHours() - TIME_DELTA);

		// duration in ms
		let duration = (endTime.getTime() - startTime.getTime()) / (endIndex - startIndex + 1);

		for (let i = 0; i <= endIndex - startIndex; i++) {
			let newStartTime = new Date(startTime.getTime() + i * duration);

			events[i + startIndex].meta.model.timeA = newStartTime;

			let displayStartTime = new Date(events[i + startIndex].meta.model.timeA);
			displayStartTime.setHours(displayStartTime.getHours() + TIME_DELTA);

			let displayEndTime = new Date(displayStartTime.getTime() + duration);

			events[i + startIndex].start = displayStartTime;
			events[i + startIndex].end = displayEndTime;
		}
	}

	public hasEndHomeEvent(events: TravelDiaryEvent[]): boolean {
		if (events.length > 1) {
			if (events[events.length - 1].meta.model.purpose === 'home') {
				return true;
			}
		}
		return false;
	}

	/**
	 *
	 * @param events
	 */
	public updateHomeEvents(events: TravelDiaryEvent[]): void {
		for (let i = 0; i < events.length; i++) {
			if (i < events.length - 1) {
				if (events[i].meta.model.purpose.includes('home')) {
					events[i].meta.model.name = 'Home Temporarily';
					events[i].title = 'Home Temporarily';
				}
			}

			if (i === events.length - 1) {
				if (events[i].meta.model.purpose.includes('home')) {
					events[i].meta.model.name = 'Return Home';
					events[i].title = 'Return Home';
					events[i].end = new Date(new Date(this._surveyAccessTime).setHours(23, 59, 0, 0));
				}
			}

			if (i === 0) {
				if (events[i].meta.model.purpose.includes('home')) {
					events[i].meta.model.name = 'At Home';
					events[i].title = 'At Home';
				}
			}
		}
	}

	/**
	 *
	 * @param events
	 */
	public reAlignTimeBoundaries(
		users: SurveyRespondentUser[],
		allEvents: TravelDiaryEvent[],
		updated: TimelineLineResponseDisplayData = null
	) {
		// realigns time boundaries using the location / timeline model as master
		for (let user of users) {
			let events = allEvents.filter((x) => x.meta.user.id === user.id);
			events = events.sort((a, b) => a.meta.model.timeA.getTime() - b.meta.model.timeA.getTime());
			for (let i = 0; i < events.length - 1; i++) {
				events[i].meta.model.order = i;
				let displayTime = new Date(events[i].meta.model.timeA);
				displayTime.setHours(displayTime.getHours() + TIME_DELTA);
				if (i > 0) {
					events[i].start = displayTime;
				}
				if (events[i].meta.model.identifier === updated?.identifier && updated?.hasEndTime) {
					let endTime = new Date(events[i].meta.model.insertedEndTime);
					endTime.setHours(endTime.getHours() + TIME_DELTA);
					events[i + 1].start = endTime;
					if (events[i].meta.model.insertedEndTime) {
						events[i + 1].meta.model.timeA = events[i].meta.model.insertedEndTime;
					}
					events[i].end = endTime;
				} else {
					let displayTime2 = new Date(events[i + 1].meta.model.timeA);
					displayTime2.setHours(displayTime2.getHours() + TIME_DELTA);
					events[i].end = displayTime2;
				}
			}
			if (events.length > 1) {
				let displayTime = new Date(events[events.length - 1].meta.model.timeA);
				displayTime.setHours(displayTime.getHours() + TIME_DELTA);
				events[events.length - 1].meta.model.order = events.length - 1;
				events[events.length - 1].start = displayTime;
			}
		}
	}

	/**
	 * Appends a new event to the list of events
	 * @param newEvent
	 * @param events
	 * @param param2
	 */
	public appendEvent(newEvent: TravelDiaryEvent, events: TravelDiaryEvent[]): void {}

	/**
	 * Creates an at home all day event
	 * @param user
	 */
	private createHomeAllDayEvent(user: SurveyRespondentUser): TravelDiaryEvent[] {
		let displayId = this.generateId();
		let events: TravelDiaryEvent[] = [];
		events.push({
			id: displayId,
			title: 'Home All Day',
			draggable: false,
			resizable: {
				beforeStart: false,
				afterEnd: false,
			},
			meta: {
				purpose: 'home',
				homeAllDay: true,
				address: undefined,
				user: user,
				mode: undefined,
				model: {
					address: user.homeAddress,
					purpose: 'home',
					identifier: uuidv4(),
					mode: undefined,
					timeA: new Date(new Date(this._surveyAccessTime).setHours(0, 0, 0, 0)),
					timeB: new Date(new Date(this._surveyAccessTime).setHours(23, 59, 0, 0)),
					latitude: undefined,
					longitude: undefined,
					name: 'Home All Day',
					order: 0,
					users: [user],
					id: undefined,
					isValid: true,
					displayAddress: null,
				},
				id: Date.now(),
			},
			start: new Date(new Date().setHours(0, 0, 0, 0)),
			end: new Date(new Date().setHours(23, 59, 0, 0)),
		});
		return events;
	}

	/**
	 *
	 * @param user
	 * @param title
	 * @param purpose
	 */
	private createBaseEvent(user: SurveyRespondentUser, title: string, purpose: string): TravelDiaryEvent {
		let displayId = this.generateId();
		return {
			id: displayId,
			title: title,
			draggable: false,
			resizable: {
				beforeStart: false,
				afterEnd: false,
			},
			meta: {
				purpose: purpose,
				homeAllDay: false,
				address: undefined,
				user: user,
				mode: undefined,
				model: {
					address: undefined,
					purpose: purpose,
					timeA: undefined,
					timeB: undefined,
					latitude: undefined,
					longitude: undefined,
					mode: undefined,
					name: title,
					order: 0,
					users: [user],
					id: undefined,
					identifier: displayId,
					isValid: false,
					displayAddress: undefined,
				},
				id: Date.now(),
			},
			start: new Date(new Date(this._surveyAccessTime).setHours(0, 0, 0, 0)),
			end: new Date(new Date(this._surveyAccessTime).setHours(23, 59, 0, 0)),
		};
	}

	/**
	 *
	 * @param event
	 * @param events
	 */
	public findTravelDiaryEvent(event: TimelineLineResponseDisplayData, events: TravelDiaryEvent[]): TravelDiaryEvent {
		let match = events.find((x) => x.meta.model.identifier === event.identifier);
		return match;
	}

	/**
	 * Deletes the event from the list of travel diary events
	 * @param event
	 * @param events
	 */
	public deleteEvent(event: TimelineLineResponseDisplayData, events: TravelDiaryEvent[]): void {
		let idx = events.findIndex((x) => x.meta.model.identifier === event.identifier);
		if (idx >= 0) {
			events.splice(idx, 1);
		}
		if (Array.isArray(event.users)) {
		}
		this.reAlignTimeBoundaries(event.users, events);
		this.sortEvents(events);
		this.updateHomeEvents(events);
	}

	/**
	 *
	 * @param user
	 * @param events
	 */
	public updateIndices(user: SurveyRespondentUser, events: TravelDiaryEvent[]): void {
		let userEvents = events.filter((x) => x.meta.user.id === user.id);
		for (let i = 0; i < userEvents.length; i++) {
			userEvents[i].meta.model.order = i;
		}
	}
}
