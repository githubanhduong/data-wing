<script setup lang="ts">
// PassengerInput.vue
import { computed, onBeforeMount, reactive, ref, watch } from 'vue'
import { allowDigitInput } from '@/common/commons'
import { useSeDataState } from '@/stores/engine'
import { useI18n_ } from '@/plugins/i18n'
import ActivatorPopperWrapper from '@/components/forms/wrapper/ActivatorPopperWrapper.vue'
import  { type ActivatorPopper, BookingClass } from '@/common/custom-type'
import InputWrapper from '@/components/forms/wrapper/InputWrapper.vue'
import { selectAllText } from '@/compositions/common-event'
import MessageText from '@/components/utils/MessageText.vue'

interface IModel {
    nbAdt: number;
    nbChd: number;
    nbInf: number;
    bookingClass: BookingClass;
}

const props = defineProps({
	label: String,
	errorMsg: { type: [String, Array<string>] },
//   activatorClass: String,
//   popperClass: String,
  // paxReq: {
  //   type: Object as PropType<{
  //     nbAdt: number;
  //     nbChd: number;
  //     nbInf: number;
  //     bookingClass: BookingClass;
  //   }>
  // }
})

// console.log({xpaxReq: props.xpaxReq});

const { t } = useI18n_()

const store = useSeDataState()

const activatorMenu = ref<ActivatorPopper | null>(null)

const paxReq: {model: IModel} = reactive({model: store.passengerInputProps})

const applyPax = () => {
  activatorMenu.value!.closePopper()
  activatorMenu.value!.inputFocus()
}

const paxSumary = computed(() => t('se.home.passengers.sum', { n: paxReq.model.nbAdt + paxReq.model.nbChd + paxReq.model.nbInf }, '{n} Taveller'))

const buttonsDisabled = reactive<{ [key: string]: boolean | null }>({ decreaseAdt: null, increaseAdt: null, decreaseChd: null, increaseChd: null, decreaseInf: null, increaseInf: null })

const checkButtonStatus = () => {
  const paxNb = paxReq.model.nbAdt + paxReq.model.nbChd
  buttonsDisabled.increaseAdt = paxNb >= 9
  buttonsDisabled.increaseChd = paxNb >= 9
  buttonsDisabled.decreaseAdt = paxReq.model.nbAdt <= 0
  buttonsDisabled.decreaseChd = paxReq.model.nbChd <= 0
  buttonsDisabled.increaseInf = paxReq.model.nbInf >= paxReq.model.nbAdt
  buttonsDisabled.decreaseInf = paxReq.model.nbInf <= 0
}

const increaseAdt = () => {
  if (paxReq.model.nbAdt + paxReq.model.nbChd < 9) {
    paxReq.model.nbAdt++
    //store.seData.seForm.nbAdt = paxReq.model.nbAdt
  }

}
const decreaseAdt = () => {
  if (paxReq.model.nbAdt > 0) {
    paxReq.model.nbAdt--
    //store.seData.seForm.nbAdt = paxReq.model.nbAdt
    if (paxReq.model.nbInf > paxReq.model.nbAdt) {
      paxReq.model.nbInf = paxReq.model.nbAdt
    }
  }
}
const increaseChd = () => {
  if (paxReq.model.nbAdt + paxReq.model.nbChd < 9) {
    paxReq.model.nbChd++
    //store.seData.seForm.nbChd = paxReq.model.nbChd
  }
}
const decreaseChd = () => {
  if (paxReq.model.nbChd > 0) {
    paxReq.model.nbChd--
    //store.seData.seForm.nbChd = paxReq.model.nbChd
  }

}
const increaseInf = () => {
  if (paxReq.model.nbInf < paxReq.model.nbAdt) {
    paxReq.model.nbInf++
    //store.seData.seForm.nbInf = paxReq.model.nbInf
  }
}

const decreaseInf = () => {
  if (paxReq.model.nbInf > 0) {
    paxReq.model.nbInf--
    //store.seData.seForm.nbInf = paxReq.model.nbInf
  }
}
const stringVal = (model: IModel) => {
  return `${model.bookingClass}_${model.nbAdt+ model.nbChd + model.nbInf}`
}

// watch(() => paxReq.model, (n, o) => {
//   const newVal = stringVal(n)
//   const oldVal = stringVal(o)
//   if (newVal !== oldVal) {
//     console.log('New value of Model', newVal, oldVal);
//     checkButtonStatus()
//     store.setPassengerInputProps(paxReq.model, 22)
//   }

// }, { deep: true })

watch([() => paxReq.model.bookingClass, () => paxReq.model.nbAdt,
() => paxReq.model.nbChd, () => paxReq.model.nbInf], ([bookingClass, nbAdt, nbChd, nbInf], [obookingClass, onbAdt, onbChd, onbInf]) => {
  const newVal = stringVal({bookingClass, nbAdt, nbChd, nbInf})
  const oldVal = stringVal({bookingClass:obookingClass,nbAdt: onbAdt, nbChd: onbChd, nbInf:onbInf})
  if (newVal !== oldVal) {
    console.log('New value of Model', newVal, oldVal);
    checkButtonStatus()
    store.setPassengerInputProps(paxReq.model, 22)
  }

})

watch([() => store.seData.seForm.bookingClass, () => store.seData.seForm.nbAdt,
() => store.seData.seForm.nbChd, () => store.seData.seForm.nbInf], ([bookingClass, nbAdt, nbChd, nbInf]) => {
  paxReq.model = {bookingClass, nbAdt, nbChd, nbInf}
})

onBeforeMount(() => {
  checkButtonStatus()
})
const errors = computed(() => (Array.isArray(props.errorMsg) ? props.errorMsg : [props.errorMsg]))
</script>

<template>
  <ActivatorPopperWrapper ref="activatorMenu" :class="['form-group', {'has-error': !!errorMsg}]" :label="label" :offset="[0, 3]" :popper-same-width="true" popper-placement="bottom-start" :popper-min-width="205" input-focus="input#paxTotal">
    <template #activator="{elmClass, elmActive, onElmClick, onElmFocus, onElmBlur}">
		<div :class="['activeStyle box-input-Datefrom styleboxmain box-input-to', {'active': elmActive}, elmClass]" @click="onElmClick" >
			<MessageText code="se.home.passenger_class" text="Passenger(s) & class" tag="label" class="style-depavi text-nowrap"> *</MessageText>
			<InputWrapper id="paxTotal" input-class="form-control open-select" :value="paxSumary" 
				:on-events="{focus: onElmFocus, blur: onElmBlur}" readonly></InputWrapper>
			<div v-if="errors" class="invalid-feedback styleulerror">
				<ul>
					<li v-for="(error, index) in errors" :key="index">{{ error }}</li>
				</ul>
			</div>
		</div>
    </template>
    <template #popper="popperProps">
		<div class="selector-box-flight section-booking popper-dw-style" v-bind="popperProps">
			<div data-popper-arrow></div>
			<div class="room-cls">
				<div class="row">
					<MessageText tag="span" code="se.home.passenger_label" text="Passenger(s)" class="fw-bold style-dep mb-3"/>
					<div class="col-sm-4 col-xs-12">
						<div class="qty-box stylecountpax">
							<span><b><MessageText tag="span" code="se.home.passenger.adts" text=".Adults"/></b><br><small><MessageText code="se.home.passenger.adts_age" text=".(12+ years)"/></small> </span>
							<div class="input-group mt-2">
								<button type="button" @click="decreaseAdt" :class="['btn quantity-left-minus', {'disabled': buttonsDisabled.decreaseAdt}]" data-type="minus" data-field=""> - </button>
								<input type="text" name="quantity" class="form-control qty-input input-number" :maxlength="1" @keydown="allowDigitInput" @focus="selectAllText" v-model.number="paxReq.model.nbAdt" />
								<button type="button"  @click="increaseAdt" :class="['btn quantity-right-plus', {'disabled': buttonsDisabled.increaseAdt}]" data-type="plus" data-field="">+</button>
							</div>
						</div>
					</div>
					<div class="col-sm-4 col-xs-12">
						<div class="qty-box stylecountpax">
							<span><b><MessageText code="se.home.passenger.chds" text=".Children"/></b><br><small><MessageText code="se.home.passenger.chds_age" text=".(2-11 years)"/></small></span>
							<div class="input-group mt-2">
								<button type="button" @click="decreaseChd" :class="['btn quantity-left-minus', {'disabled': buttonsDisabled.decreaseChd}]" data-type="minus" data-field=""> - </button>
								<input type="text" name="quantity" class="form-control qty-input input-number" :maxlength="1" @keydown="allowDigitInput" @focus="selectAllText" v-model.number="paxReq.model.nbChd" />
								<button type="button" @click="increaseChd" :class="['btn quantity-right-plus', {'disabled': buttonsDisabled.increaseChd}]" data-type="plus" data-field=""> + </button>
							</div>
						</div>
					</div>
					<div class="col-sm-4 col-xs-12">
						<div class="qty-box stylecountpax">
							<span class="text-nowrap"><b><MessageText code="se.home.passenger.infs" text=".Children"/></b><br><small><MessageText code="se.home.passenger.infs_age" text=".(Under 2 years)"/></small></span>
							<div class="input-group mt-2">
								<button type="button" @click="decreaseInf" :class="['btn quantity-left-minus', {'disabled': buttonsDisabled.decreaseInf}]" data-type="minus" data-field=""> - </button>
								<input type="text" name="quantity" class="form-control qty-input input-number" :maxlength="1" @keydown="allowDigitInput" @focus="selectAllText" v-model.number="paxReq.model.nbInf" />
								<button type="button" @click="increaseInf" :class="['btn quantity-right-plus', {'disabled': buttonsDisabled.increaseInf}]" data-type="plus" data-field=""> + </button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="flight-class pt-3">
				<div class="row">
					<div class="col-sm-2">
						<MessageText tag="span" code="se.home.class.booking_class" text=".Class" class="fw-bold style-dep mt-2 mb-3"></MessageText>
					</div>
					<div class="col-sm-3">
						<input id="class-economy" class="form-check-input radio_animated" type="radio" v-model="paxReq.model.bookingClass" :value="BookingClass.ECONOMY" :checked="paxReq.model.bookingClass === BookingClass.ECONOMY">
						<MessageText code="se.class.ECONOMY" text=".Economy" class="form-check-label fs-14" tag="label" for="class-economy"></MessageText>
					</div>
					<div class="col-sm-3">
						<input id="class-premium" class="form-check-input radio_animated" type="radio" v-model="paxReq.model.bookingClass" :value="BookingClass.PREMIUM" :checked="paxReq.model.bookingClass === BookingClass.PREMIUM">
						<MessageText code="se.class.PREMIUM" text=".Premium" class="form-check-label fs-14" tag="label" for="class-premium"></MessageText>
					</div>
					<div class="col-sm-3">
						<input id="class-business" class="form-check-input radio_animated" type="radio" v-model="paxReq.model.bookingClass" :value="BookingClass.BUSINESS" :checked="paxReq.model.bookingClass === BookingClass.BUSINESS">
						<MessageText code="se.class.BUSINESS" text=".Business" class="form-check-label fs-14" tag="label" for="class-business"></MessageText>
					</div>
				</div>  
			</div>
			<div class="bottom-part pt-3">
				<button class="applyBtn btn btn-sm" @click="applyPax">
					<MessageText code="se.btn.apply" text=".Apply"/>
				</button>
			</div>

        </div>
    </template>

  </ActivatorPopperWrapper>
</template>
<style lang="scss" scoped>
.box-input-to {
    border-top-left-radius: 0px !important;
    border-bottom-left-radius: 0px !important;
    border-left: 1px solid rgba(229, 229, 229, 0) !important;
}
@media (max-width: 992px) and (min-width: 300px){
	.box-input-to{
		border-top-left-radius: 4px !important;
    	border-bottom-left-radius: 4px !important;
		border-left: 1px solid #e5e5e5 !important;
	}
}
</style>