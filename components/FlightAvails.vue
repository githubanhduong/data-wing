<script setup lang='ts'>
import type { JourneyOffer } from '@/common/datawings-xsd';
import FlightRoute from './FlightRoute.vue';

defineProps({
    journeyOffer: Object as () => JourneyOffer,
})

</script>

<template>
    <div class="flight-detail-sec"><!--id="accordionFlushExample"-->
        <div class="detail-bar">
            <FlightRoute v-for="(routeOffers, index) in journeyOffer?.offers" :key="index" :routeId="(index as string)" :offerItems="routeOffers">
                <template #flighOption="{ item, flights, fares }">
					<slot :item="item" :flights="flights" :fares="fares">
						input FlightOption slot
					</slot>
                </template>
            </FlightRoute>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>