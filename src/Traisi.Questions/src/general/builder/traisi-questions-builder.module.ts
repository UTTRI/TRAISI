import { NgModule } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
@NgModule({
  declarations: [],
  entryComponents: [],
  providers: [
    {
      provide: 'widgets',
      useValue: [],
      multi: true,
    },
  ],
  imports: [CommonModule, HttpClientModule, FormsModule],
})
export default class TrausiQuestionsBuilderModule {}
