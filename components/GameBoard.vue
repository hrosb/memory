<template>
<div class="game-board" ref="gameBoard"  :style="{ ...gridTemplate, 'max-width': gameBoardMaxWidth }">
    <div v-for="(card, index) in cards" :key="index" class="card" :class="{ 'revealed': card.revealed }" @click="handleCardClick(index)" :style="cardSize">
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
  gameState: any
}>();


const emit = defineEmits(['cardClicked']);

function handleCardClick(index: number) {
  emit('cardClicked', index);
}

const gridTemplate = computed(() => {
  const [rows, cols] = props.gameState.boardSizeId.split('x').map(Number);
  return {
    'grid-template-columns': `repeat(${cols}, 1fr)`,
    'grid-template-rows': `repeat(${rows}, 1fr)`
  };
});

const cardSize = ref({ width: '100px', height: '100px' }); // Default card size

const calculateCardSize = () => {
  const [rows, cols] = props.gameState.boardSizeId.split('x').map(Number);
  const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
  
  const gapSize = 10; // Gap size in pixels
  const maxCardWidth = (windowWidth - gapSize * (cols - 1)) / cols;
  const maxCardHeight = (windowHeight - gapSize * (rows - 1)) / rows;
  const size = Math.min(maxCardWidth, maxCardHeight);

  cardSize.value = { width: `${size}px`, height: `${size}px` };
  gameBoardMaxWidth.value = `${size * cols + gapSize * (cols - 1)}px`; // Calculate the max width of the game board
};

const gameBoardMaxWidth = ref('100%');


onMounted(() => {
  calculateCardSize();
  window.addEventListener('resize', calculateCardSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculateCardSize);
});
</script>