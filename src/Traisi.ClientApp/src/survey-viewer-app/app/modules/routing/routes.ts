import { Route, RouterModule, Routes } from '@angular/router';
import { SurveyViewerContainerComponent } from '../../components/survey-viewer-container/survey-viewer-container.component';
import { AppComponent } from '../../app.component';
import { SurveyStartPageComponent } from '../../components/survey-start-page/survey-start-page.component';
import { SurveyErrorComponent } from '../../components/survey-error/survey-error.component';
import { ModuleWithProviders, Component } from '@angular/core';
import { SurveyTermsPageComponent } from '../../components/survey-terms-page/survey-terms-page.component';
import { SurveyViewerComponent } from '../../components/survey-viewer/survey-viewer.component';
import { SurveyThankYouPageComponent } from '../../components/survey-thankyou-page/survey-thankyou-page.component';
import { SurveyScreeningPageComponent } from 'app/components/survey-screening-page/survey-screening-page.component';
import { SurveyShortcodeDisplayPageComponent } from 'app/components/survey-shortcode-display-page/survey-shortcode-display-page.component';
import { SurveyGroupcodePageComponent } from 'app/components/survey-groupcode-page/survey-groupcode-page.component';
import { SurveyShortcodePageComponent } from 'app/components/survey-shortcode-page/survey-shortcode-page.component';
import { SurveyDataResolver } from 'app/resolvers/survey-data.resolver';

export const ROUTES: ModuleWithProviders<RouterModule> = RouterModule.forRoot([
	{
		path: 'error',
		component: SurveyErrorComponent
	},
	{
		path: ':surveyName',
		children: [
			{
				path: '',
				redirectTo: 'start',
				pathMatch: 'full'
			},
			{
				path: 'error',
				component: SurveyErrorComponent,
				data: { title: 'Survey Not Found' }
			},
			{
				path: 'start/:shortcode',
				children: [
					{
						path: '',
						component: SurveyShortcodePageComponent,
						data: { isChild: true, shortcodePage: true }
					},

					{
						path: 'groupcode',
						component: SurveyGroupcodePageComponent,
						data: { isChild: true }
					},
					{
						path: 'shortcode',
						component: SurveyShortcodeDisplayPageComponent,
						data: { isChild: true }
					}
				],
				component: SurveyStartPageComponent,
				data: { title: 'Survey Start', isChild: false }
			},
			{
				path: 'start',
				children: [
					{
						path: '',
						component: SurveyShortcodePageComponent,
						data: { isChild: true, shortcodePage: true }
					},

					{
						path: 'groupcode',
						component: SurveyGroupcodePageComponent,
						data: { isChild: true }
					},
					{
						path: 'shortcode',
						component: SurveyShortcodeDisplayPageComponent,
						data: { isChild: true }
					}
				],
				component: SurveyStartPageComponent,
				data: { title: 'Survey Start', isChild: false }
			},

			{
				path: 'terms',
				component: SurveyTermsPageComponent,
				data: { title: 'Survey Terms and Conditions' }
			},
			{
				path: 'screening',
				component: SurveyScreeningPageComponent,
				data: { title: 'Survey Screening Questions' }
			},
			{
				path: 'thankyou',
				component: SurveyThankYouPageComponent,
				data: { title: 'Thank You' }
			},
			{
				path: 'complete',
				component: SurveyThankYouPageComponent,
				data: { title: 'Survey Complete - Rejected' }
			},
			{
				path: 'viewer',
				component: SurveyViewerComponent,
				data: { title: 'Survey Viewer' },
				children: [
					{
						path: ':question',
						component: SurveyViewerComponent,
						data: { title: 'Survey Viewer' }
					}
				]
			},
			{
				path: 'viewer/:questionNumber',
				component: SurveyViewerComponent,
				data: { title: 'Survey Viewer' }
			}
		],
		resolve: {
			surveyData: SurveyDataResolver
		}
	}
]);
