<script setup lang='ts'>
// BaseWrapper.vue
import { computed } from 'vue';

const props = defineProps({
    label: String,
    errorMsg: { type: [String, Array] }
})

const hasError = computed(() => !!props.errorMsg)
const errors = computed(() => (Array.isArray(props.errorMsg) ? props.errorMsg : [props.errorMsg]))

</script>

<template>
    <div :class="[{ 'has-error': hasError }]">
        <label v-if="label">{{ label }}</label>
        <slot name="main_el"></slot>
        <div v-if="hasError" class="invalid-feedback">
            <ul>
                <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
        </div>
    </div>
</template>