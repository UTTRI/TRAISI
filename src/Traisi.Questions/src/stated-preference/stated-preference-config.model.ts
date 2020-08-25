export interface StatedPreferenceChoice {

	items: Array<{
		label: string;
		viewCondition: string;
	}>;

}

export interface StatedPreferenceConfig {
	headers: Array<string>;
	choices: Array<StatedPreferenceChoice>;
	rowHeaders: Array<string>;
}
