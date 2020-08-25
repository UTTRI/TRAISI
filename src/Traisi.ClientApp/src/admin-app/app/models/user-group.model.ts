import { GroupMember } from './group-member.model';

export class UserGroup {
	constructor(public id?: number,
		public name?: string,
		public members?: GroupMember[]) {
	}
}
