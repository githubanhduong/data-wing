<script setup lang='ts'>
import { reactive, ref, watch } from 'vue';
import 'ion-rangeslider';
import 'ion-rangeslider/css/ion.rangeSlider.css';
import '@/styles/price-range.scss';

const isOpen = reactive({
	main: true,
	stop: true,
	price: true,
	airline: true,
	departureTime: true,
	arrivalTime: true,
	cabin: true,
	facility: true,
} as any)
const togggleClassOpen = (key: string) => {
	isOpen[key] = !isOpen[key]
}

const rangeProp = reactive({ min: 0, max: 1500, from: 0, to: 1500, instanceElm: null })
const rangElm = ref(null)
const updateInputs = (data: any) => {
	rangeProp.from = data.from
	rangeProp.to = data.to
	console.log({ data });
}

watch(rangElm, () => {
	if (rangElm.value) {
		const $range = $(".js-range-slider")
		console.log({ elm: $range, ref: rangElm, refVal: rangElm.value })
		$range.ionRangeSlider({
			type: "double",
			min: rangeProp.min,
			max: rangeProp.max,
			from: rangeProp.from,
			to: rangeProp.to,
			prefix: '$',
			onStart: updateInputs,
			onChange: updateInputs,
			step: 100,
			prettify_enabled: true,
			prettify_separator: ".",
			values_separator: " - ",
			force_edges: true
		})
		rangeProp.instanceElm = $range.data("ionRangeSlider")
	} else {
		if (rangeProp.instanceElm) {
			const t = setTimeout(() => {
				(rangeProp.instanceElm as any).destroy();
				rangeProp.instanceElm = null
				clearTimeout(t)
			}, 500);
		}
	}
})

</script>

<template>
	<div class="left-sidebar">
		<div class="back-btn">back</div>
		<!--<div class="search-bar">
			<input type="text" placeholder="Search here..">
			<i class="fas fa-search"></i>
		</div>-->
		<div :class="['middle-part collection-collapse-block', { 'open': isOpen['main'] }]">
			<a href="javascript:void(0)" class="section-title collapse-block-title" @click="togggleClassOpen('main')">
				<h5>Filter</h5>
				<i class="fas fa-align-center"></i>
			</a>
			<transition name="filter" mode="in-out">
				<div class="collection-collapse-block-content" v-if="isOpen['main']">
					<div class="filter-block">
						<div :class="['collection-collapse-block', { 'open': isOpen['stop'] }]">
							<div class="collapse-block-title" @click="togggleClassOpen('stop')">
								<span>stops</span>
							</div>
							<transition name="filter" mode="in-out">
								<div class="collection-collapse-block-content" v-if="isOpen['stop']">
									<div class="collection-brand-filter">
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="free-d">
											<label class="form-check-label" for="free-d">non stop</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="time">
											<label class="form-check-label" for="time">1 stop</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="zara">
											<label class="form-check-label" for="zara">2 stop</label>
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
					<div class="filter-block">
						<div :class="['collection-collapse-block', { 'open': isOpen['price'] }]">
							<h6 class="collapse-block-title" @click="togggleClassOpen('price')">price</h6>
							<transition name="filter" mode="in-out">
								<div class="collection-collapse-block-content" v-if="isOpen['price']">
									<div class="wrapper">
										<div class="range-slider">
											<input type="text" class="js-range-slider" value="" ref="rangElm" />
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
					<!-- <div class="filter-block">
						<div :class="['collection-collapse-block', { 'open': isOpen['airline'] }]">
							<h6 class="collapse-block-title" @click="togggleClassOpen('airline')">airlines</h6>
							<transition name="filter" mode="in-out">
								<div class="collection-collapse-block-content" v-if="isOpen['airline']">
									<div class="collection-brand-filter">
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="wifi">
											<label class="form-check-label" for="wifi">Qatar airways</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="spa">
											<label class="form-check-label" for="spa">singapore airlines</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="pet">
											<label class="form-check-label" for="pet">Nippon Airways</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="parking">
											<label class="form-check-label" for="parking">Cathay Pacific</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="swimming">
											<label class="form-check-label" for="swimming">Emirates</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="chinese">
											<label class="form-check-label" for="chinese">Hainan Airlines</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="restaurant">
											<label class="form-check-label" for="restaurant">Qantas Airways</label>
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>-->
					<div class="filter-block">
						<div :class="['collection-collapse-block', { 'open': isOpen['departureTime'] }]">
							<h6 class="collapse-block-title" @click="togggleClassOpen('departureTime')">departure time</h6>
							<transition name="filter" mode="in-out">
								<div class="collection-collapse-block-content" v-if="isOpen['departureTime']">
									<div class="collection-brand-filter">
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="suomi">
											<label class="form-check-label" for="suomi">
												<span class="blur-up lazyload me-1">morning (6am to 12pm)
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="english">
											<label class="form-check-label" for="english">
												<span class="blur-up lazyload me-1">noon (12pm to 6pm)
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="sign">
											<label class="form-check-label" for="sign">
												<span class="blur-up lazyload me-1">evening (after 6pm)
												</span>
											</label>
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
					<div class="filter-block">
						<div :class="['collection-collapse-block', { 'open': isOpen['arrivalTime'] }]">
							<h6 class="collapse-block-title" @click="togggleClassOpen('arrivalTime')">arrival time</h6>
							<transition name="filter" mode="in-out">
								<div class="collection-collapse-block-content" v-if="isOpen['arrivalTime']">
									<div class="collection-brand-filter">
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="morning">
											<label class="form-check-label" for="morning">
												<span class="blur-up lazyload me-1">morning (6am to 12pm)
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="noon">
											<label class="form-check-label" for="noon">
												<span class="blur-up lazyload me-1">noon (12pm to 6pm)
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="evening">
											<label class="form-check-label" for="evening">
												<span class="blur-up lazyload me-1">evening (after 6pm)
												</span>
											</label>
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
					<div class="filter-block">
						<div :class="['collection-collapse-block', { 'open': isOpen['cabin'] }]">
							<h6 class="collapse-block-title" @click="togggleClassOpen('cabin')">Cabin</h6>
							<transition name="filter" mode="in-out">
								<div class="collection-collapse-block-content" v-if="isOpen['cabin']">
									<div class="collection-brand-filter">
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="bseco">
											<label class="form-check-label" for="bseco">
												<span class="blur-up lazyload me-1">Basic Economy
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="economy">
											<label class="form-check-label" for="economy">
												<span class="blur-up lazyload me-1">Economy
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="business">
											<label class="form-check-label" for="business">
												<span class="blur-up lazyload me-1">Business
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="mixed">
											<label class="form-check-label" for="mixed">
												<span class="blur-up lazyload me-1">Mixed
												</span>
											</label>
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
					<div class="filter-block">
						<div :class="['collection-collapse-block', { 'open': isOpen['facility'] }]">
							<h6 class="collapse-block-title" @click="togggleClassOpen('facility')">Facilities</h6>
							<transition name="filter" mode="in-out">
								<div class="collection-collapse-block-content" v-if="isOpen['facility']">
									<div class="collection-brand-filter">
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="baggage">
											<label class="form-check-label" for="baggage">
												<span class="blur-up lazyload me-1">Baggage
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="meal">
											<label class="form-check-label" for="meal">
												<span class="blur-up lazyload me-1">Meal
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="entertainment">
											<label class="form-check-label" for="entertainment">
												<span class="blur-up lazyload me-1">Entertainment
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="wifiopt">
											<label class="form-check-label" for="wifiopt">
												<span class="blur-up lazyload me-1">Wifi
												</span>
											</label>
										</div>
										<div class="form-check collection-filter-checkbox">
											<input type="checkbox" class="form-check-input" id="ubspower">
											<label class="form-check-label" for="ubspower">
												<span class="blur-up lazyload me-1">Usb and power
												</span>
											</label>
										</div>
									</div>
								</div>
							</transition>
						</div>
					</div>
				</div>
			</transition>

		</div>
	</div>
</template>

<style lang="scss" scoped>
.filter-enter-from,
.filter-leave-to {
	opacity: 0;
	transform: translateY(20px);
}

.filter-enter-to,
.filter-leave-from {
	opacity: 1;
	transform: translateY(0);
}

.filter-enter-active,
.filter-leave-active {
	transition: all 0.5s ease;
}
</style>