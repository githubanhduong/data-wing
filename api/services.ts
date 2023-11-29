
import type { CityPair, ICsrfToken, IbeData, SeForm } from '@/common/custom-type';
import http from './axiosApi'
import type { DataResponse } from './type'
import { decryptAesHexToken } from '@/common/token/aes';
import { flattenDataV2 } from '@/common/commons';
import { CsrfToken } from '@/common/token/CsrfToken';
import type { PassengerData } from '@/common/datawings-xsd';
import ctxData from '@/common/ctx-data';
import { dateToString } from '@/common/dw-luxon';
import type { AviahubServiceFeeX, PaymentModel } from '@/common/datawings-payment';
import type { IbeBooking } from '@/common/datawings-ibe';

// const apiMode = import.meta.env.VITE_API_MODE
// const baseURL = import.meta.env.VITE_BASE_API_URL_LC || import.meta.env.VITE_BASE_API_URL
// const loginURL = `${baseURL.endsWith('/')? baseURL.substring(0, baseURL.length - 1) : baseURL}${import.meta.env.VITE_LOGIN_PATH}`

const baseUrlFromSecure = (currentHref: string) => {
	let url = currentHref.split('/secure')[0]
	if (url.endsWith('/')) {
		url = url.substring(0, url.length - 1)
	}
	console.log(url)
	return url
}

// const loginUrl = (currentHref: string) => {
// 	const base_ = baseUrlFromSecure(currentHref)
// 	return `${base_}${import.meta.env.VITE_LOGIN_PATH}`
// }



let csrfHolder: CsrfToken | null = null

export const changeLanguage = (locale: string, csrf: CsrfToken): Promise<DataResponse<string>> => {
	const data = new URLSearchParams()
	data.append('locale', locale)
	if (csrf) {
		data.append(csrf.name, csrf.token)
	}
	console.log({ data })
	return http.post("/secure/changelocale.json", data, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
}

// const loadCityPair = async () => {
// 	const citypair = await import(/* webpackChunkName: "/market-list" */ './market_list.json')
// 	return citypair.default
// }

// export const getMarketList = (): Promise<Array<CityPair>> => apiMode === 'PROD' ? http.get("/secure/data/market-list.json").catch((error) => {
//     console.log(error.toJSON());
//     return [] as any;
// }) : loadCityPair();

export const getMarketList = (): Promise<Array<CityPair>> => http.get("/secure/data/market-list.json").catch((error) => {
	console.log(error.toJSON());
	return [] as any;
})

export const getCsrf = () => {
	if (!csrfHolder || csrfHolder.isValidTime()) { // prod -> if (!csrfHolder || csrfHolder.isValidTime()) 
		const rs: Promise<string> = http.get('/secure/data/xtoken.json')
		rs.catch(() => {
			// console.log({err})
			// const url = window.location.href 
			const loginUrl = `${ctxData?.basePath || import.meta.env.VITE_BASE_API_URL}${import.meta.env.VITE_LOGIN_PATH}`

			const callBackUrl = `${baseUrlFromSecure(window.location.href)}/secure/ibe/home`
			window.location.href = `${loginUrl}?callback=${callBackUrl}`
			// return new Promise<boolean>((resolve) => {
			//     resolve(false);
			// });
			return null;
		})
		return rs.then((token) => {
			const data: ICsrfToken = JSON.parse(decryptAesHexToken(token))
			csrfHolder = new CsrfToken(data.name, data.token, new Date())
			return true;
		})
	} else {
		return new Promise<boolean>((resolve /*, reject */) => {
			resolve(true);
		});
	}
	// const rs: Promise<string> = http.get('/secure/data/xtoken.json')
	// return rs.then((token) => {
	//     const data: ICsrfToken = JSON.parse(decryptAesHexToken(token))
	//     csrfHolder = new CsrfToken(data.name, data.token)
	//     return true;
	// })
}

export const getSearchData = (searchId: string | null) => {
	const url = searchId ? `/secure/data/ibe/${searchId}/searchData.json` : `/secure/data/ibe/searchData.json`
	return getCsrf().then(() => {
		return http.post<any, DataResponse<IbeData>>(url, csrfHolder ? csrfHolder.setCsrf({}) : {}, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
			.then((data) => {
				console.log({ searchData: data })
				return data;
			})
	})
}

export const getBookingInfo = (bookingId: number) => {
	const url = `/secure/data/ibe/booking/${bookingId}/bookingInfo.json`
	return getCsrf().then(() => {
		return http.post<any, IbeBooking>(url, csrfHolder ? csrfHolder.setCsrf({}) : {}, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
			.then((data) => {
				console.log({ searchData: data })
				return data;
			})
	})
}

export const ibeFlightSearch = (seBean: SeForm, searchId: string | null) => {
	const mainTask = () => {
		const url = searchId ? `/secure/data/ibe/${searchId}/search.json` : `/secure/data/ibe/search.json`

		console.log({ 'post': seBean })
		const postData = flattenDataV2(seBean)
		// postData.bookingClass = BookingClass[postData.bookingClass]
		// postData.bookingType = BookingType[postData.bookingType]
		//seBean.retourDate ? BookingType[BookingType.ROUNDTRIP] : BookingType[BookingType.ONEWAY]
		console.log({ postData })

		csrfHolder?.setCsrf(postData)
		const rs: Promise<DataResponse<IbeData>> = http.post(url, postData, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
		rs.then((res) => {
			console.log({ res })
			// getSearchData(searchId)
		})
		return rs;
	}

	return getCsrf().then(mainTask)

	// if (csrfHolder) {
	//     return mainTask()
	// } else {
	//     return getCsrf().then(mainTask)
	// }
}
export const ibeFlightSearchSlick = (depart: string, date: Date, seBean: SeForm, searchId: string | null) => {
	const mainTask = () => {
		const url = searchId ? `/secure/data/ibe/${searchId}/search.json` : `/secure/data/ibe/search.json`

		console.log({ 'post': seBean })
		const postData = flattenDataV2(seBean)
		depart === "depart" ? seBean.departDate = date : seBean.retourDate = date
		console.log({ postData })

		csrfHolder?.setCsrf(postData)
		const rs: Promise<DataResponse<IbeData>> = http.post(url, postData, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
		rs.then((res) => {
			console.log({ res })
		})
		return rs;
	}

	return getCsrf().then(mainTask)
}
export const ibeDepartSelection = (flightDate: Date, journeyKey: string, fareKey: string, searchId: string | null) => {
	const mainTask = () => {
		const url = searchId ? `/secure/data/ibe/${searchId}/departFlightSelection.json` : `/secure/data/ibe/departFlightSelection.json`
		const headers = csrfHolder?.headerWithCsrf({})
		const rs: Promise<DataResponse<IbeData>> = http.post(url, { flightDate: dateToString(flightDate, 'yyyy-MM-dd'), journeyKey, fareKey }, { headers })
		return rs
	}
	return getCsrf().then(mainTask)
}

export const ibeReturnSelection = (flightDate: Date, journeyKey: string, fareKey: string, searchId: string | null) => {
	const mainTask = () => {
		const url = searchId ? `/secure/data/ibe/${searchId}/returnFlightSelection.json` : `/secure/data/ibe/returnFlightSelection.json`
		const headers = csrfHolder?.headerWithCsrf({})
		const rs: Promise<DataResponse<IbeData>> = http.post(url, { flightDate: dateToString(flightDate, 'yyyy-MM-dd'), journeyKey, fareKey }, { headers })
		return rs
	}
	return getCsrf().then(mainTask)
}

export const ibePostPassenger = (passengerData: PassengerData, searchId: string | null) => {
	console.log({ postData: passengerData });

	const mainTask = () => {
		const url = searchId ? `/secure/data/ibe/${searchId}/passenger.json` : `/secure/data/ibe/passenger.json`
		const postData = flattenDataV2(passengerData)
		csrfHolder?.setCsrf(postData)
		console.log({ postData_Flat: postData });
		const rs: Promise<DataResponse<IbeData>> = http.post(url, postData, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
		return rs

	}
	return getCsrf().then(mainTask)
}

export const ibePostpaymnetDetailAndFinish = (pmModel: PaymentModel, searchId: string | null) => {
	const mainTask = () => {
		const url = searchId ? `/secure/data/ibe/${searchId}/paymnetDetail.json` : `/secure/data/ibe/paymnetDetail.json`
		const data = {
			length: pmModel.length,
			serviceFees: [] as AviahubServiceFeeX[],
			listPayments: pmModel.listPayments,
			amountValid: pmModel.amountValid,
			remark: pmModel.remark,
			customerRemark: pmModel.customerRemark,
			invoiceDate: pmModel.invoiceDate,
			paymentDate: pmModel.paymentDate,
			otherCharges: pmModel.otherCharges,
			vat: pmModel.vat,
			vatAmount: pmModel.vatAmount,
		}
		for (const val of Object.values(pmModel.serviceFees)) {
			data.serviceFees[data.serviceFees.length] = {
				paxIndex: val.paxIndex,
				serviceFee: val.serviceFee,
				adjustment: val.adjustment,
				currencyCode: val.currencyCode
			}
		}

		const postData = flattenDataV2(data)
		csrfHolder?.setCsrf(postData)
		console.log({ postData_Flat: postData });
		const rs: Promise<DataResponse<IbeData>> = http.post(url, postData, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
		return rs
	}
	return getCsrf().then(mainTask)
}