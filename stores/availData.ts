import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { AvailData } from '@/common/custom-type'
import type { AvailabilityResult, FlightFareKeySelection } from '@/common/datawings-xsd'

export const useAvailState = defineStore('availDataState', () => {
	const data = reactive<AvailData>({
		dataKey: "root",
		availabilityData: null,
	})

	const setAvailabilityData = (_data: AvailabilityResult | null) => {
		data.availabilityData = _data
	}

	// const getJourneyOfferOnDateDepart = () => {
	//   if (availData.dateSelected && availData.dateSelected.depart) {
	//     const time = availData.dateSelected.depart.getTime()
	//     const journey = availData.availabilityData?.tripOffers[0].journeyAvails.find(j => j.date.getTime() === time)
	//     if (journey) {
	//       return journey;
	//     }
	//   }
	//   return null
	// }

	const getJourneyOfferOnDateDepart = (date: Date | null | undefined) => {
		if (data.availabilityData && date) {
			const time = date.getTime()
			return data.availabilityData.tripOffers[0].journeyAvails ? data.availabilityData.tripOffers[0].journeyAvails.find(j => j.date.getTime() === time) : undefined
		}
		return null
	}
	const getJourneyOfferOnDateReturn = (date: Date | null | undefined) => {
		if (data.availabilityData && data.availabilityData.tripOffers.length == 2 && date) {
			const time = date.getTime()
			return data.availabilityData.tripOffers[1].journeyAvails.find(j => j.date.getTime() === time)
		}
		return null
	}

	const setSelectedDateDepart = (date: Date) => {
		if (!data.flightFareKeySelections) {
			data.flightFareKeySelections = []
		}
		if (data.flightFareKeySelections.length == 0) {
			data.flightFareKeySelections.push({} as FlightFareKeySelection)
		}
		data.flightFareKeySelections[0].flightDate = date
	}

	const setSelectedDateRetour = (date: Date) => {
		if (!data.flightFareKeySelections || data.flightFareKeySelections.length == 0) {
			throw new Error("Data not correct");
		}
		if (data.flightFareKeySelections.length == 1) {
			data.flightFareKeySelections.push({} as FlightFareKeySelection)
		}
		data.flightFareKeySelections[1].flightDate = date
	}

	const getFlightDateDepart = (defaultVal: Date) => {
		if (data.flightFareKeySelections && data.flightFareKeySelections.length >= 1) {
			return data.flightFareKeySelections[0].flightDate ?? defaultVal
		}
		return defaultVal
	}

	const getFlightDateReturn = (defaultVal: Date) => {
		if (data.flightFareKeySelections && data.flightFareKeySelections.length == 2) {
			return data.flightFareKeySelections[1].flightDate ?? defaultVal
		}
		return defaultVal
	}

	const getFlightFareKeySelectionDepart = () => {
		console.log('data.flightFareKeySelections');
		
		console.log(data.flightFareKeySelections);
		
		if (data.flightFareKeySelections && data.flightFareKeySelections.length >= 1) {
			console.log('data.flightFareKeySelections true');
			return data.flightFareKeySelections[0]
		}
		console.log('data.flightFareKeySelections false');
		return undefined
	}

	const getFlightFareKeySelectionReturn = () => {
		if (data.flightFareKeySelections && data.flightFareKeySelections.length == 2) {
			return data.flightFareKeySelections[1]
		}
		return undefined
	}

	return {
		data, setAvailabilityData, getJourneyOfferOnDateDepart, getJourneyOfferOnDateReturn,
		getFlightFareKeySelectionDepart, getFlightFareKeySelectionReturn,
		setSelectedDateDepart, setSelectedDateRetour,
		getFlightDateDepart, getFlightDateReturn,
	}
})
