import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'search-input',
	templateUrl: './search-box.component.html',
	styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent {

	@Input()
	placeholder: string = 'Search...';

	@Output()
	searchChange = new EventEmitter<string>();

	@ViewChild('searchInput', { static: true })
	searchInput: ElementRef;

	public input: string;


	onValueChange(value: string) {
		setTimeout(() => this.searchChange.emit(value));
	}


	clear() {
		this.searchInput.nativeElement.value = '';
		this.onValueChange(this.searchInput.nativeElement.value);
	}
}
