import { SurveyPermissions } from './survey-permissions.model';
export class Survey {

	constructor(public id?: number,
				public code?: string,
				public name?: string,
				public owner?: string,
				public group?: string,
				public createdDate?: Date,
				public updatedDate?: Date,
				public startAt?: Date,
				public endAt?: Date,
				public isActive?: boolean,
				public isOpen?: boolean,
				public successLink?: string,
				public rejectionLink?: string,
				public defaultLanguage?: string,
				public styleTemplate?: string,
				public surveyPermissions?: SurveyPermissions[]) {
	}
}
