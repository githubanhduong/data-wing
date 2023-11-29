<script setup lang="ts">
import { computed } from 'vue'
import { useAvailState } from '@/stores/availData';
import { useI18n_ } from '@/plugins/i18n';
import { amountFormat } from '@/common/commons';
import MessageText from '../utils/MessageText.vue';

const prop = defineProps<{
	passengerIndex: number
}>()


const availStore = useAvailState()
const { locale } = useI18n_()


const passenger = computed(() => availStore.data.ibeBooking?.passengers.find((p: any) => p.paxIndex==prop.passengerIndex))

const fareDetail = computed(() => {
	const paxFareDetail = {currency: availStore.data.ibeBooking?.currencyCode || 'USD', fare: 0.0, taxes: 0.0, yq: 0.0, discount: 0.0, total: 0.0}
	availStore.data.ibeBooking?.journeys.forEach(jn => {
		jn.fares.forEach(fareSmg => {
			const paxFare = fareSmg.passengerFares.find(f => f.passengerType == passenger.value?.passengerType)
			if (paxFare) {
				paxFareDetail.fare += paxFare.fares
				paxFareDetail.taxes += paxFare.taxes
				paxFareDetail.yq += paxFare.yqTaxes
				paxFareDetail.discount += paxFare.discount
				paxFareDetail.total += paxFare.total
			}
		});
	})
	// INF fees
	if (passenger.value?.passengerFees && passenger.value?.passengerFees.length > 0) {
		passenger.value?.passengerFees.forEach(paxFee => {
			paxFee.serviceCharges.forEach(sc => {
				paxFareDetail.taxes += sc.amount
				paxFareDetail.total += sc.amount
			})
		})
	}

	return paxFareDetail;
})
// const parseInputToNumber = (inputVal: string) => {
// 	if (inputVal)
// 		return Number(inputVal)
// 	return inputVal
// }
</script>

<template>
	<template v-if="passenger">
		<div class="col-sm-1 lineleft">
			<span class="paxnum">{{ passenger.paxIndex + 1 }}</span>
		</div>
		<div class="col-sm-11">
			<div class="row form_flight_line">
				<div class="col-sm-7">
					<MessageText tag="span" code="se.form.payment.passengerName" text=".Passenger name" /><br/>
					<span class="fw-bold">{{ passenger.firstName }} / {{ passenger.lastName }} {{ passenger.title }} ({{ passenger.passengerType }})</span>
				</div>
				<!-- <div class="col-sm-5 text-end">
					<span>Ticket number</span><br>
					<span class="fw-bold">[ 2410507206 ]</span>
				</div> -->
			</div>
			<div class="row mt-3">
				<div class="col-sm-2">
					<MessageText tag="span" code="se.form.payment.fare" text=".Fare" /><br/>
					<span class="fw-bold">{{ amountFormat(fareDetail.fare, fareDetail.currency, locale)  }}</span>
				</div>
				<div class="col-sm-2">
					<MessageText tag="span" code="se.form.payment.otherTax" text=".Other tax" /><br/>
					<span class="fw-bold">{{ amountFormat(fareDetail.taxes - fareDetail.yq, fareDetail.currency, locale) }}</span>
				</div>
				<div class="col-sm-2">
					<span>YQ</span><br>
					<span class="fw-bold">{{ amountFormat(fareDetail.yq, fareDetail.currency, locale) }}</span>
				</div>
				<div class="col-sm-2">
					<MessageText tag="span" code="se.form.payment.serviceFee" text=".Service fee" /><br/>
					<input type="text" class="form-control borderstyle" v-model="passenger.aviahubServiceFee.serviceFee">
				</div>
				<div class="col-sm-2">
					<MessageText tag="span" code="se.form.payment.adjustment" text=".Adjustment (+/-)" /><br/>
					<input type="text" class="form-control borderstyle" v-model="passenger.aviahubServiceFee.adjustment">
				</div>
				<div class="col-sm-2">
					<div class="float-end">
						<MessageText tag="span" code="se.form.payment.grandTotal" text=".Grand total" /><br/>
						<span class="fw-bold">{{ amountFormat(fareDetail.total + Number(passenger.aviahubServiceFee.adjustment) + Number(passenger.aviahubServiceFee.serviceFee), fareDetail.currency, locale) }}</span>
					</div>
				</div>
			</div>
		</div>
	</template>
</template>

<style lang="scss" scoped></style>