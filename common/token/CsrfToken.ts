import type { ICsrfToken } from "../custom-type"
import { addSeconds } from "../dw-luxon"

export class CsrfToken implements ICsrfToken {
    name: string
    token: string
    date: Date
    constructor(name: string, token: string, date: Date) {
        this.name = name
        this.token = token
        this.date = date
    }
    setCsrf(obj: any) {
        obj[this.name] = this.token
        return obj
    }
	headerWithCsrf(header: any | null) {
		if (header != null) {
			header['X-CSRF-TOKEN'] = this.token
			return header
		}
		return {'X-CSRF-TOKEN': this.token}
	}
    isValidTime() {
        if (!this.date) {
            return false
        }
        return addSeconds(this.date, 1795 /* 30*60 -5 seconds */).getTime() < new Date().getTime();
    }
}