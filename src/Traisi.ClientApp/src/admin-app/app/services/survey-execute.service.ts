import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import {forkJoin as observableForkJoin,  Observable ,  Subject } from 'rxjs';
import { SurveyExecuteEndpointService } from './survey-execute-endpoint.service';
import { CodeGenerator } from '../models/code-generator.model';
import { ShortCode } from '../models/short-code.model';
import { GroupCode } from '../models/group-code.model';

@Injectable({ providedIn: 'root'})
export class SurveyExecuteService {


	constructor(private _surveyExecuteEndpointService: SurveyExecuteEndpointService) {}


	public listSurveyShortCodes(surveyId: number, mode: string, page?: number, pageSize?: number): Observable<ShortCode[]> {
		return this._surveyExecuteEndpointService.getSurveyShortCodesEndpoint<ShortCode[]>(surveyId, mode, page, pageSize).pipe(map(codes => {
			return codes.map(code => {
				code.createdDate = new Date(code.createdDate);
				return code;
			});
		}));
	}

	public totalSurveyShortCodes(surveyId: number, mode: string): Observable<number> {
		return this._surveyExecuteEndpointService.getCountOfSurveyShortCodesEndpoint<number>(surveyId, mode);
	}

	public totalSurveyGroupCodes(surveyId: number, mode: string): Observable<number> {
		return this._surveyExecuteEndpointService.getCountOfSurveyGroupCodesEndpoint<number>(surveyId, mode);
	}

	public listSurveyGroupCodes(surveyId: number, mode: string, page?: number, pageSize?: number): Observable<GroupCode[]> {
		return this._surveyExecuteEndpointService.getSurveyGroupCodesEndpoint<GroupCode[]>(surveyId, mode, page, pageSize).pipe(map(codes => {
			return codes.map(code => {
				code.createdDate = new Date(code.createdDate);
				return code;
			});
		}));
	}

	public createSurveyShortCodes(codeGenParams: CodeGenerator) {
		return this._surveyExecuteEndpointService.getCreateSurveyShortCodesEndpoint<CodeGenerator>(codeGenParams);
	}

	public createSurveyGroupCodes(codeGenParams: CodeGenerator) {
		return this._surveyExecuteEndpointService.getCreateSurveyGroupCodesEndpoint<CodeGenerator>(codeGenParams);
	}

	public downloadSurveyShortCodes(surveyId: number, mode: string) {
		return this._surveyExecuteEndpointService.getDownloadSurveyShortCodesEndpoint<string>(surveyId, mode);
	}

	public downloadSurveyGroupCodes(surveyId: number, mode: string) {
		return this._surveyExecuteEndpointService.getDownloadSurveyGroupCodesEndpoint<string>(surveyId, mode);
	}

}
