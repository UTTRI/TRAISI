import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as introJs from 'intro.js';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Subject } from 'rxjs';

@Injectable()
export class TravelDiaryTourService {
	private _tour = introJs();
	private _popover: BsDropdownDirective;
	private _lastEvent;

	public tourEnded: Subject<any> = new Subject<any>();

	public constructor(@Inject(DOCUMENT) private _document: Document) {}

	public initializeSubTour(popover: BsDropdownDirective): void {
		this._popover = popover;

		let invalidEvents = document.querySelectorAll('.invalid-event');

		if (invalidEvents.length === 0) {
			let events = document.querySelectorAll('.event-container');
			this._lastEvent = events[events.length - 1];
		} else {
			this._lastEvent = invalidEvents[invalidEvents.length - 1];
		}

		this._tour.onbeforechange(this.onBeforeChange);
		this._tour.onexit(this.onExit);
		introJs().refresh();
		// this._tour.on
		this._tour.setOptions({
			scrollToElement: true,
			keyboardNavigation: false,
			steps: [
				{
					element: this._document.querySelector('.add-event-button'),
					intro: `<h3>Travel Diary - Add a Trip</h3>
                            <p>Click this button to add new trips to your travel diary. If you wish to edit an existing activity or trip, simply click it in the summary.</p>
                            <p>Trips with a dashed orange border means that the trip is missing some information.</p>`,
				},
				{
					element: this._lastEvent,
					intro: `<h3>Travel Diary - Don't miss any information</h3>
                            <p>The timeline scrolls too - make sure you don't miss the last event of the day when filling in your information.</p>`,
				},
				{
					element: this._document.querySelector('.reset-links'),
					intro: `<h3>Travel Diary - Starting Over</h3>
							<p>If you'd like to start entering your information again, use the reset travel diary option to reset the travel diary back to a fresh state.</p>
							<p>If you'd like to remove all the events from your diary, choose clear all trips, You will also be prompted to enter the starting location of your day.`,
				},
			],
		});
	}

	public initialize(popover: BsDropdownDirective): void {
		this._popover = popover;
		let events = document.querySelectorAll('.event-container');
		this._lastEvent = events[events.length - 1];
		console.log(events);
		this._tour.onbeforechange(this.onBeforeChange);
		this._tour.onexit(this.onExit);
		// this._tour.on
		this._tour.setOptions({
			scrollToElement: true,
			keyboardNavigation: false,
			steps: [
				{
					element: this._document.querySelector('#travelDiaryQuestionContainer'),
					intro: `<h3>Travel Diary</h3>
                            <p>This question will collect trip information for you and members of your household.<p>
                            <p>Press next to see instructions on how to enter information about the trips you took on the assigned travel date. If
							you need to see the instructions again, click the help icon at the bottom of the page.</p>
							<p>If you need help, please call: <strong>1-647-836-5706</strong> (9:00AM - 5:00PM).</p>`,
				},

				{
					element: this._document.querySelector('#travelDiaryQuestionContainer'),
					intro: `<h3>Travel Diary - Overview</h3>
                            <p>The highlighted area shows an overview of all the trips entered for the assigned travel date.</p>
                            <p>The day begins at 4am, and ends the next day at 3:59AM. Each trip in the summary is displayed in the order they occur throughout the day.</p>
                            `,
				},
				{
					element: this._document.querySelector('.add-event-button'),
					intro: `<h3>Travel Diary - Add a Trip</h3>
                            <p>Click this button to add new trips to your travel diary. If you wish to edit an existing activity or trip, simply click it in the summary.</p>
                            <p>Trips with a dashed orange border means that the trip is missing some information.</p>`,
				},
				{
					element: this._lastEvent,
					intro: `<h3>Travel Diary - Don't miss any information</h3>
                            <p>The timeline scrolls too - make sure you don't miss the last event of the day when filling in your information.</p>`,
				},
				{
					element: this._document.querySelector('.schedule-view'),
					intro: `<h3>Travel Diary - Schedule View</h3>
							<p>Click this button to view your travel diary in a daily schedule format.</p>`
				},
				{
					element: this._document.querySelector('.linear-view'),
					intro: `<h3>Travel Diary - Simple View</h3>
							<p>Click here to the view the travel diary in a more simple list format.</p>`,
				},
				{
					element: this._document.querySelector('.reset-links'),
					intro: `<h3>Travel Diary - Starting Over</h3>
							<p>If you'd like to start entering your information again, use the reset travel diary option to reset the travel diary back to a fresh state.</p>
							<p>If you'd like to remove all the events from your diary, choose clear all trips, You will also be prompted to enter the starting location of your day.`,
				},
			],
		});
	}

	public startTour(): void {
		introJs().refresh();
		this._tour.start().goToStep(1);
	}

	public stopTour(): void {
		this._tour.exit(true);
	}

	public onBeforeChange = () => {
		if (this._tour._currentStep === 1) {
			// this._popover.show();
			// this._popover.toggle(true);
			this._lastEvent.scrollIntoView();
		}
	};

	public onExit = () => {
		this._popover.toggle(false);
		this.tourEnded.next();
	};
}
