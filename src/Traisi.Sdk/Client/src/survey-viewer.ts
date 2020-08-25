import { Subject, Observable } from 'rxjs';
import { QuestionConfiguration } from './question-configuration';
import { QuestionOption } from './question-option';
import { SurveyRespondent } from './survey-respondent.model';
export abstract class SurveyViewer {
	configurationData: Subject<QuestionConfiguration[]>;
	options: Subject<QuestionOption[]>;
	accessToken: string;
	abstract updateNavigationState(canNavigate: boolean): void;
	abstract preparePreviousSurveyResponses(respondent: SurveyRespondent, currentQuestionId: number): Observable<any>;
}
