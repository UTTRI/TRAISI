import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import {forkJoin as observableForkJoin,  Observable ,  Subject } from 'rxjs';
import { PhoneData } from '../models/phonedata.model';
import { PhoneDataEndpointService } from './phonedata-endpoint.service'

@Injectable({ providedIn: 'root'})
export class PhoneDataService {

	private lastPhoneData: PhoneData;

	constructor(private _phonedataEndpointService: PhoneDataEndpointService) {}

	/**
	 * Lists all samples owned by user.
	 * @param  {number} page?
	 * @param  {number} pageSize?
	 */
	public listPhoneData(page?: number, pageSize?: number): Observable<PhoneData[]> {
		return this._phonedataEndpointService.getListPhoneDataEndPoint<PhoneData[]>(page, pageSize).pipe(map(phonesdata => {
			return phonesdata.map(phonedata => {
			   	return phonedata;
			});
		}));
	}

	
	/**
	 * Retrieves sample with specified id.
	 * @param id
	 */
	 public getPhoneData(id: number): Observable<PhoneData> {
		return this._phonedataEndpointService.getPhoneDataEndpoint<PhoneData>(id).pipe(map(phonedata => {
			return phonedata;
		}));
	}

	public getLastPhoneData(): PhoneData {
		return this.getLastPhoneData();
	} 
}
