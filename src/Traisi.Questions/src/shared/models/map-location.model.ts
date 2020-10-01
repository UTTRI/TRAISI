import { Address } from 'traisi-question-sdk';

export interface MapLocation {
	lat: number;
	lng: number;
	address: Address;
	name: string;
	id: string;
}
