<script setup lang="ts">
import { amountFormat } from '@/common/commons';
import MessageText from '../utils/MessageText.vue';
import type { PaxFareDetail } from '@/common/datawings-payment';
import { useAvailState } from '@/stores/availData';

defineProps<{
	totalFareDetail: PaxFareDetail,
	locale: string
}>()

const availStore = useAvailState()

const emits = defineEmits<{
	(e: 'update:vat', val: number|string): void,
}>()

const updateVAT = (e: any) => {
	const val = e.target.value
	let val_ = Number(val);
	if (isNaN(val_)) {
		val_ = 0
	}
	if (availStore) {
		availStore.data.pmModel!.vat = val_
	}
	emits('update:vat', val)
}
</script>

<template>
	<div class="col-sm-12">
		<div class="row">
			<div class="col-sm-12 pb-2">
				<span class="fw-bold">Total (No VAT)</span>
			</div>
		</div>
		<div class="row">
			<div class="col-sm-1">
				<MessageText tag="span" code="se.form.payment.fare" text=".Fare" /><br/>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.fare, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-1 text-nowrap">
				<MessageText tag="span" code="se.form.payment.otherTax" text=".Other tax" /><br/>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.taxes - totalFareDetail.yq, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-1">
				<span>YQ</span><br>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.yq, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-1">
				<span>Total tkt</span><br>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.fare + totalFareDetail.taxes, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-center">
				<MessageText tag="span" code="se.form.payment.serviceFee" text=".Service fee" /><br/>
				<span class="fw-bold text-right">{{ amountFormat(totalFareDetail.serviceFeeAmt, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-nowrap text-center">
				<MessageText tag="span" code="se.form.payment.adjustment" text=".Adjustment (+/-)" /><br/>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.adjustmentAmt, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-center">
				<MessageText tag="span" code="se.form.payment.otherCharges" text=".Other charges" /><br/>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.otherCharges, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-end">
				<div class="float-end">
					<MessageText tag="span" code="se.form.payment.grandTotal" text=".Grand total" /><br/>
					<span class="fw-bold">{{ amountFormat(totalFareDetail.total, totalFareDetail.currency, locale) }}</span>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-sm-6 offset-sm-4">
				<div class="dropdown-divider-line"></div>
			</div>
		</div>
		<div class="row d-flex align-items-center mt-3">
			<div class="col-sm-1 text-end">
				<span class="fw-bold">VAT</span>
			</div>
			<div class="col-sm-1 text-center p-0">
				<div class="form-group mb-0">
					<div class="input_wrrapper input-vat">
						<span>
							<i class="fas fa-percent fa-size-14-px"></i>
						</span>
						<input type="text" class="form-control" autocomplete="off" @change="updateVAT" value=0>
					</div>
				</div>
			</div>
			<div class="col-sm-2 text-end text-nowrap">
				<span class="fw-bold">VAT ammount</span>
			</div>
			<div class="col-sm-2 text-center">
				<span class="fw-bold">{{ amountFormat(totalFareDetail.serviceFeeAmt * Number(availStore.data.pmModel!.vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-center">
				<span class="fw-bold">{{ amountFormat(totalFareDetail.adjustmentAmt * Number(availStore.data.pmModel!.vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-center">
				<span class="fw-bold">{{ amountFormat(totalFareDetail.otherCharges * Number(availStore.data.pmModel!.vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-end">
				<span class="fw-bold">{{ amountFormat(totalFareDetail.vatAmount, totalFareDetail.currency, locale) }}</span>
			</div>
		</div>
		<div class="row d-flex align-items-center mt-2">
			<div class="col-sm-12 text-end">
				<span class="fw-bold">Total (VAT include) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.total + (totalFareDetail.adjustmentAmt + totalFareDetail.serviceFeeAmt + totalFareDetail.otherCharges) * Number(availStore.data.pmModel!.vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
		</div>
	</div>
</template>