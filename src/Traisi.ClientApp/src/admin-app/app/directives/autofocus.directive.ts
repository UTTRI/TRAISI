import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';


@Directive({
	selector: '[autofocus]'
})
export class AutofocusDirective implements OnInit {
	constructor(public renderer: Renderer2, public elementRef: ElementRef) { }

	ngOnInit() {
		setTimeout(() => this.elementRef.nativeElement.focus(), 500);
	}
}
