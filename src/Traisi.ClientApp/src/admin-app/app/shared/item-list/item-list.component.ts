import {Component, Input, OnInit} from '@angular/core';

@Component({
	selector: 'item-list',
	templateUrl: './item-list.component.html',
	styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {

	@Input() public data: any = [];

	constructor() { }

	ngOnInit() {
	}

}
