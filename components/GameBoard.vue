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
  
  // Calculate card size considering gaps
  const maxCardWidth = (availableWidth - totalGapWidth) / cols;
  const maxCardHeight = (availableHeight - totalGapHeight) / rows;
  
  const size = Math.min(maxCardWidth, maxCardHeight);
  
  // Calculate exact board width including gaps
  const exactBoardWidth = (size * cols) + totalGapWidth;
  
  cardSize.value = { width: `${size}px`, height: `${size}px` };
  gameBoardWidth.value = `${exactBoardWidth}px`;
};

// Change from maxWidth to width for more precise control
const gameBoardWidth = ref('auto');


onMounted(() => {
  calculateCardSize();
  window.addEventListener('resize', calculateCardSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculateCardSize);
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