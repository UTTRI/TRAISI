import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemListComponent } from './item-list/item-list.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SafePipe } from '../pipes/safe.pipe';
import { TreeviewModule } from 'ngx-treeview';
import { DropdownTreeviewSelectComponent } from './dropdown-treeview-select/dropdown-treeview-select.component';

@NgModule({
	imports: [CommonModule, TooltipModule, FormsModule, RouterModule, TreeviewModule],
	providers: [],
	declarations: [ItemListComponent, SearchBoxComponent, SafePipe, DropdownTreeviewSelectComponent ],
	exports: [ItemListComponent, SearchBoxComponent, SafePipe, DropdownTreeviewSelectComponent]
})
export class SharedModule {}
