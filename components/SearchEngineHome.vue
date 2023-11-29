<script setup lang='ts'>
import { CityPairManager, type Airport } from '@/common/CityPairManager'
import { useSeDataState } from '@/stores/engine'
import { reactive, ref, watch } from 'vue'
import AutoComplete from '@/components/forms/standard/AutoComplete.vue'
import { useI18n_ } from '@/plugins/i18n'
import { BookingType, SeStep, type CityPair, type FilterFunction } from '@/common/custom-type'
import { removeDiacritics } from '@/common/commons'
import AirportItem from '@/components/AirportItem.vue'
import XDatepickerRange from '@/components/forms/standard/XDatepickerRange.vue'
import XDatepicker from '@/components/forms/standard/XDatepicker.vue'
import InputForm from '@/components/forms/standard/InputForm.vue'
import PassengerInputHome from '@/components/forms/PassengerInputHome.vue'
import { errorMessages, seDataVaidatorHome } from '@/compositions/vuevalidate-utils'
import { ibeFlightSearch } from '@/api/services'
import { useAvailState } from '@/stores/availData'
import { StatusRes, type ErrorServer } from '@/api/type'
import router, { RouterName } from '@/router'
import MessageText from '@/components/utils/MessageText.vue'
import { postDataBack } from '@/compositions/store-value-back'
import VToast from './VToast.vue'

const props = defineProps<{ marketList: Array<CityPair> }>()
const { t } = useI18n_()

const seStore = useSeDataState()
const availStore = useAvailState()

const noActiveClass = ref('no-active');

const cpData = reactive({
	departItems: [] as Airport[],
	arrivalItems: [] as Airport[]
})

const toast = reactive<{ messages: string[] }>({ messages: [] })

const cityPairManager = new CityPairManager()
cityPairManager.applyCityPairss(props.marketList, t, (departs: Airport[]) => cpData.departItems = departs)

if (props.marketList && seStore.seData.seForm.fromCode) {
	cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
}

const cityPairCallBack = (departs: Airport[]) => {
	cpData.departItems = departs
	if (seStore.seData.seForm.fromCode) {
		cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
	}
}

watch(props.marketList, () => {
	cityPairManager.applyCityPairss(props.marketList, t, cityPairCallBack)
	// if (seStore.seData.seForm.fromCode) {
	// 	cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
	// }
})

watch(() => seStore.seData.seForm.fromCode, (/**newFromCode: string, oldFromCode: string */) => {
	console.log('fromCode CHANGED');

	// if (newFromCode !== oldFromCode) {
	// 	cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
	// }
	cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
})

//const onSelectAirportFrom = () => cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)

const customFilter: FilterFunction = (query: string, item: Airport) =>
	item.searching(removeDiacritics(query?.toLowerCase().trim()))
const itemTitle = (item: Airport) => `${item.city}`

// validator
const v$ = seDataVaidatorHome(seStore.seData)

const errors = (errors: any) => {
	errors.forEach((e: any) => {
		console.log(`${e.$propertyPath} - ${e.$message}`)
	})
}

const switchAirport = () => {
	if (seStore.seData.seForm.fromCode && seStore.seData.seForm.toCode) {
		const { fromCode, toCode } = seStore.seData.seForm
		seStore.seData.seForm.fromCode = toCode

		cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
		seStore.seData.seForm.toCode = fromCode
		// const t = setTimeout(() => {
		// 	clearTimeout(t)
		// 	seStore.seData.seForm.toCode = fromCode
		// }, 50)
	}
}

const show = ref(false)

const toggle = () => show.value = !show.value

const handleSubmit = () => {
	errors(v$.value.seForm.$errors)

	v$.value.$touch()
	if (v$.value.$invalid) {
		console.log('Validation errors!')
		return
	}
	console.log('Form submitted successfully!')
	toggle()
	seStore.seData.showStepBarBox = false

	ibeFlightSearch(seStore.seData.seForm, null).then(async (data) => {
		if (data.status === StatusRes.SUCCESS) {
			await toggle()
			await postDataBack(data.data, SeStep.HOMEPAGE)
			toast.messages = []
			// data.errorServer != null ? data.errorServer.forEach(error => {toast.messages.push(`${error.code} ${error.rawMessage}`)}) : {}
			availStore.data.errorServer = {} as ErrorServer;
			availStore.data.errorServer!.rawMessage = data.errorServer == null ? " " : data.errorServer[0].rawMessage
		} else {
			availStore.data.availabilityData = undefined
			availStore.data.flightFareKeySelections = undefined
		}

		for (const prop in availStore.data.availabilityData?.flights) {
			const f = availStore.data.availabilityData?.flights[prop]
			const s = `${f.carrierCode}.${f.flightNumber}.${f.origin}${f.destination}${(f.departure instanceof Date) ? 'date' : typeof f.departure}`
			console.log(s)
		}
		availStore.data.errorServer!.rawMessage == null ? seStore.setStep(SeStep.DEPART) : {}
		seStore.seData.showStepBarBox = true
		data.data.availabilityData?.tripOffers ? router.push({ name: RouterName.IbeFlight }) : {}
	})
		.catch((err: any) => {
			toggle()
			seStore.seData.showStepBarBox = true
			// const errDetail = err.response.data.dwEx.errorDetail
			if (err) {
				toast.messages = []
				toast.messages.push(`${err.response.data.dwEx?.errorDetail.msg}`)
			}
		})
}

const pressTab = (e: Event, stateOpen: boolean, callback: () => void) => {
	if (stateOpen) {
		e.preventDefault()
		return
	}
	callback()
}
const nation1 = ref('')
const nation2 = ref('')
const getNation = (nation: string, place: string) => {
	place == 'depart' ? nation1.value = nation : nation2.value = nation
}

const timeoutNoActive = setTimeout(() => {
	noActiveClass.value = "";
	(document.activeElement as HTMLElement)?.blur();
	clearInterval(timeoutNoActive)
}, 1000);
</script>

<template>
	<div v-if="show">
		<div class="center-item">
        <div id="meeting-national-geographic-map" class="map playing">
            <div class="text-center">
              <h3 class="text-uppercase">we are looking for the best solutions for your flight arrival time</h3>
            </div>
            <p id="map-rally">
                <span class="fs-20"><MessageText :code="`airport.${seStore.seData.seForm.fromCode}.city`"
                                                            :text="seStore.seData.seForm.fromCode" /></span><br>
                <small>{{nation1}} - <MessageText :code="`airport.${seStore.seData.seForm.fromCode}.name`"
                                                            :text="seStore.seData.seForm.fromCode"/></small>
            </p>
            <p id="map-national-geographic">
                <span class="fs-20"><MessageText :code="`airport.${seStore.seData.seForm.toCode}.city`"
                                                            :text="seStore.seData.seForm.toCode" /></span><br>
                <small>{{nation2}} - <MessageText :code="`airport.${seStore.seData.seForm.toCode}.name`"
                                                            :text="seStore.seData.seForm.toCode"/></small>
            </p>
			<div id="flight-path">
                <i class="fas fa-map-marker-alt location-left"></i>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="-8 -85 848 326" preserveAspectRatio="xMinYMin slice">
                    <path d="M28.9,106.2 c76-75.1,394-252.1,740.5,-66" id="plane-path"></path>
                    <image xlink:href="@/assets/images/plane.png" id="plane" x="-28" y="-64" width="85" height="85">
                        <animateMotion class="svg-anim" id="plane-motion" dur="8s" rotate="auto" fill="freeze" begin="0s" repeatCount="once" calcMode="spline" keySplines="0.833333 0.02 0.5 1" keyTimes="0; 1">
                             <mpath xlink:href="#plane-path"></mpath>
                        </animateMotion>
                    </image>
                </svg>
            </div>
			<div id="flight-path-shadow">
                <i class="fas fa-map-marker-alt location-right"></i>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="78 -120 848 256" preserveAspectRatio="xMinYMin slice">
                    <path d="M98.9,87.2 c76-95.1,424-252.1,760.5,-110" id="plane-shadow-path"></path>
                    <image xlink:href="@/assets/images/plane-shadow.png" id="plane-shadow" x="-90" y="-40" width="60" height="60">
                        <animateMotion class="svg-anim" id="plane-shadow-motion" dur="8s" rotate="auto" fill="freeze" begin="0s" repeatCount="once" calcMode="spline" keySplines="0.833333 0.02 0.5 1" keyTimes="0; 1">
                             <mpath xlink:href="#plane-shadow-path"></mpath>
                        </animateMotion>
                    </image>
                </svg>
            </div>
        </div>
      </div>

	</div>

	<div v-else>
		<!--open seacrh booking -->
		<div class="d-none d-lg-flex bghome">
			<img src="@/assets/images/bg-search.png">
		</div>
		<div class="row pt-4">
			<div class="col-lg-12">
				<div class="container-book">
					<div>
						<div class="row">
							<div class="col-sm-12">
								<h1 class="fw-bold">
									<MessageText code="se.home.bookaflight" text=".Book A Flight"></MessageText>
								</h1>
							</div>
						</div>
						<div :class="['flight-search-detail box-flight-search', noActiveClass]">
							<div class="flight-search">
								<div class="flight-search-detail ibe-booking rounded pt-4 p-3 pb-5">
									<div class="row">
										<div class="col-lg-6 col-md-6 col-sm-6 col-xs-12 mb-1">
											<div class="search-check-box">
												<label>
													<input type="radio" name="radio" :value="BookingType.ROUNDTRIP"
														v-model="seStore.seData.seForm.bookingType"
														:checked="seStore.seData.seForm.bookingType === BookingType.ROUNDTRIP" />
													<MessageText tag="span" code="se.form.trip.type.roundtrip"
														text=".Round trip"></MessageText>
												</label>
												<label>
													<input type="radio" name="radio" :value="BookingType.ONEWAY"
														v-model="seStore.seData.seForm.bookingType"
														:checked="seStore.seData.seForm.bookingType === BookingType.ONEWAY" />
													<!--@click="seStore.seData.seForm.retourDate = undefined"-->
													<MessageText tag="span" code="se.form.trip.type.oneway" text=".One way">
													</MessageText>
												</label>
												<!-- <label>
													<input type="radio" name="radio" />
													<span>{{ $t('se.form.trip.type.multicity', '.Multi city') }}</span>
												</label> -->
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-6 col-md-12 col-sm-12 col-xs-12 desktopstyle right">
											<div class="row mt-2 pb-2">
												<div class="form">
													<div class="col-sm-6 mb-2">
														<AutoComplete append-icon="fas fa-plane"
															v-model="seStore.seData.seForm.fromCode"
															:errorMsg="errorMessages(v$.seForm.fromCode, $t)"
															:show-errors-in-activator="true" :popper-same-min-width="true"
															popper-class="ap-autocomplete popper-dw-style"
															:custom-filter="customFilter" no-ddata-text="No data"
															:item-title="itemTitle" item-value="code"
															:items="cpData.departItems" input-focus="input#airportFrom" @update:get-nation="(nation) => getNation(nation, 'depart')">
															<!-- @update:model-value="onSelectAirportFrom" -->
															<template
																#activator="{ elmClass, elmActive, onElmClick, inputProps, datas, errors, onEventKeyDown }">
																<div :class="['widgetSection box-input-from activeStyle', elmClass, { 'active': elmActive }]"
																	@click="onElmClick" data-animation="fadeIn">
																	<MessageText code="se.home.depart.from"
																		text=".Depart from" tag="label" class="style-depavi"
																		for="airportFrom"> *</MessageText>
																	<input id="airportFrom"
																		class="form-control airport textsize18"
																		autocomplete="off" type="text" v-bind="inputProps"
																		:placeholder="$t('se.home.select.city', 'Select city')"
																		:value="datas.search" @keydown="onEventKeyDown" />
																	<span class="descCode top-show"
																		v-if="datas.item && datas.search === datas.itemTitleDisplay">{{
																			datas.item?.code }}</span>
																	<p class="text-airport-info"
																		v-if="datas.item && datas.search === datas.itemTitleDisplay">
																		{{ datas.item.country }} - {{ datas.item.name }}
																	</p>
																	<div v-if="errors"
																		class="text-airport-info invalid-feedback">
																		<ul>
																			<li v-for="(error, index) in errors"
																				:key="index">{{ error }}</li>
																		</ul>
																	</div>
																</div>
															</template>
															<template #item="{ bindingProps, item, isSelected, isHover }">
																<li v-bind="bindingProps"
																	:class="['dw-list-item', { 'dw-list-item--active': isSelected, 'dw-list-item--link': isHover }, item.isAirport ? 'airport' : 'city']">
																	<AirportItem :item="item" />
																</li>
															</template>
														</AutoComplete>
													</div>
													<span class="flight-widget-icon text-center" @click="switchAirport">
														<i class="fas fa-exchange-alt"></i>
													</span>
													<div class="col-sm-6 mb-2">
														<div class="form-group">
															<AutoComplete append-icon="fas fa-plane"
																v-model="seStore.seData.seForm.toCode"
																:errorMsg="errorMessages(v$.seForm.toCode, $t)"
																:show-errors-in-activator="true"
																:popper-same-min-width="true"
																popper-class="ap-autocomplete popper-dw-style"
																:custom-filter="customFilter" no-ddata-text="No data"
																input-focus="input#airportTo" :item-title="itemTitle"
																item-value="code" :items="cpData.arrivalItems" @update:get-nation="(nation) => getNation(nation, 'destination')">
																<template
																	#activator="{ elmClass, elmActive, onElmClick, inputProps, datas, errors, onEventKeyDown }">
																	<div :class="['widgetSection box-input-to box-input-from activeStyle', elmClass, { 'active': elmActive }]"
																		@click="onElmClick">
																		<MessageText code="se.home.arrivat.at"
																			text=".Arriving at" tag="label"
																			class="style-depavi" for="airportTo"> *
																		</MessageText>
																		<input id="airportTo"
																			class="form-control airport textsize18"
																			autocomplete="off" type="text"
																			v-bind="inputProps"
																			:placeholder="$t('se.home.select.city', 'Select city')"
																			:value="datas.search"
																			@keydown="onEventKeyDown" />
																		<span class="descCode top-show"
																			v-if="datas.item && datas.search === datas.itemTitleDisplay">{{
																				datas.item?.code }}</span>
																		<p class="text-airport-info"
																			v-if="datas.item && datas.search === datas.itemTitleDisplay">
																			{{ datas.item.country }} - {{ datas.item.name }}
																		</p>
																		<div v-if="errors"
																			class="text-airport-info invalid-feedback">
																			<ul>
																				<li v-for="(error, index) in errors"
																					:key="index">{{ error }}</li>
																			</ul>
																		</div>
																	</div>
																</template>
																<template
																	#item="{ bindingProps, item, isSelected, isHover }">
																	<li v-bind="bindingProps"
																		:class="['dw-list-item', { 'dw-list-item--active': isSelected, 'dw-list-item--link': isHover }, item.isAirport ? 'airport' : 'city']">
																		<AirportItem :item="item" />
																	</li>
																</template>
															</AutoComplete>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="col-lg-4 col-md-12 col-sm-12 col-xs-12 desktopstyle right">
											<div class="row mt-2 pb-2">
												<XDatepickerRange
													v-if="seStore.seData.seForm.bookingType === BookingType.ROUNDTRIP"
													:min-date="new Date()" :columns="3" visibility="click"
													:valueStart="seStore.departDate" :valueEnd="seStore.returnDate"
													:placeholder="$t('se.home.date.placeholder', '.Choose date..')"
													@update:model-value="dates => { seStore.seData.seForm.departDate = dates.start; seStore.seData.seForm.retourDate = dates.end; }"
													:error-msg-start="errorMessages(v$.seForm.departDate, $t)"
													:error-msg-end="errorMessages(v$.seForm.retourDate, $t)"
													:show-errors-in-activator="true"
													:input-focus="['#departDate', '#returnDate']">
													<template
														#mainContainner="{ inputValue, inputEvents, elmState, placeholder, errorsStart, errorsEnd, onFocus, onBlur, onElmMouseIn, onElmMouseOut, forceBlur }">
														<div class="form p-0"><!-- container-->
															<div class="col-sm-6 mb-2">
																<InputForm :class="{ 'has-error': !!errorsStart }">
																	<template #main_el>
																		<div :onMouseenter="onElmMouseIn"
																			:onMouseleave="onElmMouseOut"
																			:class="['activeStyle box-input-from box-input-to box-input-Datefrom styleboxmain dw-activator', { 'active': elmState.active }]">
																			<MessageText code="se.home.date.depart"
																				text=".Depart date" class="style-depavi"
																				tag="label" for="departDate"> *
																			</MessageText>
																			<i class="far fa-calendar-alt"
																				@click="(e) => { inputEvents.start.click(e); onFocus.start() }"></i>
																			<input type="text" class="date-style-From"
																				id="departDate" :placeholder="placeholder"
																				autocomplete="off" readonly
																				:value="inputValue.start"
																				v-on="inputEvents.start"
																				@keydown.tab="pressTab($event, elmState.open, forceBlur)"
																				@focus="onFocus.start" @blur="onBlur" />
																			<div v-if="errorsStart"
																				class="text-airport-info invalid-feedback">
																				<ul>
																					<li v-for="(error, index) in errorsStart"
																						:key="index">{{ error }}</li>
																				</ul>
																			</div>
																		</div>
																	</template>
																</InputForm>
															</div>
															<div class="col-sm-6 mb-2">
																<InputForm :class="{ 'has-error': !!errorsEnd }">
																	<template #main_el>
																		<div :onMouseenter="onElmMouseIn"
																			:onMouseleave="onElmMouseOut"
																			:class="['activeStyle  box-input-to box-input-from box-input-Datefrom styleboxmain dw-activator', { 'active': elmState.active }]">
																			<MessageText code="se.home.date.return"
																				text=".Return date" class="style-depavi"
																				tag="label" for="returnDate"> *
																			</MessageText>
																			<i class="far fa-calendar-alt"
																				@click="(e) => { inputEvents.end.click(e); onFocus.end() }"></i>
																			<input type="text" class="date-style-From"
																				id="returnDate" :placeholder="placeholder"
																				autocomplete="off" readonly
																				:value="inputValue.end"
																				v-on="inputEvents.end"
																				@keydown.tab="pressTab($event, elmState.open, forceBlur)"
																				@focus="onFocus.end" @blur="onBlur" />
																			<div v-if="errorsEnd"
																				class="text-airport-info invalid-feedback">
																				<ul>
																					<li v-for="(error, index) in errorsEnd"
																						:key="index">{{ error }}</li>
																				</ul>
																			</div>
																		</div>
																	</template>
																</InputForm>
															</div>
														</div>
													</template>
												</XDatepickerRange>
												<div v-else class="form"><!-- container-->
													<div class="col-sm-6 mb-2">
														<XDatepicker v-model="seStore.seData.seForm.departDate"
															:value="seStore.seData.seForm.departDate" :min-date="new Date()"
															:columns="3" visibility="click"
															:placeholder="$t('se.home.date.placeholder', '.Choose date..')"
															:show-errors-in-activator="true"
															:error-msg="errorMessages(v$.seForm.departDate, $t)"
															input-focus="#departDate">
															<template
																#main_activator="{ inputValue, inputEvents, isActive, placeholder, errors, onFocus, onBlur, onElmMouseIn, onElmMouseOut }">
																<div :onMouseenter="onElmMouseIn"
																	:onMouseleave="onElmMouseOut"
																	:class="['activeStyle box-input-from  box-input-Datefrom styleboxmain', { 'active': isActive }]">
																	<MessageText tag="label" code="se.home.date.depart"
																		text=".Depart date" class="style-depavi"
																		for="departDate"> *</MessageText>
																	<i class="far fa-calendar-alt"
																		@click="(e) => { inputEvents.click(e); onFocus() }"></i>
																	<input type="text" class="date-style-From"
																		id="departDate" :placeholder="placeholder"
																		autocomplete="off" readonly :value="inputValue"
																		v-on="inputEvents" @focus="onFocus"
																		@blur="onBlur" />
																	<div v-if="errors"
																		class="text-airport-info invalid-feedback">
																		<ul>
																			<li v-for="(error, index) in errors"
																				:key="index">{{ error }}</li>
																		</ul>
																	</div>
																</div>
															</template>
														</XDatepicker>
													</div>
													<div class="col-sm-6 mb-2">
														<div class="form-group">
															<div
																class="activeStyle box-input-to box-input-Datefrom styleboxmain disabled">
																<MessageText code="se.home.date.return" text=".Return date"
																	class="style-depavi" tag="label" />
																<i class="far fa-calendar-alt disabled"></i>
																<input type="text" class="date-style-From"
																	:placeholder="$t('se.home.date.placeholder', '.Choose date..')"
																	autocomplete="off" disabled />
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="col-lg-2 col-md-12 col-sm-12 col-xs-12">
											<div class="row mt-2 pb-2">
												<div class="col-sm-12">
													<PassengerInputHome :pax-req-data="seStore.passengerInputProps"
														:errorMsg="errorMessages(v$.seForm.nbAdt, $t)" />
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-12 text-center">
											<div class="search-btn">
												<MessageText tag="span" v-show="availStore.data.errorServer?.rawMessage" code="se.btn.errorServer" :text="`${availStore.data.errorServer?.rawMessage}`" class="text-danger"/><br>
												<button class="btn btn-solid color1 mx-auto" @click="handleSubmit">
													<i class="fas fa-paper-plane"></i>&nbsp;
													<MessageText tag="span" code="se.btn.search" text="Search" />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="position-relative" aria-live="polite" aria-atomic="true">
			<div class="toast-container position-fixed p-3 bottom-0 start-50 translate-middle-x" id="toastPlacement">
				<!-- <v-toast v-for="(msg, index) in toast.messages" :key="index" :message="msg"></v-toast> -->
				<TransitionGroup name="slide-fade" tag="ul">
					<li v-for="(msg, index) in toast.messages" :key="index">
						<v-toast :message="msg" :timeout="300000"></v-toast>
					</li>
				</TransitionGroup>

			</div>
		</div>
		<!--open seacrh booking -->
	</div>
</template>

<style lang="scss" scoped>

.position-relative {
	position: relative !important;
}

.tabbable {
	top: 42%;
	z-index: 100;
	width: 100%;
	left: 25%;
	right: 25%;

	.nav-tabs {
		background-color: #fff;
		position: relative;
		margin: auto;
		padding: 0px 20px;
		display: table;
		align-items: center;
		position: relative;
		top: 0px;
		margin: initial;

		>li {
			float: left;
			padding: 7px 0px 0px 0px;
		}
	}
}

.form-group {
	.disabled {
		background: #eee;
		cursor: not-allowed;
	}
}

.nav-tabs {
	border-bottom: 0px;

	.nav-link {
		border-top-left-radius: 0px;
		border-top-right-radius: 0px;
		border: 0px;
		font-size: 15px;
		color: #212529 !important;
		border-bottom: solid 3px #fff;
		white-space: nowrap;
		padding: 10px 5px !important;

		>i {
			margin-bottom: 7px;
		}

		&:focus {
			border-color: unset;
			border-bottom: solid 3px #1E306D;
			background-color: #fff;
			color: #14358F !important;
		}

		&:hover {
			border-color: unset;
			border-bottom: solid 3px #1E306D;
			background-color: #fff;
			color: #14358F !important;
		}
	}

	.nav-item.show {
		.nav-link {
			border-color: unset;
			border-bottom: solid 3px #1E306D;
			color: #14358F !important;
		}
	}

	.nav-link.active {
		border-color: unset;
		border-bottom: solid 3px #1E306D;
		color: #14358F !important;
	}
}

.width-seting-nav {
	box-shadow: 0 2px 1px -1px #0003, 0 1px 1px #00000024, 0 1px 3px #0000001f;
	display: flex;
	box-sizing: border-box;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: 16px;
	border-radius: 2px;
}

button.search-booking-nav {
	width: auto;
	height: 60px;
	margin: 0px 20px;

	&:before {
		display: none;
	}
}

.tab-content-search {
	padding: 26px 20px 0px 20px;
	border-radius: 10px;
}

.bg-style-booking {
	width: 773px;
}

.search-check-box {
	label {
		display: flex;
		cursor: pointer;
		font-weight: 500;
		position: relative;
		overflow: hidden;
		margin-right: 15px;

		input {
			position: absolute;
			left: -9999px;

			&:checked {
				+ {
					span {
						background-color: #eaeaee;

						&:before {
							box-shadow: inset 0 0 0 0.4375em #00005c;
						}
					}
				}
			}
		}

		span {
			display: flex;
			align-items: center;
			padding: 0.1em 0.6em 0.1em 0.1em;
			border-radius: 99em;
			transition: 0.25s ease;

			&:hover {
				background-color: #d6d6e5;
			}

			&:before {
				display: flex;
				flex-shrink: 0;
				content: "";
				background-color: #fff;
				width: 1.5em;
				height: 1.5em;
				border-radius: 50%;
				margin-right: 0.375em;
				transition: 0.25s ease;
				box-shadow: inset 0 0 0 0.125em #00005c;
			}
		}
	}
}

:deep(.flight-search) {
	.flight-search-detail {
		background-color: white;
		padding: 0px;

		.form-group {
			margin-bottom: 0;
			position: relative;
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;
			height: 90px;
			display: block;
			align-items: center;

			img {
				position: absolute;
				right: 0;
				bottom: 0;
				border-left: 1px solid #e5e5e5;
				padding: 10px;
			}

			label {
				text-transform: revert;
				font-weight: 600;
				font-size: 14px;
				color: #797979;
			}

			.form-control {
				border-radius: 0;
				text-transform: capitalize;
				border: 0px !important;
				cursor: pointer;

				&:focus {
					-webkit-box-shadow: none;
					box-shadow: none;
				}
			}

			.gj-datepicker {
				button {
					border: 1px solid #e5e5e5 !important;
					background-color: white;
					height: 38px;
					border-radius: 0px;
				}
			}

			.gj-timepicker {
				button {
					border: 1px solid #e5e5e5 !important;
					background-color: white;
					height: 38px;
					border-radius: 0px;
				}
			}

			&::-webkit-input-placeholder {
				color: #a5a5a5;
				text-transform: capitalize;
			}

			&::-moz-placeholder {
				color: #a5a5a5;
				text-transform: capitalize;
			}

			&:-ms-input-placeholder {
				color: #a5a5a5;
				text-transform: capitalize;
			}

			&::-ms-input-placeholder {
				color: #a5a5a5;
				text-transform: capitalize;
			}

			&::placeholder {
				color: #a5a5a5;
				text-transform: capitalize;
			}
		}

		.search-btn {
			display: -webkit-box;
			display: -ms-flexbox;
			display: block;
			-webkit-box-align: end;
			-ms-flex-align: end;
			align-items: flex-end;
			height: 100%;
			text-align: center;

			.btn {
				width: 220px;
			}
		}

		.responsive-close {
			display: none;
		}
	}

	.responsive-detail {
		display: none;
		background-color: white;
		padding: 15px 25px;
		position: relative;

		.destination {
			span {
				font-size: calc(14px + (18 - 14) * ((100vw - 320px) / (1920 - 320)));
				text-transform: capitalize;
				color: black;
				font-weight: 700;
				margin-bottom: -3px;
			}
		}

		.details {
			span {
				text-transform: capitalize;
				color: #5d5d5d;
			}
		}

		.modify-search {
			position: absolute;
			right: 25px;
			top: 50%;
			-webkit-transform: translateY(-50%);
			transform: translateY(-50%);

			.btn {
				padding: 4px 6px;
				text-transform: capitalize;
				font-size: 14px;
			}
		}
	}

	.form {
		display: flex;

		.date-ranger-style-right {
			padding-right: calc(var(--bs-gutter-x) * 0.5);
		}

		.date-ranger-style-left {
			padding-left: calc(var(--bs-gutter-x) * 0.5);
		}
	}

	.form-group {
		label.style-dep {
			padding-top: 5px;
		}

		i.fa-calendar-alt {
			position: absolute;
			left: 3px;
			top: 36px;
			font-size: 20px;
			border-left: 0px;
			padding: 12px;
			width: 40px;
		}
	}

	.search-btn {
		position: absolute;
		top: 2px;
		margin-left: auto;
		margin-right: auto;
		left: 0;
		right: 0;
		text-align: center;
	}

	.booking-form {
		color: #4A4A4A;
		position: absolute;
		top: 40%;
		bottom: 0px;
		z-index: 999;
		width: 100%;
	}

	.form-control {
		padding: 0px;
	}

	.styleboxmain {
		margin-bottom: 0;
		position: relative;
		border: 1px solid #e5e5e5;
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
		height: 98px;
		display: block;
		align-items: center;
	}

	div.widgetSection {
		margin-bottom: 0;
		border: 1px solid #e5e5e5;
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
		height: 98px;
		display: block;
		align-items: center;
	}

	input.airport {
		font-weight: 500;
		background: unset;
		padding: 40px 15px 30px;
		height: 100%;
		display: block;
		position: relative;
		margin-top: -40px;
	}

	label.style-depavi {
		padding: 10px 20px 10px 15px;
		width: 100%;
		font-weight: 500 !important;
	}

	.textsize18 {
		font-size: 18px !important;
	}

	.text-airport-info {
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		position: absolute;
		top: 66px;
		padding: 0px 15px;
	}

	input {
		&::placeholder {
			font-size: 14px;
			font-weight: normal;
		}

		&:focus-visible {
			outline-offset: 0px;
			outline: unset;
		}
	}

	.table-condensed {
		>thead {
			color: #23a8ba;
		}

		thead {
			tr {
				th {
					border-radius: 0px !important;
				}
			}
		}
	}

	.bg-search {
		height: 490px;
		background-size: contain;
		background-repeat: no-repeat;
		display: block;
	}

	.date-style-From {
		display: block;
		width: 100%;
		border: 0px;
		font-weight: 500;
		padding: 7px 0px 15px 42px;
		margin-top: -5px;
		height: 55px;
		font-size: 18px;
		background: unset;
		cursor: pointer;
		font-feature-settings: 'salt' 2;
	}

	.date-style-To {
		display: block;
		width: 100%;
		border: 0px;
		font-weight: 500;
		padding: 7px 0px 15px 50px;
		height: 55px;
		font-size: 18px;
		background: unset;
		cursor: pointer;
		font-feature-settings: 'salt' 2;
	}

	.flight-widget-icon {
		border-radius: 50%;
		box-shadow: 0 0 1px #0000001a;
		cursor: pointer;
		left: calc(51% - 0.875rem);
		position: absolute;
		top: 2.65rem;
		vertical-align: middle;
		height: 1.75rem;
		width: 1.75rem;
		border: solid 1px rgb(237, 238, 239);
		background: #fff;
		z-index: 10;

		.fa-exchange-alt {
			margin-top: 7.5px;
			color: #23a8ba;
		}
	}

	.boxinfor-avi {
		background: #d4f3f7;
		border: solid 1px #23a8ba;
		padding: 6px 12px;
		display: flex;

		i {
			position: unset;
			border-left: 0px;
			color: #23a8ba;
			width: 22px;
			padding: 0px;
			font-size: 18px;
			margin: 0px 8px 0px 0px;
		}

		>span {
			font-size: 13px;
			color: #001840;
		}
	}

	.box-input-from.active {
		background: #eaf9fb;
		color: #001840;
		border-color: #23a8ba;

		label.style-depavi {
			color: #23a8ba;
		}
	}

	.box-input-Datefrom.active {
		background: #eaf9fb;
		color: #001840;
		border-color: #23a8ba;

		label.style-depavi {
			color: #23a8ba;
		}

		i {
			color: #23a8ba;
		}
	}

	.has-error .activeStyle {
		background: #ffe6e638;
		color: #ff0000;
		border-color: #ff0000;

		label.style-depavi {
			color: #ff0000;
		}
	}

	.box-input-to.active {
		label.style-depavi {
			color: #23a8ba;
		}

		background: #eaf9fb;
		color: #001840 !important;
		border-color: #23a8ba;
		border-left: solid 1px #23a8ba !important;
	}

	.selector-box-flight {
		&.show {
			display: block;
			width: 100%;
			left: 0px;
			animation: fadeIn 1.1s;
		}

		&:before {
			position: absolute;
			display: inline-block;
			content: '';
			left: 0;
			right: 0;
			width: 0;
			margin-left: auto;
			margin-right: auto;
			display: none !important;
			top: -7px;
			border-right: 7px solid transparent;
			border-left: 7px solid transparent;
			border-bottom: 7px solid #ccc;
		}

		&:after {
			position: absolute;
			display: inline-block;
			content: '';
			left: 0;
			right: 0;
			width: 0;
			margin-left: auto;
			margin-right: auto;
			display: none !important;
			top: -6px;
			border-right: 6px solid transparent;
			border-bottom: 6px solid #fff;
			border-left: 6px solid transparent;
		}

		.room-cls {
			.title_room {
				font-size: 16px;
				text-transform: capitalize;
				font-weight: 700;
			}

			.qty-box {
				display: block !important;
				-webkit-box-align: center;
				-ms-flex-align: center;
				align-items: center;

				label {
					text-transform: capitalize;
					margin-bottom: 0;
					color: #001840;
				}

				small {
					color: #001840;
				}

				.input-group {
					margin-left: 0px !important;

					.btn {
						border: solid 1px #23a8ba;
						color: #23a8ba;
						padding: 0px 8px;
						height: 25px;
						width: 25px;
						border-radius: 40px !important;

						&:hover {
							background: #23a8ba;
							color: #fff;
						}
					}

					.form-control {
						padding: 0;
						text-align: center;
						border: none;
					}
				}

				+ {
					.qty-box {
						margin-top: 10px;
					}
				}
			}

			+ {
				.room-cls {
					margin-top: 10px;
					border-top: 1px solid #f9f9f9;
					padding-top: 10px;
				}
			}
		}

		.flight-class {
			border-top: 1px solid #e7e7e7;
			margin-top: 10px;
			padding-top: 15px;
			padding-bottom: 3px;

			.form-check {
				margin-top: 7px;
			}

			.form-check-label {
				text-transform: capitalize;
			}
		}

		.bottom-part {
			border-top: 1px solid #e7e7e7;
			margin-top: 5px;
			padding-top: 5px;
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
			-webkit-box-align: center;
			-ms-flex-align: center;
			align-items: center;

			.btn {
				margin-left: auto;
				background-color: #23a8ba;
				color: #fff;
				border: 0px !important;
			}
		}
	}



}

.box-input-from {
	border-top-right-radius: 0px !important;
	border-bottom-right-radius: 0px !important;
}

.box-input-to {
	border-top-left-radius: 0px !important;
	border-bottom-left-radius: 0px !important;
	border-left: 1px solid #e5e5e500 !important;
}



.btn.btn-solid {
	background-color: #001840;
	color: #fff;
	padding: 12px 20px;
	-webkit-box-shadow: unset;
	box-shadow: unset;
	line-height: 20px;
	text-transform: uppercase;
	font-size: 15px;
	font-weight: 500;
	border-radius: 0;
	text-decoration: none;
	-webkit-transition: 0.3s ease-in-out;
	transition: 0.3s ease-in-out;
	width: 180px;
	text-align: center;
	border: solid 1px #000F40;

	&:hover,
	&:focus {
		-webkit-transition: 0.3s ease-in-out;
		transition: 0.3s ease-in-out;
		background-color: #fff;
		color: #001840;
		border: 1px solid #001840;
		-webkit-box-shadow: 1px 11px 20px 0px rgb(0 80 255 / 12%);
		box-shadow: 1px 11px 20px 0px rgb(0 80 255 / 12%);
	}
}

.btn.btn-solid.btn-outline {
	background-color: transparent;
	border: 1px solid #14358F;
	color: #14358F;

	&:hover {
		color: white;
		background-color: #14358F;
	}
}

.ui-state-default {
	width: auto !important;
	border: 0px !important;
	background: unset !important;
	color: #212529 !important;

	.ui-icon {
		background-image: none !important;
	}
}

.ui-widget-content {
	.ui-state-default {
		width: auto !important;
		border: 0px !important;
		background: unset !important;
		color: #212529 !important;
	}

	.ui-state-hover {
		background: none !important;
	}

	.ui-state-focus {
		background: none !important;
	}

	.ui-state-active {
		border: unset !important;
		background: inherit !important;
		font-weight: inherit !important;
		color: inherit !important;
	}
}

.ui-widget-header {
	.ui-state-default {
		width: auto !important;
		border: 0px !important;
		background: unset !important;
		color: #212529 !important;
	}

	.ui-state-hover {
		background: none !important;
	}

	.ui-state-focus {
		background: none !important;
	}

	.ui-state-active {
		border: unset !important;
		background: inherit !important;
		font-weight: inherit !important;
		color: inherit !important;
	}
}

.ui-front {
	z-index: 1000 !important;
}

.ui-selectmenu-text {
	&:before {
		font-family: "Font Awesome 5 Free";
		font-weight: 900;
		content: "\f107";
		right: 1.5em;
		left: auto;
		margin-top: -8px;
		position: absolute;
		top: 12%;
		font-size: 18px;
	}
}

.ui-selectmenu-button {
	span.ui-selectmenu-text {
		padding: 0px !important;
	}

	display: inline !important;
}

.ui-widget {
	font-family: inherit !important;
}

:deep(.descCode) {
	font-size: 13px !important;
	background: #23a8ba;
	border-radius: 30px;
	color: #fff;
	float: right;
	position: absolute;
	top: 5px;
	right: 0px;
	padding: 0px 10px;
	width: 50px;
	text-align: center;
}

.ui-state-hover {
	background: none !important;
}

.ui-state-focus {
	background: none !important;
}

.ui-menu-item {
	&:hover {
		background: #000F40 !important;
		color: #fff !important;
	}

	&:before {
		font-family: "Font Awesome 5 Free";
		font-weight: 900;
		content: "\f5b0";
		position: absolute;
		margin-top: 15px;
		left: 15px;
	}

	.ui-menu-item-wrapper {
		&:hover {
			border: none !important;
			background-color: unset !important;
		}
	}
}

.ui-menu-item-wrapper {
	position: relative;
	padding: 3px 2em 3px 2.4em;
}

.ui-selectmenu-menu {
	.ui-menu {
		margin-top: 7px;
		margin-left: -16px;
		height: 300px;
		overflow-x: scroll;
		border: 1px solid #e5e5e5 !important;
		box-shadow: 0px 5px 5px 0px rgb(0 0 0 / 12%);
	}
}

.ui-selectmenu-menu-item-content {
	display: block;
	text-overflow: ellipsis;
	overflow: hidden;
	font-weight: 700;
}

.ui-menu {
	&::-webkit-scrollbar {
		width: 0px !important;
		background-color: #90A4AE;
		border-radius: 6px;
		border: 3px solid #CFD8DC;
	}

	.ui-menu-item {
		padding: 10px 1em 10px 2.5rem !important;
		border-bottom: 1px solid #e5e5e5;
	}

	&:before {
		top: -8px;
		border-right: 7px solid transparent;
		border-left: 7px solid transparent;
		border-bottom: 7px solid #ccc;
		left: 0;
		right: 17rem;
		width: 0;
		margin-left: auto;
		margin-right: auto;
		position: absolute;
		display: inline-block;
		content: '';
	}

	&:after {
		top: -6px;
		border-right: 6px solid transparent;
		border-bottom: 6px solid #fff;
		border-left: 6px solid transparent;
		left: 0;
		right: 17rem;
		width: 0;
		margin-left: auto;
		margin-right: auto;
		position: absolute;
		display: inline-block;
		content: '';
	}

	height: 290px;
	overflow-y: scroll;
	overflow-x: unset !important;
	border-color: #ddd !important;
	animation: fadeIn 1.1s;
	-webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);

	.ui-state-focus {
		margin: 0px !important;
	}

	.ui-state-active {
		margin: 0px !important;
	}
}

.ui-state-active {
	border: unset !important;
	background: inherit !important;
	font-weight: inherit !important;
	color: inherit !important;
}

a.ui-button {
	&:active {
		border: unset !important;
		background: inherit !important;
		font-weight: inherit !important;
		color: inherit !important;
	}
}

.ui-button {
	&:active {
		border: unset !important;
		background: inherit !important;
		font-weight: inherit !important;
		color: inherit !important;
	}
}

.ui-button.ui-state-active {
	&:hover {
		border: unset !important;
		background: inherit !important;
		font-weight: inherit !important;
		color: inherit !important;
	}
}

li.ui-state-focus {
	border: 1px solid #e5e5e5 !important;
}

.ui-autocomplete {
	position: relative !important;
	width: 29% !important;
}

.daterangepicker {
	margin-top: 7px !important;
	animation: fadeIn 1.1s;
	border-radius: 0px !important;
	-webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);

	.calendar-table {
		th {
			font-family: Nunito, sans-serif !important;
			font-size: 14px !important;
			width: 39px !important;
			min-width: 39px !important;
			height: 39px !important;
			border-radius: 40px !important;
		}

		td {
			font-family: Nunito, sans-serif !important;
			font-size: 14px !important;
			width: 39px !important;
			min-width: 39px !important;
			height: 39px !important;
			border-radius: 40px !important;
		}

		.next {
			span {
				border: solid #23a8ba !important;
				border-width: 0 2px 2px 0 !important;
				color: #23a8ba !important;
			}
		}

		.prev {
			span {
				border: solid #23a8ba !important;
				border-width: 0 2px 2px 0 !important;
				color: #23a8ba !important;
			}
		}
	}

	td.start-date {
		padding: 0px 10px;
		border-radius: 40px !important;
		background: #1E306D !important;
		padding: 0px;
		border-radius: 30px !important;

		&:hover {
			background: #1E306D !important;
		}
	}

	th.month {
		font-size: 18px !important;
		padding: 15px 15px;
		border-bottom: 1px solid #e7e7e7 !important;
	}

	.drp-buttons {
		.btn {
			font-size: 14px !important;
		}
	}

	td.today {
		color: white !important;
		background-color: #23a8ba !important;
		border-radius: 40px !important;
	}

	td.end-date {
		padding: 0px;
		border-radius: 30px !important;
	}

	td.disabled {
		text-decoration: unset !important;
	}

	option.disabled {
		text-decoration: unset !important;
	}

	.drp-calendar {
		max-width: fit-content !important;
	}

	td.available {
		&:hover {
			border-radius: 40px;
			background: unset !important;
			color: #23a8ba !important;
		}
	}

	th.available {
		&:hover {
			border-radius: 40px;
			background: unset !important;
			color: #23a8ba !important;
		}
	}

	&:before {
		display: none !important;
	}

	&:after {
		display: none !important;
	}
}

.drp-selected {
	display: none !important;
}

.drp-buttons {
	>button.btn-primary {
		background: #23a8ba !important;
		border-color: #23a8ba !important;
	}
}

input.open-select {
	font-size: 18px !important;
	font-weight: 500;
	position: relative;
	top: 6px;
	background-color: unset !important;
	padding: 5px 15px 0px;
}

.airport:before {
	font-family: "Font Awesome 5 Free";
	font-weight: 900;
	content: "\f5b0";
	margin-right: 20px;
	position: absolute;
	left: 10px;
	margin-top: 15px;
}

.city:before {
	font-family: "Font Awesome 5 Free";
	font-weight: 900;
	content: "\f3c5";
	margin-right: 20px;
	position: absolute;
	left: 12px;
	margin-top: 15px;
}

li.ui-menu-item {
	display: list-item;
}

.list-group-item {
	padding: 10px 1em 10px 2.5rem;
}

.ui-selectmenu-menu-item-header {
	float: right;
	padding: 2px 5px;
	margin-top: 9.5px;
	font-weight: 600 !important;
}

.each {
	border-bottom: 1px solid #555;
	padding: 3px 0;
}

.acItem {
	.name {
		font-size: 14px;
		font-weight: 700;
	}

	&:hover {
		background: unset !important;
	}
}

.top-show {
	top: 46px !important;
	right: 18px !important;
	position: absolute;
}

.step-bar-box {
	padding: 0px;
}

body.rtl {
	.section-booking {
		.qty-box {
			label {
				margin-left: 0px !important;
			}
		}

		direction: ltr !important;
		text-align: left !important;
	}

	.ui-widget-content {
		direction: ltr !important;
	}
}

@media screen and (max-width: 1280px) {
	.booking-form {
		left: 0px;
		width: 100%;
		top: 42%;
	}
}

@media screen and (min-width: 1100px) {
	.container-book {
		max-width: 1320px;
		margin: auto;
		margin-top: 60px;
	}
}

@media screen and (max-width: 1100px) {
	.width-seting-nav {
		width: 100%;
		height: auto !important;
	}

	button.search-booking-nav {
		margin: 0px 5px !important;
	}
}

@media (max-width: 991px) {
	:deep(.flight-search) {
		.ibe-booking {
			display: block !important;
			top: unset !important;
			position: unset !important;
			width: auto !important;
			overflow: inherit;
		}

		.flight-search-detail {
			form {
				width: 100%;
				padding: 0px !important;
			}
		}
	}

	.bg-search {
		background-image: unset;
	}

	/*div.widgetSection {
		margin: 0px 13px;
	}*/

	/*.box-input-to {
		border-left: 1px solid #e5e5e5 !important;
		border-top-left-radius: 4px !important;
		border-bottom-left-radius: 4px !important;
	}

	.box-input-from {
		border-top-right-radius: 4px !important;
		border-bottom-right-radius: 4px !important;
	}*/

	.flight-widget-icon {
		display: none;
	}
}

:deep(.open-select) {
	font-size: 18px;
	font-weight: 500;
	position: relative;
	top: 6px;
	background-color: unset !important;
	padding: 0px 15px 0px !important;
}

:deep(.ap-autocomplete) {
	width: 300px;
}

@media (min-width: 593px) and (max-width: 1200px) {
	.ui-autocomplete {
		width: 47% !important;
	}
}

@media (max-width: 591px) {
	:deep(.flight-search) {
		.flight-search-detail {
			form {
				display: block;
			}

			.search-btn {
				.btn {
					padding: 12px 20px !important;
				}
			}
		}
	}

	.date-ranger-style-right {
		padding-right: 0px !important;
	}

	.date-ranger-style-left {
		padding-left: 0px !important;
	}

	.daterangepicker {
		width: fit-content !important;
	}

	input.airport {
		font-size: 18px;
	}

	.date-style-From {
		font-size: 18px !important;
	}

	.date-style-To {
		font-size: 18px !important;
	}

	.ui-autocomplete {
		width: fit-content !important;
	}
}

.list-group {
	.list-group-item:hover {
		background: #000F40 !important;
	}

	.selected {
		background: #000F40 !important;
	}
}

.overlay-container {
	.show {
		width: 300px;
	}
}

:deep(.styleulerror) {
	position: relative;
	margin-top: -28px;
	margin-left: 19px;
}

:deep(.vc-popover-content.vc-date-picker-content) {
	width: 750px;
}

:deep(.vc-popover-content:not(.vc-date-picker-content)) {
	width: auto;
}

:deep(.search-check-box) {
	display: flex;
}

:deep(.vc-highlight-bg-solid) {
	background-color: #000F40 !important;
}

:deep(.vc-highlight-bg-outline, .vc-highlight-bg-none) {
	border-color: #000F40 !important;
	border: 1px solid !important;
}

:deep(.vc-highlight-content-outline, .vc-highlight-content-none) {
	color: #000F40 !important;
}

:deep(.invalid-feedback) {
	color: #ff0000 !important;
}

.desktopstyle.left {
	padding-left: 0px;
}

.desktopstyle.right {
	padding-right: 0px;
}

.bghome {
	position: absolute;
	// margin-left: -10%;
	right: 0;
	left: 0;
	margin-top: -20px;
	/*height: 674px;*/
	width: 100%;
	height: 90%;
}

@media (max-width: 2200px) and (min-width:1550px) {
	.bghome {
		height: auto;
	}
}

@media (max-width: 992px) and (min-width: 300px) {
	.box-input-to {
		border-top-left-radius: 4px !important;
		border-bottom-left-radius: 4px !important;
		border-left: 1px solid #e5e5e5 !important;
	}

	.box-input-from {
		border-top-right-radius: 4px !important;
		border-bottom-right-radius: 4px !important;
		border-right: 1px solid #e5e5e5 !important;
	}

	.form.p-0 {
		padding: 0px 11px !important;
	}

	.desktopstyle.right {
		padding-right: 15px;
	}
}

.bghome img {
	width: 100%;
	// max-width: 100%;
	// max-height: 100%;
	object-fit: cover;
}

.flight-search-title {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	top: 20px;
}

.flight-search-title div.row {
	background: #fff;
	border-radius: 8px;
	box-shadow: 0 1px 7px 0 rgba(0, 0, 0, .4);
	padding: 10px;
	width: 80%;
	margin: auto;
}

.box-flight-search {
	box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

.popper-dw-style {
	& .dw-list {
		height: 255px !important;
	}
}
</style>