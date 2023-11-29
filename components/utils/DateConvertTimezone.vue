<script setup lang='ts'>
import { dateToStringWithTimzone, dateToString } from '@/common/dw-luxon';

defineProps({
	date: Date,
	format: String,
	timezoneId: String,
	tag: String
})
</script>

<template>
	<component v-if="tag" :is="tag">{{ timezoneId? dateToStringWithTimzone(date, format??'', timezoneId) : `${dateToString(date, format??'')}[No timezoneId]` }}</component>
	<template v-else>
		{{ timezoneId? dateToStringWithTimzone(date, format??'', timezoneId) : `${dateToString(date, format??'')}[No timezoneId]` }}
	</template>
</template>