import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// RECOMMENDED
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot()    
  ]
})
export class TravelDiaryLoggerModule
{

}