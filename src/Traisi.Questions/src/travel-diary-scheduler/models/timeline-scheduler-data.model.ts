import { TimelineResponseData } from 'traisi-question-sdk';

export type TimelineSchedulerData = TimelineResponseData & {
	isConfirmed?: boolean;
};
