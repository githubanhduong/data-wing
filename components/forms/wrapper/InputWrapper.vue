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
    value: { type: [String, Number] },
    inputClass: String,
    percent: Boolean,
    // onBindings: {type: Object as PropType<{[index: string]: Function}>, default: {}},
    onEvents: {
        type: Object as PropType<Record<string, any>>,
        default: {} as Record<string, any>
    },
    // onChange: {
    //   type: Function as PropType<(value: any) => void>
    // },
    // onFocus: {
    //   type: Function as PropType<(value: any) => void>
    // },
    // onBlur: {
    //   type: Function as PropType<(value: any) => void>
    // },
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
        <span v-on="onEvents" v-if="prependIcon"><i :class="prependIcon"></i></span>
        <span v-if="disabled && prependIcon"><i :class="prependIcon"></i></span>
        <input v-if="disabled && appendIcon" :id="id" :type="type" :class="inputClass" :placeholder="placeholder" :autocomplete="autocomplete"
            :disabled="disabled" :readonly="readonly" :value="value" />
        <input v-else :id="id" :type="type" :class="inputClass" :placeholder="placeholder" :autocomplete="autocomplete"
            :disabled="disabled" :readonly="readonly" :value="value" v-on="onEvents" />
        <span v-if="percent">
            <i class="fas fa-percent fa-size-14-px"></i>
        </span>
        <!-- @change="onChange" @focus="onFocus" @blur="onBlur" -->
        <span v-on="onEvents" v-if="appendIcon"><i :class="appendIcon"></i></span>
        <span v-if="disabled && appendIcon"><i :class="appendIcon"></i></span>
        <slot name="append"></slot>
    </div>
</template>