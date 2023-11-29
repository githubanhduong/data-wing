import { getSearchData } from "@/api/services"
import { StatusRes } from "@/api/type"
import { SeStep, type IbeData, type AvailData } from "@/common/custom-type"
import type { PaymentModel, PmAncv, PmCash, PmCreditCard } from "@/common/datawings-payment"
import type { ContactInfo, Passenger, PassengerType } from "@/common/datawings-xsd"
import { stringToDate } from "@/common/dw-luxon"
import router, { RouterName } from "@/router"
import { useAvailState } from "@/stores/availData"
import { useSeDataState } from "@/stores/engine"
import {totalPaxFareDetailCalculator2} from '@/common/availabilityResultUtils';

export const ibeSessionData = (seStep: SeStep) => {
	const seStore = useSeDataState()
	const availStore = useAvailState()
	seStore.setStep(seStep)

	if (!seStore.seData.seForm.fromCode || seStep == SeStep.PAYMENT) {
		getSearchData(seStore.seData.dataKey)
			.then(res => {
				if (res.status === StatusRes.SUCCESS) {
					seStore.seData.seForm = { ...res.data.seForm }
					// seStore.seData.seForm.fromCode = res.data.seForm.fromCode
					// seStore.seData.seForm.bookingType = res.data.seForm.bookingType
					// seStore.seData.seForm.bookingClass = res.data.seForm.bookingClass
					// seStore.seData.seForm.departDate = res.data.seForm.departDate
					// seStore.seData.seForm.retourDate = res.data.seForm.retourDate
					// seStore.seData.seForm.nbAdt = res.data.seForm.nbAdt
					// seStore.seData.seForm.nbChd = res.data.seForm.nbChd
					// seStore.seData.seForm.nbInf = res.data.seForm.nbInf
					// seStore.seData.seForm.toCode = res.data.seForm.toCode

					availStore.data.availabilityData = res.data.availabilityData
					availStore.data.flightFareKeySelections = res.data.flightFareKeySelections
					availStore.data.passengerData = res.data.passengerData
					availStore.data.paxPricingInfos = res.data.paxPricingInfos
					// availStore.data.pmModel = undefined

					if (res.data.booking) {
						availStore.data.booking = res.data.booking
					}
					if (res.data.ibeBooking) {
						availStore.data.ibeBooking = res.data.ibeBooking
					}
					if (seStep === SeStep.PASSENGER) {
						initPassenger()
					} else if (seStep === SeStep.PAYMENT) {
						availStore.data.pmModel = initPmModel(availStore.data);
						availStore.data.pmModel!.paymentDate = new Date();
					}
				}

				//validateData
				if (!availStore.data.availabilityData) {
					if (seStep >= SeStep.DEPART)
						console.log('invalid availabilityData -> redirect to home');
					router.push({ name: RouterName.IbeHome })
				}
			})
	} else if (seStep === SeStep.DEPART) {
		console.log('DEPART - no run');

	} else if (seStep === SeStep.PASSENGER) {
		initPassenger()
	}

	availStore.data.errorServer = {code: '', path: '', rawMessage: ''}
}

export const postDataBack = (dataRS: IbeData, seStep: SeStep) => {
	const seStore = useSeDataState()
	const availStore = useAvailState()
	console.log({ seStore, dataRS });

	seStore.seData.seForm = { ...dataRS.seForm }

	console.log(seStore.seData.seForm);

	availStore.data.availabilityData = dataRS.availabilityData
	availStore.data.flightFareKeySelections = dataRS.flightFareKeySelections
	if (seStep !== SeStep.PASSENGER) {
		availStore.data.passengerData = dataRS.passengerData
	}
	availStore.data.paxPricingInfos = dataRS.paxPricingInfos
}

export const postDataBackSlick = (depart: string, date: Date, dataRS: IbeData, seStep: SeStep) => {
	const seStore = useSeDataState()
	const availStore = useAvailState()
	console.log({ seStore, dataRS });

	depart === "depart" ? dataRS.seForm.departDate = date : dataRS.seForm.retourDate = date
	seStore.seData.seForm = { ...dataRS.seForm }

	console.log(seStore.seData.seForm);

	availStore.data.availabilityData = dataRS.availabilityData
	availStore.data.flightFareKeySelections = dataRS.flightFareKeySelections?.length != 0 || depart === "depart" ? dataRS.flightFareKeySelections : availStore.data.flightFareKeySelections
	if (seStep !== SeStep.PASSENGER) {
		availStore.data.passengerData = dataRS.passengerData
	}
	availStore.data.paxPricingInfos = dataRS.paxPricingInfos
}

const initPmModel = (availData: AvailData): PaymentModel => {
	const pmModel:PaymentModel = {
		length: availData.ibeBooking?.passengers.length??0,
		serviceFees: {},
		listPayments: [],
		amountValid: false,
		otherCharges: 0,
		vat: 0
	}

	let index = 0
	availData.ibeBooking?.passengers.forEach(pax => {
		pmModel.serviceFees[`pax${index++}`] = {paxIndex: pax.paxIndex, ... pax.aviahubServiceFee}
	})

	// pmModel.listPayments.push({ paymentType: 'CASH', currency: availData.ibeBooking?.currencyCode||'USD', amount: 0, reference: '' } as PmCash)

	const totalPaxFareDetail = totalPaxFareDetailCalculator2(availData.ibeBooking!, pmModel)
	applyForOnePayment(pmModel, totalPaxFareDetail.total, totalPaxFareDetail.currency)
	pmModel.vat = 0
	return pmModel
}

const applyForOnePayment = (pmModel: PaymentModel, amt: number, currency: string) => {
	if (pmModel.listPayments.length == 1) {
		const pm = pmModel.listPayments[0]
		pm.amount = Number(amt.toFixed(2))
		pm.currency = currency
		if (pm.paymentType === 'CREDIT_CARD') {
			const pm_ = pm as PmCreditCard
			pm_.feeCC = Number((pm_.amount * 3 / 100).toFixed(2))
			pm_.total = pm_.amount + pm_.feeCC
		} else if (pm.paymentType === 'ANCV') {
			const pm_ = pm as PmAncv
			pm_.feeCC = Number((pm_.amount * 4 / 100).toFixed(2))
			pm_.total = pm_.amount + pm_.feeCC
		}
	}
}

const initPassenger = () => {
	const seStore = useSeDataState()
	const availStore = useAvailState()

	if (!availStore.data.passengerData) {
		console.log('availStore.data.passengerData is null');
		const passengers: Passenger[] = []
		const contactInfo: ContactInfo = {} as ContactInfo
		contactInstance(contactInfo)

		for (let i = 0; i < seStore.seData.seForm.nbAdt; i++) {
			passengers.push(paxInstance("ADT", ''))
		}
		for (let i = 0; i < seStore.seData.seForm.nbChd; i++) {
			passengers.push(paxInstance("CHD", 'CHD'))
		}
		for (let i = 0; i < seStore.seData.seForm.nbInf; i++) {
			passengers.push(paxInstance("INF", 'INF'))
		}
		availStore.data.passengerData = { passengers, contactInfo }

	} else {
		console.log('availStore.data.passengerData is not null');

		const mode = router.currentRoute.value.query.mode
		console.log({ queryMode: mode });
		availStore.data.passengerData.passengers.forEach(p => mode === 'QA' ? demo.paxInit(p) : paxInit(p))
		if (!availStore.data.passengerData.contactInfo) {
			availStore.data.passengerData.contactInfo = {} as ContactInfo
		}
		if (mode === 'QA') {
			demo.contactInstance(availStore.data.passengerData.contactInfo)
		} else {
			contactInstance(availStore.data.passengerData.contactInfo)
		}
	}
}

const paxInstance = (passengerType: PassengerType, title: string): any => {
	return {
		passengerType, title,
		firstName: undefined,
		lastName: undefined,
		dateOfBirth: undefined,
		nationality: undefined,
		identityType: undefined,
		identityNumber: undefined,
		idExpirationDate: undefined
	}
}
const setValueIfNotExist = (obj: any, key: string, val: any) => {
	if (!Object.prototype.hasOwnProperty.call(obj, key)) {
		obj[key] = val;
	}
}

const setValueIfNotExistOrEmpty = (obj: any, key: string, val: any) => {
	const check = Object.prototype.hasOwnProperty.call(obj, key)
	if (!check) {
		obj[key] = val
	} else {
		if (!obj[key]) {
			obj[key] = val
		}
	}
}

const paxInit = (pax: any): void => {
	setValueIfNotExist(pax, "firstName", undefined)
	setValueIfNotExist(pax, "lastName", undefined)
	setValueIfNotExist(pax, "middleName", undefined)
	setValueIfNotExist(pax, "dateOfBirth", undefined)
	setValueIfNotExist(pax, "nationality", undefined)
	setValueIfNotExist(pax, "identityType", undefined)
	setValueIfNotExist(pax, "identityNumber", undefined)
	setValueIfNotExist(pax, "idExpirationDate", undefined)
	// pax.firstName = undefined
	// pax.lastName = undefined
	// pax.middleName = undefined
	// pax.dateOfBirth = undefined
	// pax.nationality = undefined
	// pax.identityType = undefined
	// pax.identityNumber = undefined
	// pax.idExpirationDate = undefined
}

// const paxInstance = (passengerType: PassengerType, title: string): Passenger => {
// 	return {
// 		passengerType, title,
// 		gender: '',
// 		firstName: '',
// 		lastName: '',
// 		middleName: '',
// 		dateOfBirth: undefined,
// 		nationality: '',
// 		identityType: '',
// 		identityNumber: '',
// 		idExpirationDate: undefined
// 	}
// }
const contactInstance = (ct: any): void => {
	setValueIfNotExist(ct, "phoneCountryCode", undefined)
	setValueIfNotExist(ct, "phoneNumber", undefined)
	setValueIfNotExist(ct, "email", undefined)
	setValueIfNotExist(ct, "emailConfirm", undefined)
	// ({ phoneCountryCode: undefined, phoneNumber: undefined, email: undefined, emailConfirm: undefined })
}

const demo = {
	paxInit: (pax: any): void => {
		if (Object.keys(pax).length > 2)
			return;

		if (pax.passengerType === 'ADT') {
			setValueIfNotExistOrEmpty(pax, "title", 'MR')
			setValueIfNotExistOrEmpty(pax, "firstName", 'Linh')
			setValueIfNotExistOrEmpty(pax, "lastName", 'Doan')
			setValueIfNotExistOrEmpty(pax, "middleName", undefined)
			setValueIfNotExistOrEmpty(pax, "dateOfBirth", stringToDate('1987-01-01', 'yyyy-MM-dd'))
			setValueIfNotExistOrEmpty(pax, "nationality", 'VN')
			setValueIfNotExistOrEmpty(pax, "identityType", 'PP')
			setValueIfNotExistOrEmpty(pax, "identityNumber", 'V1111111')
			setValueIfNotExistOrEmpty(pax, "idExpirationDate", stringToDate('2027-01-01', 'yyyy-MM-dd'))

			// pax.title = 'MR'
			// pax.firstName = 'Linh'
			// pax.lastName = 'Doan'
			// pax.middleName = undefined
			// pax.dateOfBirth = stringToDate('1987-01-01', 'yyyy-MM-dd')
			// pax.nationality = 'VN'
			// pax.identityType = 'PP'
			// pax.identityNumber = 'V1111111'
			// pax.idExpirationDate = stringToDate('2027-01-01', 'yyyy-MM-dd')
		} else if (pax.passengerType === 'CHD') {
			// setValueIfNotExistOrEmpty(pax, "title", 'MR')
			setValueIfNotExistOrEmpty(pax, "firstName", 'Huy')
			setValueIfNotExistOrEmpty(pax, "lastName", 'Doan')
			setValueIfNotExistOrEmpty(pax, "middleName", undefined)
			setValueIfNotExistOrEmpty(pax, "dateOfBirth", stringToDate('2019-01-01', 'yyyy-MM-dd'))
			setValueIfNotExistOrEmpty(pax, "nationality", 'VN')
			setValueIfNotExistOrEmpty(pax, "identityType", 'PP')
			setValueIfNotExistOrEmpty(pax, "identityNumber", 'V2222222')
			setValueIfNotExistOrEmpty(pax, "idExpirationDate", stringToDate('2030-01-01', 'yyyy-MM-dd'))

			// pax.firstName = 'Huy'
			// pax.lastName = 'Doan'
			// pax.middleName = undefined
			// pax.dateOfBirth = stringToDate('2019-01-01', 'yyyy-MM-dd')
			// pax.nationality = 'VN'
			// pax.identityType = 'PP'
			// pax.identityNumber = 'V2222222'
			// pax.idExpirationDate = stringToDate('2030-01-01', 'yyyy-MM-dd')
		} else {
			setValueIfNotExistOrEmpty(pax, "firstName", 'Hung')
			setValueIfNotExistOrEmpty(pax, "lastName", 'Doan')
			setValueIfNotExistOrEmpty(pax, "middleName", undefined)
			setValueIfNotExistOrEmpty(pax, "dateOfBirth", stringToDate('2022-01-01', 'yyyy-MM-dd'))
			setValueIfNotExistOrEmpty(pax, "nationality", 'VN')
			setValueIfNotExistOrEmpty(pax, "identityType", 'PP')
			setValueIfNotExistOrEmpty(pax, "identityNumber", 'V3333333')
			setValueIfNotExistOrEmpty(pax, "idExpirationDate", stringToDate('2030-01-01', 'yyyy-MM-dd'))

			// pax.firstName = 'Hung'
			// pax.lastName = 'Doan'
			// pax.middleName = undefined
			// pax.dateOfBirth = stringToDate('2022-01-01', 'yyyy-MM-dd')
			// pax.nationality = 'VN'
			// pax.identityType = 'PP'
			// pax.identityNumber = 'V3333333'
			// pax.idExpirationDate = stringToDate('2030-01-01', 'yyyy-MM-dd')
		}
	},
	contactInstance: (ct: any): void => {
		if (Object.keys(ct).length > 0) {
			return;
		}
		setValueIfNotExistOrEmpty(ct, "phoneCountryCode", '84')
		setValueIfNotExistOrEmpty(ct, "phoneNumber", '0909100247')
		setValueIfNotExistOrEmpty(ct, "email", 'ld.247@outlook.com')
		setValueIfNotExistOrEmpty(ct, "emailConfirm", 'ld.247@outlook.com')
		// ({ phoneCountryCode: '84', phoneNumber: '0909100247', email: 'ld.247@outlook.com', emailConfirm: 'ld.247@outlook.com' })
	}
}

// passengerType: PassengerType;
// gender: string;
// title: string;
// firstName: string;
// lastName: string;
// middleName: string;
// dateOfBirth?: Date;
// nationality: string;
// identityType: string;
// identityNumber: string;
// idExpirationDate?: Date;