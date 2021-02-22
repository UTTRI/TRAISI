import { Address } from 'traisi-question-sdk';
import { PurposeLocation } from './purpose-location.model';

export interface RespondentsData {
	respondent: { [id: number]: RespondentData };
	homeLocation: PurposeLocation;
}

export interface RespondentData {
	workLocations: PurposeLocation[];
	schoolLocations: PurposeLocation[];
	
}
