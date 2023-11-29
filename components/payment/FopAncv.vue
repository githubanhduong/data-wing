<script setup lang="ts">
import { computed, reactive } from 'vue';
import InputForm from '../forms/standard/InputForm.vue';
import MessageText from '../utils/MessageText.vue';
import { selectAllText } from '@/compositions/common-event';
import type { PmAncv } from '@/common/datawings-payment';
import { useAvailState } from '@/stores/availData';

const availStore = useAvailState()

const props = defineProps<{
	index: number;
	modelValue: PmAncv;
	error: { [prop: string]: Array<string> };
}>();

const data = reactive({
	...props.modelValue
})

const vatUpdate =  computed(() => {
	return parseFloat((data.feeCC * Number(availStore.data.pmModel!.vat)/100).toFixed(2));
})

const totalUpdate =  computed(() => {
	data.total = parseFloat((data.quantity * ((data.amount ? data.amount : 0) + (data.feeCC ? data.feeCC : 0) + vatUpdate.value)).toFixed(2));
	return data.total
})

const emits = defineEmits<{
	(e: 'update:pmData', index: number, data: PmAncv): void,
	(e: 'remove:pmOption', index: number): void
}>()

const emitUpdate = (prop: string, val: any) => {
	if (prop === 'amount' || prop === 'CCfee') {
		data.feeCC = parseFloat((data.CCfee * data.amount/100).toFixed(2));
		(data as any)[prop] = Number(val)
	} else {
		(data as any)[prop] = val
	}
	emits('update:pmData', props.index, data)
}
</script>

<template>
	<div class="mt-4 dynamic_form pm-credi-card linebt">
		<h4 class="fw-bold">{{ index + 1 }}. Travel voucher</h4>
		<div class="row mt-2 d-flex">
			<div class="col-md-1 pe-0 width5">
				<label class="iconpay">
					<i class="fas fa-money-bill-wave"></i>
				</label>
			</div>
			<div class="col-sm-10">
				<div class="row">
					<InputForm class="col-md-3" v-model="data.amount"
						@update:model-value="(val: any) => emitUpdate('amount', val)" :on-events="{ focus: selectAllText }"
						:error-msg="error?.amount">
						<template #label>
							<MessageText tag="label" code="se.form.payment.amount" text=".Amount"><span class="red-color">*</span></MessageText>
						</template>
					</InputForm>
					<InputForm class="col-md-2" v-model="data.CCfee" :percent="true"
						@update:model-value="(val: any) => emitUpdate('CCfee', val)" :on-events="{ focus: selectAllText }">
						<template #label>
							<MessageText tag="label" code="se.form.payment.ancvCCfee" text=".Fee"><span class="red-color"></span></MessageText>
						</template>
					</InputForm>
					<InputForm class="col-md-2" v-model="data.feeCC" :disabled="true"
						:error-msg="error?.feeCC">
						<template #label>
							<MessageText tag="label" code="se.form.payment.ancvfeeCC" text=".Fee Amount"><span class="red-color"></span></MessageText>
						</template>
					</InputForm>
					<!-- <div class="form-group col-md-2">
						<label>Fee amount<span class="red-color"></span></label>
						<div class="input_wrrapper">
							<input type="text" class="form-control" autocomplete="nope" disabled readonly>
						</div>
					</div> -->
					<InputForm class="col-md-2" v-model="vatUpdate" readonly disabled
						:on-events="{ focus: selectAllText }"
						:error-msg="error?.vat">
						<template #label>
							<MessageText tag="label" code="se.form.payment.vat" :text="`VAT (${availStore.data.pmModel!.vat}%)`"><span class="red-color"></span></MessageText>
						</template>
					</InputForm>
					<InputForm class="col-md-3" v-model="totalUpdate" readonly disabled>
						<template #label>
							<MessageText tag="label" code="se.form.payment.total" text=".Total"><span class="red-color"></span></MessageText>
						</template>
					</InputForm>
					
					<!-- <div class="form-group col-sm-4">
						<label>Vat (10%)<span class="red-color"></span></label>
						<input type="text" class="form-control">
					</div> -->
					
					<InputForm class="col-md-3" v-model="data.quantity"
						:on-events="{ focus: selectAllText }"
						:error-msg="error?.quantity">
						<template #label>
							<MessageText tag="label" code="se.form.payment.quantity" text=".Quantity"><span class="red-color">*</span></MessageText>
						</template>
					</InputForm>
					<InputForm class="col-md-6" v-model="data.reference"
						@update:model-value="(val: any) => emitUpdate('reference', val)" :on-events="{ focus: selectAllText }"
						:error-msg="error?.reference">
						<template #label>
							<MessageText tag="label" code="se.form.payment.reference" text=".Reference"><span class="red-color">*</span></MessageText>
						</template>
					</InputForm>
				</div>
			</div>
			<div class="col-md-1 button-group">
				<button id="delete" class="btn btn-delete" @click="emits('remove:pmOption', index)"><i
						class="far fa-trash-alt"></i>
				<!-- <MessageText code="se.btn.delete" text=".Delete" /> -->
			</button>
		</div>
	</div>
</div></template>

<style lang="scss" scoped></style>