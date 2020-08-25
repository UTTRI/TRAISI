import { TreeviewItem, TreeviewSelection, TreeviewI18nDefault } from 'ngx-treeview';
import { Injectable } from "@angular/core";

@Injectable()
export class DropdownTreeviewSelectI18n extends TreeviewI18nDefault {
	private internalSelectedItem: TreeviewItem;

	set selectedItem(value: TreeviewItem) {
		if ((value && value.children === undefined && value.text !== 'All') || value === undefined) {
			this.internalSelectedItem = value;
		}
	}

	get selectedItem(): TreeviewItem {
		return this.internalSelectedItem;
	}

	getText(selection: TreeviewSelection): string {
		return (this.internalSelectedItem !== undefined && this.internalSelectedItem !== null) ? this.internalSelectedItem.text : 'Select Option';
	}
}
