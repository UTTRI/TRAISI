import { EventEmitter, Output, Inject, ChangeDetectorRef, Component, Directive } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Directive({
	selector: '[traisiQuestionInternalView]',
	exportAs: 'traisiSurveyQuestionInternalView'
})
export class SurveyQuestionInternalViewDirective {}
