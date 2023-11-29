<script setup lang='ts'>

defineProps<{
	code: string,
	text?: string,
	format?: any
}>();

</script>

<template>
	{{ format? $t(code, format, text ?? code) : $t(code, text ?? code) }}
</template>