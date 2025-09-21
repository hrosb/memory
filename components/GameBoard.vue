<template>
  <div class="game-board" ref="gameBoard" :style="{ ...gridTemplate, width: gameBoardWidth }">
    <div 
      v-for="(card, index) in cards" 
      :key="index" 
      class="card" 
      :class="{ 'revealed': card.revealed }" 
      @click="handleCardClick(index)" 
      :style="cardSize"
    >
      <span v-if="cardType !== 'animals'" :class="{ 'hidden': !card.revealed }">{{ card.name }}</span>
      <img v-else :class="{ 'hidden': !card.revealed }" :src="`/images/${card.name.toLowerCase()}.png`">
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

// Simplified card size calculation with better reactive dependencies
const calculateCardSize = () => {
  if (!props.gameState || !props.gameState.boardSizeId) return;

  const [rows, cols] = props.gameState.boardSizeId.split('x').map(Number);
  const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
  
  // Calculate available space with consistent margins
  const margin = 20; 
  const availableWidth = windowWidth - (margin * 2);
  const availableHeight = windowHeight - (margin * 2);
  
  const gapSize = 10;
  const totalGapWidth = gapSize * (cols - 1);
  const totalGapHeight = gapSize * (rows - 1);
  
  // Calculate card size considering gaps with minimum size protection
  const maxCardWidth = Math.max((availableWidth - totalGapWidth) / cols, 50);
  const maxCardHeight = Math.max((availableHeight - totalGapHeight) / rows, 50);
  
  const size = Math.min(maxCardWidth, maxCardHeight);
  
  // Calculate exact board width including gaps
  const exactBoardWidth = (size * cols) + totalGapWidth;
  
  cardSize.value = { width: `${size}px`, height: `${size}px` };
  gameBoardWidth.value = `${exactBoardWidth}px`;
};

// Change from maxWidth to width for more precise control
const gameBoardWidth = ref('auto');

// Better resize handler with throttling
let resizeTimeout: number | null = null;
const throttledResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = window.setTimeout(calculateCardSize, 100);
};

onMounted(() => {
  calculateCardSize();
  window.addEventListener('resize', throttledResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', throttledResize);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
});
</script>

<style scoped>
.game-board {
  display: grid;
  gap: 10px;
  margin: 0 auto; /* Center the board */
  justify-content: center;
  align-items: center;
}
</style>