import { Time } from '@angular/common';
import { SamplePermissions } from './sample-permissions.model';
export class Sample 
{
	constructor(public id?: number,
				public accessCode?: string,
				public lastName?: string,
				public hhIdNum?: number | string,
				public mailingBlock?: number | string,
				public postalCode?: string,
				public owner?: string,
				public group?: string,
				public address?: string,
				public phoneNumber?: number | string,
				public createdDate?: Date,
				public updatedDate?: Date,
				public name?: string,
				public startDate?: Date | string,
				public lastModified?: Date | string,
				public status?: string,
			 	public isActive?: boolean,
				public isOpen?: boolean,
				public defaultLanguage?: string,
				public state?: string,
				public language?: string,
				//public selectSearchKey?: string,
				public styleTemplate?: string,
				public samplePermissions?: SamplePermissions[])
				{
		}
}
