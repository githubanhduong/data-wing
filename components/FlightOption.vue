<script setup lang="ts">
import type { FareReference, FlightAvailability, OfferItem } from '@/common/datawings-xsd'
import { computed, ref, type PropType } from 'vue'
import { dateToStringWithTimzone, durationX, durationHHmm, getUtc } from '@/common/dw-luxon'
import { amountFormat, generateUUID } from '@/common/commons'
import { getTimezoneId } from '@/common/timezoneUtils'
import { useI18n_ } from '@/plugins/i18n'
import DurationText from '@/components/utils/DurationText.vue'
import StopDetail from '@/components/utils/StopDetail.vue'
import AirlineLogo from '@/components/utils/AirlineLogo.vue'
import MessageText from '@/components/utils/MessageText.vue'
import DateConvertTimezone from './utils/DateConvertTimezone.vue'
import { useSeDataState } from '@/stores/engine'
import { useAvailState } from '@/stores/availData'

const props = defineProps({
	flightDate: Date,
	item: Object as () => OfferItem,
	flights: Array<FlightAvailability>,
	fares: Array<FareReference>,
	selectionAction: Function as PropType<(flightDate: Date, journeyKey: string, fareKey: string, arrivalTime: Date) => void>
})

const availStore = useAvailState()

const emit = defineEmits<{
  (e: 'update_searchDate', date: Date): void
}>()

const updateSearchDate = (date: Date) => {
	emit('update_searchDate', date)
}

const seStore = useSeDataState()

const toggleDiv = (id: string) => {
  	if (seStore.seData.seForm.idAutoHide != id && seStore.seData.seForm.idAutoHide != undefined) {
	  	document.getElementById(seStore.seData.seForm.idAutoHide)!.classList.remove("show")
		seStore.seData.seForm.idAutoHide = id
	} else {
		seStore.seData.seForm.idAutoHide = id
  	}
}

const { locale } = useI18n_()

const format = {
	flightTime: 'HH:mm',
	flightDate: 'MMM dd',
	fullDate: 'EEE, dd MMM, yyyy'
}

const uuid = generateUUID()

const flightDetail = computed(() => {
	if (props.flights) {
		const f1 = props.flights[0]
		const fn = props.flights[props.flights.length - 1]
		return {
			from: f1.origin,
			to: fn.destination,
			timeDeparture: f1.departure,
			timeArrival: fn.arrival,
			duration: durationX(f1.departure, fn.arrival)
		}
	}
	return null
})


const showError = ref(false)
</script>

<template>
	<div class="detail-wrap">
		<div class="title-bar">
			<div class="row">
				<div class="col-sm-2">
					<p>{{ $t('se.flight.label.airline', 'Airline') }}</p>
				</div>
				<div class="col-sm-5">
					<p>{{ $t('se.flight.label.departure.arrival', '.Departure & arrival') }}</p>
				</div>
				<div class="col-sm-2">
					<p>{{ $t('se.flight.label.vol', 'Flight N°') }}</p>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-md-2">
				<div class="logo-sec">
					<AirlineLogo :airline-code="flights![0].carrierCode"></AirlineLogo>
					<MessageText tag="span" class="title" :code="`airline.name.${flights![0].carrierCode}`" :text="`Airline code ${flights![0].carrierCode}`"></MessageText>
				</div>
			</div>
			<div class="col-md-5">
				<div class="airport-part">
					<div class="airport-name">
						<h4>
							<DateConvertTimezone :date="flightDetail?.timeDeparture" :format="format.flightTime" :timezone-id="getTimezoneId(flightDetail?.from??'')"/>
						</h4>
						<MessageText tag="h6" :code="`airport.${flightDetail?.from}.city`" :text="flightDetail?.from"/>
						<label class="code-destination">{{ flightDetail?.from }}</label>
					</div>
					<div class="airport-progress">
						<img src="@/assets/images/airlines/take-off-line.png" class="float-start picicon" alt="" />
						<img src="@/assets/images/airlines/airport.png" class="float-end picicon" alt="" />
						<div class="stop">
							<DurationText :duration="flightDetail?.duration"/><br>
							(<StopDetail :flight-type="item?.flightType" :stops="item?.stops"/>)
						</div>
					</div>
					<div class="airport-name arrival">
						<h4>
							<DateConvertTimezone :date="flightDetail?.timeArrival" :format="format.flightTime" :timezone-id="getTimezoneId(flightDetail?.to??'')"/>
						</h4>
						<MessageText tag="h6" :code="`airport.${flightDetail?.to}.city`" :text="flightDetail?.to"/>
						<label class="code-destination">{{ flightDetail?.to }}</label>
					</div>
				</div>
			</div>
			<div class="col-md-2">
				<div class="flight-number price align-items-start">
					<div class="pt-2">
						<h4 v-for="(f, index) in flights" :key="index">
							{{ f.carrierCode }}{{ f.flightNumber }}
						</h4>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="book-flight text-center">
					<button class="btn btn-solid wid-cus color1 collapsed arcstrider" type="button"  @click="toggleDiv(`uuid-${uuid}`)"
						data-bs-toggle="collapse" :data-bs-target="`#uuid-${uuid}`" aria-expanded="false"
						aria-controls="panelsView-collapseOne">
						{{ $t('se.flight.booknow', '.Book now') }}
					</button><br>
					<MessageText v-if="(item?.fareRefs[0].details[0].availableCount ?? 10) < 9" class="left-seat" tag="label" code="se.flight.seats.left" text=".{n} seats left at this fare" :format="{ n: item?.fareRefs[0].details[0].availableCount }"/>
				</div>
			</div>
		</div>
		<div :id="`uuid-${uuid}`" class="accordion-collapse collapse arcstrider"
			aria-labelledby="panelsStayOpen-headingOne">
			<div class="accordion-body-view">
				<div class="background-main-arrow"></div>
				<div class="style-main-arrow"></div>
				<div class="">
					<div class="col-sm-12 content-flight">
						<nav>
							<div class="nav nav-tabs mt-3 mb-3" id="nav-tab" role="tablist">
								<button class="nav-link tab-slider--trigger active" data-bs-toggle="tab"
									:data-bs-target="`#uuid-${uuid} .tab-nav-fare`" type="button" role="tab"
									aria-controls="nav-profile" aria-selected="false">
									{{ $t('se.flight.tab.fare', '.Fare & Benefits') }}
								</button>

								<button class="nav-link tab-slider--trigger" data-bs-toggle="tab"
									:data-bs-target="`#uuid-${uuid} .tab-nav-flight`" type="button" role="tab"
									aria-controls="nav-home" aria-selected="true">
									{{ $t('se.flight.flight_details', `.Flight Details`) }}
								</button>
							</div>
						</nav>
						<div class="tab-content">
							<!-- FARES TAB -->
							<div class="tab-pane tab-nav-fare fade show active" role="tabpanel"
								aria-labelledby="nav-fare-tab" tabindex="0">
								<div class="row snippet-body">
									<!-- <div class="col-sm-12">
                                        <div class="col-sm-6 offset-sm-6 text-end button-slide">
                                            <a class="btn btn-primary btn-pre mb-3 mr-1" href="#carouselExampleIndicators2"
                                                role="button" data-slide="prev">
                                                <i class="fa fa-arrow-left"></i>
                                            </a>
                                            <a class="btn btn-primary btn-next mb-3 " href="#carouselExampleIndicators2"
                                                role="button" data-slide="next">
                                                <i class="fa fa-arrow-right"></i>
                                            </a>
                                        </div>
                                    </div> -->
									<div class="col-sm-12">
										<div class="carousel slide">
											<div class="">

												<div class="">
													<div class="row">

														<div v-for="(fare, index) in fares" :key="index" class="col-md-6 offset-sm-3 mb-3">
															<div class="customlr-style">
																<div class="card value-style height-same">
																	<div class="card-body">
																		<div class="text-center">
																			<h4 class="card-title-blue">{{ fare.fares[0].fareBasisCode }}</h4>
																			<span class="card-title-blue">Travel light</span>
																		</div>
																		<ul class="list-fareicon mt-4 ms-2 me-2">
																			<li>
																				<div class="style-iconfare">
																					<span><i class="fas fa-suitcase"></i></span>
																				</div>
																				<div>
																					<p>1 Small Bag only</p>
																					<small>Must fit under the seat (40cm x
																						20cm x 25cm)</small>
																				</div>
																			</li>
																		</ul>
																	</div>
																	<div class="row mb-4">
																		<div class="col-sm-12 text-center">
																			<div class="p-3">
																				<p class="me-3 ms-3">{{flightDate}}</p>
																				<div style="display:none;">{{ item?.offerKey }}<br/>{{ fare.fareAvailKey }}<br/></div>
																				<div class="button-select">
																					<button class="btn btn-choose-style-2-avi mt-4" @click="availStore.data.arrivalTime === undefined || (availStore.data.arrivalTime !== undefined && flightDetail!.timeDeparture >= availStore.data.arrivalTime!) ? selectionAction!(flightDate!, item!.offerKey, fare.fareAvailKey, flightDetail!.timeArrival!) : showError = true">
																						<MessageText tag="span" code="se.flight.option.select" text=".Continue for" class="padding-right-3px" >
																							&nbsp;{{ amountFormat(fare.total.total, fare.currencyCode, locale) }}
																						</MessageText>
																					</button>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														<p v-if="showError">Error: Depart time > Retour time</p>

														<!-- HIDE HIDE HIDDEN-->
														<div class="col-md-4 mb-3 hide">
															<div class="card regular-style height-same">
																<div class="card-body">
																	<div class="text-center">
																		<h4 class="card-title-blue">Regular</h4>
																		<span class="card-title-blue">Great for short
																			trips</span>
																	</div>
																	<ul class="list-fareicon mt-4 ms-2 me-2">
																		<li>
																			<div class="style-iconfare">
																				<span><i
																						class="fas fa-suitcase-rolling"></i></span>
																			</div>
																			<div>
																				<p>Priority & 2 Cabin Bags</p>
																				<small>Board first, 10kg Cabin Bag and 1
																					Small Bag</small>
																			</div>
																		</li>
																		<li>
																			<div class="style-iconfare">
																				<span>
																					<img src="@/assets/images/seat-fare.png"
																						class="icon-seat" />
																				</span>
																			</div>
																			<div>
																				<p>Reserved Seat</p>
																				<small>Specific rows available</small>
																			</div>
																		</li>
																	</ul>
																	<div class="row mb-4">
																		<div class="col-sm-12 text-center">
																			<div class="">
																				<button class="btn btn-choose-style-2"
																					onclick="window.location='DW2.html';">
																					<span>Continue for $ 75.24</span><br />
																					<small>on each flight</small>
																				</button>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														<div class="col-md-4 mb-3 hide">
															<div class="card plus-style height-same">
																<div class="card-body">
																	<div class="text-center">
																		<h4 class="card-title-blue">Plus</h4>
																		<span class="card-title-blue">Includes 20kg Check-in
																			Bag</span>
																	</div>
																	<ul class="list-fareicon mt-4">
																		<li>
																			<div class="style-iconfare">
																				<span><i
																						class="fas fa-briefcase"></i></span>
																			</div>
																			<div>
																				<p>1 Small Bag</p>
																				<small>Must fit under the seat (40cm x 20cm
																					x 25cm) @@</small>
																			</div>
																		</li>
																		<li>
																			<div class="style-iconfare">
																				<span>
																					<img src="@/assets/images/seat-fare.png"
																						class="icon-seat" />
																				</span>
																			</div>
																			<div>
																				<p>Reserved Seat</p>
																				<small>Specific rows available</small>
																			</div>
																		</li>
																		<li>
																			<div class="style-iconfare">
																				<span><i
																						class="fas fa-suitcase-rolling"></i></span>
																			</div>
																			<div>
																				<p>20 kg Check-in Bag</p>
																				<small>Drop bag at check-in desk</small>
																			</div>
																		</li>
																		<li>
																			<div class="style-iconfare">
																				<span><i class="fas fa-laptop"></i></span>
																			</div>
																			<div>
																				<p>Free check-in at the airport</p>
																				<small>Up to 40 minutes before your
																					flight</small>
																			</div>
																		</li>
																	</ul>
																</div>
																<div class="row mb-4">
																	<div class="col-sm-12 text-center">
																		<div class="button-select">
																			<button class="btn btn-choose-style-2"
																				onclick="window.location='DW2.html';">
																				<span>Continue for $ 75.24</span><br />
																				<small>on each flight</small>
																			</button>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														<!-- HIDE HIDE HIDDEN-->

													</div>
												</div>


											</div>
										</div>
									</div>
								</div>
							</div>
							<!-- FLIGHT DETAILS TAB -->
							<div class="tab-pane tab-nav-flight wow fadeIn" role="tabpanel" aria-labelledby="nav-flight"
								tabindex="0">
								<div class="row mt-4 d-flex flex-grow-1 align-items-center flight-detail-box"
									v-for="(f, idx) in flights" :key="idx">
									<div class="col-sm-12 mb-3">
										{{ $t('se.flight.departure.flight', '.Departure flight') }}: {{
											dateToStringWithTimzone(f.departure,
												'EEEE, dd MMMM yyyy', getTimezoneId(f.origin)) }}
									</div>
									<div class="col-sm-1 text-center">
										<i class="far fa-clock"></i> {{ durationHHmm(f.departure, f.arrival) }}
									</div>
									<div class="col-sm-5 box-show-time">
										<div class="time-des-flight">
											<div class="dote-time-icon">
												<div class="line-time-icon"></div>
											</div>
										</div>
										<div class="time-show-text">
											<div>
												<span class="depart-time">{{
													dateToStringWithTimzone(
														f.departure,
														format.flightTime,
														getTimezoneId(f.origin)
													)
												}}</span><br />
												<span class="depart-time date-detial">({{ getUtc(f.departure,
													getTimezoneId(f.origin)) }})</span>
											</div>
											<div class="mt-4">
												<span class="depart-time">{{
													dateToStringWithTimzone(
														f.arrival,
														format.flightTime,
														getTimezoneId(f.destination)
													)
												}}</span><br />
												<span class="depart-time date-detial">({{ getUtc(f.departure,
													getTimezoneId(f.origin)) }})</span>
											</div>
										</div>
										<div class="time-show-text">
											<div>
												<span class="depart-time"><strong>{{ f.origin }}</strong>
													{{ $t(`airport.${f.origin}.name`) }}</span><br /><span>{{
														$t(`airport.${f.origin}.city`) }},
													{{ $t(`airport.${f.origin}.country`) }}</span>
											</div>
											<div class="mt-4">
												<span class="depart-time"><strong>{{ f.destination }}</strong>
													{{ $t(`airport.${f.destination}.name`) }}</span><br /><span>{{
														$t(`airport.${f.destination}.city`) }},
													{{ $t(`airport.${f.destination}.country`) }}</span>
											</div>
										</div>
									</div>
									<div class="col-sm-3">
										<div class="row">
											<div class="col-sm-12">
												<strong>{{ $t('se.flight.label.flightNumber', '.Flight number') }}</strong>
												<p>{{ f.carrierCode }}{{ f.flightNumber }} -  Economy</p>
											</div>
										</div>
									</div>
									<div class="col-sm-3 d-flex">
										<div class="pe-2"><i class="fas fa-suitcase"></i></div>
										<div>
											<span>Baggage 0kg</span><br />
											<span>Baggage 0kg</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div></template>

<style lang="scss" scoped>
.hide {
	display: none;
}
.padding-right-3px {
	padding-right: 3px;
}
</style>