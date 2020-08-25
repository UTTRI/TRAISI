import { User } from '../../../shared/models/user.model';

export class GroupCode {
	get id(): number {
		return this._id;
	}

	set id(value: number) {
		this._id = value;
	}

	get createdBy(): User {
		return this._createdBy;
	}

	set createdBy(value: User) {
		this._createdBy = value;
	}

	get code(): string {
		return this._code;
	}

	set code(value: string) {
		this._code = value;
	}

	get createdDate(): Date {
		return this._createdDate;
	}

	set createdDate(value: Date) {
		this._createdDate = value;
	}

	get isActive(): boolean {
		return this._isActive;
	}

	set isActive(value: boolean) {
		this._isActive = value;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	set updatedAt(value: Date) {
		this._updatedAt = value;
	}

	constructor(private _id?: number,
		private _createdBy?: User,
		private _code?: string,
		private _createdDate?: Date,
		private _isActive?: boolean,
		private _name?: string,
		private _updatedAt?: Date) {

	}


}
