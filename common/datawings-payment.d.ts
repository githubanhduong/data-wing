import type { PassengerType, PaymentType } from "./datawings-ibe";

export interface PmCash {
	paymentType: PaymentType;
	currency: string;
	amount: number;
	cardType: string;
	reference: string;
}
export interface PmCreditCard {
	paymentType: PaymentType;
	currency: string;
	amount: number;
	cardType: string;
	holderName: string;
	reference: string;
	feeCC: number;
	CCfee: number;
	total: number;
	vat: number;
}
export interface PmAviaCollect {
	paymentType: PaymentType;
	currency: string;
	amount: number;
	cardType: string;
	reference: string;
}
export interface PmBankTransfer extends PmCash {
}
export interface PmAncv {
	paymentType: PaymentType;
	currency: string;
	amount: number;
	CCfee: number;
	feeCC: number;
	total: number;
	quantity: number;
	reference: string;
	vat: number;
}
export interface PmInvoice extends PmCash { }
export interface PmOther extends PmCash { }

export interface PaxFareDetail {
	paxIndex?: number;
	paxType?: PassengerType;
	currency: string;
	fare: number;
	taxes: number;
	yq: number;
	discount: number;
	serviceFeeAmt: number;
	adjustmentAmt: number;
	otherCharges: number;
	vatAmount: number;
	total: number;
}

export interface SummaryDetail {
	total: PaxFareDetail,
	// paxs: Record<number, PaxFareDetail>
	summmary: {[paxType: string]: PaxTypeDetail}
}

export interface PaxTypeDetail {
	paxType: PassengerType;
	nbPax: number;
	currency: string;
	base: {
		fare: number;
		taxes: number;
		discount: number;
	}
	totalPaxFees: number;
	totalAviahubFees: number;
	total: number;
}

export interface AviahubServiceFeeX extends Serializable {
	paxIndex: number;
	serviceFee: number | string;
	adjustment: number | string;
	otherCharges: number | string;
	currencyCode: string;
}

export interface PaymentModel {
	length: number;
	serviceFees: Record<string, AviahubServiceFeeX>;
	listPayments: Array<PmCash | PmCreditCard | PmAviaCollect | PmBankTransfer | PmAncv | PmInvoice | PmOther>;
	amountValid: boolean;
	remark?: string;
	customerRemark?: string;
	invoiceNumber?: string;
	invoiceDate?: Date;
	paymentDate?: Date;
	otherCharges?: number | string;
	vat?: number | string;
	vatAmount?: number | string;
}
