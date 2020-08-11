import { Injectable } from '@angular/core';
import { map, sample } from 'rxjs/operators';

import {forkJoin as observableForkJoin,  Observable ,  Subject } from 'rxjs';
import { Sample } from '../models/sample.model';
import { SampleEndpointService } from './sample-endpoint.service'

@Injectable({ providedIn: 'root'})
export class SampleService {

	private lastSample: Sample;

	constructor(private _sampleEndpointService: SampleEndpointService) {}

	/**
	 * Lists all samples owned by user.
	 * @param  {number} page?
	 * @param  {number} pageSize?
	 */
	public listSamples(page?: number, pageSize?: number): Observable<Sample[]> {
		return this._sampleEndpointService.getListSamplesEndpoint<Sample[]>(page, pageSize).pipe(map(samples => {
			return samples.map(sample => {
			    sample.startDate = new Date(sample.startDate);
				sample.lastModified = new Date(sample.lastModified);
				sample.createdDate = new Date(sample.createdDate);
				sample.updatedDate = new Date(sample.updatedDate);
				return sample;
			});
		}));
	}

	/**
	 * Lists all distribution samples.
	 * @param  {number} page?
	 * @param  {number} pageSize?
	 */
	public listDistributionSamples(): Observable<Sample[]> {
		return this._sampleEndpointService.getListDistributionSamplesEndpoint<Sample[]>().pipe(map(samples => {
			return samples.map(sample => {
				sample.startDate = new Date(sample.startDate);
				sample.lastModified = new Date(sample.lastModified);
				sample.createdDate = new Date(sample.createdDate);
				sample.updatedDate = new Date(sample.updatedDate);
				return sample;
			});
		}));
	}

	/**
	 * List all queue samples
	 */
	public listQueueSamples(): Observable<Sample[]> {
		return this._sampleEndpointService.getListQueueSamplesEndpoint<Sample[]>().pipe(map(samples => {
			return samples.map(sample => {
				sample.startDate = new Date(sample.startDate);
				sample.lastModified = new Date(sample.lastModified);
				sample.createdDate = new Date(sample.createdDate);
				sample.updatedDate = new Date(sample.updatedDate);
				return sample;
			});
		}));
	}

	/**
	 * Creates a new sample with the passed sample details.
	 * @param  {any} sample
	 */
	public createSample(sample: any): Observable<Sample> {
		return this._sampleEndpointService.getCreateSampleEndpoint<Sample>(sample);
	}

	/**
	 * Edits (submits) updated sample information.
	 * @param  {any} sample Sample object with updated data.
	 */
	public editSample(sample: any): Observable<Sample> {
		return this._sampleEndpointService.getEditSampleEndpoint<Sample>(sample);
	}

	/**
	 * Deletes the passed sample.
	 * @param  {Sample} sample
	 */
	public deleteSample(id: number): Observable<number> {
		return this._sampleEndpointService.getDeleteSampleEndpoint<number>(id);
	}
	
	/**
	 * Retrieves sample with specified id.
	 * @param id
	 */
	public getSample(id: number): Observable<Sample> {
		return this._sampleEndpointService.getSampleEndpoint<Sample>(id).pipe(map(sample => {
			this.lastSample = sample;
			return sample;
		}));
	}

	public getLastSample(): Sample {
		return this.getLastSample();
	}
}
