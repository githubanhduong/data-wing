<script setup lang="ts">
import { reactive, watch } from 'vue';
import InputForm from '../forms/standard/InputForm.vue';
import MessageText from '../utils/MessageText.vue';
import { selectAllText } from '@/compositions/common-event';
import type { PmCash } from '@/common/datawings-payment';

const props = defineProps<{
	index: number;
	modelValue: PmCash;
	error?: {[prop: string]: Array<string>};
}>();

const data = reactive({
	model: {...props.modelValue}
})

const emits = defineEmits<{
	(e: 'update:pmData', index: number, data: PmCash): void,
	(e: 'remove:pmOption', index: number): void
}>()

const emitUpdateAmt = (amt: any) => {
	data.model.amount = Number(amt)
	emits('update:pmData', props.index, data.model)
}
const emitUpdateRef = (ref: any) => {
	data.model.reference = ref
	emits('update:pmData', props.index, data.model)
}

watch(props, () => {
	data.model = {...props.modelValue}
})
</script>

<template>
	<div class="mt-4 dynamic_form pm-cash">
		<MessageText tag="h5" class="fw-bold" code="se.form.payment.type.cash" text=".Cash">
			<template #prepend>{{ index + 1 }}. </template>
			<template #default><i class="fas fa-money-bill-wave ms-2"></i></template>
		</MessageText>
		<div class="row mt-4 d-flex align-items-center">
			<div class="col-sm-10">{{ modelValue.amount }}
				<div class="row">
					<InputForm class="col-md-6" v-model="data.model.amount" @update:model-value="emitUpdateAmt"
						:on-events="{ focus: selectAllText }" :error-msg="error?.amount">
						<template #label>
							<MessageText tag="label" code="se.form.payment.amount" text=".Amount"></MessageText>
						</template>
					</InputForm>
					<InputForm class="col-md-6" v-model="data.model.reference" @update:model-value="emitUpdateRef"
						:on-events="{ focus: selectAllText }" :error-msg="error?.reference">
						<template #label>
							<MessageText tag="label" code="se.form.payment.reference" text=".Reference"></MessageText>
						</template>
					</InputForm>
				</div>
			</div>
			<div class="col-md-2">
				<button id="delete" class="btn btn-delete" @click="emits('remove:pmOption', index)"><i
						class="far fa-trash-alt me-2"></i>
					<MessageText code="se.btn.delete" text=".Delete" />
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>