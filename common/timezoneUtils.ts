import * as data  from './airport-timezone-id.json'

const asRecord = (data: any) => data as Record<string, string>

export const getTimezoneId = (airportCode: string) => asRecord(data)[airportCode]