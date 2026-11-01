<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'

const props = defineProps({ labels: { type: Object, required: true } })
const dialog = ref(null)
const viewport = ref(null)
const project = ref(null)
const zoomed = ref(false)
const failed = ref(false)
let trigger
let previousOverflow

async function open(value, source) {
  trigger = source
  project.value = value
  zoomed.value = false
  failed.value = false
  await nextTick()
  previousOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  dialog.value.showModal()
}

function restore() {
  if (previousOverflow !== undefined) {
    document.documentElement.style.overflow = previousOverflow
    previousOverflow = undefined
  }
  trigger?.focus({ preventScroll: true })
}

function close() {
  dialog.value.close()
}

function keepFocus(event) {
  if (event.key !== 'Tab') return
  const controls = Array.from(
    dialog.value.querySelectorAll('button, a[href], [tabindex="0"]'),
  ).filter((el) => !el.disabled && el.getClientRects().length)
  if (!controls.length) return
  event.preventDefault()
  const index = controls.indexOf(document.activeElement)
  const next = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length
  controls[next].focus()
}

async function toggleZoom() {
  zoomed.value = !zoomed.value
  await nextTick()
  viewport.value.scrollTo(0, 0)
}

function dismissBackdrop(event) {
  if (event.target !== dialog.value) return
  const rect = dialog.value.getBoundingClientRect()
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    close()
}

onBeforeUnmount(restore)
defineExpose({ open })
</script>

<template>
  <dialog
    ref="dialog"
    class="image-viewer"
    aria-labelledby="image-viewer-title"
    @close="restore"
    @click="dismissBackdrop"
    @keydown="keepFocus"
  >
    <template v-if="project">
      <header
        class="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"
      >
        <h2 id="image-viewer-title" class="font-display text-lg text-fg">
          {{ project.title }}
        </h2>
        <div class="flex gap-2">
          <button
            v-if="!failed"
            type="button"
            class="viewer-control"
            :aria-pressed="zoomed"
            @click="toggleZoom"
          >
            {{ zoomed ? props.labels.fit : props.labels.zoom }}
          </button>
          <button type="button" autofocus class="viewer-control" @click="close">
            {{ props.labels.close }}
          </button>
        </div>
      </header>
      <div
        ref="viewport"
        class="viewer-viewport"
        :class="{ 'is-zoomed': zoomed }"
        tabindex="0"
        :aria-label="props.labels.pan"
      >
        <div v-if="failed" class="p-8 text-fg" role="alert">
          <p>{{ props.labels.error }}</p>
          <a
            :href="project.image"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-block text-accent underline"
            >{{ props.labels.original }}</a
          >
        </div>
        <img
          v-else
          :key="project.id"
          :src="project.image"
          :alt="project.imageAlt"
          :width="project.imageWidth"
          :height="project.imageHeight"
          @error="failed = true"
        />
      </div>
    </template>
  </dialog>
</template>
