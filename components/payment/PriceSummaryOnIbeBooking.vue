<script setup lang="ts">
import MessageText from '../utils/MessageText.vue';
import { amountFormat } from '@/common/commons';
import type { SummaryDetail } from '@/common/datawings-payment';


defineProps<{
	summaryDetail: SummaryDetail,
	locale: string
}>()


</script>

<template>
	<div class="sticky-cls-top">
		<div class="review-section">
			<div class="review_box">
				<div class="title-top">
					<MessageText tag="h5" code="se.form.payment.collapse.summary" text=".Booking summery"/>
				</div>
				<!-- <div class="flight_detail">
					-- Flights --
				</div> -->
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
									<div class="ms-3 extra-option-pas">
										<MessageText tag="h4" class="fw-bold" code="se.passengers.label" text=".Passenger | .Passengers" :format="{ n: summaryDetail.summmary.ADT.nbPax + summaryDetail.summmary.CHD.nbPax + summaryDetail.summmary.INF.nbPax }" />
										<span>
											<MessageText v-if="summaryDetail.summmary.ADT.nbPax > 0" code="se.form.passengers.ADT"
												text=".0 Adult | .{n} Aldult | .{n} Aldults"
												:format="{ n: summaryDetail.summmary.ADT.nbPax }" />
											<MessageText v-if="summaryDetail.summmary.CHD.nbPax > 0" code="se.form.passengers.CHD"
												text=".0 Child | .{n} Child | .{n} Children"
												:format="{ n: summaryDetail.summmary.CHD.nbPax }" />
											<MessageText v-if="summaryDetail.summmary.INF.nbPax > 0" code="se.form.passengers.INF"
												text=".0 Infant | .{n} Infant | .{n} Infants"
												:format="{ n: summaryDetail.summmary.INF.nbPax }" />
										</span>
									</div>
									<div class="dw-arrow-collapse">
										<i class="fas fa-caret-square-down"></i>
									</div>
								</div>
							</div>
						</div>
						<div id="collapseFive" class="collapse show" aria-labelledby="headingFive" data-bs-parent="#collapseFive">
							<div class="card-body-extra">
								<div class="row mt-3">
									<div class="col-sm-6">
										<MessageText tag="span" class="fw-bold" code="se.form.passengers.sum" text=".| .{n} Passenger | .{n} Passengers'" :format="{ n: summaryDetail.summmary.ADT.nbPax + summaryDetail.summmary.CHD.nbPax + summaryDetail.summmary.INF.nbPax }" />
									</div>
									<div class="col-sm-6 text-end">
										<span class="fw-bold">{{ amountFormat(summaryDetail.total.total, summaryDetail.total.currency, locale) }}</span>
									</div>
								</div>
								<table class="table table-borderless">
									<tbody>
										<tr>
											<td><MessageText code="se.summary.total_fare" text=".Flights excluding taxes" /></td>
											<td>{{ amountFormat(summaryDetail.total.fare, summaryDetail.total.currency, locale) }}</td>
										</tr>
										<tr>
											<td><MessageText code="se.summary.taxesAndFee" text=".Taxes and fees" /></td>
											<td>{{ amountFormat(summaryDetail.total.taxes, summaryDetail.total.currency, locale) }}</td>
										</tr>
										<tr v-if="summaryDetail.total.discount > 0">
											<td><MessageText code="se.summary.discounts" text=".Discounts" /></td>
											<td>{{ amountFormat(summaryDetail.total.discount, summaryDetail.total.currency, locale) }}</td>
										</tr>
										<tr v-if="summaryDetail.total.serviceFeeAmt + summaryDetail.total.adjustmentAmt > 0">
											<td><MessageText code="se.summary.totalAviahubFee" text=".Total aviahub fees" /></td>
											<td>{{ amountFormat(summaryDetail.total.serviceFeeAmt + summaryDetail.total.adjustmentAmt, summaryDetail.total.currency, locale) }}</td>
										</tr>
										<tr v-if="summaryDetail.total.otherCharges > 0">
											<td><MessageText code="se.summary.otherCharges" text=".Other Charges" /></td>
											<td>{{ amountFormat(summaryDetail.total.otherCharges, summaryDetail.total.currency, locale) }}</td>
										</tr>
										<tr v-if="summaryDetail.total.vatAmount > 0">
											<td><MessageText code="se.summary.vat" text=".Total VAT" /></td>
											<td>{{ amountFormat(summaryDetail.total.vatAmount, summaryDetail.total.currency, locale) }}</td>
										</tr>
									</tbody>
								</table>
								<template v-for="(summary, key) in summaryDetail.summmary" :key="key">
									<table v-if="summary.nbPax > 0" class="table table-borderless mt-3">
										<tbody>
											<tr>
												<td class="fw-bold"><MessageText :code="`se.passengers.${summary.paxType}`" :text="`.${summary.paxType}`" :format="{ n: summary.nbPax }" /></td>
												<td class="fw-bold">{{ amountFormat(summary.total, summary.currency, locale) }}</td>
											</tr>
											<tr>
												<td><MessageText code="se.summary.tktPrice" text=".Ticket price" /></td>
												<td>{{ summary.nbPax }} x {{ amountFormat(summary.base.fare, summary.currency, locale) }}</td>
											</tr>
											<tr v-if="summary.base.discount > 0">
												<td><MessageText code="se.summary.discounts" text=".Discounts" /></td>
												<td>{{ summary.nbPax }} x {{ amountFormat(summary.base.discount, summary.currency, locale) }}</td>
											</tr>
											<tr>
												<td><MessageText code="se.summary.taxesAndFee" text=".Taxes and fees" /></td>
												<td>{{ summary.nbPax }} x {{ amountFormat(summary.base.taxes, summary.currency, locale) }}</td>
											</tr>
											<tr v-if="summary.totalPaxFees > 0">
												<td><MessageText code="se.summary.otherServiceFees" text=".Other service fees" /></td>
												<td>{{ amountFormat(summary.totalPaxFees, summary.currency, locale) }}</td>
											</tr>
											<tr v-if="summary.totalAviahubFees > 0">
												<td><MessageText code="se.summary.totalAviahubFee" text=".Total aviahub fees" /></td>
												<td>{{ amountFormat(summary.totalAviahubFees, summary.currency, locale) }}</td>
											</tr>
										</tbody>
									</table>
								</template>
							</div>
						</div>
					</div>
				</div>
				<div class="grand-total-price">
					<div class="row d-flex align-items-center">
						<div class="col-sm-8">
							<h4 class="fw-bold mb-0">
								<MessageText code="se.summary.total" text=".Total amount(VAT)">(VAT):</MessageText>
							</h4>
						</div>
						<div class="col-sm-4 text-end">
							<h4 class="fw-bold mb-0">{{ amountFormat(summaryDetail.total.total + summaryDetail.total.vatAmount, summaryDetail.total.currency, locale) }}</h4>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>