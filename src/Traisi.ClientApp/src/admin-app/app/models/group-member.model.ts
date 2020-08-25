import { UserGroup } from './user-group.model';
import { User } from '../../../shared/models/user.model';

export class GroupMember {

	constructor(public id?: number,
		public userName?: string,
		public user?: User,
		public group?: string,
		public dateJoined?: Date,
		public groupAdmin?: boolean) {

		}
}
