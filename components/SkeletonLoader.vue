<template>
    <Suspense>
        <slot></slot>
        <template #fallback>
            <slot name="fallback"></slot>
        </template>
    </Suspense>
</template>