import {
	Compiler,
	Component,
	Injector,
	SkipSelf,
	ViewChild,
	ViewContainerRef,
	Injectable,
	ComponentFactory,
	NgModuleRef,
	ComponentRef,
	ElementRef,
	InjectionToken,
	Type,
	Inject,
	NgModuleFactory,
	SystemJsNgModuleLoader,
} from '@angular/core';
import { QuestionLoaderEndpointService } from './question-loader-endpoint.service';
import {
	Observable,
	of,
	Operator,
	Subscriber,
	Observer,
	ReplaySubject,
	from,
	EMPTY,
	forkJoin,
	combineLatest,
} from 'rxjs';
import * as AngularCore from '@angular/core';
import * as AngularRouter from '@angular/router';
import * as AngularCommon from '@angular/common';
import * as AngularHttp from '@angular/common/http';
import * as AngularForms from '@angular/forms';
import * as AngularAnimations from '@angular/animations';
import * as AngularPlatformAnimations from '@angular/platform-browser/animations';
import * as AngularPlatformBrowser from '@angular/platform-browser';
import * as popover from 'ngx-bootstrap/popover';
import * as alert from 'ngx-bootstrap/alert';
import * as buttons from 'ngx-bootstrap/buttons';
import * as modal from 'ngx-bootstrap/modal';
import * as dropdown from 'ngx-bootstrap/dropdown';
import * as datepicker from 'ngx-bootstrap/datepicker';
import * as BrowserModule from '@angular/platform-browser';
import * as tooltip from 'ngx-bootstrap/tooltip';
import * as timePicker from 'ngx-bootstrap/timepicker';
import * as rxjsSubject from 'rxjs/Subject';
import * as rxjsReplaySubject from 'rxjs/ReplaySubject';
import * as rxjs from 'rxjs';
import * as rxjsBehaviourSubject from 'rxjs/BehaviorSubject';
import * as rxjsObservable from 'rxjs/Observable';
import * as traisiSdkModule from 'traisi-question-sdk';
import * as angularPopper from 'angular-popper';
import * as angularCalendar from 'angular-calendar';
import * as adapterFactory from 'angular-calendar/date-adapters/date-fns';
import { share, map, expand, flatMap, mergeMap, tap, switchMap } from 'rxjs/operators';
import { find } from 'lodash';
import * as rxjsOperators from 'rxjs/operators';
import { UpgradeModule } from '@angular/upgrade/static';
import { SurveyQuestion, QuestionConfiguration, SurveyViewQuestion } from 'traisi-question-sdk';
import { QuestionConfigurationService } from './question-configuration.service';
import { jsModule as moduleSupport } from 'environments/module';
type ComponentFactoryBoundToModule<T> = any;

declare const SystemJS;

@Injectable({
	providedIn: 'platform',
})
export class QuestionLoaderService {
	private _componentFactories: {
		[type: string]: ComponentFactoryBoundToModule<any>;
	} = {};

	public get componentFactories(): {
		[type: string]: ComponentFactoryBoundToModule<any>;
	} {
		of();
		return this._componentFactories;
	}

	private _moduleRefs: { [type: string]: NgModuleRef<any> } = {};

	private _loadedModules: Set<any> = new Set<any>();

	/**
	 *Creates an instance of QuestionLoaderService.
	 * @param {QuestionLoaderEndpointService} _questionLoaderEndpointService
	 * @param {Compiler} compiler
	 * @param {Injector} injector
	 * @memberof QuestionLoaderService
	 */
	constructor(
		private _questionLoaderEndpointService: QuestionLoaderEndpointService,
		@Inject('CONFIG_SERVICE')
		private _questionConfigurationService: QuestionConfigurationService,
		private compiler: Compiler,
		private injector: Injector
	) {
		SystemJS.config({ transpiler: false });
		this.init();
	}

	private init(): void {
		SystemJS.registry.set('@angular/core', SystemJS.newModule(AngularCore));
		SystemJS.registry.set('@angular/common', SystemJS.newModule(AngularCommon));
		SystemJS.registry.set('@angular/router', SystemJS.newModule(AngularRouter));
		SystemJS.registry.set('@angular/common/http', SystemJS.newModule(AngularHttp));
		SystemJS.registry.set('@angular/forms', SystemJS.newModule(AngularForms));
		SystemJS.registry.set('@angular/platform-browser', SystemJS.newModule(BrowserModule));
		SystemJS.registry.set('@angular/upgrade/static', SystemJS.newModule(UpgradeModule));
		// SystemJS.registry.set('@angular/upgrade', SystemJS.newModule(UpgradeModule));
		SystemJS.registry.set('ngx-bootstrap/popover', SystemJS.newModule(popover));
		SystemJS.registry.set('ngx-bootstrap/alert', SystemJS.newModule(alert));
		SystemJS.registry.set('ngx-bootstrap/datepicker', SystemJS.newModule(datepicker));
		SystemJS.registry.set('ngx-bootstrap/buttons', SystemJS.newModule(buttons));
		SystemJS.registry.set('ngx-bootstrap/modal', SystemJS.newModule(modal));
		SystemJS.registry.set('ngx-bootstrap/dropdown', SystemJS.newModule(dropdown));
		// SystemJS.registry.set('ngx-bootstrap/carousel', SystemJS.newModule(carousel));
		SystemJS.registry.set('ngx-bootstrap/tooltip', SystemJS.newModule(tooltip));
		SystemJS.registry.set('ngx-bootstrap/timepicker', SystemJS.newModule(timePicker));
		SystemJS.registry.set('traisi-question-sdk', SystemJS.newModule(traisiSdkModule));
		SystemJS.registry.set('rxjs/Subject', SystemJS.newModule(rxjsSubject));
		SystemJS.registry.set('rxjs/BehaviorSubject', SystemJS.newModule(rxjsBehaviourSubject));
		SystemJS.registry.set('rxjs/internal/BehaviorSubject', SystemJS.newModule(rxjsBehaviourSubject));
		SystemJS.registry.set('rxjs/Observable', SystemJS.newModule(rxjsObservable));
		SystemJS.registry.set('rxjs/ReplaySubject', SystemJS.newModule(rxjsReplaySubject));
		SystemJS.registry.set('rxjs', SystemJS.newModule(rxjs));
		SystemJS.registry.set('angular-popper', SystemJS.newModule(angularPopper));
		SystemJS.registry.set('rxjs/operators', SystemJS.newModule(rxjsOperators));
		SystemJS.registry.set('@angular/animations', SystemJS.newModule(AngularAnimations));
		SystemJS.registry.set('@angular/platform-browser/animations', SystemJS.newModule(AngularPlatformAnimations));
		SystemJS.registry.set('@angular/platform-browser', SystemJS.newModule(AngularPlatformBrowser));
		SystemJS.registry.set('angular-calendar', SystemJS.newModule(angularCalendar));
		SystemJS.registry.set('angular-calendar/date-adapters/date-fns', SystemJS.newModule(adapterFactory));
	}

	/**
	 *
	 */
	public getQuestionComponentModule(questionType: string): NgModuleRef<any> {
		return this._moduleRefs[questionType];
	}

	/**
	 *
	 *
	 * @param {string} questionType
	 * @returns {Observable<any>}
	 * @memberof QuestionLoaderService
	 */
	public getQuestionComponentFactory(questionType: string): Observable<ComponentFactoryBoundToModule<any>> {
		// reuse the preloaded component factory

		if (questionType in this._componentFactories) {
			return of(this._componentFactories[questionType]);
		}
		// if the module has already loaded.. but the question does not exist yet
		else if (questionType in this._moduleRefs) {
			return of(this.createComponentFactory(this._moduleRefs[questionType], questionType)).pipe(
				map((componentFactory: ComponentFactoryBoundToModule<any>) => {
					if (!(questionType in this._componentFactories)) {
						this._componentFactories[questionType] = componentFactory;
					}
					return componentFactory;
				})
			);
		} else {
			return forkJoin([
				from(SystemJS.import(this._questionLoaderEndpointService.getClientCodeEndpointUrl(questionType, moduleSupport.es5))),
				this._questionLoaderEndpointService.getQuestionConfigurationEndpoint(questionType),
			]).pipe(
				map(([module, config]: any) => {
					if (module.default.name in this._moduleRefs) {
						return this._moduleRefs[module.default.name];
					}

					const moduleFactory = this.compiler.compileModuleAndAllComponentsSync(module.default);
					const moduleRef: any = moduleFactory.ngModuleFactory.create(this.injector);
					this._moduleRefs[<string>module.default.name] = moduleRef;
					this._questionConfigurationService.setQuestionServerConfiguratioByType(questionType, config);
					return moduleRef;
				}),
				map((moduleRef: any) => {
					const componentFactory: ComponentFactoryBoundToModule<any> = <ComponentFactoryBoundToModule<any>>(
						this.createComponentFactory(moduleRef, questionType)
					);
					return componentFactory;
				}),
				expand((componentFactory: ComponentFactoryBoundToModule<any>) => {
					if (!(questionType in this._componentFactories)) {
						this._componentFactories[questionType] = componentFactory;
					} else {
						return EMPTY;
					}
					let hasDependency: boolean = false;
					for (let key of Object.keys(componentFactory['ngModule']._providers)) {
						let provider = componentFactory['ngModule']._providers[key];
						if (provider !== undefined && provider.hasOwnProperty('dependency')) {
							hasDependency = true;
							return this.getQuestionComponentFactory(provider.name);
						}
					}
					return of(componentFactory);
				})
			);
		}
	}

	/**
	 *
	 * @param moduleRef
	 * @param questionType
	 */
	private createComponentFactory(
		moduleRef: NgModuleRef<any>,
		questionType: string
	): ComponentFactoryBoundToModule<any> {
		const widgets = moduleRef.injector.get<Array<any>>(<any>'widgets', []);

		// let cat = moduleRef.injector.get('test');
		const resolver = moduleRef.componentFactoryResolver;
		let widget = find(widgets[0], (item) => {
			return item.id.toLowerCase() === questionType.toLowerCase();
		});

		const componentFactory: ComponentFactoryBoundToModule<any> = <ComponentFactoryBoundToModule<any>>(
			resolver.resolveComponentFactory(widget.component)
		);

		if (!(questionType in this._componentFactories)) {
			// 	this._componentFactories[questionType] = componentFactory;
		}
		return componentFactory;
	}

	/**
	 * Preloads modules for questions, and only once
	 * @param questions
	 */
	public loadModulesForQuestions(questions: SurveyViewQuestion[]): Observable<void> {
		let unique = new Set<string>();
		for (let question of questions) {
			unique.add(question.questionType);
		}
		let moduleLoads = [];
		for(let qType of unique) {
			
		}

		return new Observable((obs) => {
			obs.complete();
		});
	}

	/**
	 *
	 * @param questionType
	 * @param viewContainerRef
	 */
	public loadQuestionComponent(
		question: SurveyViewQuestion,
		viewContainerRef: ViewContainerRef
	): Observable<ComponentRef<any>> {
		return new Observable((o) => {
			forkJoin([this.getQuestionComponentFactory(question.questionType)]).subscribe({
				next: ([componentFactory]) => {},
				error: (r) => {
					console.log(r);
					console.error('Error loading question / getting factory.');
				},
				complete: () => {
					const injector: Injector = Injector.create({
						providers: [],
						parent: this.injector,
					});
					let componentRef = viewContainerRef.createComponent(
						this._componentFactories[question.questionType],
						undefined,
						injector
					);
					o.next(componentRef);
					o.complete();
				},
			});
		});
	}

	/**
	 * Loads the appropriate component factory async
	 * @param question
	 * @param viewContainerRef
	 */
	public loadQuestionComponentFactory(question: SurveyViewQuestion): Observable<ComponentFactory<any>> {
		return new Observable((o) => {
			forkJoin([
				this.getQuestionComponentFactory(question.questionType),
				this.getQuestionConfiguration(question),
			]).subscribe({
				next: ([componentFactory, configuration]) => {
					this._questionConfigurationService.setQuestionServerConfiguration(question, configuration);
				},
				error: (r) => {
					console.log(r);
					console.error('Error loading question / getting factory.');
				},
				complete: () => {
					o.next(this._componentFactories[question.questionType]);
					o.complete();
				},
			});
		});
	}

	/**
	 * Retrieves the server configuration (file) for the associated question type.
	 * @param question
	 */
	public getQuestionConfiguration(question: SurveyViewQuestion): Observable<any> {
		return new Observable((o) => {
			if (this._questionConfigurationService.hasQuestionServerConfiguration(question.questionType)) {
				o.next(this._questionConfigurationService.getQuestionServerConfiguration(question.questionType));
				o.complete();
			} else {
				this._questionLoaderEndpointService
					.getQuestionConfigurationEndpoint(question.questionType)
					.subscribe((x) => {
						this._questionConfigurationService.setQuestionServerConfiguration(question, x);
						o.next(x);
						o.complete();
					});
			}
		});
	}
}
