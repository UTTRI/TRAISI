import { Address } from 'traisi-question-sdk';
import { PurposeLocation } from './purpose-location.model';

export interface RespondentsData {
	respondent: { [id: number]: RespondentData };
}

export interface RespondentData {
	workLocations: PurposeLocation[];
	schoolLocations: PurposeLocation[];
	homeLocation: PurposeLocation;
}
