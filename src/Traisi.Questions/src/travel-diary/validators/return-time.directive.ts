import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
	selector: '[returnTime][ngModel]',
	providers: [{ provide: NG_VALIDATORS, useExisting: ReturnTimeValidatorDirective, multi: true }],
})
export class ReturnTimeValidatorDirective implements Validator {
	validate(control: AbstractControl): ValidationErrors {
		console.log('in valid');
		return null;
	}
}
