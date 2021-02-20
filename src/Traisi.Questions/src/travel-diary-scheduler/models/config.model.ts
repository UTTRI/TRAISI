import { Purpose } from "./purpose.model";

/**
 * Scheduler configurationion interface
 */
export interface TravelDiarySchedulerConfiguration {
	mode: Array<{
		label: string;
		icon: string;
		id: string;
	}>;
	purpose: Array<Purpose>;
	schoolLocations: Array<{
		id: string;
		label: string;
		value: string;
	}>;
	workLocations: Array<{
		id: string;
		label: string;
		value: string;
	}>;
}
