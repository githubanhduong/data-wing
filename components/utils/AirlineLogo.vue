<script setup lang='ts'>
import { reactive } from 'vue';
import airlineLogos from '@/common/airlines-images'

const props = defineProps({
    airlineCode: { type: String, required: true },
})

const logoSrc = reactive({ src: airlineLogos[props.airlineCode], error: false })

if (!logoSrc.src) {
    const noLogoSvg = airlineLogos['nonLogoSvg']
    const lastSlashIndex = noLogoSvg.lastIndexOf('/')
    logoSrc.src = `${noLogoSvg.substring(0, lastSlashIndex)}/${props.airlineCode}.png`
}

const handleImageError = () => {
    logoSrc.src = airlineLogos['nonLogo']
    logoSrc.error = true
}

</script>

<template>
    <img :src="logoSrc.src" :alt="airlineCode" :class="['airline-logo', { 'no-image': logoSrc.error }, airlineCode]" @error="handleImageError" />
</template>