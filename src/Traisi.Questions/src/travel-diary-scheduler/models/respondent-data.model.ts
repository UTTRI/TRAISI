import { Address } from "traisi-question-sdk";
import { PurposeLocation } from "./purpose-location.model";

export interface RespondentData {
	workLocations: PurposeLocation[];
	schoolLocations: PurposeLocation[];
	homeLocation: PurposeLocation;
}
