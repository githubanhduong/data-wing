import type { DateFare } from "./custom-type";
import type { BaseServiceCharge, IbeBooking } from "./datawings-ibe";
import type { PaxFareDetail, PaxTypeDetail, PaymentModel, SummaryDetail } from "./datawings-payment";
import type { AvailabilityResult, FareReference, FlightAvailability, FlightType, JourneyFareRef, OfferItem, TripOffer } from "./datawings-xsd";
import { addDays } from "./dw-luxon";

export const dateFaresV1 = (availRs: AvailabilityResult, offer: TripOffer, searchDate: Date, date: Date, flexiAble: number): DateFare[] => {
	const rs: DateFare[] = []
	const startDate = addDays(searchDate, -flexiAble)
	const endDate = addDays(searchDate, flexiAble)


	console.log({ startDate, endDate });

	for (let iDate_ = startDate; iDate_ <= endDate; iDate_ = addDays(iDate_, 1)) {
		const journeyAvail = offer.journeyAvails ? offer.journeyAvails.find(j => j.date.getTime() == iDate_.getTime()) : undefined
		if (!journeyAvail) {
			rs.push({ date: iDate_, avail: false })
		} else {
			const f: DateFare = { date: journeyAvail.date, avail: true }
			rs.push(f)
			for (const r in journeyAvail.offers) {
				journeyAvail.offers[r].forEach(itm => {
					const fares = listFaresByFareRefs(availRs, itm.fareRefs)
					const total = totalByFares(fares)
					if (fares && fares.length > 0) {
						f.currency = fares[0].currencyCode
					}
					if (!f.amt || f.amt > total) {
						f.amt = total
					}
				})
			}
		}
	}

	return rs
}

export const dateFaresV0 = (availRs: AvailabilityResult, offer: TripOffer, date: Date, flexiAble: number): DateFare[] => {
	const rs: DateFare[] = []
	const startDate = addDays(date, -flexiAble)
	const endDate = addDays(date, flexiAble)


	console.log({ startDate, endDate });

	for (let iDate_ = startDate; iDate_ <= endDate; iDate_ = addDays(iDate_, 1)) {
		const journeyAvail = offer.journeyAvails.find(j => j.date.getTime() == iDate_.getTime())
		if (!journeyAvail) {
			rs.push({ date: iDate_, avail: false })
		} else {
			const f: DateFare = { date: journeyAvail.date, avail: true }
			rs.push(f)
			for (const r in journeyAvail.offers) {
				journeyAvail.offers[r].forEach(itm => {
					const fares = listFaresByFareRefs(availRs, itm.fareRefs)
					const total = totalByFares(fares)
					if (fares && fares.length > 0) {
						f.currency = fares[0].currencyCode
					}
					if (!f.amt || f.amt > total) {
						f.amt = total
					}
				})
			}
		}
	}

	return rs
}

export const listFaresByFareRefs = (availRs: AvailabilityResult | null | undefined, fareRefs: JourneyFareRef[]) => {
	const fares: FareReference[] = []
	if (availRs) {
		fareRefs.forEach(f => {
			fares.push(availRs.fares[f.fareAvailKey])
		})
	}

	return fares
}

const totalByFares = (fares: FareReference[]) => {
	if (!fares || fares.length == 0) {
		return 0
	}
	let amt = 0;
	fares.forEach(f => {
		amt += f.total.total
	})
	return amt
}

export const listFlight = (availRs: AvailabilityResult | null | undefined, flightKeys: string[] | undefined) => {
	const flights: FlightAvailability[] = []
	if (flightKeys && availRs) {
		flightKeys.forEach(fk => flights.push(availRs.flights[fk]))
	}
	return flights;
}

export const listFlightFromSelection = (availRs: AvailabilityResult | null | undefined, tripOfferIndex: number, journeyKey: string | undefined): FlightAvailability[] | undefined => {
	if (journeyKey && availRs && availRs.tripOffers && availRs.tripOffers.length > 0 && availRs.tripOffers.length > tripOfferIndex) {
		const tripOffer = availRs.tripOffers[tripOfferIndex];
		for (const ja of tripOffer.journeyAvails) {
			for (const key in ja.offers) {
				for (const offer of ja.offers[key]) {
					if (offer.offerKey === journeyKey) {
						return listFlight(availRs, offer.listFlightIds)
					}
				}
			}
		}
	}
	return undefined
}

export const getOfferFromSelection = (availRs: AvailabilityResult | null | undefined, tripOfferIndex: number, journeyKey: string | undefined): OfferItem | undefined => {
	if (journeyKey && availRs && availRs.tripOffers && availRs.tripOffers.length > 0 && availRs.tripOffers.length > tripOfferIndex) {
		const tripOffer = availRs.tripOffers[tripOfferIndex];
		for (const ja of tripOffer.journeyAvails) {
			for (const key in ja.offers) {
				for (const offer of ja.offers[key]) {
					if (offer.offerKey === journeyKey) {
						return offer
					}
				}
			}
		}
	}
	return undefined
};


export const getDuration = (t: any, duration: { hours: number; minutes: number } | null | undefined) => {
	if (!duration) {
		return ''
	}
	let h_ = ''
	let m_ = ''
	if (duration.hours > 0) {
		h_ = t('se.duration.hours', { n: duration.hours }, '.{n} hours')
	}
	if (duration.minutes > 0) {
		m_ = t('se.duration.minutes', { n: duration.minutes }, '.{n} minutes')
	}
	return `${h_} ${m_}`
}

export const getFlightType = (t: any, type: FlightType | null, stops: number) => {
	// export type FlightType = "None" | "NonStop" | "Through" | "Direct" | "Connect" | "All";
	if (type == 'NonStop' || type == 'Direct' || type == 'Connect') {
		return t(`se.flight.type.${type}`, type)
	} else {
		return t(`se.flight.stops`, { n: stops }, '.None stop | .{n} stop | .{n} stops')
	}
}


export const totalPaxFareDetailCalculator = (ibeBooking?: IbeBooking) => {
	const paxFareDetail = {
		currency: ibeBooking?.currencyCode || 'USD', fare: 0.0, taxes: 0.0, yq: 0.0, discount: 0.0, total: 0.0,
		serviceFeeAmt: 0.0, adjustmentAmt: 0.0
	}

	ibeBooking?.passengers.forEach(passenger => {
		ibeBooking?.journeys.forEach(jn => {
			jn.fares.forEach(fareSmg => {
				const paxFare = fareSmg.passengerFares.find(f => f.passengerType == passenger.passengerType)
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
		if (passenger.passengerFees && passenger.passengerFees.length > 0) {
			passenger.passengerFees.forEach(paxFee => {
				paxFee.serviceCharges.forEach(sc => {
					paxFareDetail.taxes += sc.amount
					paxFareDetail.total += sc.amount
				})
			})
		}
		// aivahub service fees

		console.log({"aviahubServiceFee": passenger.aviahubServiceFee});

		const aviahubServiceFee = {
			serviceFee: Number(passenger.aviahubServiceFee.serviceFee),
			adjustment: Number(passenger.aviahubServiceFee.adjustment)
		}
		
		paxFareDetail.serviceFeeAmt += aviahubServiceFee.serviceFee
		paxFareDetail.adjustmentAmt += aviahubServiceFee.adjustment
		paxFareDetail.total += aviahubServiceFee.serviceFee + aviahubServiceFee.adjustment
	})
	return paxFareDetail;
}

export const totalPaxFareDetailCalculator2 = (ibeBooking: IbeBooking, pmModel: PaymentModel) => {
	const paxFareDetail: PaxFareDetail = {
		currency: ibeBooking?.currencyCode || 'USD', fare: 0.0, taxes: 0.0, yq: 0.0, discount: 0.0, total: 0.0,
		serviceFeeAmt: 0.0, adjustmentAmt: 0.0, otherCharges: 0.0, vatAmount: 0.0
	}
	let index = 0;

	ibeBooking?.passengers.forEach(passenger => {
		ibeBooking?.journeys.forEach(jn => {
			jn.fares.forEach(fareSmg => {
				const paxFare = fareSmg.passengerFares.find(f => f.passengerType == passenger.passengerType)
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
		if (passenger.passengerFees && passenger.passengerFees.length > 0) {
			passenger.passengerFees.forEach(paxFee => {
				paxFee.serviceCharges.forEach(sc => {
					console.log(sc);
					
					paxFareDetail.taxes += sc.amount
					paxFareDetail.total += sc.amount
				})
			})
		}
		// aivahub service fees
		const pmModelSc = pmModel.serviceFees[`pax${index}`]
		const aviahubServiceFee = {
			serviceFee: Number(pmModelSc.serviceFee),
			adjustment: Number(pmModelSc.adjustment)
		}

		paxFareDetail.serviceFeeAmt += aviahubServiceFee.serviceFee
		paxFareDetail.adjustmentAmt += aviahubServiceFee.adjustment
		paxFareDetail.total += aviahubServiceFee.serviceFee + aviahubServiceFee.adjustment

		index++
	})

	paxFareDetail.serviceFeeAmt = round2Decimal(paxFareDetail.serviceFeeAmt)
	paxFareDetail.adjustmentAmt = round2Decimal(paxFareDetail.adjustmentAmt)
	paxFareDetail.fare = round2Decimal(paxFareDetail.fare)
	paxFareDetail.taxes = round2Decimal(paxFareDetail.taxes)
	paxFareDetail.yq = round2Decimal(paxFareDetail.yq)
	paxFareDetail.discount = round2Decimal(paxFareDetail.discount)
	paxFareDetail.total = round2Decimal(paxFareDetail.total)

	return paxFareDetail;
}
// export interface SummaryDetail {
// 	total: PaxFareDetail,
// 	paxs:Record<number, PaxFareDetail>
// 	summmary: {[paxType: PassengerType]: PaxFareDetail}
// }

const isCollect = (sc: BaseServiceCharge) => sc.collectType === 'SellerChargeable' || sc.collectType === 'ExternalChargeable' || sc.collectType === 'ExternalChargeableImmediate'

const isFare = (sc: BaseServiceCharge) => sc.type === 'FareSurcharge' || sc.type === 'DynamicFareAdjustment'
const isTaxe = (sc: BaseServiceCharge) => (
	sc.type === 'Tax' 
	|| sc.type === 'ServiceCharge'
	|| sc.type === 'AddOnsCancelFee'
	|| sc.type === 'IncludedTravelFee'
	|| sc.type === 'IncludedAddOnsFee'
	|| sc.type === 'Calculated'
	|| sc.type === 'IncludedTax'
	|| sc.type === 'ConnectionAdjustmentAmount'
	|| sc.type === 'AddOnsFee'
	|| sc.type === 'Note'
	|| sc.type === 'TravelFee'
	|| sc.type === 'AddOnsPrice'
	|| sc.type === 'AddOnsMarkup'
)
const isDiscount = (sc: BaseServiceCharge) => sc.type === 'Discount' || sc.type === 'PromotionDiscount'

const addOrSub_ServiceFee = (sc: BaseServiceCharge): number => {
	if (isCollect(sc)) {
		if (isFare(sc) || isTaxe(sc)) {
			return sc.amount
		} else if (isDiscount(sc)) {
			return -sc.amount
		}
	}
	return 0.0
}

// const paxType = (type: PassengerType) => {
// 	if (type === "ADT")
// 		return "ADT"
// 	else if (type === "CHD")
// 		return "CHD"
// 	return "INF"
// }

export const totalPaxFareDetailCalculator3 = (ibeBooking: IbeBooking, pmModel: PaymentModel) => {
	const summaryDetail: SummaryDetail = {
		total: {
			currency: ibeBooking?.currencyCode || 'USD',
			fare: 0.0,
			taxes: 0.0,
			yq: 0.0,
			discount: 0.0,
			total: 0.0,
			serviceFeeAmt: 0.0,
			adjustmentAmt: 0.0,
			otherCharges: 0.0,
			vatAmount: 0.0,
		},
		summmary: {
			"ADT": {
				paxType: "ADT",
				nbPax: 0,
				currency: ibeBooking?.currencyCode || 'USD',
				base: {
					fare: 0.0,
					taxes: 0.0,
					discount: 0.0,
				},
				totalPaxFees: 0.0,
				totalAviahubFees: 0.0,
				total: 0.0,
			},
			"CHD": {
				paxType: "CHD",
				nbPax: 0,
				currency: ibeBooking?.currencyCode || 'USD',
				base: {
					fare: 0.0,
					taxes: 0.0,
					discount: 0.0,
				},
				totalPaxFees: 0.0,
				totalAviahubFees: 0.0,
				total: 0.0,
			},
			"INF": {
				paxType: "INF",
				nbPax: 0,
				currency: ibeBooking?.currencyCode || 'USD',
				base: {
					fare: 0.0,
					taxes: 0.0,
					discount: 0.0,
				},
				totalPaxFees: 0.0,
				totalAviahubFees: 0.0,
				total: 0.0,
			},
		}
	}
	let index = 0;

	ibeBooking?.passengers.forEach(passenger => {
		const summaryByPaxType: PaxTypeDetail = summaryDetail.summmary[passenger.passengerType]
		summaryByPaxType.nbPax = summaryByPaxType.nbPax + 1

		ibeBooking?.journeys.forEach(jn => {
			jn.fares.forEach(fareSmg => {
				const paxFare = fareSmg.passengerFares.find(f => f.passengerType == passenger.passengerType)
				if (paxFare) {
					summaryDetail.total.fare = round2Decimal(summaryDetail.total.fare + paxFare.fares)
					summaryDetail.total.taxes = round2Decimal(summaryDetail.total.taxes + paxFare.taxes)
					summaryDetail.total.yq = round2Decimal(summaryDetail.total.yq + paxFare.yqTaxes)
					summaryDetail.total.discount = round2Decimal(summaryDetail.total.discount + paxFare.discount)
					summaryDetail.total.total = round2Decimal(summaryDetail.total.total + paxFare.total)

					if (summaryByPaxType.nbPax == 1) {
						summaryByPaxType.base.fare = round2Decimal(summaryByPaxType.base.fare + paxFare.fares)
						summaryByPaxType.base.taxes = round2Decimal(summaryByPaxType.base.taxes + paxFare.taxes)
						summaryByPaxType.base.discount = round2Decimal(summaryByPaxType.base.discount + paxFare.discount)
					}
					// summaryByPaxType.total += paxFare.total
				}
			});
		})
		// pax fees
		if (passenger.passengerFees && passenger.passengerFees.length > 0) {
			passenger.passengerFees.forEach(paxFee => {
				paxFee.serviceCharges.forEach(sc => {
					if (sc.code !== 'INF') {
						console.log(sc);
						const scFee = addOrSub_ServiceFee(sc)
						summaryDetail.total.taxes = round2Decimal(summaryDetail.total.taxes + scFee)
						summaryDetail.total.total = round2Decimal(summaryDetail.total.total + scFee)

						summaryByPaxType.totalPaxFees = round2Decimal(summaryByPaxType.totalPaxFees + scFee)
					}
				})
			})
		}

		// aivahub service fees
		const pmModelSc = pmModel.serviceFees[`pax${index}`]
		const aviahubServiceFee = {
			serviceFee: Number(pmModelSc.serviceFee),
			adjustment: Number(pmModelSc.adjustment)
		}

		summaryDetail.total.serviceFeeAmt = round2Decimal(summaryDetail.total.serviceFeeAmt + aviahubServiceFee.serviceFee)
		summaryDetail.total.adjustmentAmt = round2Decimal(summaryDetail.total.adjustmentAmt + aviahubServiceFee.adjustment)

		summaryDetail.total.total = round2Decimal(summaryDetail.total.total + aviahubServiceFee.serviceFee + aviahubServiceFee.adjustment) 

		summaryByPaxType.totalAviahubFees = round2Decimal(summaryByPaxType.totalAviahubFees + aviahubServiceFee.serviceFee + aviahubServiceFee.adjustment)

		index++
	})

	if (summaryDetail.summmary['ADT'].nbPax > 0) {
		const summaryByPaxType: PaxTypeDetail = summaryDetail.summmary["ADT"]
		summaryByPaxType.total = round2Decimal(summaryByPaxType.nbPax * (summaryByPaxType.base.fare + summaryByPaxType.base.taxes - summaryByPaxType.base.discount) + summaryByPaxType.totalPaxFees + summaryByPaxType.totalAviahubFees)
	}
	if (summaryDetail.summmary['CHD'].nbPax > 0) {
		const summaryByPaxType: PaxTypeDetail = summaryDetail.summmary["CHD"]
		summaryByPaxType.total = round2Decimal(summaryByPaxType.nbPax * (summaryByPaxType.base.fare + summaryByPaxType.base.taxes - summaryByPaxType.base.discount) + summaryByPaxType.totalPaxFees + summaryByPaxType.totalAviahubFees)
	}
	if (summaryDetail.summmary['INF'].nbPax > 0) {
		const pax = ibeBooking!.passengers.find(pax => pax.passengerType === "ADT")
		if (pax) {
			const summaryByPaxType: PaxTypeDetail = summaryDetail.summmary["INF"]
			pax.passengerFees?.forEach(paxFee => paxFee.serviceCharges.filter(sc => sc.code === "INF").forEach(sc => {
				if (isFare(sc)) {
					summaryByPaxType.base.fare = round2Decimal(summaryByPaxType.base.fare + sc.amount)
				} else if (isTaxe(sc)) {
					summaryByPaxType.base.taxes = round2Decimal(summaryByPaxType.base.taxes + sc.amount)
				} else if (isDiscount(sc)) {
					summaryByPaxType.base.discount = round2Decimal(summaryByPaxType.base.discount + sc.amount)
				}
			}));
			summaryByPaxType.total = round2Decimal(summaryByPaxType.nbPax * (summaryByPaxType.base.fare + summaryByPaxType.base.taxes - summaryByPaxType.base.discount) + summaryByPaxType.totalPaxFees + summaryByPaxType.totalAviahubFees)
		}
	}

	// summaryDetail.total.serviceFeeAmt = round2Decimal(summaryDetail.total.serviceFeeAmt)
	// summaryDetail.total.adjustmentAmt = round2Decimal(summaryDetail.total.adjustmentAmt)
	// summaryDetail.total.fare = round2Decimal(summaryDetail.total.fare)
	// summaryDetail.total.taxes = round2Decimal(summaryDetail.total.taxes)
	// summaryDetail.total.yq = round2Decimal(summaryDetail.total.yq)
	// summaryDetail.total.discount = round2Decimal(summaryDetail.total.discount)
	// summaryDetail.total.total = round2Decimal(summaryDetail.total.total)
	summaryDetail.total.otherCharges =  Number(pmModel!.otherCharges)
	summaryDetail.total.total += summaryDetail.total.otherCharges
	summaryDetail.total.vatAmount = (summaryDetail.total.adjustmentAmt + summaryDetail.total.serviceFeeAmt + summaryDetail.total.otherCharges) * Number(pmModel!.vat)/100

	return summaryDetail;
}

export const round2Decimal = (amt: number) => Number(amt.toFixed(2))