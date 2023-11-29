/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2023-06-28 12:08:09.

export interface AvailabilityResult extends Serializable {
    flights: { [index: string]: FlightAvailability };
    fares: { [index: string]: FareReference };
    tripOffers: TripOffer[];
    flexible: number;
}

export interface ContactInfo extends Serializable {
    phoneCountryCode: string;
    phoneNumber: string;
    email: string;
    emailConfirm: string;
}

export interface FareAvailability extends Serializable {
    fareBasisCode: string;
    classe: string;
    classType: string;
    fareAppType: FareAppType;
    fareStatus: FareStatus;
    productClass: string;
    ruleNumber: string;
    ruleTariff: string;
    reference: string;
    passengerFares: PassengerFareAvailability[];
}

export interface FareRefDetail extends Serializable {
    availableCount: number;
    status: ClassStatus;
    reference: string;
    serviceBundleSetCode: string;
}

export interface FareReference extends Serializable {
    fareAvailKey: string;
    currencyCode: string;
    total: FareTotal;
    fares: FareAvailability[];
}

export interface FareTotal extends Serializable {
    currencyCode: string;
    total: number;
    fare: number;
    tax: number;
    fee: number;
}

export interface FlightAvailability extends Serializable {
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
    flightLegs: FlightLeg[];
}

export interface FlightFareKeySelection extends Serializable {
    flightDate: Date;
    journeyKey: string;
    fareKey: string;
}

export interface FlightLeg extends Serializable {
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

export interface JourneyFareRef extends Serializable {
    fareAvailKey: string;
    details: FareRefDetail[];
}

export interface JourneyOffer extends Serializable {
    date: Date;
    offers: { [index: string]: OfferItem[] };
}

export interface OfferItem extends Serializable {
    flightType: FlightType;
    stops: number;
    offerKey: string;
    listFlightIds: string[];
    fareRefs: JourneyFareRef[];
}

export interface Passenger extends Serializable {
    passengerType: PassengerType;
    gender: string;
    title: string;
    firstName: string;
    lastName: string;
    middleName: string;
    dateOfBirth?: Date;
    nationality: string;
    identityType: string;
    identityNumber: string;
    idExpirationDate?: Date;
}

export interface PassengerData extends Serializable {
    passengers: Passenger[];
    contactInfo: ContactInfo;
}

export interface PassengerFareAvailability extends Serializable {
    passengerType: PassengerType;
    currencyCode: string;
    totalAmt: number;
    fareAmt: number;
    taxAmt: number;
    multiplier: number;
    serviceChargeDetails: ServiceCharge[];
}

export interface PaxPricingInfo extends Serializable {
    passengerType: PassengerType;
	currency: string;
    fares: number;
    taxes: number;
    fees: number;
    paxCount: number;
}

export interface TripOffer extends Serializable {
    journeyAvails: JourneyOffer[];
}

export interface Serializable {
}

export interface ServiceCharge extends Serializable {
    amount: number;
    currencyCode: string;
    code: string;
    type: ChargeType;
    collectType: CollectType;
    ticketCode: string;
}

export type FareAppType = "Route" | "Sector" | "Governing";

export type FareStatus = "Default" | "SameDayStandBy" | "FareOverrideConfirming" | "PublishedFareOverrideConfirming" | "PublishedFareOverrideConfirmed";

export type ClassStatus = "Active" | "InActive" | "AvsOpen" | "AvsOnRequest" | "AvsClosed";

export type SegmentType = "Normal" | "CodeShareOperating" | "CodeShareMarketing" | "InterlineOutbound" | "InterlineInbound" | "Passive";

export type CodeShareIndicator = "NonCodeShare" | "CodeShareCommercialDuplicate" | "SharedDesignatorOrWetLease" | "CodeShareHostOperatingCarrier" | "CodeShareCommercialDuplicateWithOverrideText" | "SharedDesignatorOrWetLeaseWithOverrideText";

export type FlightLegStatus = "Normal" | "Closed" | "Canceled" | "Suspended" | "ClosedPending" | "BlockAllActivities" | "Mishap";

export type FlightType = "None" | "NonStop" | "Through" | "Direct" | "Connect" | "All";

export type PassengerType = "ADT" | "CHD" | "INF" | "INFF";

export type ChargeType = "FarePrice" | "Discount" | "IncludedTravelFee" | "IncludedTax" | "TravelFee" | "Tax" | "ServiceCharge" | "PromotionDiscount" | "ConnectionAdjustmentAmount" | "AddOnsPrice" | "FarePoints" | "DiscountPoints" | "IncludedAddOnsFee" | "AddOnsFee" | "AddOnsMarkup" | "FareSurcharge" | "AddOnsCancelFee" | "Calculated" | "Note" | "Points" | "DynamicFareAdjustment";

export type CollectType = "SellerChargeable" | "ExternalChargeable" | "SellerNonChargeable" | "ExternalNonChargeable" | "ExternalChargeableImmediate";
