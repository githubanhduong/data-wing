/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2023-09-10 12:02:30.

export interface AviahubServiceFee extends Serializable {
    passenger: Passenger;
    serviceFee: number|string;
    adjustment: number|string;
    otherCharges: number|string;
    currencyCode: string;
}

export interface BaseServiceCharge extends Serializable {
    amount: number;
    currencyCode: string;
    code: string;
    detail: string;
    type: ChargeType;
    collectType: CollectType;
    xchangeAmount: number;
    xchangeCurrencyCode: string;
}

export interface Contact extends Serializable {
    booking: IbeBooking;
    contactTypeCode: string;
    cultureCode: string;
    email: string;
    customerNumber: string;
    phoneNumber: string;
    sourceOrganization: string;
    firstName: string;
    lastName: string;
    title: string;
}

export interface FareAvailability extends Serializable {
    journey: Journey;
    fareIndex: number;
    fareKey: string;
    downgradeAvailable: boolean;
    carrierCode: string;
    fareClassOfService: string;
    fareBasisCode: string;
    ruleNumber: string;
    productClass: string;
    ruleTariff: string;
    travelClassCode: string;
    passengerFares: PassengerFare[];
}

export interface FareAvailabilityId extends Serializable {
    journey: Journey;
    fareIndex: number;
}

export interface FlightAvail extends Serializable {
    id: number;
    flightAvailKey: string;
    flightNumber: string;
    carrierCode: string;
    segmentType: SegmentType;
    changeOfGauge: boolean;
    origin: string;
    destination: string;
    departure: Date;
    arrival: Date;
    international: boolean;
    flightLegs: FlightLegDetail[];
}

export interface FlightLegDetail extends Serializable {
    flightAvail: FlightAvail;
    legIndex: number;
    legKey: string;
    origin: string;
    destination: string;
    departure: Date;
    arrival: Date;
    equipmentType: string;
    equipmentTypeSuffix: string;
    capacity: number;
    prbcCode: string;
    codeShareIndicator: CodeShareIndicator;
    status: FlightLegStatus;
    seatmapReference: string;
    flightReference: string;
    eticket: boolean;
}

export interface FlightLegDetailId extends Serializable {
    flightAvail: FlightAvail;
    legIndex: number;
}

export interface IbeBooking extends Serializable {
    id: number;
    bookingKey: string;
    recordLocator: string;
    fromCode: string;
    toCode: string;
    bookingType: BookingType;
    groupName: string;
    systemCode: string;
    numericRecordLocator: string;
    parentRecordLocator: string;
    status: IbeStatus;
    bookedDate: Date;
    createdDate: Date;
    expirationDate: Date;
    modifiedDate: Date;
    createdAgentId: number;
    modifiedAgentId: number;
    owningCarrierCode: string;
    changeAllowed: boolean;
    organizationCodePosCreated: string;
    organizationCodePosmodified: string;
    residentCountry: string;
    promotionCode: string;
    currencyCode: string;
    totalFares: number;
    totalTaxesFees: number;
    totalDiscount: number;
    totalPrices: number;
    totalAviahubFees: number;
    nbAdt: number;
    nbChd: number;
    nbInf: number;
    journeys: Journey[];
    contact: Contact;
    passengers: Passenger[];
    vat: number;
    vatAmount: number;
    otherCharges: number;
    paymentDetails: PaymentDetail[];
    invoiceDate: Date;
    paymentDate: Date;
    invoiceNumber: string;
}

export interface Journey extends Serializable {
    booking: IbeBooking;
    journeyIndex: number;
    journeyKey: string;
    fromCode: string;
    toCode: string;
    flightType: FlightType;
    stops: number;
    flightAvails: FlightAvail[];
    fares: FareAvailability[];
}

export interface JourneyId extends Serializable {
    booking: IbeBooking;
    journeyIndex: number;
}

export interface Passenger extends Serializable {
    booking: IbeBooking;
    paxIndex: number;
    passengerKey: string;
    passengerAlternateKey: string;
    customerNumber: string;
    passengerType: PassengerType;
    firstName: string;
    lastName: string;
    middleName: string;
    title: string;
    suffix: string;
    discountCode: string;
    nationality: string;
    residentCountry: string;
    gender: Gender;
    dateOfBirth: Date;
    hasInfant: boolean;
    infRef: number;
    aviahubServiceFee: AviahubServiceFee;
    passengerFees: PassengerFee[];
}

export interface PassengerFare extends Serializable {
    fareAvailability: FareAvailability;
    passengerType: PassengerType;
    discountCode: string;
    fareDiscountCode: string;
    fares: number;
    taxes: number;
    discount: number;
    total: number;
    yqTaxes: number;
    serviceCharges: ServiceCharge[];
}

export interface PassengerFareId extends Serializable {
    fareAvailability: FareAvailability;
    passengerType: PassengerType;
}

export interface PassengerFee extends Serializable {
    passenger: Passenger;
    feeIndex: number;
    code: string;
    detail: string;
    passengerFeeKey: string;
    flightReference: string;
    note: string;
    createdDate: Date;
    serviceCharges: PassengerFeeCharge[];
}

export interface PassengerFeeCharge extends BaseServiceCharge {
    passengerFee: PassengerFee;
    scIndex: number;
}

export interface PassengerFeeChargeId extends Serializable {
    passengerFee: PassengerFee;
    scIndex: number;
}

export interface PassengerFeeId extends Serializable {
    passenger: Passenger;
    feeIndex: number;
}

export interface PassengerId extends Serializable {
    booking: IbeBooking;
    paxIndex: number;
}

export interface PaymentDetail extends Serializable {
    booking: IbeBooking;
    pmIndex: number;
    paymentType: PaymentType;
    currency: string;
    amount: number;
    feeCC: number;
    total: number;
    reference: string;
    quantity: number;
    cardType: string;
    holderName: string;
}

export interface PaymentDetailId extends Serializable {
    booking: IbeBooking;
    pmIndex: number;
}

export interface ServiceCharge extends BaseServiceCharge {
    passengerFare: PassengerFare;
    scIndex: number;
}

export interface ServiceChargeId extends Serializable {
    passengerFare: PassengerFare;
    scIndex: number;
}

export interface Serializable {
}

export type ChargeType = "FarePrice" | "Discount" | "IncludedTravelFee" | "IncludedTax" | "TravelFee" | "Tax" | "ServiceCharge" | "PromotionDiscount" | "ConnectionAdjustmentAmount" | "AddOnsPrice" | "FarePoints" | "DiscountPoints" | "IncludedAddOnsFee" | "AddOnsFee" | "AddOnsMarkup" | "FareSurcharge" | "AddOnsCancelFee" | "Calculated" | "Note" | "Points" | "DynamicFareAdjustment";

export type CollectType = "SellerChargeable" | "ExternalChargeable" | "SellerNonChargeable" | "ExternalNonChargeable" | "ExternalChargeableImmediate";

export type SegmentType = "Normal" | "CodeShareOperating" | "CodeShareMarketing" | "InterlineOutbound" | "InterlineInbound" | "Passive";

export type CodeShareIndicator = "NonCodeShare" | "CodeShareCommercialDuplicate" | "SharedDesignatorOrWetLease" | "CodeShareHostOperatingCarrier" | "CodeShareCommercialDuplicateWithOverrideText" | "SharedDesignatorOrWetLeaseWithOverrideText";

export type FlightLegStatus = "Normal" | "Closed" | "Canceled" | "Suspended" | "ClosedPending" | "BlockAllActivities" | "Mishap";

export type BookingType = "ONEWAY" | "ROUNDTRIP" | "MULTISEGMENT";

export type IbeStatus = "BOOKED" | "CONFIRM" | "CANCEL";

export type FlightType = "None" | "NonStop" | "Through" | "Direct" | "Connect" | "All";

export type PassengerType = "ADT" | "CHD" | "INF";

export type Gender = "MALE" | "FEMALE";

export type PaymentType = "CASH" | "CREDIT_CARD" | "AVIACOLLECT" | "BANK_TRANSFER" | "ANCV" | "INVOICE" | "OTHER_PAYMENT";
