<script setup lang='ts'>
import type { PropType } from 'vue';

// InputWrapper.vue
defineProps({
    id: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    autocomplete: { default: 'off', type: String },
    disabled: Boolean,
    readonly: Boolean,
    appendIcon: String,
    prependIcon: String,
    value: String,
    inputClass: String,
    onChange: {
      type: Function as PropType<(value: any) => void>
    }
})
// const emits = defineEmits<{
//   (e: 'update:modelValue', val: string): void
// }>()
// const updateValueAction = (e: any) => {
//   console.log('update:modelValue');
//   emits('update:modelValue', e.target.value);
// };
</script>

<template>
    <div class="input_wrrapper">
        <slot name="prepend"></slot>
        <span v-if="prependIcon"><i :class="prependIcon"></i></span>
        <input :id="id" :type="type" :class="inputClass" :placeholder="placeholder"
            :autocomplete="autocomplete" :disabled="disabled" :readonly="readonly" :value="value"
            @change="onChange" />
        <span v-if="appendIcon"><i :class="appendIcon"></i></span>
        <slot name="append"></slot>
    </div>
</template>