<script setup lang="ts">
import { ref, computed } from 'vue'
import SearchForm from './SearchForm.vue'
import { useSeDataState } from '@/stores/engine';
import { useI18n_ } from '@/plugins/i18n';
import { dateToString } from '@/common/dw-luxon';
import MessageText from './utils/MessageText.vue';

const { t } = useI18n_();

const seFormOpen = ref(false)//ref(false)
const searchModifyClick = () => {
  seFormOpen.value = !seFormOpen.value
}

const seStore = useSeDataState()

const paxSummaryDetail = computed(() => {
  const pax = seStore.passengerDetail
  const rs = []
  if (pax.nbAdt > 0)
    rs.push(t('se.form.passengers.adt', { n: pax.nbAdt }, '_| {n} Aldult | {n} Aldults'))
  if (pax.nbChd > 0)
    rs.push(t('se.form.passengers.chd', { n: pax.nbChd }, '_| {n} Child | {n} Children'))
  if (pax.nbInf > 0)
    rs.push(t('se.form.passengers.inf', { n: pax.nbInf }, '_| {n} Infant | {n} Infants'))
  return rs.join(", ")
})

</script>

<template>
  <div class="bg-inner small-section pb-0">
    <div class="container">
      <div class="flight-search">
        <div class="responsive-detail">
          <div class="destination" v-if="seStore.seData.seForm.fromCode && seStore.seData.seForm.toCode">
			<MessageText tag="span" :code="`airport.${seStore.seData.seForm.fromCode}.city`" :text="seStore.seData.seForm.fromCode"></MessageText>
            <span><i v-if="seStore.returnDate" class="fas fa-exchange-alt"></i>
              <i v-else class="fas fa-long-arrow-alt-right"></i>
            </span>
			<MessageText tag="span" :code="`airport.${seStore.seData.seForm.toCode}.city`" :text="seStore.seData.seForm.toCode"></MessageText>
          </div>
          <div class="details">
            <span>{{ dateToString(seStore.departDate, 'EEE, dd MMM yyyy') }}{{ (seStore.departDate && seStore.returnDate)? ' - ' : '' }}{{ dateToString(seStore.returnDate, 'EEE, dd MMM yyyy') }}</span>
            <span class="divider">|</span>
            <span>{{ paxSummaryDetail }}</span>
          </div>

          <div class="modify-search">
            <div @click="searchModifyClick" class="button btn btn-solid-modifi-flight color1 wid-cus accordion-toggle">
			        <MessageText tag="p" code="se.btn.modify_search" text=".Modify search"><i class="fas fa-pencil-alt ms-1" /></MessageText>
            </div>
          </div>
        </div>
        <div class="flight-search-detail accordion-flight"
          :class="['flight-search-detail accordion-flight', { 'open': seFormOpen } ]">
          <skeleton-loader>
            <SearchForm></SearchForm>
            <template #fallback>Loading...</template>
          </skeleton-loader>

          
        </div>
      </div>
    </div>
  </div>
  <!-- search section end -->
</template>

<style scoped></style>
