type option = {
	label: string;
	value: string;
};
export interface TravelDiaryConfiguration {
	purpose: Purpose[];
	mode: TravelMode[];
	homeAllDay: option;
	homeDeparture: option;
	returnHome: option;
	workOutside: option[];
	schoolOutside: option[];
}

export interface TravelMode {
	icon: string;
	id: string;
	label: string;
}

export interface Purpose {
	icon: string;
	id: string;
	label: string;
	allowFirstLocation: boolean;
	askIfOtherPassengers: boolean;
}
