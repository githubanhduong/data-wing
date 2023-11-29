<script setup lang='ts'>
import type { Passenger, PassengerType } from '@/common/datawings-xsd'
import MessageText from './utils/MessageText.vue'
import InputForm from './forms/standard/InputForm.vue'
import XSelect from './forms/standard/XSelect.vue'
import { computed } from 'vue'
import { useI18n_ } from '@/plugins/i18n'
import AutoComplete from '@/components/forms/standard/AutoComplete.vue'
import XDatepicker from '@/components/forms/standard/XDatepicker.vue'
import { useAvailState } from '@/stores/availData'
import { removeDiacritics } from '@/common/commons'
import { pathErrorsOnEach, pathErrorsOnPaxIdType } from '@/compositions/vuevalidate-utils'

const props = defineProps<{
	index: number;
	paxType: PassengerType;
	paxTypeIndex: number;
	error?: Record<string, any>;
	hidden: boolean;
	// passenger: Passenger;
}>()

const availStore = useAvailState()

const $i18n = useI18n_()
const listIdType = computed(() => [
	{ title: $i18n.t('se.passenger.idType.PP', '.PP'), value: 'PP' }, { title: $i18n.t('se.passenger.idType.NID', '.NID'), value: 'NID' }
])

const listCountries = computed(() => {
	const list = []
	const countries = ($i18n.getLocaleMessage($i18n.locale.value) as any)['country']
	for (const key in countries) {
		list.push({ title: countries[key], value: key })
	}
	return list
})

const nationalityFilter = (text: string, item: { title: string, value: string }) => {
	const search = removeDiacritics(text.toLowerCase())
	return item.title.toLowerCase().indexOf(search) > -1
			|| item.value.toLowerCase().indexOf(search) > -1
}

const passenger = computed(() => availStore.data.passengerData? availStore.data.passengerData.passengers[props.index] : {} as Passenger)

const listTitle = computed(() => {
	if (props.paxType === "ADT") {
		return [{ title:  $i18n.t('se.passenger.title.MR', '.Mr.'), value: 'MR' }, { title: $i18n.t('se.passenger.title.MS', '.Ms.'), value: 'MS' }]
	} else if (props.paxType === "CHD") {
		return [{title: $i18n.t('se.passenger.title.CHD', 'Child'), value: 'CHD'}]
	} else {
		return [{title: $i18n.t('se.passenger.title.INF', 'Infant'), value: 'INF'}]
	}
})
const idNumberLabel = computed(() => !passenger.value.identityType? 'se.form.passenger.idNumber' :  passenger.value.identityType === 'PP'? 'se.form.passenger.passport' : 'se.form.passenger.nationalityId')
const idExpiredDateLabel = computed(() => !passenger.value.identityType? 'se.form.passenger.idExpiredDate' :  passenger.value.identityType === 'PP'? 'se.form.passenger.ppExpiredDate' : 'se.form.passenger.nidExpiredDate')
</script>

<template>
	<div class="form-infor">
		<h5 class="fw-bold"><i class="fas fa-user me-2"></i>
			<MessageText :code="`se.form.passenger.${paxType}`" :text="`.${paxType}`">{{ paxTypeIndex }}</MessageText>
		</h5>
		<div class="row mt-4">
			<XSelect class="col-md-4" :id="`title${index}`" v-model="passenger.title" :readonly="paxType != 'ADT'" :error-msg="pathErrorsOnEach(error, 'title', $t)"
				:items="listTitle"
				:placeholder="$t('se.form.passenger.chooseTitle', 'Choose...')">
				<template #label>
					<MessageText tag="label" :for="`title${index}`" code="se.form.passenger.title" text=".Title">*
					</MessageText>
				</template>
			</XSelect>
			<InputForm class="col-md-4" :id="`firstName${index}`" v-model="passenger.firstName" :error-msg="pathErrorsOnEach(error, 'firstName', $t)">
				<template #label>
					<MessageText tag="label" :for="`firstName${index}`" code="se.form.passenger.firstName"
						text=".First name">*</MessageText>
				</template>
			</InputForm>
			<InputForm class="col-md-4" :id="`lastName${index}`" v-model="passenger.lastName" :error-msg="pathErrorsOnEach(error, 'lastName', $t)">
				<template #label>
					<MessageText tag="label" :for="`lastName${index}`" code="se.form.passenger.lastName" text=".Last name">*
					</MessageText>
				</template>
			</InputForm>
		</div>
		<div class="row mt-4">
			<XDatepicker class="col-md-4" :max-date="new Date()" readonly visibility="click" :id="`dateOfBirth${index}`" v-model="passenger.dateOfBirth"
				prepend-icon="far fa-calendar-alt fa-size-14-px" :error-msg="pathErrorsOnEach(error, 'dateOfBirth', $t)">
				<template #label>
					<MessageText tag="label" :for="`dateOfBirth${index}`" code="se.form.passenger.dateOfBirth" text=".Date of birth">*</MessageText>
				</template>
			</XDatepicker>
			<AutoComplete containerClass="col-md-4" :id="`nationality${index}`" :items="listCountries" popperSameWidth v-model="passenger.nationality"
				:customFilter="nationalityFilter" popper-class="pax-nationality" :error-msg="pathErrorsOnEach(error, 'nationality', $t)">
				<template #label>
					<MessageText tag="label" :for="`nationality${index}`" code="se.form.passenger.nationality" text=".ID type">*</MessageText>
				</template>
				<template #item="{ bindingProps, item, isSelected, isHover}">
					<li v-bind="bindingProps" :class="[{'dw-list-item': true, 'dw-list-item--active': isSelected, 'dw-list-item--link': isHover}, 'country-flag', item.value]">
						{{ item.title }}
					</li>
				</template>
			</AutoComplete>
			<!-- <XSelect class="col-md-4" :id="`title${index}`" :items="listIdType" v-model="passenger.identityType" :error-msg="pathErrorsOnEach(error, 'identityType', $t)" -->
			<XSelect v-if="!props.hidden" class="col-md-4" :id="`title${index}`" :items="listIdType" v-model="passenger.identityType" :error-msg="pathErrorsOnEach(error, 'identityType', $t)"
				:placeholder="$t('se.form.passenger.chooseIdType', 'Choose id type')">
				<template #label>
					<MessageText tag="label" :for="`idType${index}`" code="se.form.passenger.idType" text=".ID type">*</MessageText>
				</template>
			</XSelect>
		</div>
		<div class="row mt-4">
			<InputForm v-if="!props.hidden" class="col-md-4" :id="`idNumber${index}`" v-model="passenger.identityNumber" :error-msg="pathErrorsOnPaxIdType(passenger, error, 'identityNumber', $t)" :disabled="passenger.identityType ? false :true">
				<template #label>
					<MessageText tag="label" :for="`idNumber${index}`" :code="idNumberLabel" text=".ID number">*</MessageText>
				</template>
			</InputForm>

			<XDatepicker v-if="!props.hidden" class="col-md-4" :min-date="new Date()" readonly visibility="click" :id="`idExpiredDate${index}`" v-model="passenger.idExpirationDate" :disabled="passenger.identityType ? false :true"
				prepend-icon="far fa-calendar-alt fa-size-14-px" :error-msg="pathErrorsOnPaxIdType(passenger, error, 'idExpirationDate', $t)">
				<template #label>
					<MessageText tag="label" :for="`idExpiredDate${index}`" :code="idExpiredDateLabel" text=".ID expired date">{{passenger.identityType === "PP"? "*" : ""}}</MessageText>
				</template>
			</XDatepicker>
	</div>
</div></template>

<style lang="scss">
.pax-nationality {
	& .list-group {
		max-height: 293px;
		overflow-y: auto;
	}
}
</style>