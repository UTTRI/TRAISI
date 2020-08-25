import { Injectable, Compiler, Injector, ComponentFactory, NgModuleRef, SystemJsNgModuleLoader } from '@angular/core';
import { SurveyBuilderEndpointService } from './survey-builder-endpoint.service';
import { Observable, Observer } from 'rxjs';

/**
 * Block of required imports through SystemJS
 */
import * as AngularCore from '@angular/core';
import * as AngularCommon from '@angular/common';
import * as AngularHttp from '@angular/common/http';
import * as AngularForms from '@angular/forms';
import * as BrowserModule from '@angular/platform-browser';
import * as Upgrade from '@angular/upgrade/static';
import * as RxjsModule from 'rxjs';
import * as traisiSdkModule from 'traisi-question-sdk';
import { UpgradeModule } from '@angular/upgrade/static';
import * as rxjsOperators from 'rxjs/operators';
import { find } from 'lodash';
/**
 * End SystemJS requirement block.
 */

declare const SystemJS;

@Injectable()
export class CustomBuilderService {
	/**
	 * Private hash table with module name as key to store previously loaded modules.
	 *
	 * @private
	 * @type {{ [type: string]: NgModuleRef<any> }}
	 * @memberof CustomBuilderService
	 */
	private _moduleRefs: { [type: string]: NgModuleRef<any> } = {};
	/**
	 *Creates an instance of CustomBuilderService.
	 * @param {SurveyBuilderEndpointService} _surveyBuilderEndpointService
	 * @param {Compiler} _compiler
	 * @param {Injector} _injector
	 * @memberof CustomBuilderService
	 */
	constructor(
		private _surveyBuilderEndpointService: SurveyBuilderEndpointService,
		private _compiler: Compiler,
		private _injector: Injector
	) {
		this.init();
	}

	/**
	 *
	 *
	 * @private
	 * @memberof CustomBuilderService
	 */
	private init(): void {
		SystemJS.registry.set('@angular/core', SystemJS.newModule(AngularCore));
		SystemJS.registry.set('@angular/common', SystemJS.newModule(AngularCommon));
		SystemJS.registry.set('@angular/common/http', SystemJS.newModule(AngularHttp));
		SystemJS.registry.set('@angular/forms', SystemJS.newModule(AngularForms));
		SystemJS.registry.set('@angular/platform-browser', SystemJS.newModule(BrowserModule));
		SystemJS.registry.set('@angular/upgrade/static', SystemJS.newModule(Upgrade));
		SystemJS.registry.set('@angular/upgrade', SystemJS.newModule(UpgradeModule));
		SystemJS.registry.set('traisi-question-sdk', SystemJS.newModule(traisiSdkModule));
		SystemJS.registry.set('rxjs', SystemJS.newModule(RxjsModule));
		SystemJS.registry.set(
			'rxjs/operators',
			SystemJS.newModule(rxjsOperators)
		);
	}

	/**
	 * Loads the component factory for the specified question type and associated builder name.
	 *
	 * @param {string} typeName The type name where the view resides (question type name)
	 * @param {string} builderName The name/id of the builder component defined in the providers attribute of the module
	 * @returns {Observable<ComponentFactory<any>>} Async observable, the first and last value will be the resolved component factory.
	 * @memberof CustomBuilderService
	 */
	public loadCustomClientBuilderView(
		typeName: string,
		builderName: string,
		injector?: Injector
	): Observable<ComponentFactory<any>> {
		return this.loadClientBuilderModule(typeName, builderName);
	}


	/**
	 *
	 *
	 * @private
	 * @param {string} typeName
	 * @param {string} customBuilderId
	 * @returns {Observable<any>}
	 * @memberof CustomBuilderService
	 */
	private loadClientBuilderModule(typeName: string, customBuilderId: string, injector?: Injector): Observable<any> {
		console.log(typeName);
		const result = Observable.create((observer: Observer<ComponentFactory<any>>) => {
			SystemJS.import(this._surveyBuilderEndpointService.getCustomBuilderClientCodeEndpointUrl(typeName)).then(
				(module: any) => {
					const componentFactory: ComponentFactory<any> = this.unpackComponentFactoryForClientBuilder(
						customBuilderId,
						module.default
					);
					observer.next(componentFactory);
					observer.complete();
				}
			);
		});

		return result;
	}

	/**
	 * Unpacks the related component factory from the passed module reference (already imported through SystemJS)
	 *
	 * @private
	 * @param {string} customBuilderId The name of the builder to read. This is the unique id/name of the component that will be loaded.
	 * @param {AngularCore.Type<{}>} module The module reference loaded from SystemJS.import(...)
	 * @memberof CustomBuilderService
	 */
	private unpackComponentFactoryForClientBuilder(
		customBuilderId: string,
		module: AngularCore.Type<{}>,
		injector?: Injector
	): ComponentFactory<any> {
		const moduleFactory: AngularCore.ModuleWithComponentFactories<{}> = this._compiler.compileModuleAndAllComponentsSync(
			module
		);
		const moduleRef: NgModuleRef<any> = moduleFactory.ngModuleFactory.create(
			injector === undefined ? this._injector : injector
		);
		this._moduleRefs[customBuilderId] = moduleRef;
		const componentFactory: ComponentFactory<any> = this.createComponentFactory(moduleRef, customBuilderId);
		return componentFactory;
	}

	/**
	 *
	 *
	 * @private
	 * @param {NgModuleRef<any>} moduleRef
	 * @param {string} customBuilderId
	 * @returns {ComponentFactory<any>}
	 * @memberof CustomBuilderService
	 */
	private createComponentFactory(moduleRef: NgModuleRef<any>, customBuilderId: string): ComponentFactory<any> {
		const widgets = moduleRef.injector.get('widgets');
		const resolver = moduleRef.componentFactoryResolver;

		let widget = find(widgets[0], (item) => {
			return item.id.toLowerCase() === customBuilderId.toLowerCase();
		});

		const componentFactory: ComponentFactory<any> = resolver.resolveComponentFactory(widget.component);

		return componentFactory;
	}
}
