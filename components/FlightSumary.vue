<script setup lang='ts'>
import type { FlightAvailability, OfferItem } from '@/common/datawings-xsd';
import { computed } from 'vue';
import { durationHHmm, durationX } from '@/common/dw-luxon';
import { getTimezoneId } from '@/common/timezoneUtils';
import DurationText from '@/components/utils/DurationText.vue'
import StopDetail from '@/components/utils/StopDetail.vue'
import AirlineLogo from '@/components/utils/AirlineLogo.vue'
import DateConvertTimezone from './utils/DateConvertTimezone.vue';
import { generateUUID } from '@/common/commons';
import MessageText from './utils/MessageText.vue';

const props = defineProps({
	offerItem: Object as () => OfferItem,
	flights: Array<FlightAvailability>
})

const flightTimeFormat = 'HH:mm'
const flightDateFormat = 'dd MMM'
const uuid = generateUUID()

console.log({ ...props });

const firstFlight = computed(() => (props.flights && props.flights.length > 0) ? props.flights[0] : null)
const lastFlight = computed(() => (props.flights && props.flights.length > 0) ? props.flights[props.flights.length - 1] : null)

const flightDetail = computed(() => {
	if (firstFlight.value && lastFlight.value) {
		return {
			from: firstFlight.value.origin,
			to: lastFlight.value.destination,
			timeDeparture: firstFlight.value.departure,
			timeArrival: lastFlight.value.arrival,
			duration: durationX(firstFlight.value.departure, lastFlight.value.arrival)
		}
	}
	return null
})

</script>

<template>
	<div class="flight_detail" v-if="flights">
		<div class="row">
			<div class="col-sm-6 mb-4">
				<div class="tittle-flight-sm">
					<slot name="titleFlightDate" :origin="firstFlight?.origin" :fligthDate="firstFlight?.departure">
						Flight: {{ firstFlight?.departure }}
					</slot>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-2 text-center">
				<div class="logo-sec">
					<AirlineLogo :airline-code="firstFlight?.carrierCode ?? ''" class="img-fluid blur-up lazyloaded">
					</AirlineLogo>
					<MessageText tag="span" class="title koko" :code="`airline.name.${firstFlight?.carrierCode}`"
						:text="firstFlight?.carrierCode"></MessageText>
				</div>
			</div>
			<div class="col-md-7">
				<div class="airport-part">
					<div class="airport-name">
						<h4>
							<DateConvertTimezone :date="flightDetail?.timeDeparture" :format="flightTimeFormat"
								:timezone-id="getTimezoneId(flightDetail?.from ?? '')" />
						</h4>
						<MessageText tag="h6" :code="`airport.${flightDetail?.from}.city`" :text="flightDetail?.from" />
						<p class="code-destination">{{ flightDetail?.from }}</p>
					</div>
					<div class="airport-progress stopover">
						<img src="@/assets/images/airlines/take-off-line.png" class="float-start picicon" alt="">
						<!-- <i class="fas fa-circle"></i> -->
						<img src="@/assets/images/airlines/airport.png" class="float-end picicon" alt="">
						<div class="stop">
							<DurationText :duration="flightDetail?.duration" /><br>
							<StopDetail use-brackets :flight-type="offerItem?.flightType" :stops="offerItem?.stops" />
						</div>
					</div>
					<div class="airport-name arrival">
						<h4>
							<DateConvertTimezone :date="flightDetail?.timeArrival" :format="flightTimeFormat"
								:timezone-id="getTimezoneId(flightDetail?.to ?? '')" />
						</h4>
						<MessageText tag="h6" :code="`airport.${flightDetail?.to}.city`" :text="flightDetail?.to" />
						<p class="code-destination">{{ flightDetail?.to }}</p>
					</div>
				</div>
			</div>
			<div class="col-md-3 text-center">
				<button class="btn btn-solid-view-flight color1 collapsed arcstrider" type="button"
					data-bs-toggle="collapse" :data-bs-target="`#panelsView-collapseOne-${uuid}`" aria-expanded="false"
					aria-controls="panelsView-collapseOne">
					<MessageText tag="span" code="se.btn.view.flight_detail" text=".View flight detail"></MessageText>
					<i class="fas fa-angle-down space-padding-left"></i>
				</button>
			</div>
		</div>
		<!-- FLIGHT DETAIL -->
		<div :id="`panelsView-collapseOne-${uuid}`" class="accordion-collapse collapse arcstrider"
			aria-labelledby="panelsStayOpen-headingOne">
			<div class="accordion-body-view">
				<template v-for="(f, fidx) in flights" :key="fidx">
					<template v-for="(leg, lidx) in f.flightLegs" :key="lidx">
						<div class="row mt-3 d-flex flex-grow-1 align-items-center flight-detail-box">
							<div class="col-sm-1 text-center">
								<i class="far fa-clock"></i> {{ durationHHmm(leg.departure, leg.arrival) }}
							</div>
							<div class="col-sm-6 box-show-time">
								<div class="time-des-flight">
									<div class="dote-time-icon">
										<div class="line-time-icon"></div>
									</div>
								</div>
								<div class="time-show-text">
									<div>
										<DateConvertTimezone tag="span" class="depart-time" :date="leg.departure"
											:format="flightTimeFormat" :timezone-id="getTimezoneId(leg.origin ?? '')" />
										<br />
										<DateConvertTimezone tag="span" class="depart-time date-detial"
											:date="leg.departure" :format="flightDateFormat"
											:timezone-id="getTimezoneId(leg.origin ?? '')" />
									</div>
									<div class="mt-4">
										<DateConvertTimezone tag="span" class="depart-time" :date="leg.arrival"
											:format="flightTimeFormat"
											:timezone-id="getTimezoneId(leg.destination ?? '')" />
										<br />
										<DateConvertTimezone tag="span" class="depart-time date-detial" :date="leg.arrival"
											:format="flightDateFormat"
											:timezone-id="getTimezoneId(leg.destination ?? '')" />
									</div>
								</div>
								<div class="time-show-text">
									<div>
										<MessageText tag="span" class="depart-time" :code="`airport.${leg.origin}.name`"
											:text="`.From ${leg.origin}`">
											<template #prepend><strong class="space-padding-right">{{ leg.origin }}</strong></template>
										</MessageText><br />
										<MessageText tag="span" class="depart-time" :code="`airport.${leg.origin}.city`"
											:text="`.${leg.origin}`">
											<template #default> -
												<MessageText :code="`airport.${leg.origin}.country`" text="." />
											</template>
										</MessageText>
									</div>
									<div class="mt-4">
										<MessageText tag="span" class="depart-time" :code="`airport.${leg.destination}.name`"
											:text="`.From ${leg.destination}`">
											<template #prepend><strong class="space-padding-right">{{ f.destination	}}</strong></template>
										</MessageText><br />
										<MessageText tag="span" class="depart-time" :code="`airport.${leg.destination}.city`"
											:text="`.${leg.destination}`">
											<template #default> -
												<MessageText :code="`airport.${leg.destination}.country`" text="." />
											</template>
										</MessageText>
									</div>
								</div>
							</div>
							<div class="col-sm-3">
								<div class="row">
									<div class="col-sm-12">
										<MessageText tag="strong" code="se.flight.label.flightNumber" text=".Flight number">
										</MessageText>
										<p>{{ f.carrierCode }}{{ f.flightNumber }} - Economy</p>
									</div>
									<div class="col-sm-12 mt-3">
										<MessageText tag="strong" code="se.flight.aircraft" text=".Aircraft"></MessageText>
										<MessageText tag="p" :code="`aircraft.${leg.equipmentType}`"
											:text="`.${leg.equipmentType}`"></MessageText>
									</div>
								</div>
							</div>
							<div class="col-sm-2 d-flex">
								<div class="pe-2"><i class="fas fa-suitcase"></i></div>
								<div>
									<span>Baggage 0kg</span><br>
									<span>Baggage 0kg</span>
								</div>
							</div>

						</div>

						<div class="stopover-connect mt-4 mb-4" v-if="lidx !== f.flightLegs.length - 1">
							<div class="row d-flex flex-grow-1 align-items-center ">
								<div class="stopover-style">
									<div class="stylestop">
										<!-- <div class="shownumber-stop">
											<span class="numberstyle-stop">1</span>
										</div> -->
										<MessageText tag="span" code="se.flight.duration.ground" text=".Ground duration">
											: <DurationText :duration="durationX(leg.arrival, f.flightLegs[lidx + 1].departure)"></DurationText>
										</MessageText>
									</div>
								</div>
							</div>
						</div>
					</template>

					<div class="stopover-connect mt-4 mb-4" v-if="fidx !==flights?.length - 1">
						<div class="row d-flex flex-grow-1 align-items-center ">
							<div class="stopover-style">
								<div class="stylestop">
									<!-- <div class="shownumber-stop">
										<span class="numberstyle-stop">1</span>
									</div> -->
									<MessageText tag="span" code="se.flight.duration.ground" text=".Ground duration">
										: <DurationText :duration="durationX(f.arrival, flights[fidx + 1].departure)"></DurationText>
									</MessageText>
								</div>
							</div>
						</div>
					</div>

				</template>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>