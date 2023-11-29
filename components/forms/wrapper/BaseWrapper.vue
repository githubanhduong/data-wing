<script setup lang='ts'>
// BaseWrapper.vue
import { computed } from 'vue';

const props = defineProps<{
	class?: string | Array<string | object> | object,
	label?: string,
	errorMsg?: string | string[],
	// hasError?: boolean
}>()
//!!errorMsg || hasError
// const hasError = computed(() => !!props.errorMsg)
const errors = computed(() => (Array.isArray(props.errorMsg) ? props.errorMsg : [props.errorMsg]))
const class_ = computed(() => (Array.isArray(props.class) ? props.class : [props.class]))
</script>

<template>
	<div :class="[...class_, { 'has-error': !!errorMsg }]">
		<slot name="label">
			<label v-if="label">{{ label }}</label>
		</slot>
		<slot name="main_el"></slot>
		<slot name="info"></slot>
		<slot name="error">
			<div v-if="errors" class="invalid-feedback">
				<ul>
					<li v-for="(error, index) in errors" :key="index">{{ error }}</li>
				</ul>
			</div>
		</slot>
	</div>
</template>