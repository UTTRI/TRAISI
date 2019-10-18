import { Component, ElementRef, Input, AfterContentInit } from '@angular/core';
// import Popper from 'popper.js';

declare var Popper: any;
@Component({
	selector: 'traisi-popper-content',
	templateUrl: './popper-content.component.html',
	styleUrls: ['./popper-content.component.scss']
})
export class PopperContentComponent implements AfterContentInit {
	@Input()
	public target!: HTMLElement;
	public constructor(private _element: ElementRef) {
		console.log(this);
	}

	public ngAfterContentInit(): void {
		console.log(this.target);
		console.log(this._element.nativeElement);
		let popper = new Popper(this.target, this._element.nativeElement, { placement: 'top' });
	}

	public close(): void {}
}
