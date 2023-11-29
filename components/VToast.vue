<script setup lang='ts'>
import { ref } from 'vue';

const props = defineProps<{
	msgIndex?: number;
	message?: string;
	timeout?: number;
	level?: string
}>();

const emits = defineEmits<{
	(e: 'toast:end', index: number): void
}>()

const state = ref(true)

const t = setTimeout(() => {
	state.value = false
	if (props.msgIndex != undefined) {
		emits('toast:end', props.msgIndex)
	}
	clearTimeout(t)
}, props.timeout? props.timeout : 3000);

</script>

<template>
	<div v-if="state && message" :class="['toast align-items-center show', level??'INFO']" role="alert" aria-live="assertive"
		aria-atomic="true">
		<div class="d-flex">
			<div class="toast-body">
				{{ message }}
			</div>
			<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
		</div>
	</div>

		<!-- <p v-if="state">hello</p> -->
</template>