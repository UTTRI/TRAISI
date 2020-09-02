// adds, moves etc travel diary

import { Injectable } from '@angular/core';
import { CalendarEvent } from 'calendar-utils';
import { SurveyResponseViewModel, LocationResponseData } from 'traisi-question-sdk';
import { SurveyRespondentUser, TimelineLineResponseDisplayData, TravelDiaryEvent } from 'travel-diary/models/consts';

// events based on user input
@Injectable()
export class TravelDiaryEditor {
	public constructor() {}

	/**
	 * Will attempt to create, if  any, the appropriate initial events on the travel diary
	 * for this user.
	 * @param respondent
	 */
	public createDefaultTravelDiaryforRespondent(
		user: SurveyRespondentUser,
		homeAllDay: boolean,
		workDeparture: boolean,
		schoolDeparture: boolean,
		returnedHome: boolean,
		workLocation?: any,
		schoolLoation?: any
	): CalendarEvent[] {
		let events: CalendarEvent[] = [];
		if (homeAllDay) {
			events = events.concat(this.createHomeAllDayEvent(user));
		}
		if (workDeparture) {
			events = events.concat(this.createHomeWorkHomeEvent(user, workLocation));
		}
		if (schoolDeparture) {
			events = events.concat(this.createHomeSchoolHomeEvent(user, schoolLoation));
		}

		return events;
	}

	private createHomeWorkHomeEvent(user: SurveyRespondentUser, workLocation: LocationResponseData): TravelDiaryEvent[] { 
		console.log('creating home work home');

		let homeEvent = this.createBaseEvent(user, 'At Home', 'home');
		let workEvent = this.createBaseEvent(user, 'Work (Not Home)', 'work');
		let returnHomeEvent = this.createBaseEvent(user, 'Return Home', 'home');
		homeEvent.end = new Date(new Date().setHours(9, 0, 0, 0));
		workEvent.start = new Date(new Date().setHours(9, 1, 0, 0));
		workEvent.end = new Date(new Date().setHours(17, 0, 0, 0));

		workEvent.meta.model.timeA = new Date(new Date().setHours(9, 1, 0, 0));
		workEvent.meta.model.timeB = new Date(new Date().setHours(17, 0, 0, 0)); 

		returnHomeEvent.start = new Date(new Date().setHours(17, 1, 0, 0));
		returnHomeEvent.end = new Date(new Date().setHours(23, 59, 0, 0));

		return [homeEvent, workEvent, returnHomeEvent];
	}

	private createHomeSchoolHomeEvent(
		user: SurveyRespondentUser,
		schoolLocation: LocationResponseData
	): TravelDiaryEvent[] {
		console.log('creating home work home');

		let homeEvent = this.createBaseEvent(user, 'At Home', 'home');
		let workEvent = this.createBaseEvent(user, 'School (Not Home)', 'school');
		let returnHomeEvent = this.createBaseEvent(user, 'Return Home', 'home');
		homeEvent.end = new Date(new Date().setHours(9, 0, 0, 0));
		workEvent.start = new Date(new Date().setHours(9, 1, 0, 0));
		workEvent.end = new Date(new Date().setHours(17, 0, 0, 0));

		workEvent.meta.model.timeA = new Date(new Date().setHours(9, 1, 0, 0));
		workEvent.meta.model.timeB = new Date(new Date().setHours(17, 0, 0, 0)); 

		returnHomeEvent.start = new Date(new Date().setHours(17, 1, 0, 0));
		returnHomeEvent.end = new Date(new Date().setHours(23, 59, 0, 0));

		return [homeEvent, workEvent, returnHomeEvent];
	}

	/**
	 * Inserts this event into the passed list of events. It assumes the event users have already
	 * beeen split.
	 *
	 * The source events are modified in place.
	 * @param eventData
	 */
	public insertEvent(events: CalendarEvent[], newEvent: CalendarEvent): void {
		// loop through the respondents
		console.log(' inserting an event ');
	}

	/**
	 * Creates an at home all day event
	 * @param user
	 */
	private createHomeAllDayEvent(user: SurveyRespondentUser): TravelDiaryEvent[] {
		let events: TravelDiaryEvent[] = [];
		events.push({
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
					address: '',
					purpose: 'home',
					timeA: new Date(new Date().setHours(0, 0, 0, 0)),
					timeB: new Date(new Date().setHours(23, 59, 0, 0)),
					latitude: undefined,
					longitude: undefined,
					name: 'Home All Day',
					order: 0,
					users: [user],
					id: null,
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
		console.log('in create base event'); 
		return {
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
					address: '',
					purpose: purpose,
					timeA: undefined,
					timeB: undefined,
					latitude: undefined,
					longitude: undefined,
					name: title,
					order: 0,
					users: [user],
					id: undefined,
				},
				id: Date.now(),
			},
			start: new Date(new Date().setHours(0, 0, 0, 0)),
			end: new Date(new Date().setHours(23, 59, 0, 0)),
		};
	}
}
