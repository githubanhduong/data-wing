<script setup lang='ts'>
// ActivatorPopperWrapper.vue
import { generateUUID, querySelector, querySelectorFrom } from '@/common/commons'
import { createPopper, type Instance, type Placement } from '@popperjs/core'
import { onBeforeMount, onMounted, ref, watch } from 'vue'
import BaseWrapper from './BaseWrapper.vue'

const props = defineProps({
	class: { type: [String, Array, Object] },
	label: String,
	errorMsg: { type: [String, Array<string>] },
	activatorClass: String,
	disabledPopper: Boolean,
	popperClass: String,
	offset: {
		type: Array<number>,
		validator: (value: Array<number>) => {
			return value.length == 2
		}
	},
	popperWidth: Number,
	popperMinWidth: Number,
	popperSameWidth: { type: Boolean, default: false },
	popperSameMinWidth: { type: Boolean, default: false },
	popperPlacement: {
		type: String,
		default: 'bottom-start',
		validator: (value: string) => ["auto", "auto-start", "auto-end", "top", "bottom", "right", "left", "top-start", "top-end", "bottom-start", "bottom-end", "right-start", "right-end", "left-start", "left-end"].includes(value)
	},
	popperHeight: Number,
	inputFocus: String
})

const popperState = ref(false)
const activeState = ref(false)
const rootElement = ref<HTMLElement | null>(null)
let popperInstance: Instance | null = null;
const muid = generateUUID()

const openPopper = () => popperState.value = !props.disabledPopper ? true : false



const togglePopperClick = () => {
	// popperState.value = !popperState.value
	const state = !popperState.value

	if (state) {
		openPopper()
		activeState.value = true
	} else {
		popperState.value = false
	}

	if (props.inputFocus) {
		querySelector<HTMLElement>(props.inputFocus)?.focus()
	}
}

const onElmFocus = () => activeState.value = true
const onElmBlur = () => {
	if (!popperState.value) {
		activeState.value = false
	}
}

const $el = (element: any): HTMLElement => element.$el || element

const handleClickOutside = () => {
	popperState.value = false
	activeState.value = false
}

const modifiersOpt = ref<Array<any>>([
	// {
	//   name: 'preventOverflow',
	//   // enabled:false,
	//   options: {
	//     boundary: 'window',
	//   },
	// }
])

if (props.offset) {
	modifiersOpt.value.push({
		name: 'offset',
		options: {
			offset: props.offset,
		},
	})
}

if (props.popperWidth) {
	modifiersOpt.value.push({
		name: 'width',
		enabled: true,
		phase: 'beforeWrite', // set the phase for the width modifier
		fn: ({ state }: any) => {
			state.styles.popper.width = `${props.popperWidth}px` // set the desired width here
		},
		effect: ({ state }: any) => {
			state.elements.popper.style.width = `${props.popperWidth}px`
		}
	})
} else if (props.popperSameWidth) {
	modifiersOpt.value.push({
		name: "sameWidth",
		enabled: true,
		phase: "beforeWrite",
		requires: ["computeStyles"],
		fn: ({ state }: any) => {
			state.styles.popper.width = `${state.rects.reference.width}px`
		},
		effect: ({ state }: any) => {
			state.elements.popper.style.width = `${(state.elements.reference as any).offsetWidth}px`
		}
	})
}
if (props.popperMinWidth) {
	modifiersOpt.value.push({
		name: 'min-width',
		enabled: true,
		phase: 'beforeWrite', // set the phase for the width modifier
		fn: ({ state }: any) => {
			state.styles.popper['min-width'] = `${props.popperMinWidth}px` // set the desired width here
		},
		effect: ({ state }: any) => {
			state.elements.popper.style['min-width'] = `${props.popperMinWidth}px`
		}
	})
} else if (props.popperSameMinWidth) {
	modifiersOpt.value.push({
		name: 'min-width',
		enabled: true,
		phase: 'beforeWrite', // set the phase for the width modifier
		fn: ({ state }: any) => {
			state.styles.popper['min-width'] = `${state.rects.reference.width}px` // set the desired width here
		},
		effect: ({ state }: any) => {
			state.elements.popper.style['min-width'] = `${(state.elements.reference as any).offsetWidth}px`
		}
	})
}

// if (props.popperHeight) {
// modifiersOpt.value.push({
//   name: 'max-height',
//   enabled: true,
//   phase: 'beforeWrite', // set the phase for the width modifier
//   fn: ({ state }: any) => {
//     state.styles.popper['max-height'] = `${props.popperHeight}px` // set the desired width here
//   },
//   effect: ({ state }: any) => {
//     state.elements.popper.style['max-height'] = `${props.popperHeight}px`
//   }
// })
// modifiersOpt.value.push({
//   name: 'overflow-y',
//   enabled: true,
//   phase: 'beforeWrite', // set the phase for the width modifier
//   fn: ({ state }: any) => {
//     state.styles.popper['overflow-y'] = 'scroll' // set the desired width here
//   },
//   effect: ({ state }: any) => {
//     state.elements.popper.style.height = 'scroll'
//   }
// })
// }

const emits = defineEmits<{
	(e: 'onPopperClose'): void
}>()

watch(popperState, (newVal: Boolean) => {
	if (!newVal) {
		emits('onPopperClose')
	} else if (popperInstance) {
		popperInstance.update()
	}
})

onMounted(() => {
	const activator = querySelectorFrom($el(rootElement.value), '.dw-activator')
	const popper = querySelector<HTMLElement>(`div.overlay-container .dw-popper[muid="${muid}"]`)

	popperInstance = createPopper(activator!, popper!, {
		placement: props.popperPlacement as Placement,
		modifiers: modifiersOpt.value,
		strategy: 'absolute',
	})
})

defineExpose({
	openPopper: () => openPopper(),
	closePopper: () => { popperState.value = false },
	popperState: () => popperState.value,
	inputFocus: () => {
		if (props.inputFocus) {
			querySelector<HTMLElement>(props.inputFocus)?.focus()
		}
	}
})

onBeforeMount(() => {
	if (!querySelector('div.overlay-container')) {
		const overlayContainer = document.createElement('div')
		overlayContainer.className = 'overlay-container'
		document.body.appendChild(overlayContainer)
	}
})

</script>

<template>
	<base-wrapper :class="[props.class, { 'active': activeState }]" :error-msg="errorMsg"
		v-click-outside="handleClickOutside" :data-muid="muid" ref="rootElement">
		<template #label>
			<slot name="label">
				<label v-if="label">{{ label }}</label>
			</slot>
		</template>
		<template #main_el>
			<slot name="activator" :elmClass="['dw-activator', activatorClass]" :onElmClick="togglePopperClick"
				:elmActive="activeState" :onElmFocus="onElmFocus" :onElmBlur="onElmBlur"></slot>
			<teleport to="div.overlay-container">
				<slot name="popper" :class="['dw-popper', popperClass, { show: popperState }]" :muid="muid"
					@click="activeState = true"></slot>
			</teleport>
		</template>
	</base-wrapper>
</template>