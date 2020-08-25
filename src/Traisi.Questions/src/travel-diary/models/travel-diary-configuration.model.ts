type option = {
	label: string;
	value: string;
};
export interface TravelDiaryConfiguration {
	purpose: string[];
	mode: string[];
	homeAllDay: option;
	homeDeparture: option;
	returnHome: option;
	workOutside: option[],
	schoolOutside: option[],
}
