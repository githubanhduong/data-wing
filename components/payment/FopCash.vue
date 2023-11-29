<script setup lang="ts">
import { reactive } from 'vue';
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
	...props.modelValue
})

const emits = defineEmits<{
	(e: 'update:pmData', index: number, data: PmCash): void,
	(e: 'remove:pmOption', index: number): void
}>()

const emitUpdateData = () => {
	data.amount = Number(data.amount)
	data.cardType = "cash"
	emits('update:pmData', props.index, data)
}
// const emitUpdateRef = (ref: any) => {
// 	// data.reference = ref
// 	emits('update:pmData', props.index, data)
// }

</script>

<template>
	<div class="mt-4 dynamic_form pm-cash linebt">
		<MessageText tag="h4" class="fw-bold" code="se.form.payment.type.cash" text=".Cash">
			<template #prepend>{{ index + 1 }}. </template>
			<!-- <template #default><i class="fas fa-money-bill-wave ms-2"></i></template> -->
		</MessageText>
		<div class="row mt-2 d-flex">
			<div class="col-md-1 pe-0 width5">
				<label class="iconpay">
					<i class="fas fa-money-bill-wave"></i>
				</label>
			</div>
			<InputForm class="col-md-5" v-model="data.amount" @update:model-value="emitUpdateData"
				:on-events="{ focus: selectAllText }" :error-msg="error?.amount">
				<template #label>
					<MessageText tag="label" code="se.form.payment.amount" text=".Amount"><span class="red-color">*</span></MessageText> 
				</template>
			</InputForm>
			<InputForm class="col-md-5" v-model="data.reference" @update:model-value="emitUpdateData"
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