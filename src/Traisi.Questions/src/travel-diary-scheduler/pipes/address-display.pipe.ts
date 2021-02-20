import { Pipe, PipeTransform } from '@angular/core';
import { Address } from 'traisi-question-sdk';

@Pipe({name: 'addressDisplay'}) 
export class AddressDisplayPipe implements PipeTransform {
  transform(address: Address): string {
    return `${address.streetNumber} ${address.streetAddress}, ${address.city}`;
  }
}