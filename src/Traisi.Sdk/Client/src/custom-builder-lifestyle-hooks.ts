import { Injector } from '@angular/core';
export interface CustomBuilderOnInit {
	customBuilderInitialized(injector?: Injector): void;
}

export interface CustomBuilderOnShown {
	customBuilderShown(): void;
}
export interface CustomBuilderOnHidden {
	customBuilderHidden(): void;
}

