<script setup lang='ts'>
// Inputform.vue
import BaseWrapper from '@/components/forms/wrapper/BaseWrapper.vue'
import InputWrapper from '@/components/forms/wrapper/InputWrapper.vue'
import type { PropType } from 'vue';

defineProps({
	type: { type: String, default: 'text' },
	label: String,
	errorMsg: { type: [String, Array<string>] },
	id: String,
	placeholder: String,
	autocomplete: { default: 'nope', type: String },//off
	disabled: Boolean,
	readonly: Boolean,
	percent: Boolean,
	appendIcon: String,
	prependIcon: String,
	inuptClass: String,
	modelValue: { type: [String, Number] },
	onEvents: {
		type: Object as PropType<Record<string, any>>,
		default: {} as Record<string, any>
	},
	showMainEl: {
      type: Boolean,
      default: true, // Default to true if not provided
    },
})
const emits = defineEmits<{
	(e: 'update:modelValue', val: string|number): void
}>()
const updateValueAction = (e: any) => {
	emits('update:modelValue', e.target.value);
};

</script>

<template>
	<base-wrapper class="form-group" :error-msg="errorMsg">
		<template #label>
			<slot name="label">
				<label v-if="label">{{ label }}</label>
			</slot>
		</template>
		<template v-if="showMainEl" #main_el><!-- v-bind="elProps" -->
			<slot name="main_el" :onChange="updateValueAction" :placeholder="placeholder">
				<InputWrapper :id="id" :type="type" :placeholder="placeholder" :on-events="{change: updateValueAction, ...onEvents}"
					:autocomplete="autocomplete" :disabled="disabled" :readonly="readonly" :prepend-icon="prependIcon" :percent="percent"
					:append-icon="appendIcon" :value="modelValue" :inputClass="inuptClass ? inuptClass : 'form-control'">
				</InputWrapper>
			</slot>
		</template>
		<template v-else #main_el><!-- v-bind="elProps" -->
			<textarea></textarea>
		</template>
	</base-wrapper>
</template>