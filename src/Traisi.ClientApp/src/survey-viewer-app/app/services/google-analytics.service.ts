import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { NavigationState } from 'app/models/navigation-state.model';
import { SurveyNavigator } from 'app/modules/survey-navigation/services/survey-navigator/survey-navigator.service';
import { SurveyNavigatorEvent } from 'app/modules/survey-navigation/survey-navigator.models';
import { EMPTY, Observable } from 'rxjs';
import { SurveyAnalyticsService } from 'traisi-question-sdk';

declare var gtag: UniversalAnalytics.ga;

@Injectable({
	providedIn: 'root',
})
export class GoogleAnalyticsService extends SurveyAnalyticsService {
	private _previousState: NavigationState;
	private _viewStartTime: number;

	/**
	 *
	 * @param _navigator
	 * @param _router
	 * @param _titleService
	 */
	public constructor(private _navigator: SurveyNavigator, private _router: Router, private _titleService: Title) {
		super();
		console.debug(this);
		this.initialize();
	}

	private initialize(): void {
		this._navigator.navigationState$.subscribe(this._onNavigationStateChanged);
		this._navigator.navigationEvents$.subscribe(this._onSurveyNavigatorEvent);
	}

	/**
	 *
	 * @param event
	 */
	private _onSurveyNavigatorEvent = (event: SurveyNavigatorEvent): void => {
		this.sendEvent('Survey Navigation Event', event.eventType.toString(), undefined, event.eventValue);
	};

	/**
	 *
	 * @param state
	 */
	private _onNavigationStateChanged = (state: NavigationState): void => {
		if (!state.isLoaded) {
			return;
		}
		if (!this._previousState) {
			this._previousState = state;
			this._viewStartTime = new Date().getTime();
			return;
		}
		if (
			state.activeQuestionIndex !== this._previousState.activeQuestionIndex ||
			state.activeRespondent.id !== this._previousState.activeRespondent.id
		) {
			// determine if section or question active
			if (state.activeSection) {
				let page = 'section/' + state.activeSection.id;
				this.setPage(
					this._titleService.getTitle() + ' - ' + state.activePage.label + '/' + state.activeSection.label,
					page,
					undefined
				);
			} else {
				if (state.activeQuestionInstances.length > 0) {
					let page = 'question/' + state.activeQuestionInstances[0]?.model.questionId;
					this.setPage(
						this._titleService.getTitle() +
							' - ' +
							state.activePage.label +
							'/' +
							state.activeQuestionInstances[0]?.model.name,
						page,
						undefined
					);
				}
			}
			let timeNow = new Date().getTime();
			this.sendTiming('survey_page_view_time', timeNow - this._viewStartTime, 'Survey User Interaction Times');
		}

		this._viewStartTime = new Date().getTime();
		this._previousState = state;
	};

	/**
	 * Sends an event to the google analytics tracker.
	 * @param eventCategory
	 * @param eventAction
	 * @param eventLabel
	 * @param eventValue
	 */
	public sendEvent(
		eventCategory: string,
		eventAction: string,
		eventLabel?: string,
		eventValue?: number
	): Observable<void> {
		gtag('event', eventAction, {
			event_category: eventCategory,
			event_label: eventLabel,
			value: eventValue,
		});

		console.debug(`send called`);
		console.debug(arguments);
		return EMPTY;
	}

	/**
	 * Sends a timing event to the google analytics tracker.
	 * @param timingCategory
	 * @param timingVar
	 * @param timingValue
	 * @param timlingLabel
	 */
	public sendTiming(
		timingVar: string,
		timingValue: number,
		timingCategory?: string,
		timlingLabel?: string
	): Observable<void> {
		console.debug(`send timing called`);
		console.debug(arguments);
		gtag('event', 'timing_complete', {
			name: timingVar,
			value: timingValue,
			event_category: timingCategory,
			event_label: timlingLabel,
		});
		return EMPTY;
	}

	/**
	 * Sets the active page value for the google analytics tracker.
	 * @param pageValue
	 */
	public setPage(pageTitle: string, pagePath: string, pageLocation: string): Observable<void> {
		console.debug(`set page called`);
		console.debug(arguments);
		gtag('event', 'page_view', {
			page_title: pageTitle,
			page_location: pageLocation,
			page_path: pagePath,
		});
		return EMPTY;
	}
}
