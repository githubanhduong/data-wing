<script setup lang='ts'>
import type { PropType } from 'vue';
import MessageText from './MessageText.vue';

defineProps({
	duration: Object as PropType<{hours: number; minutes: number;}>,
	tag: String
})

//<!-- {{ getDuration($t, duration) }} -->
</script>

<template>
	<component v-if="tag" :is="tag">
		<MessageText v-if="duration?.hours" code="se.duration.hours" text=".{n} hours" :format="{ n: duration.hours }"/>
		{{ (duration?.hours && duration?.minutes)? ' ': ''}}
		<MessageText v-if="duration?.minutes" code="se.duration.minutes" text=".{n} minutes" :format="{ n: duration.minutes }"></MessageText>
	</component>
	<template v-else>
		<MessageText v-if="duration?.hours" code="se.duration.hours" text=".{n} hours" :format="{ n: duration.hours }"/>
		{{ (duration?.hours && duration?.minutes)? ' ': ''}}
		<MessageText v-if="duration?.minutes" code="se.duration.minutes" text=".{n} minutes" :format="{ n: duration.minutes }"></MessageText>
	</template>
</template>
