import { SurveyViewQuestion } from './survey-view-question.model';
import { SurveyViewPage } from './survey-view-page.model';
import { SurveyViewSection } from './survey-view-section.model';
import { SurveyViewGroupMember } from './survey-view-group-member.model';
import { ResponseValidationState } from 'traisi-question-sdk';

export interface SurveyViewerState {

	// list of survey pages
	surveyPages: Array<SurveyViewPage>;

	// list of active questions - filtered / other transforms from conditionals
	surveyQuestions: Array<SurveyViewQuestion>;

	// entire list of survey questions, unfiltered, hidden or otherwise removed
	surveyQuestionsFull: Array<SurveyViewQuestion>;

	// ref to the active question
	activeQuestion: SurveyViewQuestion;

	// ref to the active section
	activeSection: SurveyViewSection;

	// index for current question in active section
	activeInSectionIndex: number;

	// ref to the current active page
	activePage: SurveyViewPage;

	// flag for whether active question is in a section
	isSectionActive: boolean;

	// the index of the active question (in surveyPages)
	activeQuestionIndex: number;

	// the active page index
	activePageIndex: number;

	// the active repeat index
	activeRepeatIndex: number;

	// list of group members
	groupMembers: Array<SurveyViewGroupMember>;

	// the index of the active group member
	activeGroupMemberIndex: number;

	// ref to the primary respondent
	primaryRespondent: SurveyViewGroupMember;

	// the list of active group questions
	activeGroupQuestions: Array<SurveyViewQuestion>;

	// loaded flag
	isLoaded: boolean;

	// map question ids to the viewer question object
	questionMap: { [id: number]: SurveyViewQuestion };
}
