<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { DatePicker } from 'v-calendar'
import BaseWrapper from '@/components/forms/wrapper/BaseWrapper.vue'
import type { AttributeConfig } from 'v-calendar/dist/types/src/utils/attribute';
import InputWrapper from '@/components/forms/wrapper/InputWrapper.vue';
import type {DatePickerVisibility} from '@/common/custom-type'
import { querySelector } from '@/common/commons';

const props = defineProps({
	labelStart: String,
	labelEnd: String,
	errorMsgStart: { type: [String, Array<string>] },
	errorMsgEnd: { type: [String, Array<string>] },
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
	valueStart: Date,
	valueEnd: Date,
	minDate: Date,
	maxDate: Date,
	columns: { type: Number, default: 3 },
	dateFormat: { default: 'DD MMM YYYY', type: String },
	mainContainerClass: String,
	isRange: { type: Boolean, default: true},
	showErrorsInActivator: Boolean,
	visibility: String as () => DatePickerVisibility,
	inputFocus: {type: Array<string>, validator: (value: Array<string>) => value? value.length == 2 : true}
})

const range = ref<{start: Date|undefined, end:Date|undefined} | null>({
	start: props.valueStart,
	end: props.valueEnd,
})

const emits = defineEmits<{
	(e: 'update:modelValue', val: { start: Date|undefined, end: Date|undefined }): void
}>()

if (range.value?.start && range.value?.end && range.value?.start?.getTime() > range.value?.end?.getTime()) {
	range.value.start = undefined
	range.value.end = undefined
	emits('update:modelValue', {start: undefined, end: undefined});
}

const dragValue = ref<{ start: Date, end: Date } | null>(null);

// const active = ref<{ start: boolean, end: boolean }>({start: false, end: false})
// const inFocus = ref(false)

const elmState = ref({open: false, hover: false, active: false})
const onFocus = {
	start: () => {
		elmState.value.active = true
		if (props.inputFocus) {
			querySelector<HTMLElement>(props.inputFocus[0])?.focus()
		}
	},
	end: () => {
		elmState.value.active = true
		if (props.inputFocus) {
			querySelector<HTMLElement>(props.inputFocus[1])?.focus()
		}
	}
}
const onBlur = () => {
	if (!elmState.value.open && !elmState.value.hover) {
		elmState.value.active = false
	}
}
const forceBlur = () => {
	elmState.value.active = false
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

const selectDragAttribute = computed(() => ({
	popover: {
		visibility: 'hover',
		isInteractive: false,
	},
} as AttributeConfig));

const updateValueAction = (date: { start: Date, end: Date }) => {
	emits('update:modelValue', date);
	if (props.inputFocus) {
		querySelector<HTMLElement>(props.inputFocus[1])?.focus()
	}
}

const attrDate = ref([
	{
		dates: new Date(),
		popover: {
			visibility: 'click'
		}
	}
])

const listErrorsStart = computed(() => (props.showErrorsInActivator && props.errorMsgStart)? (Array.isArray(props.errorMsgStart) ? props.errorMsgStart : [props.errorMsgStart]) : undefined)
const listErrorsEnd = computed(() => (props.showErrorsInActivator && props.errorMsgEnd)? (Array.isArray(props.errorMsgEnd) ? props.errorMsgEnd : [props.errorMsgEnd]) : undefined)

const rangeValue = computed(() => ({start: range.value?.start, end: range.value?.end}) )

watch(() => [props.valueStart, props.valueEnd], ([startVal, endVal]) => {
	range.value!.start = startVal
	range.value!.end = endVal
})

</script>

<!-- :select-attribute="selectDragAttribute" :drag-attribute="selectDragAttribute" @drag="dragValue = $event" -->
<template>
	<DatePicker v-model.range="rangeValue" :min-date="minDate" :max-date="maxDate" :columns="columns" @popover-did-hide="popoverDidHide" @popover-will-hide="popoverWillHide" @popover-will-show="popoverWillShow"
		:popover="{ visibility: visibility }"
		@update:modelValue="updateValueAction" :attributes="attrDate" :masks="{ input: dateFormat }"
		:select-attribute="selectDragAttribute" :drag-attribute="selectDragAttribute" @drag="dragValue = $event" >
		<template #day-popover="{ format }">
			<div class="text-sm">
				{{ format(dragValue ? dragValue.start : range?.start, 'MMM D') }}
				-
				{{ format(dragValue ? dragValue.end : range?.end, 'MMM D') }}
			</div>
		</template>
		<template #default="{ inputValue, inputEvents }">
			<slot name="mainContainner" :inputValue="inputValue" :inputEvents="inputEvents" :elmState="elmState" :placeholder="placeholder" :isRange="isRange"
				:errorsStart="listErrorsStart" :errorsEnd="listErrorsEnd" :onFocus="onFocus" :onBlur="onBlur" :onElmMouseIn="onElmMouseIn" :onElmMouseOut="onElmMouseOut"
				:forceBlur="forceBlur"
				>
				<div :class="mainContainerClass">
					<div class="date-rang-start col-sm-6 mb-2 date-ranger-style-right">
						<base-wrapper :class="['form-group', {'has-error': !!listErrorsStart}]" :label="labelStart" :error-msg="!showErrorsInActivator? errorMsgStart : undefined">
							<!-- activeStyle box-input-Datefrom styleboxmain -->
							<template #main_el>
								<InputWrapper :value="inputValue.start" :on-events="inputEvents.start" :id="id" type="text"
									:placeholder="placeholder" :autocomplete="autocomplete" :disabled="disabled"
									:readonly="readonly" :prepend-icon="prependIcon" :append-icon="appendIcon"
									:inputClass="inuptClass ? inuptClass : 'form-control'">
								</InputWrapper>
							</template>
						</base-wrapper>
					</div>
					<div :class="['date-rang-end col-sm-6 mb-2 date-ranger-style-left', {'disabled': !isRange}]" >
						<base-wrapper :class="['form-group', {'has-error': !!listErrorsEnd}]" :label="labelEnd" :error-msg="!showErrorsInActivator? errorMsgEnd : undefined">
							<!-- activeStyle box-input-Datefrom styleboxmain -->
							<template #main_el>
								<InputWrapper :value="inputValue.end" :on-events="inputEvents.end" :id="id" type="text"
									:placeholder="placeholder" :autocomplete="autocomplete" :disabled="disabled"
									:readonly="readonly" :prepend-icon="prependIcon" :append-icon="appendIcon"
									:inputClass="inuptClass ? inuptClass : 'form-control'">
								</InputWrapper>
							</template>
						</base-wrapper>
					</div>
				</div>
			</slot>

		</template>
	</DatePicker>
</template>
