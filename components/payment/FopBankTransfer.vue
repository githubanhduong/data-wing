<script setup lang="ts">
import { reactive } from 'vue';
import InputForm from '../forms/standard/InputForm.vue';
import MessageText from '../utils/MessageText.vue';
import { selectAllText } from '@/compositions/common-event';
import type { PmBankTransfer } from '@/common/datawings-payment';

const props = defineProps<{
	index: number;
	modelValue: PmBankTransfer;
	error: { [prop: string]: Array<string> };
}>();

const data = reactive({
	...props.modelValue
})

const emits = defineEmits<{
	(e: 'update:pmData', index: number, data: PmBankTransfer): void,
	(e: 'remove:pmOption', index: number): void
}>()

const emitUpdate = (prop: string, val: any) => {
	if (prop === 'amount') {
		data.amount = Number(val)
	} else {
		(data as any)[prop] = val
	}
	emits('update:pmData', props.index, data)
}
</script>

<template>
	<div class="mt-4 dynamic_form pm-credi-card linebt">
		<MessageText tag="h4" class="fw-bold" code="se.form.payment.type.bankTransfer" text=".Bank transfer">
			<template #prepend>{{ index + 1 }}. </template>
			<!-- <template #default><i class="fas fa-university ms-2"></i></template> -->
		</MessageText>
		<div class="row mt-3 d-flex">
			<div class="col-md-1 pe-0 width5">
				<label class="iconpay">
					<i class="fas fa-university"></i>
				</label>
			</div>
			<InputForm class="col-md-5" v-model="data.amount"
				@update:model-value="(val: any) => emitUpdate('amount', val)" :on-events="{ focus: selectAllText }" :error-msg="error?.amount">
				<template #label>
					<MessageText tag="label" code="se.form.payment.amount" text=".Amount"><span class="red-color">*</span></MessageText>
				</template>
			</InputForm>
			<InputForm class="col-md-5" v-model="data.reference"
				@update:model-value="(val: any) => emitUpdate('reference', val)"
				:on-events="{ focus: selectAllText }" :error-msg="error?.reference">
				<template #label>
					<MessageText tag="label" code="se.form.payment.reference" text=".Reference"><span class="red-color">*</span></MessageText>
				</template>
			</InputForm>
			<div class="col-md-1 button-group">
				<button id="delete" class="btn btn-delete" @click="emits('remove:pmOption', index)"><i
						class="far fa-trash-alt"></i>
					<!-- <MessageText code="se.btn.delete" text=".Delete" /> -->
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>