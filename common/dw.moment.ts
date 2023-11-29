// // dung dw.luxon.ts di

// import moment from 'moment-timezone';
// import 'moment/dist/locale/fr'
// import 'moment/dist/locale/de'
// moment.locale('en')

// export const dateToString = (date: Date | null, format: string) => date ? moment(date).format(format) : ''
// export const dateToStringWithTimzone = (date: Date | null, format: string, timezoneId: string) => {
//     if (!timezoneId) {
//         throw new Error('Missing timezoneId')
//     }
//     return date ? moment(date).tz(timezoneId).format(format) : ''
// }
// export const dateToStringWithLocale = (date: Date, format: string, locale: string) => moment(date).locale(locale).format(format)

// export const stringToDate = (stringDate: string, format: string) => moment(stringDate, format)
// export const stringToDateWithLocale = (stringDate: string, format: string, locale: string) => moment(stringDate, format, locale)

// export const getDaysArray = (s: Date, e: Date) => {
//     const end = new Date(e)
//     const a: Date[] = []
//     for (let d = new Date(s); d <= end; d.setDate(d.getDate() + 1))
//         a.push(new Date(d))
//     return a;
// }

// const _addDays = (date: Date, days: number) => {
//     date.setDate(date.getDate() + days)
//     return date;
// }

// export const addDays = (date: Date, days: number) => {
//     const date_ = new Date(date.getTime())
//     return _addDays(date_, days)
// }
// export const monthTrunc = (date: Date) => {
//     const date_ = new Date(date.getTime())
//     date_.setDate(1);
//     return date_;
// }

// export const yearTrunc = (date: Date) => {
//     const date_ = new Date(date.getTime())
//     date_.setDate(1);
//     date_.setMonth(0);
//     return date_;
// }

// export const duration = (dateFrom: Date | null, dateTo: Date | null) => {
//     if (!dateFrom || !dateTo) {
//         return '';
//     }
//     return moment.duration(moment(dateTo).diff(moment(dateFrom)))
// }

// export const durationX = (dateFrom: Date | null, dateTo: Date | null) => {
//     if (!dateFrom || !dateTo) {
//         return null;
//     }
//     const duration = moment.duration(moment(dateTo).diff(moment(dateFrom)))
//     return { hours: Math.floor(duration.asHours()), minutes: duration.minutes() }
// }

// export const durationHHmm = (dateFrom: Date | null, dateTo: Date | null) => {
//     const duration = (durationX(dateFrom, dateTo))
//     if (!duration) {
//         return null;
//     }

//     let h_ = ''
//     let m_ = ''
//     if (duration.hours > 0) {
//         h_ = `${duration.hours}h`
//     }
//     if (duration.minutes > 0) {
//         m_ = `${duration.minutes}m`
//     }
//     return `${h_}${m_}`
// }