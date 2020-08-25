
import { PageState } from './survey-viewer-state/page-state.model';
import { SectionState } from './survey-viewer-state/section-state.model';
import { SurveyRespondent, SurveyViewPage, SurveyViewSection, SurveyViewQuestion } from 'traisi-question-sdk';

export interface SurveyViewerState {
	// list of survey pages
	surveyPages: Array<SurveyViewPage>;

	// list of active questions - filtered / other transforms from conditionals
	surveyQuestions: Array<SurveyViewQuestion>;

	// entire list of survey questions, unfiltered, hidden or otherwise removed
	surveyQuestionsFull: Array<SurveyViewQuestion>;

	// ref to the current active page
	activePage: SurveyViewPage;

	// the index of the active question (in surveyPages)
	activeQuestionIndex: number;

	// the active page index
	activePageIndex: number;

	// the active repeat index
	activeRepeatIndex: number;

	// list of group members
	groupMembers: Array<SurveyRespondent>;

	// the index of the active group member
	activeGroupMemberIndex: number;

	// ref to the primary respondent
	primaryRespondent: SurveyRespondent;


	isNavProcessing: boolean;

	// the list of active group questions
	activeGroupQuestions: Array<SurveyViewQuestion>;

	// map question ids to the viewer question object
	questionMap: { [id: number]: SurveyViewQuestion };

	questionNameMap: { [name: string]: SurveyViewQuestion };

	questionViewMap: { [id: number]: SurveyViewQuestion };

	sectionMap: { [id: number]: SurveyViewSection };

	questionBlocks: Array<Array<SurveyViewQuestion>>;

	questionTypeMap: { [type: number]: string };

	questionTree: Array<Array<SurveyViewQuestion>>;

	pageStates: { [id: number]: PageState };

	sectionStates: { [id: number]: SectionState };
}
