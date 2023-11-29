import type { ErrorServer } from "@/api/type"
import type { IbeBooking } from "./datawings-ibe"
import type { PaymentModel } from "./datawings-payment"
import type { AvailabilityResult, FlightFareKeySelection, PassengerData, PaxPricingInfo } from "./datawings-xsd"

export enum SeStep {
  HOMEPAGE = 0,
  DEPART = 1,
  RETURN = 2,
//   SUMMARY = 3,
  PASSENGER = 4,
  EXTRA_OPTION = 5,
  PAYMENT = 6,
  FINISHED = 7,
}
export enum BookingType {
  ONEWAY = 'ONEWAY',
  ROUNDTRIP = 'ROUNDTRIP',
  MULTISEGMENT = 'MULTISEGMENT'
}
export enum BookingClass {
  ECONOMY = 'ECONOMY',
  PREMIUM = 'PREMIUM',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

export interface SeForm {
  idAutoHide: string
  bookingType: BookingType
  fromCode: string
  toCode: string
  departDate?: Date
  retourDate?: Date
  nbAdt: number
  nbChd: number
  nbInf: number
  bookingClass: BookingClass,
  promoCode: string
}

export interface SeData {
  step: SeStep;
  dataKey: string;
  seForm: SeForm;
  showStepBarBox: boolean;
  // availabilityData: AvailabilityResult | null;
  //dateSelected: {depart?: Date, retour?: Date};
  //Record<string, any> | null
}
export interface AvailData {
  dataKey: string;
  availabilityData?: AvailabilityResult | null;
  //dateSelected?: {depart?: Date, retour?: Date};
  //Record<string, any> | null
  flightFareKeySelections?: FlightFareKeySelection[];
  passengerData?: PassengerData;
  paxPricingInfos?: PaxPricingInfo[];
  booking?: any;
  ibeBooking?: IbeBooking;
  pmModel?: PaymentModel;
  errorServer?: ErrorServer;
  reloadSlick?: boolean;
  arrivalTime?: Date;
}


/** IbeBookingData */
export interface IbeData {
  dataKey: string;
  seForm: SeForm;
  availabilityData?: AvailabilityResult | null;
  flightFareKeySelections?: FlightFareKeySelection[];
  passengerData?: PassengerData;
  paxPricingInfos?: PaxPricingInfo[];
  booking: any;
  ibeBooking?: IbeBooking;
  bookingId: number;
}

export interface ActivatorSlotProps {
  click: () => void,
  autocomplete: string,
  class: Array<any>,
  ref: string
}

export type VoidFunctionType = (...args: any[]) => void;

export interface IVoidFunction {
  (...args: any[]): void;
}

export interface IBooleanFunction {
  (...args: any[]): boolean;
}

export enum DataKeys {
  X_Redirect = "x_redirect",
  X_Jwt_Auth = "x_jwt_auth",
  X_Auth_Token = "x_auth_token",
  X_Token = "x_token",
  X_data = "x_data",

  Auth_Data = "auth_data",

}

export interface CityPair {
  orig: string,
  dest: string,
  includesTaxesAndFees?: number
}

export interface ITranslate {
  code: string,
  text?: string
}

export interface ICsrfToken {
  name: string,
  token: string,
  setCsrf: (obj: any) => Object
}

export interface Position {
  top: number
  left: number
  width?: number
  display?: string
  'min-width'?: string
}


export interface ActivatorPopper {
  closePopper: () => void
  openPopper: () => void
  popperState: () => boolean
  inputFocus: () => void
}



// types for autocomplete
export interface AutocompleteElm {
  clearSelectedItem: () => void
}
export type SelectItemKey = string | ((item: Record<string, any>, fallback?: any) => any)
export type FilterFunction = (query: string, item?: any) => boolean

export interface DateFare {
  date: Date;
  avail: boolean;
  currency?: string;
  amt?: number;
  lowestFare?: boolean;
}

export type DatePickerVisibility = 'click' | 'hover' | 'hover-focus' | 'focus';

export interface CtxData {
	basePath: string;
	contextPath: string;
}

// export interface ErrorServer {
//   code: string;
//   rawMessage: string;
// }