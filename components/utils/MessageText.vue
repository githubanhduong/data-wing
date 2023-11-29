<script setup lang='ts'>
import DynamicTag from './DynamicTag.vue';

defineProps<{
	code: string,
	text?: string,
	format?: any,
	tag?: string,
}>();

</script>

<template>
	<DynamicTag :tag="tag">
		<slot name="prepend"></slot>
		{{ format? $t(code, format, text ?? code) : $t(code, text ?? code) }}
		<slot></slot>
	</DynamicTag>
</template>