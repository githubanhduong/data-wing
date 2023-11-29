<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import PassengerInput from '@/components/forms/PassengerInput.vue'
// import { useI18n_ } from '@/plugins/i18n'
import { useSeDataState } from '@/stores/engine'
import { seDataVaidatorMini, errorMessages } from '@/compositions/vuevalidate-utils'
import XDatepicker from '@/components/forms/standard/XDatepicker.vue'
import { ibeDepartSelection, ibeFlightSearch, ibeFlightSearchSlick } from '@/api/services'
import { Airport, CityPairManager } from '@/common/CityPairManager'
import { useI18n_ } from '@/plugins/i18n'
import AutoComplete from '@/components/forms/standard/AutoComplete.vue'
import { removeDiacritics } from '@/common/commons'
import { BookingType, type AutocompleteElm, type FilterFunction, SeStep } from '@/common/custom-type'
import { StatusRes } from '@/api/type'
import { useAvailState } from '@/stores/availData'

import { useMarketDataState } from '@/stores/marketData'
import router, { RouterName } from '@/router'
import { postDataBack, postDataBackSlick } from '@/compositions/store-value-back'

// const marketList = await getMarketList()

const marketStore = useMarketDataState();

// const marketList = marketStore.marketList

console.log({ marketList: marketStore.marketList });
console.log({ marketListSize: marketStore.marketList.length });

const { t } = useI18n_()
const seStore = useSeDataState()
const availStore = useAvailState()


console.log('SE store:' + seStore.seData.seForm.toCode);

const departDateSlick = ref(seStore.seData.seForm.departDate)

const arrivalAutocomplete = ref<AutocompleteElm | null>(null)
const cpData = reactive({
	departItems: [] as Airport[],
	arrivalItems: [] as Airport[]
})

const cityPairManager = new CityPairManager() // reactive(new CityPairManager())
cityPairManager.applyCityPairss(marketStore.marketList, t, (departs: Airport[]) => cpData.departItems = departs)

if (seStore.seData.seForm.fromCode) {
	console.log('SE store: fromCode is not null');
	cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
}

// Form submit
const errors = (errors: any) => {
	errors.forEach((e: any) => {
		console.log(`${e.$propertyPath} - ${e.$message}`)
	})
}
const v$ = seDataVaidatorMini(seStore.seData)
const handleSubmit = async () => {
	console.log({ ...seStore.seData.seForm })
	errors(v$.value.seForm.$errors)

	if (seStore.seData.seForm.retourDate) {
		seStore.seData.seForm.bookingType = BookingType.ROUNDTRIP
	} else {
		seStore.seData.seForm.bookingType = BookingType.ONEWAY
	}

	v$.value.$touch()
	if (v$.value.$invalid) {
		console.log('Validation errors!')
		return
	}
	console.log('Form submitted successfully!')

	if (seStore.seData.seForm.departDate == departDateSlick.value && seStore.seData.step == 2) {
		await ibeFlightSearchSlick("return", seStore.seData.seForm.retourDate!, seStore.seData.seForm, null).then(async (data) => {
			if (data.status === StatusRes.SUCCESS) {
				postDataBackSlick("retour", seStore.seData.seForm!.retourDate!, data.data, SeStep.RETURN)
				await location.reload()
			} else {
				availStore.data.availabilityData = undefined
			}

			for (const prop in availStore.data.availabilityData?.flights) {
				const f = availStore.data.availabilityData?.flights[prop]
				const s = `${f.carrierCode}.${f.flightNumber}.${f.origin}${f.destination}${(f.departure instanceof Date) ? 'date' : typeof f.departure}`
				console.log(s)
			}
		}).catch(error => { alert(error.message) })
		await ibeDepartSelection(availStore.data.flightFareKeySelections![0].flightDate, availStore.data.flightFareKeySelections![0].journeyKey, availStore.data.flightFareKeySelections![0].fareKey, null/* seStore.seData.dataKey */)
	} else {
		availStore.data.availabilityData = null

		ibeFlightSearch(seStore.seData.seForm, null).then(async (data) => {
			if (data.status === StatusRes.SUCCESS) {
				await postDataBack(data.data, SeStep.HOMEPAGE)
			} else {
				availStore.data.availabilityData = undefined
				availStore.data.flightFareKeySelections = undefined
			}

			for (const prop in availStore.data.availabilityData?.flights) {
				const f = availStore.data.availabilityData?.flights[prop]
				const s = `${f.carrierCode}.${f.flightNumber}.${f.origin}${f.destination}${(f.departure instanceof Date) ? 'date' : typeof f.departure}`
				console.log(s)
			}
			seStore.setStep(SeStep.DEPART)
			await router.push({ name: RouterName.IbeFlight })
			availStore.data.reloadSlick! ? await location.reload() : {}
		})
	}
}

const customFilter: FilterFunction = (query: string, item: Airport) =>
	item.searching(removeDiacritics(query?.toLowerCase().trim()))
const itemTitle = (item: Airport) => `${item.city} (${item.code})`
const itemTitleTextSub = (item: Airport) => {
	if (item.name == 'all airports' || item.name == 'tous les aéroports')
		return `${item.city} (${item.code}) - ${item.name}`
	return `${item.city} (${item.code})`
}
watch(() => seStore.seData.seForm.fromCode, (newFromCode: string, oldFromCode: string) => {
	if (newFromCode !== oldFromCode) {
		cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
		if (arrivalAutocomplete.value) {
			//arrivalAutocomplete.value.clearSelectedItem();
		}
	}
})

const cityPairCallBack = (departs: Airport[]) => {
	cpData.departItems = departs
	if (seStore.seData.seForm.fromCode) {
		cpData.arrivalItems = cityPairManager.getArrivals(seStore.seData.seForm.fromCode)
	}
}
watch(marketStore.marketList, () => {
	cityPairManager.applyCityPairss(marketStore.marketList, t, cityPairCallBack)
})
setTimeout(() => {
	departDateSlick.value === undefined ? departDateSlick.value = seStore.seData.seForm.departDate : {}
}, 1000);
</script>

<template>
	<form class="row m-0 dw-input">
		<div class="col-lg-2">
			<AutoComplete label="From" append-icon="fas fa-plane" v-model="seStore.seData.seForm.fromCode"
				:popper-same-min-width="true" popper-class="ap-autocomplete"
				:errorMsg="errorMessages(v$.seForm.fromCode, $t)" :custom-filter="customFilter" no-ddata-text="No data"
				:item-title="itemTitle" item-value="code" :items="cpData.departItems">
				<template #item="{ bindingProps, item, isSelected, isHover }">
					<li v-bind="bindingProps"
						:class="['list-group-item', { 'selected': isSelected, 'hover-item': isHover }]">
						{{ itemTitleTextSub(item) }}
					</li>
				</template>
			</AutoComplete>
		</div>
		<div class="col-lg-2">
			<AutoComplete label="To" append-icon="fas fa-map-marker-alt" v-model="seStore.seData.seForm.toCode"
				:popper-same-min-width="true" ref="arrivalAutocomplete" popper-class="ap-autocomplete"
				:errorMsg="errorMessages(v$.seForm.toCode, $t)" :custom-filter="customFilter" no-ddata-text="No data"
				:item-title="itemTitle" item-value="code" :items="cpData.arrivalItems">
				<template #item="{ bindingProps, item, isSelected, isHover }">
					<li v-bind="bindingProps" :class="['list-group-item', { 'selected': isSelected, 'hover-item': isHover }]">
						{{ itemTitleTextSub(item) }}
					</li>
				</template>
			</AutoComplete>
		</div>
		<div class="col-lg-2">
			<XDatepicker label="Departure date" v-model="seStore.seData.seForm.departDate" :min-date="new Date()" readonly
				:errorMsg="errorMessages(v$.seForm.departDate, $t)" append-icon="far fa-calendar-alt fa-size-14-px">
			</XDatepicker>
		</div>
		<div class="col-lg-2">
			<XDatepicker label="Return date" v-model="seStore.seData.seForm.retourDate" :disabled="seStore.returnDate! == undefined"
				:minDate="seStore.departDate || new Date()" :errorMsg="errorMessages(v$.seForm.retourDate, $t)" readonly
				append-icon="far fa-calendar-alt fa-size-14-px"></XDatepicker>
		</div>
		<div class="col-lg-2"> <!-- :pax-req-data="store.passengerInputProps" -->
			<PassengerInput label="Traveller & class" :errorMsg="errorMessages(v$.seForm.nbAdt, $t)"></PassengerInput>
		</div>
		<div class="col-lg-2">
			<label class="">&nbsp;</label>
			<div class="search-btn">
				<a href="#" class="btn btn-solid color1" @click="handleSubmit">Research</a>
			</div>
		</div>
		<div class="responsive-close">
			<i class="far fa-times-circle" />
		</div>
	</form>
</template>

<style scoped></style>
