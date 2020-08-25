import { PipeTransform, Pipe } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
	public transform(
		source: Observable<any>,
		filterValue: any,
		filterByProperty: string,
		exclude: boolean = true
	): Observable<any> {
		console.log(filterValue);
		return source.pipe(
			filter((value) => {
				return exclude ? value[filterByProperty] !== filterValue : value[filterByProperty] !== filterValue;
			})
		);
	}
}
