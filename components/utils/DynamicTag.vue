<script setup lang='ts'>
defineProps<{
	tag?: string
}>()
</script>

<template>
	<component v-if="tag" :is="tag">
		<slot></slot>
	</component>
	<template v-else>
		<slot></slot>
	</template>
</template>