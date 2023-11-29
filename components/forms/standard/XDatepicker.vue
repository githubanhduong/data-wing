<script setup lang='ts'>
import { computed, ref } from 'vue'
import { DatePicker } from 'v-calendar'
import BaseWrapper from '@/components/forms/wrapper/BaseWrapper.vue'
import InputWrapper from '@/components/forms/wrapper/InputWrapper.vue'
import type { DatePickerVisibility } from '@/common/custom-type';
import { querySelector } from '@/common/commons';

const props = defineProps({
	label: String,
	errorMsg: { type: [String, Array<string>] },
	containerClass: String,
	id: String,
	placeholder: String,
	autocomplete: { default: 'off', type: String },
	disabled: Boolean,
	readonly: Boolean,
	appendIcon: String,
	prependIcon: String,
	prependText: String,
	inuptClass: String,
	modelValue: Date,
	minDate: Date,
	maxDate: Date,
	columns: Number,
	dateFormat: { default: 'DD MMM YYYY', type: String },
	showErrorsInActivator: Boolean,
	visibility: String as () => DatePickerVisibility,
	inputFocus: String
})
// console.log("date, ", props)

// const currentMonth = ref<number | null>(null)

// if (props.minDate) {
// 	currentMonth.value = props.minDate.getMonth();
// }

const elmState = ref({open: false, hover: false, active: false})
const onFocus=() => {
	elmState.value.active = true
	if (props.inputFocus) {
		querySelector<HTMLElement>(props.inputFocus)?.focus()
	}
}
const onBlur=() => {
	if (!elmState.value.open && !elmState.value.hover) {
		elmState.value.active = false
	}
}
const onElmMouseIn = () => {
	elmState.value.hover = true
}
const onElmMouseOut = () => {
	elmState.value.hover = false
}

const popoverWillShow = () =>{
	elmState.value.open = true
	elmState.value.active = true
}
const popoverWillHide = () =>{
	elmState.value.open = false
}
const popoverDidHide = () =>{
	const focusedElement = document.activeElement;
	if (focusedElement?.tagName !== 'INPUT') {
		elmState.value.active = false
	}
}

const emits = defineEmits<{
	(e: 'update:modelValue', val: Date): void
}>()
const updateValueAction = (date: Date) => {
	emits('update:modelValue', date)
	if (props.inputFocus) {
		querySelector<HTMLElement>(props.inputFocus)?.focus()
	}
};

const attrDate = ref([
	{
		dates: new Date()
	}
])

// const log = (s: any) => {
// 	console.log({s});
	
// }

const listErrors = computed(() => (props.showErrorsInActivator && props.errorMsg)? (Array.isArray(props.errorMsg) ? props.errorMsg : [props.errorMsg]) : undefined)

</script>

<template>
	<base-wrapper :class="['form-group', {'has-error': !!errorMsg}]" :label="label" :error-msg="!showErrorsInActivator? errorMsg : undefined">
		<template #label>
			<slot name="label">
				<label v-if="label">{{ label }}</label>
			</slot>
		</template>
		<template #main_el>
			<DatePicker :modelValue="modelValue" :min-date="minDate" :max-date="maxDate" :columns="columns" @popover-did-hide="popoverDidHide" @popover-will-hide="popoverWillHide" @popover-will-show="popoverWillShow"
			:popover="{ visibility: visibility }"	
			@update:modelValue="updateValueAction" :attributes="attrDate" :masks="{ input: dateFormat }">
				<template #default="{ inputValue, inputEvents }">
					<slot name="main_activator" :inputValue="inputValue" :inputEvents="inputEvents" :isActive="elmState.active" :placeholder="placeholder" :errors="listErrors" :onFocus="onFocus" :onBlur="onBlur" :onElmMouseIn="onElmMouseIn" :onElmMouseOut="onElmMouseOut">
						<InputWrapper :value="inputValue" :on-events="inputEvents" :id="id" type="text" :placeholder="placeholder"
							:autocomplete="autocomplete" :disabled="disabled" :readonly="readonly"
							:prepend-icon="prependIcon" :append-icon="appendIcon"
							:inputClass="inuptClass ? inuptClass : 'form-control'">
						</InputWrapper>
					</slot>
				</template>
			</DatePicker>
		</template>
	</base-wrapper>
</template>
