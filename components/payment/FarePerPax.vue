<script setup lang="ts">
import { computed } from 'vue'
import { useAvailState } from '@/stores/availData';
import { useI18n_ } from '@/plugins/i18n';
import { amountFormat } from '@/common/commons';
import MessageText from '../utils/MessageText.vue';
import InputForm from '../forms/standard/InputForm.vue';

const prop = defineProps<{
	passengerIndex: number,
	seviceFee: number|string,
	adjustment: number|string,
	otherCharges: number|string,
	errorServiceFee?: Array<string>,
	errorAdjustment?: Array<string>,
	errorOtherCharges?: Array<string>,
}>()

const emits = defineEmits<{
	(e: 'update:seviceFee', val: number|string): void,
	(e: 'update:adjustment', val: number|string): void,
	(e: 'update:otherCharges', val: number|string): void,
}>()


const availStore = useAvailState()
const { locale } = useI18n_()


const passenger = computed(() => availStore.data.ibeBooking?.passengers.find((p: any) => p.paxIndex === prop.passengerIndex))

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

const updateServiceFee = (e: any) => {
	const val = e.target.value
	let val_ = Number(val);
	if (isNaN(val_)) {
		val_ = 0
	}
	if (passenger.value) {
		passenger.value.aviahubServiceFee.serviceFee = val_
	}
	emits('update:seviceFee', val)
}
const updateAdjustment = (e: any) => {
	const val = e.target.value
	let val_ = Number(e);
	if (isNaN(val_)) {
		val_ = 0
	}
	if (passenger.value) {
		passenger.value.aviahubServiceFee.adjustment = val_
	}
	emits('update:adjustment', val)
}
const updateOtherCharge = (e: any) => {
	const val = e.target.value
	let val_ = Number(e);
	if (isNaN(val_)) {
		val_ = 0
	}
	if (passenger.value) {
		passenger.value.aviahubServiceFee.otherCharges = val_
	}
	emits('update:otherCharges', val)
}
</script>

<template>
	<template v-if="passenger">
		<div class="row d-flex align-items-center boxpaxfee">
			<div class="col-sm-12">
				<div class="row form_flight_line d-flex align-items-center">
					<div class="col-sm-1 width-pax-num">
						<span class="paxnum">{{ passenger.paxIndex + 1 }}</span>
					</div>
					<div class="col-sm-7">
						<MessageText tag="span" code="se.form.payment.passengerName" text=".Passenger name" /><br/>
						<h5 class="fw-bold">{{ passenger.firstName }} / {{ passenger.lastName }} {{ passenger.title }} ({{ passenger.passengerType }})</h5>
					</div>
					<!-- <div class="col-sm-5 text-end">
						<span>Ticket number</span><br>
						<span class="fw-bold">[ 2410507206 ]</span>
					</div> -->
				</div>
				<div class="row mt-3">
					<div class="col-sm-1">
						<MessageText tag="span" code="se.form.payment.fare" text=".Fare" /><br/>
						<span class="fw-bold">{{ amountFormat(fareDetail.fare, fareDetail.currency, locale)  }}</span>
					</div>
					<div class="col-sm-1 text-nowrap">
						<MessageText tag="span" code="se.form.payment.otherTax" text=".Other tax" /><br/>
						<span class="fw-bold">{{ amountFormat(fareDetail.taxes - fareDetail.yq, fareDetail.currency, locale) }}</span>
					</div>
					<div class="col-sm-1">
						<span>YQ</span><br>
						<span class="fw-bold">{{ amountFormat(fareDetail.yq, fareDetail.currency, locale) }}</span>
					</div>
					<div class="col-sm-1">
						<span>Total tkt</span><br>
						<span class="fw-bold">{{ amountFormat(fareDetail.fare + fareDetail.taxes, fareDetail.currency, locale) }}</span>
					</div>
					<div class="col-sm-2 text-center">
						<InputForm inupt-class="form-control borderstyle mx-auto" :model-value="seviceFee" :error-msg="errorServiceFee"
							@change="updateServiceFee" >
							<template #label>
								<MessageText tag="span" code="se.form.payment.serviceFee" text=".Service fee" />
							</template>
						</InputForm>
					</div>
					<div class="col-sm-2 text-nowrap text-center">
						<InputForm inupt-class="form-control borderstyle mx-auto" :model-value="adjustment" :error-msg="errorAdjustment"
							@change="updateAdjustment" >
							<template #label>
								<MessageText tag="span" code="se.form.payment.adjustment" text=".Adjustment (+/-)" />
							</template>
						</InputForm>
					</div>
					<div class="col-sm-2 text-nowrap text-center">
						<InputForm inupt-class="form-control borderstyle mx-auto" :model-value="otherCharges" :error-msg="errorOtherCharges"
							@change="updateOtherCharge" >
							<template #label>
								<MessageText tag="span" code="se.form.payment.otherCharges" text=".Other charges" />
							</template>
						</InputForm>
					</div>
					<div class="col-sm-2 text-end">
						<div class="float-end">
							<MessageText tag="span" code="se.form.payment.grandTotal" text=".Grand total" /><br/>
							<span class="fw-bold">{{ amountFormat(fareDetail.total + Number(seviceFee) + Number(adjustment) + Number(otherCharges), fareDetail.currency, locale) }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</template>
</template>

<style lang="scss" scoped></style>