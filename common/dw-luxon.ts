import { DateTime } from "luxon";

// luxon : https://moment.github.io/luxon/#/formatting

export const dateToString = (date: Date | null | undefined, format: string) => date ? DateTime.fromJSDate(date).toFormat(format) : ''
export const dateToStringWithTimzone = (date: Date | null | undefined, format: string, timezoneId: string) => {
    if (!timezoneId) {
        throw new Error('Missing timezoneId')
    }
    return date ? DateTime.fromJSDate(date).setZone(timezoneId).toFormat(format) : ''
}
export const getUtc = (date: Date | null, timezoneId: string) => {
    if (!timezoneId) {
        throw new Error('Missing timezoneId')
    }
    return date ? DateTime.fromJSDate(date).setZone(timezoneId).toFormat("'UTC'ZZZ") : ''
}
export const utcFromDate = (date: Date | null) => {
    if (!date) {
        throw new Error('Missing date')
    }
    return DateTime.fromJSDate(date).toFormat("ZZ")
}
export const getX = () => {
   return DateTime.TIME_WITH_LONG_OFFSET
}

export const dateToStringWithLocale = (date: Date, format: string, locale: string) => DateTime.fromJSDate(date).setLocale(locale).toFormat(format)

export const stringToDate = (stringDate: string, format: string) => DateTime.fromFormat(stringDate, format)?.toJSDate()
export const stringToDateWithLocale = (stringDate: string, format: string, locale: string) => DateTime.fromFormat(stringDate, format, { locale })?.toJSDate()

export const getDaysArray = (s: Date, e: Date) => {
    const end = new Date(e)
    const a: Date[] = []
    for (let d = new Date(s); d <= end; d.setDate(d.getDate() + 1))
        a.push(new Date(d))
    return a;
}

export const addDays = (date: Date, days: number) => {
    return DateTime.fromJSDate(date).plus({days}).toJSDate()
}
export const addMins = (date: Date, minutes: number) => {
    return DateTime.fromJSDate(date).plus({minutes}).toJSDate()
}
export const addSeconds = (date: Date, seconds: number) => {
    return DateTime.fromJSDate(date).plus({seconds}).toJSDate()
}
export const monthTrunc = (date: Date) => {
    const date_ = new Date(date.getTime())
    date_.setDate(1);
    return date_;
}

export const yearTrunc = (date: Date) => {
    const date_ = new Date(date.getTime())
    date_.setDate(1);
    date_.setMonth(0);
    return date_;
}

export const currentDate = () => {
	const d = new Date()
	d.setHours(0, 0, 0, 0)
	return d
}

export const duration = (dateFrom: Date | null, dateTo: Date | null) => {
    if (!dateFrom || !dateTo) {
        return undefined;
    }
    return DateTime.fromJSDate(dateTo).diff(DateTime.fromJSDate(dateFrom))
}

export const durationX = (dateFrom: Date | null, dateTo: Date | null) => {
    if (!dateFrom || !dateTo) {
        return undefined;
    }
    const duration_ = duration(dateFrom, dateTo)
    return { hours: Math.floor(duration_?.as('hours')?? 0), minutes: (duration_?.as("minutes")?? 0) % 60 }
}

export const durationHHmm = (dateFrom: Date | null, dateTo: Date | null) => {
    const duration = (durationX(dateFrom, dateTo))
    if (!duration) {
        return null;
    }

    let h_ = ''
    let m_ = ''
    if (duration.hours > 0) {
        h_ = `${duration.hours}h`
    }
    if (duration.minutes > 0) {
        m_ = `${duration.minutes}m`
    }
    return `${h_}${m_}`
}