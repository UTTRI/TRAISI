import { Pipe, PipeTransform } from '@angular/core';
import { Address } from 'traisi-question-sdk';

@Pipe({ name: 'addressDisplay' })
export class AddressDisplayPipe implements PipeTransform {
	transform(address: Address): string {
		console.log(address);
		if (!address) {
			return '<address formatting error>';
		}
		else if(address?.formattedAddress) {
			return address?.formattedAddress;
		}
		return `${address?.streetNumber} ${address?.streetAddress}, ${address?.city}`;
	}
}
