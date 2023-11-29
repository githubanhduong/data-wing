export const compare = (a: any, b: any) => a > b ? 1 : a < b ? -1 : 0
export const compareNumber = (a: number, b: number) => a - b
export const compareDesc = (a: any, b: any) => a > b ? -1 : a < b ? 1 : 0


export const $el = <E extends any>(element: any): E => element.$el || element