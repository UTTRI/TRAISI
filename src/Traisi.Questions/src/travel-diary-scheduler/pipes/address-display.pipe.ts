import { Pipe, PipeTransform } from '@angular/core';
import { Address } from 'traisi-question-sdk';

@Pipe({ name: 'addressDisplay' })
export class AddressDisplayPipe implements PipeTransform {
	transform(address: Address): string {
		if (!address) {
			return '<address formatting error>';
		}
		else if(!address?.city) {
			return 'No location has been saved';
		}
		return `${address?.streetNumber} ${address?.streetAddress}, ${address?.city}`;
	}
}
