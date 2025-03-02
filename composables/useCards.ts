import { ref } from 'vue';

export interface CardItem {
  name: string;
  revealed: boolean;
}

export interface CardType {
  type: string;
  name: string;
  name_nb: string;
  cards: string[];
}

/**
 * Composable for card generation, shuffling, and match checking
 */
export function useCards() {
  // Clicked cards tracking
  const clickedCards = ref<number[]>([]);
  
  /**
   * Fisher-Yates shuffle algorithm for randomizing arrays
   * @param array The array to shuffle
   * @returns A new shuffled array
   */
  const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array]; // Create a copy to avoid mutating the original
    let currentIndex = newArray.length, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [newArray[currentIndex], newArray[randomIndex]] = [
        newArray[randomIndex], newArray[currentIndex]];
    }

    return newArray;
  };

  /**
   * Generate and shuffle cards for a memory game
   * @param type Card type to use (e.g., 'animals', 'letters')
   * @param sizeId Board size ID (e.g., '4x4')
   * @param availableCards Dictionary of available card sets
   * @returns Array of card items ready for the game
   */
  const generateCards = (
    type: string, 
    sizeId: string, 
    availableCards: Record<string, CardType>
  ): CardItem[] => {
    // Extract rows and columns from the sizeId, e.g., '4x4' -> [4, 4]
    const [rows, columns] = sizeId.split('x').map(Number);
    const totalCards = rows * columns;
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

  /**
   * Handle a card click event
   * @param cards Array of cards in the current game
   * @param index Index of the clicked card
   * @param onFlip Callback when a card is flipped
   * @param onMatch Callback when a match is found
   * @param onMismatch Callback when cards don't match
   * @param onGameComplete Callback when all cards are revealed
   * @returns Information about the clicked card and match status
   */
  const handleCardClick = (
    cards: CardItem[],
    index: number,
    {
      onFlip,
      onMatch,
      onMismatch,
      onGameComplete,
    }: {
      onFlip?: (card: CardItem) => void;
      onMatch?: () => void;
      onMismatch?: () => void;
      onGameComplete?: () => void;
    } = {}
  ) => {
    const card = cards[index];

    if (card.revealed || clickedCards.value.length >= 2) {
      return { card, isMatch: false, wasRevealed: true };
    }

    // Reveal the clicked card
    card.revealed = true;
    clickedCards.value.push(index);

    if (onFlip) {
      onFlip(card);
    }

    let isMatch = false;

    if (clickedCards.value.length === 2) {
      isMatch = checkForMatch(cards, {
        onMatch,
        onMismatch,
        onGameComplete,
      });
    }

    return { card, isMatch, wasRevealed: false };
  };

  /**
   * Check if two flipped cards match
   * @param cards Array of all cards
   * @param callbacks Object containing callback functions
   * @returns true if cards match, false otherwise
   */
  const checkForMatch = (
    cards: CardItem[],
    {
      onMatch,
      onMismatch,
      onGameComplete,
    }: {
      onMatch?: () => void;
      onMismatch?: () => void;
      onGameComplete?: () => void;
    } = {}
  ): boolean => {
    const [firstIndex, secondIndex] = clickedCards.value;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (firstCard.name === secondCard.name) {
      // Match found - keep cards revealed and reset clickedCards
      clickedCards.value = [];
      
      if (onMatch) {
        onMatch();
      }

      // Check if all cards are revealed
      if (cards.every(card => card.revealed)) {
        if (onGameComplete) {
          onGameComplete();
        }
      }
      
      return true;
    } else {
      // No match - hide both cards after a delay
      if (onMismatch) {
        onMismatch();
      }
      
      setTimeout(() => {
        firstCard.revealed = false;
        secondCard.revealed = false;
        clickedCards.value = [];
      }, 1000);
      
      return false;
    }
  };

  /**
   * Reset the clicked cards state
   */
  const resetClickedCards = () => {
    clickedCards.value = [];
  };

  return {
    clickedCards,
    shuffleArray,
    generateCards,
    handleCardClick,
    checkForMatch,
    resetClickedCards
  };
}
