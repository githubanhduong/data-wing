import { DiacriticsRemover } from './DiacriticsRemover'
import type { CtxData } from './custom-type';
import type { IbeBooking, Journey, Passenger } from './datawings-ibe';
import { dateToString } from './dw-luxon';
import { CsrfToken } from './token/CsrfToken';
import { decryptAesHexToken } from './token/aes';

export const isValidStringRegex = (regex: RegExp, value: string) => regex.test(value)

export const stringFormat = (format: string, ...args: any[]) => {
	let theString = format
	for (let i = 0; i < args.length; i++) {
		const regEx = new RegExp(`\\{${i}\\}`, "gm");
		theString = theString.replace(regEx, args[i]);
	}
	return theString;
}

export const replaceRegex = (text: string, regex: RegExp, replace: string) => {
	return text.replace(regex, replace)
}

export const removeDiacritics = (text: string) => text ? DiacriticsRemover.removeDiacritics(text) : ''

export const currentLang = () => htmlElement('html')!.getAttribute('lang');

export const csrfToken__ = (): CsrfToken | null => {
	const csrfMeta = htmlElement('meta[name="_csrf"]')
	if (csrfMeta) {
		return new CsrfToken('_csrf', csrfMeta.getAttribute('value') || '', new Date())
	}
	return null;
}

/** Return first element */
export const querySelector = <E extends Element = Element>(selectors: string) => document.querySelector<E>(selectors)
export const querySelectorFrom = <E extends Element = Element>(root: Element, selectors: string) => root.querySelector<E>(selectors)

/** kong dung nua */
export const htmlElement = (selectors: string) => document.querySelector<HTMLElement>(selectors)
/** kong dung nua */
export const htmlElementInRoot = (root: Element, selectors: string) => root?.querySelector<HTMLElement>(selectors)

export const generateUUID = () => {
	const hexValues = '0123456789abcdef';
	let uuid = '';

	// Generate a random number for each UUID section
	for (let i = 0; i < 36; i++) {
		if (i === 8 || i === 13 || i === 18 || i === 23) {
			uuid += '-';
		} else if (i === 14) {
			uuid += '4';
		} else {
			const randomValue = Math.random() * 16 | 0;
			const value = (i === 19) ? (randomValue & 0x3 | 0x8) : randomValue;
			uuid += hexValues[value];
		}
	}

	return uuid;
}

export const allowDigitInput = (event: KeyboardEvent) => {
	const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight']
	const key = event.key
	const digitPattern = /^[0-9]$/

	if (!digitPattern.test(key) && !allowedKeys.includes(key)) {
		event.preventDefault();
	} else if (['Backspace', 'Delete'].includes(key)) {
		(event.target as HTMLInputElement).value = ''
	}
}

export const isString = (value: any) => typeof value === 'string'
export const isFunction = (value: any) => typeof value === 'function'

export const validatorIncludes = (value: string, enumClass: any) => Object.values(enumClass).includes(value)

export const reduceIvalidValue = (obj: { [key: string]: any }, excludeProps?: Array<String>) => {
	// const f1 = (key: string, value: any) => {
	//     return value ? true : false
	// }
	// const f2 = (key: string, value: any) => {
	//     return value && !excludeProps!.includes(key) ? true : false
	// }
	// const check = (excludeProps && excludeProps.length > 0)? f2: f1
	const check = (excludeProps && excludeProps.length > 0) ? ((key: string, value: any) => {
		return value && !excludeProps!.includes(key) ? true : false
	}) : ((key: string, value: any) => {
		return value ? true : false
	})

	return Object.entries(obj).reduce((acc: any, [key, value]) => {
		if (check(key, value)) {
			acc[key] = value;
		}
		return acc;
	}, {});
}

export const flattenData = (obj: Record<string, any>, option: { parentPropName: string | null, connectionString: string } = { parentPropName: null, connectionString: "." }) => {
	const { parentPropName, connectionString } = option;
	const res: Record<string, any> = {};

	for (const [key, value] of Object.entries(obj)) {
		const propName = parentPropName ? `${parentPropName}${connectionString}${key}` : key

		if (Array.isArray(value)) {
			value.forEach((item, index) => {
				const subPropName = `${propName}[${index}]`
				if (Array.isArray(item) || (typeof item === "object" && item !== null)) {
					const newRes = flattenData(item, { parentPropName: subPropName, connectionString });
					Object.assign(res, newRes);
				} else {
					res[subPropName] = item;
				}
			})
		} else if (value instanceof Date) {
			res[propName] = value
		} else if (typeof value === "object" && value !== null) {
			const newRes = flattenData(value, { parentPropName: propName, connectionString })
			Object.assign(res, newRes)
		} else {
			res[propName] = value
		}
	}

	return res
};

export const getMax = (arr: number[]): number => {
	if (arr.length === 0) {
		throw new Error("Array is empty.");
	}

	let max = arr[0];
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] > max) {
			max = arr[i];
		}
	}
	return max;
}

// const isEnumType = (obj: any): boolean => {
//     return obj instanceof Object &&
//         Object.values(obj).every((val) => typeof val === 'string' || typeof val === 'number');
// } // function never work

const isPrimitiveType = (obj: any) => !(obj instanceof Object)

export const flattenDataV2 = (obj: Record<string, any>, option: { parentPropName: string | null, connectionString: string, formatDate: string } = { parentPropName: null, connectionString: ".", formatDate: 'yyyy-MM-dd' }) => {
	const { parentPropName, connectionString } = option;
	const res: Record<string, any> = {};

	for (const [key, value] of Object.entries(obj)) {
		const propName = parentPropName ? `${parentPropName}${connectionString}${key}` : key

		if (value) {
			if (isPrimitiveType(value)) {
				res[propName] = value
			} else if (value instanceof Date) {
				res[propName] = dateToString(value, option.formatDate)
			} else if (Array.isArray(value)) {
				value.forEach((item, index) => {
					const subPropName = `${propName}[${index}]`
					const obj_: Record<string, any> = {}
					obj_[subPropName] = item
					Object.assign(res, flattenDataV2(obj_));
				})
			} else {
				Object.assign(res, flattenDataV2(value, { parentPropName: propName, connectionString, formatDate: option.formatDate }));
			}
		}
	}
	return res
}

export interface CurrencyDetail {
	symbol: string; precision: number;
}

const CURRENCY_DETAILS: { [index: string]: CurrencyDetail } = {
	'USD': { symbol: '$', precision: 2 },
	'EUR': { symbol: '€', precision: 2 },
	'GBP': { symbol: '£', precision: 2 },
	'JPY': { symbol: '¥', precision: 0 }
}


export const getCurrencyDetail = (currencyCode: string): CurrencyDetail => {
	const sb = CURRENCY_DETAILS[currencyCode]
	return sb ? sb : { symbol: currencyCode, precision: 2 }
}

export const getCurrencySymbol = (currencyCode: string) => getCurrencyDetail(currencyCode).symbol
export const getCurrencyPrecision = (currencyCode: string) => getCurrencyDetail(currencyCode).precision
export const numberFormat = (nb: number, fractionDigits: number, locale: string) => new Intl.NumberFormat(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(nb)

export const amountFormat = (nb: number, currency: string, locale: string) => {
	if (!currency)
		return ''

	const rs = nb.toLocaleString(locale, {
		style: 'currency',
		currency: currency,
		useGrouping: true
	})
	return (locale === 'fr' && currency === 'USD') ? rs.replace('$US', '$') : rs
}

export const setCookie = (name: string, value: string, days: number) => {
	const expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + days);
	const cookieValue = encodeURIComponent(value) + '; expires=' + expirationDate.toUTCString();
	document.cookie = name + '=' + cookieValue;
}

export const setCookieWithPath = (name: string, value: string, days: number, path: string) => {
	const expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + days);
	const cookieValue = encodeURIComponent(value) + '; expires=' + expirationDate.toUTCString() + '; path=' + path;
	document.cookie = name + '=' + cookieValue;
}

export const getCookie = (cookieName: string) => {
	const name = cookieName + "=";
	const decodedCookie = decodeURIComponent(document.cookie);
	const cookieArray = decodedCookie.split(';');

	for (let i = 0; i < cookieArray.length; i++) {
		let cookie = cookieArray[i];
		while (cookie.charAt(0) === ' ') {
			cookie = cookie.substring(1);
		}
		if (cookie.indexOf(name) === 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}
	return null;
}

export const ctxDataCookie = (ctxName: string): CtxData | null => {
	const strData = getCookie(ctxName)
	if (!strData) {
		return null
	}

	const data = decryptAesHexToken(strData)
	console.log({ data });
	if (data === 'Invalid token') {
		console.log('data = Invalid token');
		return null
	}

	return JSON.parse(data)
}

export interface SelectItem {
	title: string;
	value: string | number | boolean
	disabled?: boolean
}

export const passengerPaxFareDetail = (bookingInfoPassengers: Passenger[], bookingInfoJourneys: Journey[], passengerIndex: number, currencyCode: string): any => {
	const passenger = (): Passenger | undefined => bookingInfoPassengers.find((p: Passenger) => p.paxIndex === passengerIndex);
	
	const paxFareDetail = { currency: currencyCode || 'USD', fare: 0.0, taxes: 0.0, yq: 0.0, discount: 0.0, total: 0.0 }
	bookingInfoJourneys.forEach(jn => {
		jn.fares.forEach(fareSmg => {
			const paxFare = fareSmg.passengerFares.find(f => f.passengerType == passenger()!.passengerType)
			if (paxFare) {
				paxFareDetail.fare += paxFare.fares
				paxFareDetail.taxes += paxFare.taxes
				paxFareDetail.yq += paxFare.yqTaxes
				paxFareDetail.discount += paxFare.discount
				paxFareDetail.total += paxFare.total
			}
		});
	})
	// INF fees
	if (passenger()!.passengerFees && passenger()!.passengerFees.length > 0) {
		passenger()!.passengerFees.forEach(paxFee => {
			paxFee.serviceCharges.forEach(sc => {
				paxFareDetail.taxes += sc.amount
				paxFareDetail.total += sc.amount
			})
		})
	}
	return {passenger: passenger(), fareDetail: paxFareDetail};
}

export const togglePopup = (show: any) => {
	show.value = !show.value;
	if(show.value){
		const body = document.getElementsByTagName('body')[0]
		body!.classList.add('dw-body-popup');
	}
	else {
		const body = document.getElementsByTagName('body')[0]
		body!.classList.remove('dw-body-popup');
	}
}

// export interface IJsonResponse {
// 	data: string;
// 	messages: string;
// 	errors: ErrorResponse;
// }

// export interface ErrorResponse {
// 	rawMessage: string;
// }