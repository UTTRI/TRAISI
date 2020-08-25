export class UserGroupAPIKeys {
	constructor(public id?: number,
		public groupId?: number,
		public mapBoxApiKey?: string,
		public googleMapsApiKey?: string,
		public mailgunApiKey?: string) {
	}
}
