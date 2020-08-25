
import {fromEvent as observableFromEvent,  Observable ,  Subscription } from 'rxjs';
import { Directive, ElementRef, Output, EventEmitter, OnDestroy, NgZone } from '@angular/core';


declare var $: any;

interface EventArg { type: string; target: Element; relatedTarget: Element; }

@Directive({
	selector: '[bootstrapTab]',
	exportAs: 'bootstrap-tab'
})
export class BootstrapTabDirective implements OnDestroy {


	@Output()
	showBSTab = new EventEmitter<EventArg>();

	@Output()
	hideBSTab = new EventEmitter<EventArg>();

	private tabShownSubscription: Subscription;
	private tabHiddenSubscription: Subscription;


	constructor(private el: ElementRef, private zone: NgZone) {

		this.tabShownSubscription = observableFromEvent($(this.el.nativeElement), 'show.bs.tab')
			.subscribe((e: any) => {
				this.runInZone(() => this.showBSTab.emit({ type: e.type, target: e.target, relatedTarget: e.relatedTarget }));
			});

		this.tabHiddenSubscription = observableFromEvent($(this.el.nativeElement), 'hidden.bs.tab')
			.subscribe((e: any) => {
				this.runInZone(() => this.hideBSTab.emit({ type: e.type, target: e.target, relatedTarget: e.relatedTarget }));
			});
	}


	ngOnDestroy() {
		this.tabShownSubscription.unsubscribe();
		this.tabHiddenSubscription.unsubscribe();
	}


	private runInZone(delegate: () => any) {
		this.zone.run(() => {
			delegate();
		});
	}


	show(selector: string) {
		$(selector).tab('show');
	}
}
