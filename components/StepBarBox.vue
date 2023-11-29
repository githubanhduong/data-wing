<script setup lang="ts">
import { SeStep, BookingType } from '@/common/custom-type'
import router from '@/router';
import { useSeDataState } from '@/stores/engine'
// import { computed } from 'vue';

const seStore = useSeDataState()

const stepClass = (step: SeStep, currentStep: SeStep) => {
	const classes = ['progress__item']
	if (currentStep > -1) {
		if (step === currentStep) {
			classes.push('active')
		}
		if (step < currentStep) {
			classes.push('ok')
		}
	}
	return classes
}

// seStore.setStep(SeStep.DEPART);

// (window as any).nextStep = () => {
// 	console.log('current step: ' + SeStep[seStore.seData.step])
// 	let nextstep = seStore.nextStep(seStore.seData.step)
// 	console.log('next step: ' + nextstep)
// 	if (nextstep)
// 		console.log('next step: ' + SeStep[nextstep])
// 	else
// 		nextstep = SeStep.ENGINE
// 	seStore.seData.step = nextstep!
// }
// (window as any).prevStep = () => {
// 	console.log('current step: ' + SeStep[seStore.seData.step])
// 	let prevStep = seStore.prevStep(seStore.seData.step)
// 	console.log('pre step: ' + prevStep)
// 	if (prevStep) console.log('next step: ' + SeStep[prevStep])
// 	else
// 		prevStep = SeStep.ENGINE
// 		seStore.seData.step = prevStep!
// }
// (window as any).store = seStore;
// const router = useRouter()

const clickTogo = (obj: any) => {
	router.push(obj)
}
</script>

<template>
	<div v-show="seStore.seData.showStepBarBox" class="step-bar-box">
		<div class="container">
			<div class="row">
				<div class="col-sm-12">
					<div class="progress">
						<!-- <div v-if="seStore.seData.step == SeStep.HOMEPAGE" id="step0" class="progress__item active" -->
						<div id="step0" :class="stepClass(SeStep.HOMEPAGE, seStore.seData.step)"
							 @click="clickTogo({ name: 'IbeHome' })">
							<div class="progress__bar"></div>
							<div class="progress__step"><i class="fas fa-search"></i></div>
							<div class="progress__text">Search flight</div>
						</div>
						<a id="step1" :class="stepClass(SeStep.DEPART, seStore.seData.step)"
							href="/aviahub/secure/ibe/flights">
							<div class="progress__bar"></div>
							<div class="progress__step"><i class="fas fa-plane-departure"></i></div>
							<div class="progress__text">Departure flight</div>
						</a>
						<div v-if="seStore.seData.seForm.bookingType !== BookingType.ONEWAY" id="step2"
							:class="stepClass(SeStep.RETURN, seStore.seData.step)">
							<div class="progress__bar"></div>
							<div class="progress__step"><i class="fas fa-plane"></i></div>
							<div class="progress__text">Return flight</div>
						</div>
						<div id="step3" :class="stepClass(SeStep.PASSENGER, seStore.seData.step)">
							<div class="progress__bar"></div>
							<div class="progress__step"><i class="fas fa-user-friends"></i></div>
							<div class="progress__text">Passengers</div>
						</div>
						<div id="step4" :class="stepClass(SeStep.EXTRA_OPTION, seStore.seData.step)">
							<div class="progress__bar"></div>
							<div class="progress__step"><i class="fas fa-luggage-cart"></i></div>
							<div class="progress__text">Extra options</div>
						</div>
						<div id="step5" :class="stepClass(SeStep.PAYMENT, seStore.seData.step)">
							<div class="progress__bar"></div>
							<div class="progress__step"><i class="far fa-credit-card"></i></div>
							<div class="progress__text">Payment</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
