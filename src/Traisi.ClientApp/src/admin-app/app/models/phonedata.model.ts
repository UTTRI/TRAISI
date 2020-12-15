import { Time } from '@angular/common';
import { PhoneDataPermissions } from './phonedata.permissions.model';
export class PhoneData 
{
	constructor(
				//Smartphone Data
				public gpsId?: number | string,
				public userId?: number | string,
				public trackedAt?: number | string,
				public latitude?: number | string,
				public longitude?: number | string,
				public accuracy?: number | string,
				public tripId?: number | string,
				public startedAt?: number | string,
				public finishedAt?: number | string,
				public length?: number | string,
				public mode?: string,
				public travelStatus?: string,
				public phoneDataPermissions?: PhoneDataPermissions[])
				{
		}
}
