import { ref, reactive, computed } from 'vue';
import { useUrlSearchParams, useStorage } from '@vueuse/core';

interface CardItem {
  name: string;
  revealed: boolean;
}

interface CardType {
  type: string;
  name: string;
  name_nb: string;
  cards: string[];
}

interface GameOptions {
  cardType: string;
  boardSizeId: string;
  playerName?: string;
  musicOn?: boolean;
  gfxOn?: boolean;
}

interface GameState {
  cardType: string;
  boardSizeId: string;
  cards: CardItem[];
  elapsedTime: number | string;
  gameStartTime: number | null;
  hits: number;
  misses: number;
  gameCompleted: boolean;
  currentGame: {
    uuid: string;
    playerName: string;
    started: boolean;
  };
  clickedCards: number[];
}

export function useGameState() {
  // URL parameters handling
  const urlParams = useUrlSearchParams('history');
  
  // Create computed refs for cardType and boardSizeId that sync with URL
  const cardType = computed({
    get: () => urlParams.cardType || 'animals',
    set: (value) => { urlParams.cardType = value }
  });

  const boardSizeId = computed({
    get: () => urlParams.boardSize || '2x2',
    set: (value) => { urlParams.boardSize = value }
  });

  // Timer management
  let intervalId: number | null = null;

  // Game state initialization
  const gameState = reactive<GameState>({
    cardType: cardType.value,
    boardSizeId: boardSizeId.value,
    cards: [],
    elapsedTime: 0,
    gameStartTime: null,
    hits: 0,
    misses: 0,
    gameCompleted: false,
    currentGame: { 
      uuid: '', 
      playerName: 'Anonymous', 
      started: false 
    },
    clickedCards: []
  });

  // Local storage for scores
  const storeBoardLocalStorage = useStorage('memoryGameScoreBoardReactive', {});
  
  const currentGameScoreBoardReactive = computed(() => {
    const scoreKey = `${gameState.boardSizeId}-${gameState.cardType}`;
    return storeBoardLocalStorage.value?.[scoreKey]?.splice(0, 10) || [];
  });
  
  const gameIsOngoing = computed(() => gameState.currentGame.started);
  
  // Clicked cards tracking
  const clickedCards = ref<number[]>([]);
  
  // Calculate current accuracy
  const currentAccuracy = computed(() => {
    const totalAttempts = gameState.hits + gameState.misses;
    return totalAttempts > 0 ? ((gameState.hits / totalAttempts) * 100).toFixed(2) : 0;
  });

  // UUID generation for games
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T>(array: T[]): T[] => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  // Generate and shuffle cards for the game
  const generateAndShuffleCards = (type: string, sizeId: string, availableCards: Record<string, CardType>): CardItem[] => {
    // Extract rows and columns from the sizeId, e.g., '4x4' -> [4, 4]
    const [rows, columns] = sizeId.split('x').map(Number);
    const totalCards = rows * columns;
    const availableCardTypes = Object.values(availableCards);
    const cardSet = availableCards[type];

    if (!cardSet || cardSet.cards.length < totalCards / 2) {
      throw new Error('Not enough unique cards for the selected board size');
    }

    // Randomly select unique cards for the game
    const selectedCards = shuffleArray([...cardSet.cards]).slice(0, totalCards / 2);

    // Convert each card name to an object with name and revealed properties
    let gameCards = selectedCards.map(name => ({ name, revealed: false }));

    // Duplicate each card to create pairs, ensuring each is a unique object
    gameCards = gameCards.reduce((acc, card) => {
      return [...acc, { ...card }, { ...card }]; // Duplicate with new objects
    }, [] as CardItem[]);

    // Shuffle the cards
    return shuffleArray(gameCards);
  };

  // Start a new game
  const startGame = (gameOptions: GameOptions, availableCards: Record<string, CardType>) => {
    if (gameOptions.playerName) {
      gameState.currentGame.playerName = gameOptions.playerName;
    }

    gameState.currentGame.uuid = generateUUID();
    gameState.currentGame.started = true;

    gameState.cardType = gameOptions.cardType;
    gameState.boardSizeId = gameOptions.boardSizeId;

    gameState.gameStartTime = Date.now();
    gameState.hits = 0;
    gameState.misses = 0;
    gameState.cards = generateAndShuffleCards(gameOptions.cardType, gameOptions.boardSizeId, availableCards);
    gameState.gameCompleted = false;

    // Clear existing interval if any
    if (intervalId !== null) {
      clearInterval(intervalId);
    }

    // Start a new interval to update elapsed time every second
    intervalId = window.setInterval(() => {
      gameState.elapsedTime = ((Date.now() - gameState.gameStartTime!) / 1000).toFixed(2);
    }, 10);
  };

  // Stop current game
  const stopCurrentGame = () => {
    gameState.gameCompleted = false;
    gameState.currentGame.uuid = '';
    gameState.currentGame.started = false;
    
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // Handle card click
  const handleCardClick = (index: number, onMatchCallback?: () => void, onCardFlipCallback?: (card: CardItem) => void) => {
    const card = gameState.cards[index];

    if (card.revealed || clickedCards.value.length >= 2) {
      return; // Ignore click if the card is already revealed or two cards are clicked
    }

    card.revealed = true;  // Reveal the clicked card
    clickedCards.value.push(index);

    // Call the callback when a card is flipped
    if (onCardFlipCallback) {
      onCardFlipCallback(card);
    }

    let clickIsMatch = false;
    if (clickedCards.value.length === 2) {
      clickIsMatch = checkForMatch(onMatchCallback);
    }

    return { card, isMatch: clickIsMatch };
  };

  // Add event callbacks
  const onGameCompletedCallbacks: Array<() => void> = [];

  // Method to register a callback for game completion
  const onGameCompleted = (callback: () => void) => {
    onGameCompletedCallbacks.push(callback);
  };

  // Method to trigger game completion callbacks
  const triggerGameCompleted = () => {
    onGameCompletedCallbacks.forEach(callback => callback());
  };

  // Check if the two flipped cards match
  const checkForMatch = (onMatchCallback?: () => void) => {
    const [firstIndex, secondIndex] = clickedCards.value;
    const firstCard = gameState.cards[firstIndex];
    const secondCard = gameState.cards[secondIndex];
    let clickIsMatch = false;

    if (firstCard.name === secondCard.name) {
      // Match found, keep cards revealed and reset clickedCards
      gameState.hits++;
      clickedCards.value = [];
      clickIsMatch = true;
      
      if (onMatchCallback) {
        onMatchCallback();
      }
    } else {
      gameState.misses++;
      // No match, hide both cards after a short delay
      setTimeout(() => {
        firstCard.revealed = false;
        secondCard.revealed = false;
        clickedCards.value = [];
      }, 1000);
    }

    // Check if the game is completed (all cards are revealed)
    if (gameState.cards.every(card => card.revealed)) {
      gameState.gameCompleted = true;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      
      // Trigger game completed callbacks
      triggerGameCompleted();
    }
    
    return clickIsMatch;
  };

  // Cleanup on component unmount
  const cleanup = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return {
    gameState,
    cardType,
    boardSizeId,
    currentAccuracy,
    gameIsOngoing,
    clickedCards,
    currentGameScoreBoardReactive,
    startGame,
    stopCurrentGame,
    handleCardClick,
    cleanup,
    generateUUID,
    onGameCompleted  // Export the new method
  };
}
