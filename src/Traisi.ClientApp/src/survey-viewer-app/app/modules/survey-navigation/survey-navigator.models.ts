export enum SurveyNavigatorEventType {
	NextPressed = 'next_pressed',
	PreviousPressed = 'previous_pressed',
	NavigatedToSection = 'navigated_to_section',
	NavigatedToPage = 'navigated_to_page',
	NavigatedToSurveyEnd = 'navigated_to_survey_end',
}

export interface SurveyNavigatorEvent {
	eventType: SurveyNavigatorEventType;
	eventValue?: any;
}
