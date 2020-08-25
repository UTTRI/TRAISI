import { Injectable } from '@angular/core';
import { GeneratedIdsViewModel } from '../models/generated-ids-view-model.model';

@Injectable()
export class UtilService {
	constructor() {}

	/**
	 * Copies the ids from the src object, in index order to the dst object
	 * @param src
	 * @param dst
	 * @param childrenProperty
	 */
	public copyIds<T extends { id: number }>(src: GeneratedIdsViewModel, dst: T, childrenProperty: string): void {
		dst.id = src.id;
		let children = dst[childrenProperty] as T[];
		if (!children) {
			return;
		}
		for (let i = 0; i < children.length; i++) {
			this.copyIds(src.children[i], children[i], childrenProperty);
		}
	}
}
