<script setup>
import { Icon } from '@iconify/vue/offline'
import { icons } from '../data/icons.js'

defineProps({
  name: { type: String, default: '' },
  size: { type: Number, default: 16 },
})
</script>

<template>
  <Icon
    v-if="icons[name]"
    :icon="icons[name]"
    :width="size"
    :height="size"
    :data-icon="name"
    aria-hidden="true"
    focusable="false"
    class="inline-block shrink-0 align-middle"
  />
</template>
