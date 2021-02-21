import { Pipe, PipeTransform } from '@angular/core';
import { Address } from 'traisi-question-sdk';

@Pipe({ name: 'addressDisplay' })
export class AddressDisplayPipe implements PipeTransform {
	transform(address: Address): string {
		if (!address) {
			return '<address formatting error>';
		}
		return `${address?.streetNumber} ${address?.streetAddress}, ${address?.city}`;
	}
}
