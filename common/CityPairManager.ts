import type { ComposerTranslation } from 'vue-i18n'
import { removeDiacritics } from './commons'
import type { CityPair, VoidFunctionType } from './custom-type'
import { compare } from './vue-commons'
import { EmitType, emitter } from '@/plugins/eventBus'

const isCity = (name: string) => name == 'all airports' || name == 'tous les aéroports'
const isAirport = (name: string) => !isCity(name)

export class Airport {
    code: string
    name: string
    country: string
    city: string
    isAirport: boolean
    searchingText: string
    constructor(code: string, name: string, country: string, city: string) {
        this.code = code
        this.name = name
        this.country = country
        this.city = city
        this.isAirport = isAirport(this.name)
        this.searchingText = removeDiacritics(this.searchText(this.isAirport))
    }
    // display() {
    //     if (isCity(this.name))
    //         return `${this.code} - ${this.city} - ${this.name}`
    //     return `${this.code} - ${this.city}`
    // }
    private searchText(isAirport: boolean) {
        // if (isAirport)
        //     return `${this.name}_${this.code}_${this.city}_${this.country}_${this.city} (${this.code})`.toLowerCase();
        if (isAirport)
            return `${this.name}_${this.code}_${this.city}_${this.country}_${this.city} (${this.code})`.toLowerCase();
            // return `${this.city}_${this.country}_${this.city} (${this.code})`.toLowerCase();
        return `${this.city}_${this.code}_${this.country}_${this.city} (${this.code})`.toLowerCase()
        
    }
    searching(lowCaseText: string) {
        return this.searchingText.indexOf(lowCaseText) > -1
    }
    // itemText() {
    //     if (isCity(this.name))
    //         return `${this.city}_${this.code}_${this.country}_${this.city} (${this.code})`
    //     return `${this.name}_${this.code}_${this.city}_${this.country}_${this.city} (${this.code})`
    // }
    // type: string,
}

const airportCompare = (a1: Airport, a2: Airport) => {
    let x = compare(a1.city, a2.city)
    if (x != 0)
        return x
    x = compare (a1.isAirport, a2.isAirport)
    return x!=0? x : compare(a1.code, a2.code)
}

export class CityPairManager {
    loadedStatus: boolean
    airports: Record<string, Airport>
    cityPairs: CityPair[]
    departs: Airport[]
    arrivalsMap: Record<string, Airport[]>
    // arrivalsMap: {
    //     orig: string,
    //     arrivals: string[],
    // }
    // itemTextDeparts: string[]
    // itemTextArrivals: string[]
    searchTermDepart: string
    searchTermArrival: string
	onCallback: null | (() => void)

    constructor() {
        this.loadedStatus = false
        this.airports = {}
        this.cityPairs = []
        this.departs = []
        this.arrivalsMap = {}
        this.searchTermDepart = ''
        this.searchTermArrival = ''
		this.onCallback = null
    }

    loadedState (t: any, callback: VoidFunctionType) {
        this.airports = {}
        this.departs = []
        this.arrivalsMap = {}

        this.cityPairs.forEach(c => {
            let airportDeparture = this.airports[c.orig];
            let airportArrival = this.airports[c.dest];
            if (!airportDeparture) {
                //airportDeparture = { code: c.orig, country: t(`airport.${c.orig}.country`, '{country}'), city: t(`airport.${c.orig}.city`, '{city}') }
                airportDeparture = new Airport(c.orig, t(`airport.${c.orig}.name`, '{name}'), t(`airport.${c.orig}.country`, '{country}'), t(`airport.${c.orig}.city`, '{city}'))
                this.airports[c.orig] = airportDeparture
            }
            if (!airportArrival) {
                //airportArrival = { code: c.dest, country: t(`airport.${c.dest}.country`, '{country}'), city: t(`airport.${c.dest}.city`, '{city}') }
                airportArrival = new Airport(c.dest, t(`airport.${c.dest}.name`, '{name}'), t(`airport.${c.dest}.country`, '{country}'), t(`airport.${c.dest}.city`, '{city}'))
                this.airports[c.dest] = airportArrival
            }

            const existDepart = this.departs.find(a => a.code == c.orig)
            if (!existDepart)
                this.departs.push(airportDeparture)
            this.addArrival(c, airportArrival)
        })
        // this.itemTextDeparts = []
        // this.departs.forEach(c => {
        //     this.itemTextDeparts.push(stringFormat('{0} - {1}, {2}', c.code, c.city, c.country))
        // })
        this.departs = this.departs.sort(airportCompare)
        for (const key in this.arrivalsMap) {
            const values = this.arrivalsMap[key]
            this.arrivalsMap[key] = values.sort(airportCompare)
        }

        if (callback)
            callback(this.departs)

        this.loadedStatus = true
    }

    applyCityPairss(cityPairs: CityPair[], t: ComposerTranslation, callback: VoidFunctionType): void {
        this.cityPairs = cityPairs
        // this.airports = {}
        // this.departs = []
        // this.arrivalsMap = {}

		if (this.onCallback) {
			emitter.$off(EmitType.LANGUAGE_LOADED, this.onCallback)
			this.onCallback = null
		}

		if (this.cityPairs && this.cityPairs.length > 0) {
			this.loadedState(t, callback)

			this.onCallback = () => {
				this.loadedState(t, callback)
			}
			emitter.$on(EmitType.LANGUAGE_LOADED, this.onCallback)
		}
    }

    getArrivals(fromCode: string): Airport[] {
        return this.arrivalsMap[fromCode]
    }

    private addArrival(c: CityPair, arrival: Airport): void {
        const arr = this.arrivalsMap[c.orig]
        if (arr)
            arr.push(arrival)
        else
            this.arrivalsMap[c.orig] = [arrival];
    }
}