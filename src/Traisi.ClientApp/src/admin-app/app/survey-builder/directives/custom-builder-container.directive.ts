import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[customBuilderContainer]'
})
export class CustomBuilderContainerDirective {
	constructor(public viewContainerRef: ViewContainerRef) {}
}
