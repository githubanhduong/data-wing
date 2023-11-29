<script setup lang='ts'>
import type { Airport } from '@/common/CityPairManager';

defineProps<{ item: Airport }>()

</script>

<template>
	<div class="acItem ui-menu-item-wrapper" tabindex="-1">
		<span class="name">{{item.city}}</span><br />
		<span class="desc">{{item.country}} - {{item.name}}</span><br />
		<span class="descCode">{{item.code}}</span>
	</div>
</template>

<style lang="scss" scoped></style>