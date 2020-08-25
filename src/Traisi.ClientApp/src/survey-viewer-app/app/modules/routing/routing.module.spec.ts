import {AppRoutingModule} from './routing.module';

describe('RoutingModule', () => {
	let routingModule: AppRoutingModule;

	beforeEach(() => {
		routingModule = new AppRoutingModule();
	});

	it('should create an instance', () => {
		expect(routingModule).toBeTruthy();
	});
});
