import { computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { BookingClass, BookingType, SeStep } from '@/common/custom-type'
import type { SeData } from '@/common/custom-type'

export const useSeDataState = defineStore('seDataState', () => {
  const seData = reactive<SeData>({
    showStepBarBox: true,
    dataKey: "root",
    seForm: {
      bookingType: BookingType.ROUNDTRIP,
      bookingClass: BookingClass.ECONOMY,
      nbAdt: 1,
      nbChd: 0,
      nbInf: 0,
    }
  } as SeData)

  const nextStep = (currentStep: SeStep): SeStep | undefined => {
    const sortedSteps = Object.values(SeStep)
      .filter((val) => typeof val === 'number')
      .filter(
        (step) => !(seData.seForm.bookingType !== BookingType.ROUNDTRIP && step === SeStep.RETURN)
      )
      .sort((a: any, b: any) => a - b) as SeStep[]

    const currentIndex = sortedSteps.indexOf(currentStep)
    if (currentIndex === -1 || currentIndex === sortedSteps.length - 1) {
      return undefined
    }
    return sortedSteps[currentIndex + 1]
  }

  const prevStep = (currentStep: SeStep): SeStep | undefined => {
    const sortedSteps = Object.values(SeStep)
      .filter((val) => typeof val === 'number')
      .filter(
        (step) => !(seData.seForm.bookingType !== BookingType.ROUNDTRIP && step === SeStep.RETURN)
      )
      .sort((a: any, b: any) => b - a) as SeStep[]

    const currentIndex = sortedSteps.indexOf(currentStep)
    if (currentIndex === -1 || currentIndex === sortedSteps.length - 1) {
      return undefined
    }
    return sortedSteps[currentIndex + 1]
  }

  const setStep = (step: SeStep) => {
    seData.step = step
  }

  const passengerInputProps = computed(() => {
    const { nbAdt, nbChd, nbInf, bookingClass } = seData.seForm
    return { nbAdt, nbChd, nbInf, bookingClass }
  })

  const bookingClass = computed(() => {
    return seData.seForm.bookingClass
  })


  const setPassengerInputProps = (data: any, xx: number) => {
    console.log('Store is updated PaxInfo', xx)
    const data_ = {...seData.seForm, ...data}
    seData.seForm = data_
  }

  const passengerDetail = computed(() => {
    const { nbAdt, nbChd, nbInf } = seData.seForm
    return { nbAdt, nbChd, nbInf, totalPax: nbAdt + nbChd + nbInf }
  })

  const departDate = computed(() => seData.seForm.departDate)
  const returnDate = computed(() => seData.seForm.retourDate)

  const currentSeForm = computed(() => seData.seForm)

  // const dateFaresDepart = computed(() => {
  //   if (seData.availabilityData) {
  //     return dateFares(seData.availabilityData, seData.availabilityData.tripOffers[0], seData.seForm.departDate, 3)
  //   } else {
  //     return []
  //   }
  // })

  return {
    seData, nextStep, prevStep, setStep, passengerInputProps, bookingClass,
    setPassengerInputProps,
    passengerDetail, departDate, returnDate, currentSeForm, //dateFaresDepart
  }
})
