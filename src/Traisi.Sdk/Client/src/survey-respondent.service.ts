import { Observable } from 'rxjs';
import { ResponseTypes } from './public_api';
import { SurveyRespondent } from './survey-respondent.model';
export abstract class SurveyRespondentService {
	id: number;

	abstract addSurveyGroupMember(respondent: SurveyRespondent): Observable<any>;
	abstract getSurveyGroupMembers(respondent: SurveyRespondent): Observable<any>;
	abstract removeSurveyGroupMember(respondent: SurveyRespondent): Observable<any>;
	abstract updateSurveyGroupMember(respondent: SurveyRespondent): Observable<any>;
}
