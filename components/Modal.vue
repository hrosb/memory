<template>
  <div class="score-board-modal-wrapper" @click="closeModal">
    <div class="score-board-modal" ref="scoreBoardModalElementRef">
      <div class="score-board-modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const scoreBoardModalElementRef = ref<HTMLElement | null>(null);
onClickOutside(scoreBoardModalElementRef, () => closeModal())

const emit = defineEmits(['closeModal']);

function closeModal() {
  emit('closeModal');
}

</script>