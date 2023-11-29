<script setup lang='ts'>
import type { DateFare } from '@/common/custom-type'
import { dateToString } from '@/common/dw-luxon'
import { amountFormat } from '@/common/commons'
import { useI18n_ } from '@/plugins/i18n';
import { computed, onMounted, reactive, watch } from 'vue'
import $ from 'jquery';
import 'slick-carousel';
import { ref } from 'vue';
import { useAvailState } from '@/stores/availData';
import { useSeDataState } from '@/stores/engine';

const props = defineProps({
	show: Boolean,
	dateFares: Array<DateFare>,
	activeDate: { type: Date, required: true },
	depart: Date,
	retour: Date,
	currentStep: String
})
const i18n = useI18n_();
const updateDate = reactive({ date: props.activeDate });
const availStore = await useAvailState()
const seStore = useSeDataState()

console.log({ dateFares: props.dateFares });

const emits = defineEmits<{
	(e: 'selected:dateFare', val: Date): void
	(e: 'selected:updateDate', val: Date, activeDate: Date): void
}>()

const getAvaiDate = () => {
	if (props.dateFares && props.dateFares.length > 0) {
		if (props.activeDate) {
			const dateFare = props.dateFares.find(df => df.date.getTime() == props.activeDate.getTime());
			if (dateFare && dateFare.avail) {
				return props.activeDate;
			}
		}
		const order: number[] = [3, 4, 5, 6, 2, 1, 0]
		for (let i = 0; i < order.length; i++) {
			const fd = props.dateFares[order[i]];
			if (fd.avail) {
				return fd.date
			}
		}
	}
	return null;
}

const dateActive = ref(getAvaiDate())
const availSlick = computed(() => {
	const dateFare = props.dateFares!.find(df => df.date >= props.activeDate && df.avail == true);
	dateFare!.date != props.activeDate ? availStore.setSelectedDateDepart(dateFare!.date) : {}
	return dateFare!.date;
})
if (dateActive.value && dateActive.value.getTime() != props.activeDate?.getTime()) {
	emits('selected:dateFare', dateActive.value)
}

const handlerSelectItem = (item: DateFare) => {
	if (item.date.getTime() != dateActive.value?.getTime()) {
		dateActive.value = item.date
		emits('selected:dateFare', item.date)
	}
}

const addDate = () => {
	const newDate = new Date(updateDate.date);
	newDate.setDate(newDate.getDate() + 7);
	try {
		updateDate.date = (newDate.getDate() + 3) > props.retour!.getDate() && props.currentStep === 'depart' ? updateMinMaxDate(props.retour!, -3) : newDate;
	} catch (error) {
		updateDate.date = newDate;
	}
	dateActive.value = updateMinMaxDate(dateActive.value!, 7)
	// Emit the event with the updated date
	emits('selected:updateDate', updateDate.date, dateActive.value);
	console.log(":))")
}

const subtractDate = () => {
	const newDate = new Date(updateDate.date);
	newDate.setDate(newDate.getDate() - 7);
	updateDate.date = (newDate.getDate() - 3) < props.depart!.getDate() && props.currentStep === 'retour' ? updateMinMaxDate(props.depart!, 3) : newDate;
	dateActive.value = updateMinMaxDate(dateActive.value!, -7)
	// Emit the event with the updated date
	emits('selected:updateDate', updateDate.date, dateActive.value);
	console.log(":))")
}

const updateMinMaxDate = (date: Date, days: number) => {
	const newDate = new Date(date);
	newDate.setDate(newDate.getDate() + days);
	return newDate
}

onMounted(() => {
	$('.fare-6').slick({
		initialSlide: 0,
		dots: false,
		speed: 300,
		slidesToShow: 7,
		slidesToScroll: 2,
		infinite: false
	});
});

// watch(() => {return props.dateFares![6].date >= props.retour! && props.currentStep! === 'depart' && seStore.seData.seForm.bookingType !== 'ONEWAY' ? true : false}, (newValue) => newValue ? {} : {})

console.log({ dateFares: props.dateFares });
</script>

<template>
	<div class="date-fare-slider wrap-shadow">
		<button @click="subtractDate()" class="custom-arrow-slick prev" aria-label="Previous" type="button"
			:disabled="dateFares![0].date <= new Date() || (dateFares![0].date <= props.depart! && props.currentStep! === 'retour')">
			<i class="fas fa-chevron-left"></i>
		</button>
		<div class="fare-6">
			<div class="slide-item" v-for="(item, index) in dateFares" :key="index">
				<div v-show="props.show" class="fare-box">
					<div class="stage">
						<div class="dot-pulse"></div>
					</div>
				</div>
				<div class="fare-box no-flight" v-if="!item.avail">
					<div class="box-lowfare"></div>
					<div class="mt-1">
						<span>{{ dateToString(item.date, 'EEE') }}</span>
						<h5 class="date">{{ dateToString(item.date, 'MMM dd') }}</h5>
						<div class="icon-no-flight">
							<img src="@/assets/images/no-travellin-black.png" class="white-temp">
							<img src="@/assets/images/no-travellin-white.png" class="black-temp">
						</div>
					</div>
				</div>
				<div :class="['fare-box', { 'active': item.date.getTime() === props.activeDate?.getTime() }]" v-if="item.avail"
					@click="handlerSelectItem(item)">
					<div class="box-lowfare" v-if="item.lowestFare">
						<div class="stylelowest">
							<label>Lowest</label>
						</div>
					</div>
					<div class="">
						<span>{{ dateToString(item.date, 'EEE') }}</span>
						<h5 class="date">{{ dateToString(item.date, 'MMM dd') }}</h5>
						<h6 class="fare">{{ amountFormat(item.amt!, item.currency!, i18n.locale.value) }}</h6>
					</div>
				</div>
			</div>
		</div>
		<button @click="addDate()" class="custom-arrow-slick next" aria-label="Next" type="button" :disabled="dateFares![6].date >= props.retour! && props.currentStep! === 'depart' && seStore.seData.seForm.bookingType !== 'ONEWAY'">
			<i class="fas fa-chevron-right"></i>
		</button>
	</div>
</template>

<style lang="scss" scoped></style>