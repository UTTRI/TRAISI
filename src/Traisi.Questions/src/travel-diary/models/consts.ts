import { SurveyRespondent, TimelineResponseData } from "traisi-question-sdk";
import { EventColor } from "calendar-utils";

export const colors: any = {
	red: {
		primary: '#ad2121',
		secondary: '#FAE3E3',
	},
	blue: {
		primary: '#1e90ff',
		secondary: '#D1E8FF',
	},
	yellow: {
		primary: '#e3bc08',
		secondary: '#FDF1BA',
	},
};

export enum DialogMode {
	New,
	Edit,
}

export type SurveyRespondentUser = SurveyRespondent & {
	id: number;
	name: string;
	color: EventColor;
};

export type TimelineLineResponseDisplayData = TimelineResponseData & { users: SurveyRespondentUser[]; id: number };