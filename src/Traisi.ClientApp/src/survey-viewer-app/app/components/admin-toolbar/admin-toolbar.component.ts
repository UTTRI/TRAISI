import { Component, ComponentFactoryResolver, OnInit, ViewEncapsulation, Inject, TemplateRef } from '@angular/core';
import { SurveyViewerService } from '../../services/survey-viewer.service';
import { QuestionLoaderService } from '../../services/question-loader.service';
import {
	ActivatedRoute,
	ActivatedRouteSnapshot,
	ActivationEnd,
	NavigationEnd,
	Router,
	RouterEvent,
	RouterStateSnapshot,
} from '@angular/router';
import { SurveyErrorComponent } from '../survey-error/survey-error.component';
import { SurveyStartPageComponent } from '../survey-start-page/survey-start-page.component';

import { Title } from '@angular/platform-browser';
import { SurveyUser } from 'shared/models/survey-user.model';
import { SurveyViewerStateService } from '../../services/survey-viewer-state.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Route } from '@angular/compiler/src/core';
import { SurveyResponseClient } from 'app/services/survey-viewer-api-client.service';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'traisi-admin-toolbar',
	templateUrl: './admin-toolbar.component.html',
	styleUrls: ['./admin-toolbar.component.scss'],
	entryComponents: [SurveyErrorComponent, SurveyStartPageComponent],
})
export class AdminToolbarComponent implements OnInit {
	public surveyId: number;

	public currentUser: SurveyUser;
	public modalRef: BsModalRef;
	/**
	 * Creates an instance of admin toolbar component.
	 * @param surveyViewerService
	 */
	constructor(
		@Inject('SurveyViewerService') private _surveyViewerService: SurveyViewerService,
		private _viewerState: SurveyViewerStateService,
		private modalService: BsModalService,
		private _route: ActivatedRoute,
		private _responseClient: SurveyResponseClient,
		@Inject(LOCAL_STORAGE) private _storage: StorageService
	) {}

	/**
	 *
	 * @param template
	 */
	public openModal(template: TemplateRef<any>): void {
		this.modalRef = this.modalService.show(template);
	}

	/**
	 * on init
	 */
	public ngOnInit(): void {
		this._route.data.subscribe((data) => {});

		this._surveyViewerService.activeSurveyId.subscribe((surveyId) => {
			this.surveyId = surveyId;
			this.currentUser = this._surveyViewerService.currentUser;
		});
	}

	/**
	 * Deletes all responses
	 */
	public deleteAllResponses(): void {
		this._storage.remove(`surveyState:${this.surveyId}`);
		this._responseClient
			.deleteAllResponses(this.surveyId, this._viewerState.viewerState.primaryRespondent.id)
			.subscribe(
				(result) => {
					console.log(result);
					location.reload();
				},
				(error: any) => {
					console.log('error');
					console.log(error);
				}
			);
	}
}
