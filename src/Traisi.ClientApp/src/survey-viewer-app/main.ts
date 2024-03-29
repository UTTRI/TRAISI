import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import '@angular/compiler';
import { AppModule } from 'app/app.module';
import { environment } from 'environments/environment';
import { jsModule as moduleSupport } from 'environments/module';

if (environment.production) {
	enableProdMode();
	console.debug = function () {};
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.log(err));
