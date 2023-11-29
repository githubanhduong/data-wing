<script setup lang='ts'>
import type { OfferItem } from '@/common/datawings-xsd';
import { listFlight, listFaresByFareRefs } from '@/common/availabilityResultUtils'
import { useAvailState } from '@/stores/availData';

const props = defineProps({
    routeId: String,
    offerItems: Array<OfferItem>
})

const store = useAvailState()



console.log(props.offerItems);



</script>

<template>
    <span>Route: {{ routeId }}</span>
    <div class="detail-wrap wow fadeInUp wrap-shadow" v-for="item in offerItems" :key="item.offerKey">
        <slot name="flighOption" :item="item" :flights="listFlight(store.data.availabilityData, item.listFlightIds)"
            :fares="listFaresByFareRefs(store.data.availabilityData, item.fareRefs)"></slot>
    </div>
</template>

<style lang="scss" scoped></style>