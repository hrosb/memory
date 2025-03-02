import { ref, reactive, computed } from 'vue';
import { useUrlSearchParams, useStorage } from '@vueuse/core';
import { useCards, CardItem, CardType } from './useCards';

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
  // Get card functionality from the new composable
  const { 
    generateCards, 
    handleCardClick: handleCardClickInternal, 
    clickedCards
  } = useCards();
  
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
    gameState.cards = generateCards(gameOptions.cardType, gameOptions.boardSizeId, availableCards);
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

  // Handle card click wrapper that updates game state - simplified with default callbacks
  const handleCardClick = (
    index: number, 
    onMatchCallback?: () => void, 
    onCardFlipCallback?: (card: CardItem) => void
  ) => {
    if (!gameState.currentGame.started || gameState.gameCompleted) {
      return false;
    }
    
    return handleCardClickInternal(gameState.cards, index, {
      onFlip: (card) => {
        if (onCardFlipCallback) {
          onCardFlipCallback(card);
        }
      },
      onMatch: () => {
        gameState.hits++;
        if (onMatchCallback) {
          onMatchCallback();
        }
      },
      onMismatch: () => {
        gameState.misses++;
      },
      onGameComplete: () => {
        gameState.gameCompleted = true;
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
        triggerGameCompleted();
      }
    });
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
    onGameCompleted
  };
}
