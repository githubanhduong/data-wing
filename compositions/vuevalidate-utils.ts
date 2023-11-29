/*
*
*	Data validate must be reactive ***
*
*/

import { BookingType, type AvailData, type SeData } from "@/common/custom-type";
import { required, helpers, minLength, maxLength, email, alpha } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
import type { ContactInfo, Passenger, PassengerData } from "@/common/datawings-xsd";
import { currentDate } from "@/common/dw-luxon";
import { isValidStringRegex, replaceRegex } from "@/common/commons";
import type { PaymentModel } from "@/common/datawings-payment";
import { computed } from "vue";

const millisecondsInYear = 1000 * 60 * 60 * 24 * 365; // Approximation for a year
const millisecondsInMonth = 1000 * 60 * 60 * 24 * 30; // Approximation for a month

// const paymentValidators: any = {
// 	'PmCash': {
// 		amount: basePaymentValidator.amount,
// 		reference: basePaymentValidator.reference
// 	},
// 	'PmCreditCard': {
// 		amount: basePaymentValidator.amount,
// 		cardType: basePaymentValidator.cardType,
// 		holderName: basePaymentValidator.holderName,
// 		reference: basePaymentValidator.reference,
// 		feeCC: basePaymentValidator.feeCC,
// 	},
// 	'PmAviaCollect': {
// 		amount: basePaymentValidator.amount,
// 		cardType: basePaymentValidator.cardType,
// 		reference: basePaymentValidator.reference,
// 	},
// 	'PmBankTransfer': {
// 		amount: basePaymentValidator.amount,
// 		reference: basePaymentValidator.reference
// 	},
// 	'PmAncv': {
// 		amount: basePaymentValidator.amount,
// 		feeCC: basePaymentValidator.ancvFeeCC,
// 		quantity: basePaymentValidator.quantity,
// 		reference: basePaymentValidator.reference,
// 	},
// 	'PmInvoice': {
// 		amount: basePaymentValidator.amount,
// 		reference: basePaymentValidator.reference
// 	},
// 	'PmOther': {
// 		amount: basePaymentValidator.amount,
// 		reference: basePaymentValidator.reference
// 	},
// }

const isNumber = (val_: number | string) => {
	return !isNaN(Number(val_))
}

const greaterThanZero = (val_: number | string) => {
	if (!isNaN(Number(val_)))
		return Number(val_) > 0
	return true
}

const latinCheck = helpers.regex(/^[a-zA-Z\s]+$/);

export const validPaymentModel = (availData: AvailData) => {
	console.log({ pmModel: availData.pmModel });

	const pmModelValid = computed(() => {
		const basePaymentValidator = {
			amount: {
				required: helpers.withMessage('se.validator.mandatory.payment.amount', required),
				numeric: helpers.withMessage('se.validator.invalid.payment.amount', isNumber),
				greaterThanZero: helpers.withMessage('se.validator.negative.payment.amount', greaterThanZero),
				amountSumEq: helpers.withMessage('se.validator.invalid.payment.amountValid', (val_: number | string) => !!val_.toString && greaterThanZero(val_)? availData.pmModel!.amountValid : true)
			},
			reference: {
				required: helpers.withMessage('se.validator.mandatory.payment.reference', required)
			},
			cardType: {
				required: helpers.withMessage('se.validator.mandatory.payment.cardType', (val_: string, obj: any) => {
					if (obj.paymentType === 'CREDIT_CARD' || obj.paymentType === 'AVIACOLLECT')
						return !!val_
					return true;
				})
			},
			holderName: {
				required: helpers.withMessage('se.validator.mandatory.payment.holderName', (val_: string, obj: any) => {
					if (obj.paymentType === 'CREDIT_CARD')
						return !!val_
					return true;
				})
			},
			// ancvFeeCC: {
			// 	numeric:  helpers.withMessage('se.validator.invalid.negative.feeCC', (val_: number | string, obj: any) => {
			// 		if (obj.paymentType === 'ANCV')
			// 			return !isNaN(Number(val_))
			// 		return true
			// 	}),
			// 	minValue: helpers.withMessage('e.validator.invalid.negative.feeCC', (val_: number | string, obj: any) => {
			// 		if (obj.paymentType === 'ANCV')
			// 			return Number(val_) >= 0
			// 		return true
			// 	})
			// },
			feeCC: {
				numeric: helpers.withMessage('se.validator.invalid.payment.feeCC', (val_: number | string, obj: any) => {
					if (obj.paymentType === 'CREDIT_CARD' || obj.paymentType === 'ANCV')
						return !isNaN(Number(val_))
					return true
				}),
				minValue: helpers.withMessage('se.validator.negative.payment.feeCC', (val_: number | string, obj: any) => {
					if (!isNaN(Number(val_)) && (obj.paymentType === 'CREDIT_CARD' || obj.paymentType === 'ANCV'))
						return Number(val_) >= 0
					return true
				})
			},
			quantity: {
				required: helpers.withMessage('se.validator.mandatory.payment.quantity', (val_: string | number, obj: any) => {
					if (obj.paymentType === 'ANCV')
						return !!val_ || val_ == 0
					return true;
				}),
				numeric: helpers.withMessage('se.validator.invalid.payment.quantity', (val_: number | string, obj: any) => {
					if (obj.paymentType === 'ANCV')
						return !isNaN(Number(val_))
					return true
				}),
				greaterThanZero: helpers.withMessage('se.validator.negative.payment.quantity', (val_: number | string, obj: any) => {
					if (!isNaN(Number(val_)) && obj.paymentType === 'ANCV')
						return Number(val_) > 0
					return true

				})
			},
		}

		const validator: { [rule: string]: any } = {}
		const serviceFees: { [rule: string]: any } = {}
		if (availData.pmModel) {
			Object.keys(availData.pmModel.serviceFees).forEach(sc => {
				serviceFees[sc] = {
					serviceFee: {
						nullValue: helpers.withMessage('se.validator.invalid.number.serviceFee', (val_: number | string) => {
							return !isNaN(Number(val_))
						})
					},
					adjustment: {
						nullValue: helpers.withMessage('se.validator.invalid.number.adjustment', (val_: number | string) => !isNaN(Number(val_)))
					}
				}
			})
		}
		// validator['amountValid'] = {
		// 	amountEqualGrandTotal: helpers.withMessage('se.validator.invalid.payment.amountValid', (val_: boolean) => {
		// 		return val_
		// 	})
		// }

		validator['serviceFees'] = serviceFees
		validator['paymentDate'] = {
			required: helpers.withMessage('se.validator.mandatory.payment.paymentDate', required),
		}
		validator['invoiceDate'] = {
			required: helpers.withMessage('se.validator.mandatory.payment.invoiceDate', required)
		}
		validator['listPayments'] = {
			minLength: helpers.withMessage('se.validator.listPayments.empty', (val_: Array<any>) => val_.length > 0),
			$each: helpers.forEach(basePaymentValidator)
		}
		return { pmModel: validator };
	})

	return useVuelidate(pmModelValid, availData as { pmModel: PaymentModel })
}

export const paxFormValidator = (availData: AvailData) => {
	const paxDataValidator = {
		passengers: {
			required,
			minLength: minLength(1),
			$each: helpers.forEach({
				passengerType: { required },
				gender: { required },
				title: { required: helpers.withMessage('se.validator.mandatory.passenger.title', required) },
				firstName: {
					required: helpers.withMessage('se.validator.mandatory.passenger.firstName', required),
					characterLatin: helpers.withMessage('se.validator.mandatory.passenger.specialCharacter', latinCheck),
					minLength: helpers.withMessage('se.validator.minLength.passenger.firstName', minLength(2)),
					maxLength: helpers.withMessage('se.validator.maxLength.passenger.firstName', maxLength(50)),
				},
				lastName: {
					required: helpers.withMessage('se.validator.mandatory.passenger.lastName', required),
					characterLatin: helpers.withMessage('se.validator.mandatory.passenger.specialCharacter', latinCheck),
					minLength: helpers.withMessage('se.validator.minLength.passenger.lastName', minLength(2)),
					maxLength: helpers.withMessage('se.validator.maxLength.passenger.lastName', maxLength(50)),
				},
				// middleName: { minLength: minLength(2), maxLength: maxLength(50) },
				dateOfBirth: {
					required: helpers.withMessage('se.validator.mandatory.passenger.dateOfBirth', required),
					notAfterToday: helpers.withMessage('se.validator.invalid.passenger.dateOfBirth', (val: Date) => {
						if (val) {
							return !(val.getTime() > currentDate().getTime())
						}
						return true
					}),
					checkAgeOfAdult: helpers.withMessage('se.validator.invalid.passenger.dateOfBirthOfAdult', (val: Date, psgType) => {
						if (val && psgType.passengerType === "ADT") {
							return (currentDate().getTime() - val.getTime())/millisecondsInYear >= 12
						}
						return true
					}),
					checkAgeOfChild: helpers.withMessage('se.validator.invalid.passenger.dateOfBirthOfChild', (val: Date, psgType) => {
						if (val && psgType.passengerType === "CHD") {
							return (currentDate().getTime() - val.getTime())/millisecondsInYear < 12 && (currentDate().getTime() - val.getTime())/millisecondsInYear >= 2
						}
						return true
					}),
					checkAgeOfInfant: helpers.withMessage('se.validator.invalid.passenger.dateOfBirthOfInfant', (val: Date, psgType) => {
						if (val && psgType.passengerType === "INF") {
							return (currentDate().getTime() - val.getTime())/millisecondsInYear < 2
						}
						return true
					}),
				},
				// dateOfBirthOfChild: {
				// 	required: helpers.withMessage('se.validator.mandatory.passenger.dateOfBirth', required),
				// 	checkAge: helpers.withMessage('se.validator.invalid.passenger.dateOfBirthOfChild', (val: Date) => {
				// 		if (val) {
				// 			return (currentDate().getTime() - val.getTime())/millisecondsInYear < 12 && (currentDate().getTime() - val.getTime())/millisecondsInYear > 2
				// 		}
				// 		return true
				// 	}),
				// },
				nationality: { required: helpers.withMessage('se.validator.mandatory.passenger.nationality', required) },
				// identityType: { required: helpers.withMessage('se.validator.mandatory.passenger.identityType', required) },
				identityType: { required: helpers.withMessage('se.validator.mandatory.passenger.identityType', (val: any, sibling: Passenger) => {
					if (val || sibling.passengerType === "INF") {
						return true
					} else {
						return false
					}
				})},
				identityNumber: {
					required: helpers.withMessage('se.validator.mandatory.passenger.identityNumber', (val: Date, sibling: Passenger) => {
						if (sibling.passengerType === 'INF') {
							return true
						} else if (sibling.identityType === 'PP' || sibling.identityType === 'NID') {
							return !!val
						}
						return true
					}),
				},
				idExpirationDate: {
					required: helpers.withMessage('se.validator.mandatory.passenger.idExpirationDate', (val: Date, sibling: Passenger) => {
						if (sibling.passengerType === 'INF') {
							return true
						} else if (sibling.identityType === 'PP' || sibling.identityType === 'NID') {
							return !!val
						}
						return true
					}),
					notBeforeToday: helpers.withMessage('se.validator.invalid.passenger.idExpirationDate', (val: Date, sibling: Passenger) => {
						console.log({ idType: sibling.identityType });

						if (val && (sibling.identityType === 'PP' || sibling.identityType === 'NID')) {
							return !(val.getTime() < currentDate().getTime())
						}
						return true
					}),
					checkExpirationDateForPassport: helpers.withMessage('se.validator.invalid.passenger.idExpirationDate_PP_6months', (val: Date, sibling: Passenger) => {
						if (val && sibling.identityType === 'PP') {
							const date = availData.flightFareKeySelections!.length == 1 ? availData.flightFareKeySelections![0].flightDate.getTime() : availData.flightFareKeySelections![1].flightDate.getTime()
							return val.getTime() >= date + 6*millisecondsInMonth
						}
						return true
					}),
					checkExpirationDateForNationalityID: helpers.withMessage('se.validator.invalid.passenger.idExpirationDate_NID_6months', (val: Date, sibling: Passenger) => {
						if (val && sibling.identityType === 'NID') {
							const date = availData.flightFareKeySelections!.length == 1 ? availData.flightFareKeySelections![0].flightDate.getTime() : availData.flightFareKeySelections![1].flightDate.getTime()
							return val.getTime() >= date + 6*millisecondsInMonth
						}
						return true
					}),
				},
			}),
		},
		contactInfo: {
			phoneCountryCode: {
				required: helpers.withMessage('se.validator.mandatory.contact.phoneCountryCode', required),
				validValue: helpers.withMessage('se.validator.invalid.contact.phoneCountryCode', (val_: string) => {
					if (val_) {
						if (val_.length > 3) return false; 
						return isValidStringRegex(/^[+0-9][0-9-+]{0,}[0-9]+$/, val_.trim())
					}
					return true
				})
			},
			phoneNumber: {
				required: helpers.withMessage('se.validator.mandatory.contact.phoneNumber', required),
				validValue: helpers.withMessage('se.validator.invalid.contact.phoneNumber', (val_: string) => {
					if (val_) {
						return isValidStringRegex(/^[0-9]{8,11}$/, replaceRegex(val_, /\s/gi, ''))
					}
					return true
				})
			},
			email: {
				required: helpers.withMessage('se.validator.mandatory.contact.email', required),
				email: helpers.withMessage('se.validator.invalid.contact.email', email),
			},
			emailConfirm: {
				required: helpers.withMessage('se.validator.mandatory.contact.emailConfirm', required),
				email: helpers.withMessage('se.validator.invalid.contact.emailConfirm', email),
				// sameValue: helpers.withMessage('se.validator.invalid.contact.emailConfirm', (value: string, sibling: ContactInfo) => (value && sibling.email)? value === sibling.email : true),
				sameValue: helpers.withMessage('se.validator.invalid.contact.emailConfirm', (value: string, sibling: ContactInfo) => {
					if (value && sibling.email && email.$validator(sibling.email, null, null) && email.$validator(value, null, null)) {
						return value === sibling.email
					}
					return true
				}),
			}
		}
	}

	return useVuelidate({ passengerData: paxDataValidator }, availData as { passengerData: PassengerData })
}

export const seDataVaidatorHome = (seData: SeData) => {
	const formRules = {
		bookingType: { required: helpers.withMessage('se.validator.mandatory.bookingType', required) },
		fromCode: { required: helpers.withMessage('se.validator.mandatory.fromCode', required) },
		toCode: { required: helpers.withMessage('se.validator.mandatory.toCode', required) },
		departDate: {
			required: helpers.withMessage('se.validator.mandatory.departDate', required),
			checkDepart: helpers.withMessage('se.validator.mandatory.departDate', (val: Date) => !(seData.seForm.bookingType === BookingType.ROUNDTRIP && val && !seData.seForm.retourDate))
		},
		retourDate: {
			retourDateRequired: helpers.withMessage('se.validator.mandatory.retourDate', (val: Date) => {
				return !(seData.seForm.bookingType === BookingType.ROUNDTRIP && !val);
			}),
			retourDateAfterDepartDate: helpers.withMessage('se.validator.invalid.retourDate', (val: Date) => {
				if (seData.seForm.bookingType === BookingType.ROUNDTRIP && val && seData.seForm.departDate) {
					return val.getTime() >= seData.seForm.departDate.getTime()
				}
				return true
			}),
		},
		nbAdt: {
			minNbAdtChd: helpers.withMessage('se.validator.mandatory.pax', () => seData.seForm.nbAdt + seData.seForm.nbChd >= 1),
			maxNbAdtChd: helpers.withMessage('se.validator.maximum.pax', () => seData.seForm.nbAdt + seData.seForm.nbChd <= 9),
			nbInf: helpers.withMessage('se.validator.invalid.nbInf', () => seData.seForm.nbInf <= seData.seForm.nbAdt),
		}
	}
	return useVuelidate({ seForm: formRules }, seData) // object validate must be reactive
}

export const seDataVaidatorMini = (seData: SeData) => {
	const formRules = {
		//bookingType: { required: helpers.withMessage('se.validator.mandatory.bookingType', required) },
		fromCode: { required: helpers.withMessage('se.validator.mandatory.fromCode', required) },
		toCode: { required: helpers.withMessage('se.validator.mandatory.toCode', required) },
		departDate: { required: helpers.withMessage('se.validator.mandatory.departDate', required) },
		retourDate: {
			retourDateAfterDepartDates: helpers.withMessage('se.validator.invalid.retourDate', (val: Date) => {
				if (seData.seForm.departDate) {
					if (seData.seForm.retourDate) {
						return val.getTime() >= seData.seForm.departDate?.getTime()
					}
				}
				return true
			}),
			// retourDateRequired: helpers.withMessage('se.validator.mandatory.retourDate', (val: Date) => {
			//     return !(formState.bookingType === 'ROUNDTRIP' && !val);
			// }),
			// retourDateAfterDepartDate: helpers.withMessage('se.validator.invalid.retourDate', (val: Date) => formState.bookingType === 'ROUNDTRIP'? val.getTime() >= formState.departDate.getTime() : true)
		},
		nbAdt: {
			minNbAdtChd: helpers.withMessage('se.validator.mandatory.pax', () => seData.seForm.nbAdt + seData.seForm.nbChd >= 1),
			maxNbAdtChd: helpers.withMessage('se.validator.maximum.pax', () => seData.seForm.nbAdt + seData.seForm.nbChd <= 9),
			nbInf: helpers.withMessage('se.validator.invalid.nbInf', () => seData.seForm.nbInf <= seData.seForm.nbAdt),
		}
	}
	return useVuelidate({ seForm: formRules }, seData) // object validate must be reactive
}


export const errorMessages = (pathValidator: any, t: any): undefined | string[] => {
	if (pathValidator && pathValidator.$errors.length > 0) {
		const msgs: string[] = []
		pathValidator.$errors.forEach((err: any) => {
			msgs.push(t(err.$message, err.$message))
		})
		return msgs
	}
	return undefined
}

export const paxErrorMessages = (v$: any, paxIndex: number): undefined | any => {
	const err = v$.passengerData.passengers.$errors
	if (err.length > 0) {
		const errIndex = err.find((e: any) => e.$validator === "$each")
		if (errIndex) {
			return errIndex.$response.$errors[paxIndex]
		}
	}
	return undefined
}

export const pathErrorsOnEach = (error: any, path: string, t: any) => {
	if (error) {
		const errOnPath = error[path]
		if (errOnPath && errOnPath.length > 0) {
			const msgs: string[] = []
			errOnPath.forEach((err: any) => {
				msgs.push(t(err.$message))
			})
			return msgs
		}
	}
	return undefined
}

export const pathErrorsOnPaxIdType = (pax: Passenger, error: any, path: string, t: any) => {
	if (error) {
		const errOnPath = error[path]
		if (errOnPath && errOnPath.length > 0) {
			const value_ = (pax as any)[path]
			const msgs: string[] = []
			errOnPath.forEach((err: any) => {
				msgs.push(t(err.$message))
			})

			// if (pax.identityType === 'PP') {
			// 	msgs[0] = t(`${errOnPath[0].$message}_PP`, `.Passport is ${value_ ? 'invalid' : 'mandatory'}`)
			// } else if (pax.identityType === 'NID') {
			// 	msgs[0] = t(`${errOnPath[0].$message}_NID`, `.Nationality id is ${value_ ? 'invalid' : 'mandatory'}`)
			// }
			return msgs
		}
	}
	return undefined
}

// ok for get error on collection
// using -> errorsOnCollection(v$, 'pmModel.listPayments', 0)
export const errorsOnCollection = (v$: any, path: string, index: number) => {
	const e: any = getPath(v$, path).$errors.find((err: any) => err.$validator === '$each')
	if (e) {
		const err = {} as any;
		const e_ = e.$response.$errors[index]
		Object.keys(e_).forEach(prop => {
			if (e_[prop].length > 0)
				err[prop] = e_[prop]
		})
		return err
	}
	return undefined
}

const getPath = (obj: any, path: string) => {
	let object = obj;
	path.split('.').forEach(p => {
		object = object[p]
	})
	return object;
}

export const errorsOnCollections = (v$: any, path: string, index: number, t$: any) => {
	const e: any = getPath(v$, path).$errors.find((err: any) => err.$validator === '$each')
	if (e) {
		const err = {} as any;
		const e_ = e.$response.$errors[index]
		Object.keys(e_).forEach(prop => {
			if (e_[prop].length > 0) {
				const msg: string[] = []
				e_[prop].forEach((m: any) => {
					msg.push(t$(m.$message, `[${m.$message}]`))
				});
				err[prop] = msg
			}
		})
		return err
	}
	return undefined
}