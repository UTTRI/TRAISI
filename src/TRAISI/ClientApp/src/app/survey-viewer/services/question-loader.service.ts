import { Injectable, Compiler, SkipSelf, Injector, ComponentFactory } from '@angular/core';
import { QuestionLoaderEndpointService } from './question-loader-endpoint.service';
import { Observable, of, Operator, Subscriber, Observer } from 'rxjs';
import 'rxjs/add/observable/of';



declare const SystemJS;

@Injectable({
	providedIn: 'root'
})
export class QuestionLoaderService {


	/**
	 *
	 * @param questionType
	 */
	public getQuestionComponentFactory(questionType: string): Observable<any> {


		// create and obserer and return the component factory after it has finished importing
		let obs: Observable<ComponentFactory<any>> = Observable.create((observer: Observer<ComponentFactory<any>>) => {
			SystemJS.import(this._questionLoaderEndpointService.getClientCodeEndpointUrl(questionType)).then((module) => {
				const moduleFactory = this.compiler.compileModuleSync(module.default);
				const moduleRef = moduleFactory.create(this.injector);
				const widgets = moduleRef.injector.get('widgets');
				const resolver = moduleRef.componentFactoryResolver;
				const componentFactory: ComponentFactory<any> = resolver.resolveComponentFactory(widgets[0][0].component);
				observer.next(componentFactory);
				observer.complete();
			});
		});

		return obs;
	}


	/**
	 *
	 * @param _questionLoaderEndpointService
	 * @param compiler
	 * @param injector
	 * @param moduleLoader
	 */
	constructor(private _questionLoaderEndpointService: QuestionLoaderEndpointService,
		private compiler: Compiler, @SkipSelf() private injector: Injector,
		) {


	}
}
