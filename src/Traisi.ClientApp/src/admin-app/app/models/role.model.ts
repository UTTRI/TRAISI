import { Permission } from '../../../shared/models/permission.model';


export class Role {

	constructor(name?: string, description?: string, level?: number, permissions?: Permission[]) {

		this.name = name;
		this.description = description;
		this.level = level;
		this.permissions = permissions;
	}

	public id: string;
	public name: string;
	public description: string;
	public level: number;
	public usersCount: string;
	public permissions: Permission[];
}
