<script setup lang="ts">
import { amountFormat } from '@/common/commons';
import type { PaxFareDetail } from '@/common/datawings-payment';
import MessageText from './utils/MessageText.vue';

defineProps<{
	totalFareDetail: PaxFareDetail,
	locale: string,
	vat: number
}>()

</script>

<template>
	<div class="col-sm-12">
		<div class="row">
			<div class="col-sm-1 text-nowrap">
				<MessageText tag="span" code="se.form.payment.totalFare" text=".Total Fare" /><br/>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.fare, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-1 text-nowrap text-center p-0">
				<MessageText tag="span" code="se.form.payment.totalTax" text=".Total tax" /><br/>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.taxes - totalFareDetail.yq, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-1 text-center">
				<span>YQ</span><br>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.yq, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-1 text-nowrap">
				<span>Total tkt</span><br>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.fare + totalFareDetail.taxes, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-center">
				<MessageText tag="span" code="se.form.payment.totalServiceFee" text=".Total Service fee" /><br/>
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
			<div class="col-sm-1 text-start p-0">
				<div class="form-group mb-0">
					<div class="input_wrrapper input-vat">
						<span>
							<i class="fas fa-percent fa-size-14-px"></i>
						</span>
						<span type="text" class="form-control" autocomplete="off" value=0>
							{{ vat }}
						</span>
					</div>
				</div>
			</div>
			<div class="col-sm-2 text-end px-0">
				<span class="fw-bold">VAT ammount</span>
			</div>
			<div class="col-sm-2 text-center">
				<span class="fw-bold">{{ amountFormat(totalFareDetail.serviceFeeAmt * Number(vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-center">
				<span class="fw-bold">{{ amountFormat(totalFareDetail.adjustmentAmt * Number(vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
			<div class="col-sm-2 text-center">
				<span class="fw-bold">{{ amountFormat(totalFareDetail.otherCharges * Number(vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
			
			<div class="col-sm-2 text-end">
				<span class="fw-bold">{{ amountFormat((totalFareDetail.serviceFeeAmt + totalFareDetail.adjustmentAmt + totalFareDetail.otherCharges) * Number(vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
		</div>
		<div class="row d-flex align-items-center mt-2">
			<div class="col-sm-12 text-end">
				<span class="fw-bold">Total (VAT include) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
				<span class="fw-bold">{{ amountFormat(totalFareDetail.total + (totalFareDetail.adjustmentAmt + totalFareDetail.serviceFeeAmt + totalFareDetail.otherCharges) * Number(vat)/100, totalFareDetail.currency, locale) }}</span>
			</div>
		</div>
	</div>
</template>