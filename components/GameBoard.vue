<template>
  <div class="game-board grid grid-cols-4">
    <div v-for="(card, index) in cards" :key="index" class="card" :class="{ 'revealed': card.revealed }" @click="handleCardClick(index)">
      <span v-if="cardType !== 'animals'" :class="{ 'hidden': !card.revealed }">{{ card.name }}</span>
      <img v-else :class="{ 'hidden': !card.revealed }" :src="`/images/${card.name.toLowerCase()}.png`">
      <!--   <div> {{  `images/${card.name.toLowerCase()}.jpeg` }} </div> -->

    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  cards: { name: string, revealed: boolean }[]
  boardSizeId: string,
  cardType: string,
}>();


const emit = defineEmits(['cardClicked']);

function handleCardClick(index: number) {
  emit('cardClicked', index);
}

</script>