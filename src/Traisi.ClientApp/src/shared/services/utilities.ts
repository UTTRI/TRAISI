import { Injectable } from '@angular/core';
import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';

export function getItem(sKey) {
	return (
		decodeURIComponent(
			document.cookie.replace(
				new RegExp(
					'(?:(?:^|.*;)\\s*' +
						encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') +
						'\\s*\\=\\s*([^;]*).*$)|^.*$'
				),
				'$1'
			)
		) || null
	);
}

export function setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
	if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
		return false;
	}

	let sExpires = '';

	if (vEnd) {
		switch (vEnd.constructor) {
			case Number:
				sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
				break;
			case String:
				sExpires = '; expires=' + vEnd;
				break;
			case Date:
				sExpires = '; expires=' + vEnd.toUTCString();
				break;
		}
	}

	document.cookie =
		encodeURIComponent(sKey) +
		'=' +
		encodeURIComponent(sValue) +
		sExpires +
		(sDomain ? '; domain=' + sDomain : '') +
		(sPath ? '; path=' + sPath : '') +
		(bSecure ? '; secure' : '');
	return true;
}

export function removeItem(sKey, sPath, sDomain) {
	if (!sKey) {
		return false;
	}
	document.cookie =
		encodeURIComponent(sKey) +
		'=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
		(sDomain ? '; domain=' + sDomain : '') +
		(sPath ? '; path=' + sPath : '');
	return true;
}

export function hasItem(sKey) {
	return new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=').test(
		document.cookie
	);
}
export function keys() {
	let aKeys = document.cookie
		.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '')
		.split(/\s*(?:\=[^;]*)?;\s*/);
	for (let nIdx = 0; nIdx < aKeys.length; nIdx++) {
		aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
	}
	return aKeys;
}

// @dynamic
@Injectable()
export class Utilities {
	public static readonly captionAndMessageSeparator = ':';
	public static readonly noNetworkMessageCaption = 'No Network';
	public static readonly noNetworkMessageDetail = 'The server cannot be reached';
	public static readonly accessDeniedMessageCaption = 'Access Denied!';
	public static readonly accessDeniedMessageDetail = '';

	public static cookies = {
		getItem: getItem,
		setItem: setItem,
		removeItem: removeItem,
		hasItem: hasItem,
		keys: keys,
	};

	public static getHttpResponseMessage(data: HttpResponseBase | any): string[] {
		let responses: string[] = [];

		if (data instanceof HttpResponseBase) {
			if (this.checkNoNetwork(data)) {
				responses.push(
					`${this.noNetworkMessageCaption}${this.captionAndMessageSeparator} ${this.noNetworkMessageDetail}`
				);
			} else {
				let responseObject = this.getResponseBody(data);

				if (responseObject && (typeof responseObject === 'object' || responseObject instanceof Object)) {
					for (let key in responseObject) {
						if (key) {
							responses.push(`${responseObject[key]}`);
						} else if (responseObject[key]) {
							responses.push(responseObject[key].toString());
						}
					}
				}
			}

			if (!responses.length && this.getResponseBody(data)) {
				responses.push(`${data.statusText}: ${this.getResponseBody(data).toString()}`);
			}
		}

		if (!responses.length) {
			responses.push(data.toString());
		}

		if (this.checkAccessDenied(data)) {
			responses.splice(
				0,
				0,
				`${this.accessDeniedMessageCaption}${this.captionAndMessageSeparator} ${this.accessDeniedMessageDetail}`
			);
		}

		return responses;
	}

	public static findHttpResponseMessage(
		messageToFind: string,
		data: HttpResponse<any> | any,
		seachInCaptionOnly = true,
		includeCaptionInResult = false
	): string {
		let searchString = messageToFind.toLowerCase();
		let httpMessages = this.getHttpResponseMessage(data);

		for (let message of httpMessages) {
			let fullMessage = Utilities.splitInTwo(message, this.captionAndMessageSeparator);

			if (fullMessage.firstPart && fullMessage.firstPart.toLowerCase().indexOf(searchString) !== -1) {
				return includeCaptionInResult ? message : fullMessage.secondPart || fullMessage.firstPart;
			}
		}

		if (!seachInCaptionOnly) {
			for (let message of httpMessages) {
				if (message.toLowerCase().indexOf(searchString) !== -1) {
					if (includeCaptionInResult) {
						return message;
					} else {
						let fullMessage = Utilities.splitInTwo(message, this.captionAndMessageSeparator);
						return fullMessage.secondPart || fullMessage.firstPart;
					}
				}
			}
		}

		return null;
	}

	public static getResponseBody(response: HttpResponseBase) {
		if (response instanceof HttpResponse) {
			return response.body;
		}

		if (response instanceof HttpErrorResponse) {
			return response.error || response.message || response.statusText;
		}
	}

	public static checkNoNetwork(response: HttpResponseBase) {
		if (response instanceof HttpResponseBase) {
			return response.status === 0;
		}

		return false;
	}

	public static checkAccessDenied(response: HttpResponseBase) {
		if (response instanceof HttpResponseBase) {
			return response.status === 403;
		}

		return false;
	}

	public static checkNotFound(response: HttpResponseBase) {
		if (response instanceof HttpResponseBase) {
			return response.status === 404;
		}

		return false;
	}

	public static checkIsLocalHost(url: string, base?: string) {
		if (url) {
			let location = new URL(url, base);
			return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
		}

		return false;
	}

	public static getQueryParamsFromString(paramString: string) {
		if (!paramString) {
			return null;
		}

		let params: { [key: string]: string } = {};

		for (let param of paramString.split('&')) {
			let keyValue = Utilities.splitInTwo(param, '=');
			params[keyValue.firstPart] = keyValue.secondPart;
		}

		return params;
	}

	public static splitInTwo(text: string, separator: string): { firstPart: string; secondPart: string } {
		let separatorIndex = text.indexOf(separator);

		if (separatorIndex === -1) {
			return { firstPart: text, secondPart: null };
		}

		let part1 = text.substr(0, separatorIndex).trim();
		let part2 = text.substr(separatorIndex + 1).trim();

		return { firstPart: part1, secondPart: part2 };
	}

	public static safeStringify(object) {
		let result: string;

		try {
			result = JSON.stringify(object);
			return result;
		} catch (error) {}

		let simpleObject = {};

		for (let prop in object) {
			if (!object.hasOwnProperty(prop)) {
				continue;
			}
			if (typeof object[prop] === 'object') {
				continue;
			}
			if (typeof object[prop] === 'function') {
				continue;
			}
			simpleObject[prop] = object[prop];
		}

		result = '[***Sanitized Object***]: ' + JSON.stringify(simpleObject);

		return result;
	}

	public static JSonTryParse(value: string) {
		try {
			return JSON.parse(value);
		} catch (e) {
			if (value === 'undefined') {
				return void 0;
			}

			return value;
		}
	}

	public static TestIsObjectEmpty(obj: any) {
		for (let prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return false;
			}
		}

		return true;
	}

	public static TestIsUndefined(value: any) {
		return typeof value === 'undefined';
	}

	public static TestIsString(value: any) {
		return typeof value === 'string' || value instanceof String;
	}

	public static capitalizeFirstLetter(text: string) {
		if (text) {
			return text.charAt(0).toUpperCase() + text.slice(1);
		} else {
			return text;
		}
	}

	public static toTitleCase(text: string) {
		return text.replace(/\w\S*/g, function (subString) {
			return subString.charAt(0).toUpperCase() + subString.substr(1).toLowerCase();
		});
	}

	public static toLowerCase(items: string | string[]);
	public static toLowerCase(items: any): string | string[] {
		if (items instanceof Array) {
			let loweredRoles: string[] = [];

			for (let i = 0; i < items.length; i++) {
				loweredRoles[i] = items[i].toLowerCase();
			}

			return loweredRoles;
		} else if (typeof items === 'string' || items instanceof String) {
			return items.toLowerCase();
		}
	}

	private static blendColours(colourString: string, lowerBackground: string): number[] {
		if (!lowerBackground) {
			return this.getRgbaArray(colourString);
		} else if (!colourString) {
			return this.getRgbaArray(lowerBackground);
		} else {
			let base = this.getRgbaArray(lowerBackground);
			let added = this.getRgbaArray(colourString);
			if (added[3] === 0) {
				return this.getRgbaArray(lowerBackground);
			} else {
				let mix = [];
				mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
				mix[0] = Math.round((added[0] * added[3]) / mix[3] + (base[0] * base[3] * (1 - added[3])) / mix[3]); // red
				mix[1] = Math.round((added[1] * added[3]) / mix[3] + (base[1] * base[3] * (1 - added[3])) / mix[3]); // green
				mix[2] = Math.round((added[2] * added[3]) / mix[3] + (base[2] * base[3] * (1 - added[3])) / mix[3]); // blue
				return mix;
			}
		}
	}

	private static getRgbaArray(colourString: string): number[] {
		let rgba = [];
		let colorTriplet;
		let a;
		if (colourString.startsWith('rgba')) {
			colorTriplet = colourString.substring(5, colourString.length - 1);
		} else {
			colorTriplet = colourString.substring(4, colourString.length - 1);
		}

		let colorSplit = colorTriplet.split(',');

		if (colourString.startsWith('rgba')) {
			a = +colorSplit[3];
		} else {
			a = 1.0;
		}
		return [+colorSplit[0], +colorSplit[1], +colorSplit[2], a];
	}

	public static whiteOrBlackText(colourString: string, lowerBackground?: string): string {
		if (!colourString && !lowerBackground) {
			return 'rgb(0,0,0)';
		}
		let [r, g, b, a] = this.blendColours(colourString, lowerBackground);

		/*if (+colorSplit[0] * 0.299 + +colorSplit[1] * 0.587 + +colorSplit[2] * 0.114 > 149) {
			return 'rgb(0,0,0)';
		} else {
			return 'rgb(255,255,255)';
		}*/

		let rT = this.rgbTransform(r);
		let gT = this.rgbTransform(g);
		let bT = this.rgbTransform(b);
		let L = (0.2126 * rT + 0.7152 * gT + 0.0722 * bT) / a;
		if (L > 0.179) {
			return 'rgb(0,0,0)';
		} else {
			return 'rgb(255,255,255)';
		}
	}

	private static rgbTransform(c: number) {
		c = c / 255.0;
		if (c <= 0.03928) {
			c = c / 12.92;
		} else {
			c = ((c + 0.055) / 1.055) ** 2.4;
		}
		return c;
	}

	public static uniqueId() {
		return this.randomNumber(1000000, 9000000).toString();
	}

	public static randomNumber(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	public static baseUrl() {
		let base = '';

		if (window.location.origin) {
			base = window.location.origin;
		} else {
			base =
				window.location.protocol +
				'//' +
				window.location.hostname +
				(window.location.port ? ':' + window.location.port : '');
		}
		return base.replace(/\/$/, '');
	}

	public static printDateOnly(date: Date) {
		date = new Date(date);

		let dayNames = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
		let monthNames = new Array(
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		);

		let dayOfWeek = date.getDay();
		let dayOfMonth = date.getDate();
		let sup = '';
		let month = date.getMonth();
		let year = date.getFullYear();

		if (dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31) {
			sup = 'st';
		} else if (dayOfMonth === 2 || dayOfMonth === 22) {
			sup = 'nd';
		} else if (dayOfMonth === 3 || dayOfMonth === 23) {
			sup = 'rd';
		} else {
			sup = 'th';
		}

		let dateString = dayNames[dayOfWeek] + ', ' + dayOfMonth + sup + ' ' + monthNames[month] + ' ' + year;

		return dateString;
	}

	public static printTimeOnly(date: Date) {
		date = new Date(date);

		let period = '';
		let minute = date.getMinutes().toString();
		let hour = date.getHours();

		period = hour < 12 ? 'AM' : 'PM';

		if (hour === 0) {
			hour = 12;
		}
		if (hour > 12) {
			hour = hour - 12;
		}

		if (minute.length === 1) {
			minute = '0' + minute;
		}

		let timeString = hour + ':' + minute + ' ' + period;

		return timeString;
	}

	public static printDate(date: Date, separator = 'at') {
		return `${Utilities.printDateOnly(date)} ${separator} ${Utilities.printTimeOnly(date)}`;
	}

	public static printFriendlyDate(date: Date, separator = '-') {
		let today = new Date();
		today.setHours(0, 0, 0, 0);
		let yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		let test = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		if (test.toDateString() === today.toDateString()) {
			return `Today ${separator} ${Utilities.printTimeOnly(date)}`;
		}
		if (test.toDateString() === yesterday.toDateString()) {
			return `Yesterday ${separator} ${Utilities.printTimeOnly(date)}`;
		} else {
			return Utilities.printDate(date, separator);
		}
	}

	public static printShortDate(date: Date, separator = '/', dateTimeSeparator = '-') {
		let day = date.getDate().toString();
		let month = (date.getMonth() + 1).toString();
		let year = date.getFullYear();

		if (day.length === 1) {
			day = '0' + day;
		}

		if (month.length === 1) {
			month = '0' + month;
		}

		return `${month}${separator}${day}${separator}${year} ${dateTimeSeparator} ${Utilities.printTimeOnly(date)}`;
	}

	public static parseDate(date) {
		if (date) {
			if (date instanceof Date) {
				return date;
			}

			if (typeof date === 'string' || date instanceof String) {
				if (date.search(/[a-su-z+]/i) === -1) {
					date = date + 'Z';
				}

				return new Date(date);
			}

			if (typeof date === 'number' || date instanceof Number) {
				return new Date(<any>date);
			}
		}
	}

	public static printDuration(start: Date, end: Date) {
		start = new Date(start);
		end = new Date(end);

		// get total seconds between the times
		let delta = Math.abs(start.valueOf() - end.valueOf()) / 1000;

		// calculate (and subtract) whole days
		let days = Math.floor(delta / 86400);
		delta -= days * 86400;

		// calculate (and subtract) whole hours
		let hours = Math.floor(delta / 3600) % 24;
		delta -= hours * 3600;

		// calculate (and subtract) whole minutes
		let minutes = Math.floor(delta / 60) % 60;
		delta -= minutes * 60;

		// what's left is seconds
		let seconds = delta % 60; // in theory the modulus is not required

		let printedDays = '';

		if (days) {
			printedDays = `${days} days`;
		}

		if (hours) {
			printedDays += printedDays ? `, ${hours} hours` : `${hours} hours`;
		}

		if (minutes) {
			printedDays += printedDays ? `, ${minutes} minutes` : `${minutes} minutes`;
		}

		if (seconds) {
			printedDays += printedDays ? ` and ${seconds} seconds` : `${seconds} seconds`;
		}

		if (!printedDays) {
			printedDays = '0';
		}

		return printedDays;
	}

	public static getAge(birthDate, otherDate) {
		birthDate = new Date(birthDate);
		otherDate = new Date(otherDate);

		let years = otherDate.getFullYear() - birthDate.getFullYear();

		if (
			otherDate.getMonth() < birthDate.getMonth() ||
			(otherDate.getMonth() === birthDate.getMonth() && otherDate.getDate() < birthDate.getDate())
		) {
			years--;
		}

		return years;
	}

	public static searchArray(searchTerm: string, caseSensitive: boolean, ...values: any[]) {
		if (!searchTerm) {
			return true;
		}

		if (!caseSensitive) {
			searchTerm = searchTerm.toLowerCase();
		}

		for (let value of values) {
			if (value != null) {
				let strValue = value.toString();

				if (!caseSensitive) {
					strValue = strValue.toLowerCase();
				}

				if (strValue.indexOf(searchTerm) !== -1) {
					return true;
				}
			}
		}

		return false;
	}

	public static moveArrayItem(array: any[], oldIndex, newIndex) {
		while (oldIndex < 0) {
			oldIndex += this.length;
		}

		while (newIndex < 0) {
			newIndex += this.length;
		}

		if (newIndex >= this.length) {
			let k = newIndex - this.length;
			while (k-- + 1) {
				array.push(undefined);
			}
		}

		array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
	}

	public static expandCamelCase(text: string) {
		if (!text) {
			return text;
		}

		return text
			.replace(/([A-Z][a-z]+)/g, ' $1')
			.replace(/([A-Z][A-Z]+)/g, ' $1')
			.replace(/([^A-Za-z ]+)/g, ' $1');
	}

	public static testIsAbsoluteUrl(url: string) {
		let r = new RegExp('^(?:[a-z]+:)?//', 'i');
		return r.test(url);
	}

	public static convertToAbsoluteUrl(url: string) {
		return Utilities.testIsAbsoluteUrl(url) ? url : '//' + url;
	}

	public static removeNulls(obj) {
		let isArray = obj instanceof Array;

		for (let k of Object.keys(obj)) {
			if (obj[k] === null) {
				isArray ? obj.splice(k, 1) : delete obj[k];
			} else if (typeof obj[k] === 'object') {
				Utilities.removeNulls(obj[k]);
			}

			if (isArray && obj.length === k) {
				Utilities.removeNulls(obj);
			}
		}

		return obj;
	}

	public static debounce(func: (...args) => any, wait: number, immediate?: boolean) {
		let timeout;

		return function () {
			let context = this;
			let args_ = arguments;

			let later = function () {
				timeout = null;
				if (!immediate) {
					func.apply(context, args_);
				}
			};

			let callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args_);
			}
		};
	}

	public static applyDrag = (arr, dragResult) => {
		const { removedIndex, addedIndex, payload } = dragResult;
		if (removedIndex === null && addedIndex === null) {
			return arr;
		}

		const result = [...arr];
		let itemToAdd = payload;

		if (removedIndex !== null) {
			itemToAdd = result.splice(removedIndex, 1)[0];
		}

		if (addedIndex !== null) {
			result.splice(addedIndex, 0, itemToAdd);
		}

		return result;
	};

	public static extractPlaceholders = (text: string): string[] => {
		if (!text) {
			return null;
		}
		let regexTest = /{{ [\w\s]* }}/g;
		let placeholderMatch = text.match(regexTest);
		if (placeholderMatch !== null) {
			return placeholderMatch.map((name) => name.substring(3, name.length - 3));
		} else {
			return null;
		}
	};

	/**
	 * Replace placeholder of utilities
	 */
	public static replacePlaceholder = (
		sourceText: string,
		tag: string,
		replacementValue: string,
		replaceValueClass: string = 'piped-value',
		tooltip: string = ''
	): string => {
		if (!replacementValue) {
			return sourceText;
		}
		return sourceText.replace(
			`{{ ${tag} }}`,
			`<span tooltip="${tooltip}" class="${replaceValueClass}">${replacementValue}</span>`
		);
	};
}
