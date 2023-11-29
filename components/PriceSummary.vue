<script setup lang='ts'>
import { useSeDataState } from '@/stores/engine';
import MessageText from './utils/MessageText.vue';
import { useAvailState } from '@/stores/availData';
import { computed } from 'vue';
import { useI18n_ } from '@/plugins/i18n';
import { amountFormat } from '@/common/commons';
import type { PaxPricingInfo } from '@/common/datawings-xsd';

const seStore = useSeDataState()
const availStore = useAvailState()
const { locale } = useI18n_()

const pricing = computed(() => {
	const data = {
		currency: "",
		totalFare: 0.0,
		totalTaxesAndFees: 0.0,
		adt: {} as PaxPricingInfo,
		chd: {} as PaxPricingInfo,
		inf: {} as PaxPricingInfo,
	}
	if (availStore.data.paxPricingInfos) {
		data.currency = availStore.data.paxPricingInfos[0].currency
		availStore.data.paxPricingInfos?.forEach(p => {
			if (p.passengerType === 'ADT') {
				(data as any).adt = p;
			} else if (p.passengerType === 'CHD') {
				(data as any).chd = p;
			} else {
				(data as any).inf = p;
			}
			data.totalFare += p.fares * p.paxCount
			data.totalTaxesAndFees += (p.taxes + p.fees) * p.paxCount
		})
	}

	return data
})
</script>

<template>
	<div class="sticky-cls-top">
		<div class="review-section">
			<div class="review_box">
				<div class="title-top">
					<MessageText tag="h5" code="se.form.payment.collapse.summary" text=".Booking summery"/>
				</div>
				<div class="flight_detail pd-20">
					<div class="summery_box">
						<div class="collapsed" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
							<div class="row">
								<div class="col-sm-12 mb-3 d-flex">
									<div class="style-box-icon">
										<div>
											<i class="fas fa-users"></i>
										</div>
									</div>
									<div class="ms-3">
										<MessageText tag="h4" class="fw-bold" code="se.passengers.label" text=".Passenger | .Passengers"
											:format="{ n: seStore.passengerDetail.totalPax }" />
										<span >
											<MessageText v-if="seStore.passengerDetail.nbAdt > 0" code="se.form.passengers.ADT"
												text=".0 Adult | .{n} Aldult | .{n} Aldults"
												:format="{ n: seStore.passengerDetail.nbAdt }" />
											<MessageText v-if="seStore.passengerDetail.nbChd > 0" code="se.form.passengers.CHD"
												text=".0 Child | .{n} Child | .{n} Children"
												:format="{ n: seStore.passengerDetail.nbChd }" />
											<MessageText v-if="seStore.passengerDetail.nbInf > 0" code="se.form.passengers.INF"
												text=".0 Infant | .{n} Infant | .{n} Infants"
												:format="{ n: seStore.passengerDetail.nbInf }" />
										</span>
									</div>
									<div class="dw-arrow-collapse">
										<i class="fas fa-caret-square-down"></i>
									</div>
								</div>
							</div>
						</div>
						<div id="collapseFive" class="collapse show" aria-labelledby="headingFive" data-bs-parent="#collapseFive">
							<div class="row">
								<div class="col-sm-6">
									<MessageText tag="span" class="fw-bold" code="se.form.passengers.sum"
										text=".| .{n} Passenger | .{n} Passengers'"
										:format="{ n: seStore.passengerDetail.totalPax }" />
								</div>
								<div class="col-sm-6 text-end">
									<span class="fw-bold">{{ amountFormat(pricing.totalFare + pricing.totalTaxesAndFees, pricing.currency, locale) }}</span>

								</div>
							</div>
							<table class="table table-borderless">
								<tbody>
									<tr>
										<td>
											<MessageText code="se.summary.total_fare" text=".Flights excluding taxes" />
										</td>
										<td>{{ amountFormat(pricing.totalFare, pricing.currency, locale) }}</td>
									</tr>
									<tr>
										<td>
											<MessageText code="se.summary.taxesAndFee" text=".Taxes and fees" />
										</td>
										<td>{{ amountFormat(pricing.totalTaxesAndFees, pricing.currency, locale) }}</td>
									</tr>
								</tbody>
							</table>
							<table v-if="seStore.passengerDetail.nbAdt > 0" class="table table-borderless mt-3">
								<tbody>
									<tr>
										<td class="fw-bold">
											<MessageText code="se.passengers.ADT" text=".Adult(s)" :format="{ n: seStore.passengerDetail.nbAdt }" />
										</td>
										<td class="fw-bold">{{ pricing.adt.paxCount }} x {{ amountFormat(pricing.adt.fares + pricing.adt.taxes + pricing.adt.fees, pricing.currency, locale) }}</td>
									</tr>
									<tr>
										<td>
											<MessageText code="se.summary.tktPrice" text=".Ticket price" />
										</td>
										<td>{{ pricing.adt.paxCount }} x {{ amountFormat(pricing.adt.fares, pricing.currency, locale) }}</td>
									</tr>
									<tr>
										<td>
											<MessageText code="se.summary.taxesAndFee" text=".Taxes and fees" />
										</td>
										<td>{{ pricing.adt.paxCount }} x {{ amountFormat(pricing.adt.taxes + pricing.adt.fees, pricing.currency, locale) }}</td>
									</tr>
								</tbody>
							</table>
							<table v-if="seStore.passengerDetail.nbChd > 0" class="table table-borderless mt-3">
								<tbody>
									<tr>
										<td class="fw-bold">
											<MessageText code="se.passengers.CHD" text=".Children" :format="{ n: seStore.passengerDetail.nbChd }" />
										</td>
										<td class="fw-bold">{{ pricing.chd.paxCount }} x {{ amountFormat(pricing.chd.fares + pricing.chd.taxes + pricing.chd.fees, pricing.currency, locale) }}</td>
									</tr>
									<tr>
										<td>
											<MessageText code="se.summary.tktPrice" text=".Ticket price" />
										</td>
										<td>{{ pricing.chd.paxCount }} x {{ amountFormat(pricing.chd.fares, pricing.currency, locale) }}</td>
									</tr>
									<tr>
										<td>
											<MessageText code="se.summary.taxesAndFee" text=".Taxes and fees" />
										</td>
										<td>{{ pricing.chd.paxCount  }} x {{ amountFormat(pricing.chd.taxes + pricing.chd.fees, pricing.currency, locale) }}</td>
									</tr>
								</tbody>
							</table>
							<table v-if="seStore.passengerDetail.nbInf > 0" class="table table-borderless mt-3">
								<tbody>
									<tr>
										<td class="fw-bold">
											<MessageText code="se.passengers.INF" text=".Infants" :format="{ n: seStore.passengerDetail.nbInf }" />
										</td>
										<td class="fw-bold">{{ pricing.inf.paxCount }} x {{ amountFormat(pricing.inf.fares + pricing.inf.taxes + pricing.inf.fees, pricing.currency, locale) }}</td>
									</tr>
								<tr>
									<td>
										<MessageText code="se.summary.tktPrice" text=".Ticket price" />
									</td>
									<td>{{ pricing.inf.paxCount }} x {{ amountFormat(pricing.inf.fares, pricing.currency, locale) }}</td>
								</tr>
								<tr v-if="pricing.inf.taxes + pricing.inf.fees > 0">
									<td>
										<MessageText code="se.summary.taxesAndFee" text=".Taxes and fees" />
									</td>
									<td>{{ pricing.inf.paxCount }} x {{ amountFormat(pricing.inf.taxes + pricing.inf.fees, pricing.currency, locale) }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="grand-total-price">
				<div class="row d-flex align-items-center">
					<div class="col-sm-6">
						<h4 class="fw-bold mb-0">
							<MessageText code="se.summary.total" text=".Total amount">:</MessageText>
						</h4>
					</div>
					<div class="col-sm-6 text-end">
						<h4 class="fw-bold mb-0">{{ amountFormat(pricing.totalFare + pricing.totalTaxesAndFees, pricing.currency, locale) }}</h4>
					</div>
				</div>
			</div>
		</div>
	</div>
</div></template>