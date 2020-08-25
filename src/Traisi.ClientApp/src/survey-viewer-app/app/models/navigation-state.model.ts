import { QuestionInstance } from './question-instance.model';
import { SurveyViewGroupMember } from './survey-view-group-member.model';
import { SurveyRespondent, SurveyViewPage, SurveyViewSection, SurveyViewQuestion } from 'traisi-question-sdk';
import { SurveyViewerValidationStateViewModel } from 'traisi-question-sdk/survey-validation.model';


export interface NavigationState {
	activePage?: SurveyViewPage;
	activePageIndex?: number;
	activeSectionId?: number;
	activeSection?: SurveyViewSection;
	activeSectionIndex?: number;
	activeQuestionInstances: Array<QuestionInstance>;
	activeQuestionIndex: number;
	activeRespondent?: SurveyRespondent;
	activeRespondentIndex?: number;
	activeValidationStates: { [id: number]: SurveyViewerValidationStateViewModel };
	isMultiView?: boolean;
	isLoaded: boolean;
	isNextEnabled: boolean;
	isPreviousEnabled: boolean;
	hiddenQuestions?: Array<SurveyViewQuestion>;
}
