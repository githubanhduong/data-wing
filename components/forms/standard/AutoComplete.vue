<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import ActivatorPopperWrapper from '@/components/forms/wrapper/ActivatorPopperWrapper.vue'
import InputWrapper from '@/components/forms/wrapper/InputWrapper.vue'
import type { ActivatorPopper } from '@/common/custom-type'
import { removeDiacritics, isString, querySelector } from '@/common/commons'
import { selectAllText } from '@/compositions/common-event'
import type { ErrorServer } from '@/api/type'
import { useAvailState } from '@/stores/availData'

const props = defineProps({
	label: String,
	containerClass: String,
	errorMsg: { type: [String, Array<string>] },
	activatorClass: String,
	activatorInputId: String,
	popperClass: String,
	placeholder: String,
	autocomplete: { default: 'off', type: String },
	disabled: Boolean,
	readonly: Boolean,
	appendIcon: String,
	prependIcon: String,
	items: { type: Array as () => any[] },
	noDataText: String,
	hideNoData: Boolean,
	customFilter: Function,
	itemTitle: { type: [String, Function] },
	itemValue: { type: [String, Function] },
	popperHeight: Number,
	popperSameMinWidth: Boolean,
	popperSameWidth: Boolean,
	modelValue: String,
	showErrorsInActivator: Boolean,
	inputFocus: String
})
const emits = defineEmits<{
	(e: 'update:modelValue', val: string): void
	(e: 'update:getNation', val: string): void
}>()

const availStore = useAvailState()

const isEqualValue = (item1: any, item2: any) => {
	if (!item1 || !item2) {
		return false
	}

	return getItemValue(item1) === getItemValue(item2)
} 

const getItemValue = (item: any) => {
	if (!item) {
		return undefined
	}
	if (!props.itemValue) {
		return item.value
	}
	else if (isString(props.itemValue)) {
		return item[props.itemValue as string]
	} else {
		return (props.itemValue as Function)(item)
	}
}

const getItemTitle = (item: any) => {
	if (!item) {
		return undefined
	}
	if (!props.itemTitle) {
		return item.title
	}
	else if (isString(props.itemTitle)) {
		return item[props.itemTitle as string]
	} else {
		return (props.itemTitle as Function)(item)
	}
}

const activatorMenu = ref<ActivatorPopper | null>(null)
const data = reactive({
	selectedItem: null as any,
	search: '',
	itemTitleDisplay: '',
	onChanging: false,
	popperOnMouseEnter: false,
	filterdItems: props.items,
	currentIndexHover: -1 as number,
	// active: false
})

// const onFocus = () => data.active = true
// const onBlur = () => data.active = false

const onPopperClose = () => {
	data.popperOnMouseEnter = false
	data.currentIndexHover = -1
}

const handlerSelectItem = (item: any) => {
	data.selectedItem = item
	// data.search = getItemTitle(item)
	const d = getItemTitle(item)
	data.search = d
	data.itemTitleDisplay = d
	activatorMenu.value?.closePopper()
	emits('update:modelValue', getItemValue(data.selectedItem))
	emits('update:getNation', data.selectedItem.country)
}

const inputFocus = () => {
	if (props.inputFocus) {
		querySelector<HTMLElement>(props.inputFocus)?.focus()
	}
}

const handlerSelectItemOnView = (item: any) => {
	handlerSelectItem(item)
	inputFocus()
}

const onKeyDown = (e: KeyboardEvent) => {
	availStore.data.errorServer = {} as ErrorServer;
	const key = e.key
	console.log(key)

	if ('Enter' === key) {
		if (data.filterdItems && data.currentIndexHover >= 0 && data.filterdItems.length > data.currentIndexHover) {
			handlerSelectItemOnView(data.filterdItems[data.currentIndexHover])
		}
	} else if ('ArrowDown' === key) {
		if (activatorMenu.value && activatorMenu.value.popperState() == false) {
			activatorMenu.value.openPopper()
		} else if (data.filterdItems && data.filterdItems.length > 0) {
			if (data.currentIndexHover < data.filterdItems.length - 1) {
				data.currentIndexHover++
			} else {
				data.currentIndexHover = 0
			}
		}
	} else if ('ArrowUp' === key) {
		if (activatorMenu.value && activatorMenu.value.popperState() == false) {
			activatorMenu.value.openPopper()
		} else if (data.filterdItems && data.filterdItems.length > 0) {
			if (data.currentIndexHover <= 0) {
				data.currentIndexHover = data.filterdItems.length - 1
			} else {
				data.currentIndexHover--
			}
		}
	}
}

const handlerClearSelectedItem = () => {
	data.selectedItem = null
	data.search = ''
	data.itemTitleDisplay = ''
	emits('update:modelValue', '')
}

const isHideNoData = computed(() => {
	return props.hideNoData && (!data.filterdItems || data.filterdItems.length == 0)
})

const filtering = (text: string) => {
	data.filterdItems = props.items?.filter((item: any) =>
		props.customFilter
			? props.customFilter(text, item)
			: removeDiacritics(getItemTitle(item)?.toLowerCase()).indexOf(removeDiacritics(text.toLowerCase())) > -1
	)

	if (data.filterdItems?.length??0 > 0) {
		if (!text) {
			data.currentIndexHover = -1
		} else {
			data.currentIndexHover = 0
		}
	} else {
		data.currentIndexHover = -1
	}
	// data.filterdItems = props.items?.filter((item:any) => removeDiacritics(getItemTitle(item).toLowerCase()).indexOf(removeDiacritics(text.toLowerCase())) > -1)
}

const handlerInput = (event: any) => {
	data.search = event.target.value
	activatorMenu.value?.openPopper()
}
const handlerOnchanged = () => {
	if (!data.popperOnMouseEnter) {
		data.onChanging = true

		if (data.selectedItem) {
			const d = getItemTitle(data.selectedItem)
			data.search = d
			data.itemTitleDisplay = d
		} else {
			data.search = ''
			data.itemTitleDisplay = ''
		}

		let timeoutId: number
		timeoutId = setTimeout(() => {
			data.onChanging = false
			clearTimeout(timeoutId)
		}, 250)
	}
}

// const getItemByCode = (airportCode: string) => {
// 	return props.items?.find((item: any) => item.code === airportCode)
// }

const findByItemValue = (val: String) => {
	return props.items?.find((item: any) => getItemValue(item) === val)
}

watchEffect(() => {
	filtering(data.search)
})

watchEffect(() => {
	if (props.modelValue) {
		// const itm = getItemByCode(props.modelValue)
		const itm = findByItemValue(props.modelValue)
		if (itm) {
			handlerSelectItem(itm)
		} else {
			//handlerClearSelectedItem()
		}
	}
})

defineExpose({
	clearSelectedItem: handlerClearSelectedItem
})

const listErrors = computed(() => (props.showErrorsInActivator && props.errorMsg)? (Array.isArray(props.errorMsg) ? props.errorMsg : [props.errorMsg]) : undefined)

</script>

<template>
	<ActivatorPopperWrapper ref="activatorMenu" :class="['form-group form-autocomplete', containerClass, { 'has-error': !!listErrors }]" :error-msg="!showErrorsInActivator? errorMsg : undefined"
		:offset="[0, 2]" popper-placement="bottom-start" :popper-height="popperHeight"
		:activator-class="activatorClass" :popper-class="popperClass" :popper-same-min-width="popperSameMinWidth"
		:popper-same-width="popperSameWidth"
		@on-popper-close="onPopperClose">
		<template #label>
			<slot name="label">
				<label v-if="label">{{ label }}</label>
			</slot>
		</template>
		<template #activator="{elmClass,elmActive,onElmClick,onElmFocus,onElmBlur}">
			<slot name="activator" :elmClass="elmClass" :onElmClick="() => {onElmClick(); inputFocus()}" :elmActive="elmActive"
				:inputProps="{ onInput: handlerInput, onChange: handlerOnchanged, onClick: selectAllText, onFocus:onElmFocus, onBlur: onElmBlur}" :errors="listErrors"
				:onEventKeyDown="onKeyDown"
				:datas="{ search: data.search, itemTitleDisplay: data.itemTitleDisplay, item: data.selectedItem }">
				<InputWrapper v-bind="{id: activatorInputId,  class: elmClass}"
					:on-events="{keydown:onKeyDown, input:handlerInput, click: ($event: any) => {onElmClick(); selectAllText($event)}, change: handlerOnchanged}"
					input-class="form-control" :value="data.search"
					:append-icon="appendIcon" :prepend-icon="prependIcon" :readonly="readonly" :disabled="disabled"
					:placeholder="placeholder" :autocomplete="autocomplete">
				</InputWrapper>
				<div v-if="listErrors" class="text-airport-info invalid-feedback">
					<ul>
						<li v-for="(error, index) in listErrors" :key="index">{{ error }}</li>
					</ul>
				</div>
			</slot>

		</template>
		<template #popper="popperProps">
			<div v-bind="popperProps" :class="['popper-autocomplete', { 'hide-no-data': isHideNoData || data.onChanging }]"
				@mouseenter="data.popperOnMouseEnter = true" @mouseleave="data.popperOnMouseEnter = false">
				<div>
					<span v-if="noDataText && (!data.filterdItems || data.filterdItems.length == 0)">{{ noDataText }}</span>
					<ul class="dw-list">
						<slot name="item" v-for="(item, index) in data.filterdItems" :key="index" :item="item"
							:isSelected="isEqualValue(item, data.selectedItem)" :isHover="index === data.currentIndexHover"
							:bindingProps="{ onClick: () => handlerSelectItemOnView(item) }">
							<li :class="[{'dw-list-item': true, 'dw-list-item--active': isEqualValue(item, data.selectedItem), 'dw-list-item--link': index === data.currentIndexHover}]"
								@click="handlerSelectItemOnView(item)">
								{{ getItemTitle(item) }}
							</li>
						</slot>
					</ul>
				</div>
			</div>
		</template>
	</ActivatorPopperWrapper>
</template>

<style lang="scss" scoped></style>
