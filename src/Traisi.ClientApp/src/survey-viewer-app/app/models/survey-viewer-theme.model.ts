import { SurveyViewerThemeTemplate } from './survey-viewer-theme-template.model';

export interface SurveyViewerTheme {
	sectionBackgroundColour: string;
	questionViewerColour: string;
	viewerTemplate: SurveyViewerThemeTemplate[];
}
