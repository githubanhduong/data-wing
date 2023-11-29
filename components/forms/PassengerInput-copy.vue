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

interface IModel {
    nbAdt: number;
    nbChd: number;
    nbInf: number;
    bookingClass: BookingClass;
}

defineProps({
  label: String,
  errorMsg: { type: [String, Array<string>] },
  activatorClass: String,
  popperClass: String,
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
}

const paxSumary = computed(() => t('se.form.passengers.sum', { n: paxReq.model.nbAdt + paxReq.model.nbChd + paxReq.model.nbInf }, '{n} Passengers'))

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

</script>

<template>
  <ActivatorPopperWrapper ref="activatorMenu" class="form-group form-passenger-mini" :label="label" :error-msg="errorMsg" :offset="[0, 3]" :popper-same-width="true" popper-placement="bottom-start" :popper-min-width="205">
    <template #activator="activatorProps">
      <InputWrapper v-bind="activatorProps" append-icon="fas fa-users blur-up lazyloaded" input-class="form-control" :value="paxSumary"></InputWrapper>
    </template>
    <template #popper="popperProps">
      <div v-bind="popperProps">
        <div data-popper-arrow></div>
        <div class="selector-box-flight">
          <div class="room-cls">
            <div class="qty-box">
              <label>Adults<br>(+12)</label>
              <div class="input-group">
                <button type="button" class="btn quantity-left-minus" data-type="minus" data-field=""
                  :class="{ 'disabled': buttonsDisabled.decreaseAdt }" @click="decreaseAdt"> - </button>
                <input type="text" name="quantity" class="form-control qty-input input-number" :maxlength="1"
                  @keydown="allowDigitInput" @focus="selectAllText" v-model.number="paxReq.model.nbAdt" />
                <button type="button" class="btn quantity-right-plus" data-type="plus" data-field=""
                  :class="{ 'disabled': buttonsDisabled.increaseAdt }" @click="increaseAdt">+</button>
              </div>
            </div>
            <div class="qty-box">
              <label>Children<br>(2-12)</label>
              <div class="input-group">
                <button type="button" class="btn quantity-left-minus" data-type="minus" data-field=""
                  :class="{ 'disabled': buttonsDisabled.decreaseChd }" @click="decreaseChd"> - </button>
                <input type="text" name="quantity" class="form-control qty-input input-number" :maxlength="1"
                  @keydown="allowDigitInput" @focus="selectAllText" v-model.number="paxReq.model.nbChd" />
                <button type="button" class="btn quantity-right-plus" data-type="plus" data-field=""
                  :class="{ 'disabled': buttonsDisabled.increaseChd }" @click="increaseChd"> + </button>
              </div>
            </div>
            <div class="qty-box">
              <label>Infant<br>(below 2)</label>
              <div class="input-group">
                <button type="button" class="btn quantity-left-minus" data-type="minus" data-field=""
                  :class="{ 'disabled': buttonsDisabled.decreaseInf }" @click="decreaseInf"> - </button>
                <input type="text" name="quantity" class="form-control qty-input input-number" :maxlength="1"
                  @keydown="allowDigitInput" @focus="selectAllText" v-model.number="paxReq.model.nbInf" />
                <button type="button" class="btn quantity-right-plus" data-type="plus" data-field=""
                  :class="{ 'disabled': buttonsDisabled.increaseInf }" @click="increaseInf"> + </button>
              </div>
            </div>
          </div>
          <div class="flight-class">
            <div class="form-check">
              <input class="form-check-input radio_animated" type="radio" v-model="paxReq.model.bookingClass" :value="BookingClass.ECONOMY"
                id="class-economy" :checked="paxReq.model.bookingClass === BookingClass.ECONOMY">
              <label class="form-check-label" for="class-economy">
                economy
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input radio_animated" type="radio" v-model="paxReq.model.bookingClass" :value="BookingClass.PREMIUM"
                id="class-premium" :checked="paxReq.model.bookingClass === BookingClass.PREMIUM">
              <label class="form-check-label" for="class-premium">
                premium
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input radio_animated" type="radio" v-model="paxReq.model.bookingClass" :value="BookingClass.BUSINESS"
                id="class-business" :checked="paxReq.model.bookingClass === BookingClass.BUSINESS">
              <label class="form-check-label" for="class-business">
                business
              </label>
            </div>
          </div>
          <div class="bottom-part">
            <a href="#" class="btn mt-1" @click="applyPax">Apply</a>
          </div>
        </div>
      </div>
    </template>

  </ActivatorPopperWrapper>
</template>
