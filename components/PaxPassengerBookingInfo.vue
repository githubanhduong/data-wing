<script setup lang="ts">
import { useI18n_ } from '@/plugins/i18n';
import { amountFormat } from '@/common/commons';
import MessageText from './utils/MessageText.vue';
import type { Passenger } from '@/common/datawings-ibe';

const prop = defineProps<{
    passengerIndex: number,
    seviceFee: number | string,
    adjustment: number | string,
    errorServiceFee?: Array<string>,
    errorAdjustment?: Array<string>,
    passengerPaxFareDetail: {passenger: Passenger, fareDetail: {currency: string, fare: number, taxes: number, yq: number, discount: number, total: number} },
}>()




// const availStore = useAvailState()
const { locale } = useI18n_()



// const parseInputToNumber = (inputVal: string) => {
// 	if (inputVal)
// 		return Number(inputVal)
// 	return inputVal
// }


</script>

<template>
    <template v-if="passengerPaxFareDetail.passenger">
        <div class="row d-flex align-items-center boxpaxfee">
            <div class="col-sm-12">
                <div class="row form_flight_line d-flex align-items-center">
                    <div class="col-sm-1 width-pax-num">
                        <span class="paxnum">{{ passengerPaxFareDetail.passenger.paxIndex + 1 }}</span>
                    </div>
                    <div class="col-sm-6">
                        &nbsp;<MessageText tag="span" code="se.form.payment.passengerName" text=".Passenger name" /><br />
                        <span class="fw-bold">&nbsp;&nbsp;{{ passengerPaxFareDetail.passenger.firstName }} / {{ passengerPaxFareDetail.passenger.lastName }} {{ passengerPaxFareDetail.passenger.title }} ({{
                            passengerPaxFareDetail.passenger.passengerType }})</span>
                    </div>
                    <!-- <div class="col-sm-5 text-end">
						<span>Ticket number</span><br>
						<span class="fw-bold">[ 2410507206 ]</span>
					</div> -->
                </div>
                <div class="row mt-3">
                    <div class="col-sm-1">
                        <MessageText tag="span" code="se.form.payment.fare" text=".Fare" /><br />
                        <span class="fw-bold">{{ amountFormat(passengerPaxFareDetail.fareDetail.fare, passengerPaxFareDetail.fareDetail.currency, locale) }}</span>
                    </div>
                    <div class="col-sm-1 text-nowrap text-center p-0">
                        <MessageText tag="span" code="se.form.payment.otherTax" text=".Other tax" /><br />
                        <span class="fw-bold">{{ amountFormat(passengerPaxFareDetail.fareDetail.taxes - passengerPaxFareDetail.fareDetail.yq, passengerPaxFareDetail.fareDetail.currency, locale) }}</span>
                    </div>
                    <div class="col-sm-1 text-center">
                        <span>YQ</span><br>
                        <span class="fw-bold">{{ amountFormat(passengerPaxFareDetail.fareDetail.yq, passengerPaxFareDetail.fareDetail.currency, locale) }}</span>
                    </div>
                    <div class="col-sm-1 text-nowrap">
						<span>Total tkt</span><br>
						<span class="fw-bold">{{ amountFormat(passengerPaxFareDetail.fareDetail.fare + passengerPaxFareDetail.fareDetail.taxes, passengerPaxFareDetail.fareDetail.currency, locale) }}</span>
					</div>
                    <div class="col-sm-2 text-center">
                        <MessageText tag="span" code="se.form.payment.serviceFee" text=".Service fee" /><br>
                        <span class="fw-bold">{{ amountFormat(prop.seviceFee as number, passengerPaxFareDetail.fareDetail.currency, locale) }}</span>
                    </div>

                    <div class="col-sm-2 text-nowrap text-center">
                        <MessageText tag="span" code="se.form.payment.adjustment" text=".Adjustment (+/-)" /><br/>
                        <span class="fw-bold">{{ amountFormat(prop.adjustment as number, passengerPaxFareDetail.fareDetail.currency, locale) }}</span>
                    </div>
                    <div class="col-sm-4">
                        <div class="float-end text-end">
                            <MessageText tag="span" code="se.form.payment.grandTotal" text=".Grand total" /><br />
                            <span class="fw-bold">{{ amountFormat(passengerPaxFareDetail.fareDetail.total + Number(seviceFee) + Number(adjustment),
                                passengerPaxFareDetail.fareDetail.currency, locale) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </template>
</template>

<style lang="scss" scoped></style>