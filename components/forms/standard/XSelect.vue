<script setup lang='ts'>
import type { SelectItem } from '@/common/commons';
import ActivatorPopperWrapper from '../wrapper/ActivatorPopperWrapper.vue';
import InputWrapper from '../wrapper/InputWrapper.vue';
import { ref, reactive, watch } from 'vue';
import type { ActivatorPopper } from '@/common/custom-type';

const props = defineProps<{
	id?: string;
	label?: string;
	errorMsg?: string | string[];
	items?: SelectItem[];
	// optionLabel?: string;
	appendIcon?: string;
	prependIcon?: string;
	placeholder?: string;
	modelValue?: string | number | boolean;
	readonly?: boolean;

}>()

const data = reactive<{
	item: SelectItem | undefined;
	currentIndexHover: number
}>({
	item: undefined,
	currentIndexHover: -1
})
const apElm = ref<ActivatorPopper | null>(null)

const emits = defineEmits<{
	(e: 'update:modelValue', val: any): void
}>()
const handlerSelectItem = (item: SelectItem) => {
	data.item = item
	apElm.value?.closePopper()
	emits('update:modelValue', item.value)
}

const getItemByValue = (val: string | number | boolean | undefined) => {
	if (!props.items) {
		return undefined
	}
	const item = props.items.find(x => x.value === val)
	return item ? item : undefined
}

data.item = getItemByValue(props.modelValue)

// const itemValue = computed(() => {
// 	if (props.modelValue && props.items) {
// 		const item = props.items.find(x => x.value === props.modelValue)
// 		return item ? item.title : undefined
// 	}
// 	return undefined
// })

watch(() => props.modelValue, () => {
	if (props.modelValue) {
		data.item = getItemByValue(props.modelValue)
	} else {
		data.item = undefined
	}
})

const onKeyDown = (e: KeyboardEvent) => {
	const key = e.key

	if ('Enter' === key) {
		if (props.items && data.currentIndexHover >= 0 && props.items.length > data.currentIndexHover) {
			handlerSelectItem(props.items[data.currentIndexHover])
		}
	} else if ('ArrowDown' === key) {
		e.preventDefault()
		if (apElm.value && apElm.value.popperState() == false) {
			apElm.value.openPopper()
		} else if (props.items && props.items.length > 0) {
			if (data.currentIndexHover < props.items.length - 1) {
				data.currentIndexHover++
			} else {
				data.currentIndexHover = 0
			}
		}
	} else if ('ArrowUp' === key) {
		e.preventDefault()
		if (apElm.value && apElm.value.popperState() == false) {
			apElm.value.openPopper()
		} else if (props.items && props.items.length > 0) {
			if (data.currentIndexHover <= 0) {
				data.currentIndexHover = props.items.length - 1
			} else {
				data.currentIndexHover--
			}
		}
	}
}

</script>

<template>
	<ActivatorPopperWrapper class="form-group" :error-msg="errorMsg" ref="apElm" :popper-same-width="true" :offset="[0, 2]"
		:disabled-popper="readonly">
		<template #label>
			<slot name="label">
				<label v-if="label">{{ label }}</label>
			</slot>
		</template>
		<template #activator="{ elmClass, elmActive, onElmClick }">
			<slot name="activator" :elmClass="elmClass" :elmActive="elmActive" @click="onElmClick">
				<InputWrapper :id="id" v-bind="{ class: elmClass }" input-class="form-control" :append-icon="appendIcon"
					:prepend-icon="prependIcon" readonly :placeholder="placeholder"
					:value="data.item ? data.item.title : undefined" :on-events="{ click: onElmClick, keydown: onKeyDown }">
				</InputWrapper>
			</slot>
		</template>
		<template #popper="popperProps">
			<div v-bind="popperProps" class="popper-select">
				<ul class="dw-list">
					<template v-for="(item, index) in items" :key="index">
						<li v-if="item.disabled == undefined || !item.disabled"
							:class="['dw-list-item', { 'dw-list-item--active': item.value === modelValue, 'dw-list-item--link': index === data.currentIndexHover }]"
							@click="handlerSelectItem(item)"> {{ item.title }}
						</li>
					</template>
					<!-- <li v-for="(item, index) in items" :key="index" v-if="item.disabled == undefined || item.disabled"
						:class="['dw-list-item', { 'dw-list-item--active': item.value === modelValue, 'dw-list-item--link': index === data.currentIndexHover }]"
						@click="handlerSelectItem(item)"> {{ item.title }}
					</li> -->
				</ul>
			</div>
		</template>
	</ActivatorPopperWrapper>
</template>

<!-- autocomplete + select
	dw-list -> LEVEL_1
	dw-list-group -> LEVEL_2
	dw-list-item dw-list-item--active dw-list-item--disabled dw-list-item--link -> LEVEL_2 & LEVEL_3
-->