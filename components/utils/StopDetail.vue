<script setup lang='ts'>
import { getFlightType } from '@/common/availabilityResultUtils';
import type { FlightType } from '@/common/datawings-xsd';

defineProps({
	flightType: String,
	stops: Number,
	useBrackets: Boolean
})
</script>

<template>
	{{ useBrackets? '(' : '' }}{{ getFlightType($t, flightType as FlightType ?? null, stops ?? 0) }}{{ useBrackets? ')' : '' }}
</template>
