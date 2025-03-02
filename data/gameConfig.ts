/**
 * Game board size configuration options
 */
export const boardSizeOptions = [
  {
    id: '2x2',
    rows: 2,
    columns: 2,
    name: 'Too easy',
    name_nb: 'Altfor enkelt'
  },
  {
    id: '2x3',
    rows: 3,
    columns: 2,
    name: 'Very easy',
    name_nb: 'Veldig enkelt'
  },
  {
    id: '3x4',
    rows: 4,
    columns: 3,
    name: 'Easy',
    name_nb: 'Enkelt'
  },
  {
    id: '4x4',
    rows: 4,
    columns: 4,
    name: 'Normal',
    name_nb: 'Normal'    
  },
  {
    id: '4x5',
    rows: 5,
    columns: 5,
    name: 'Hard',
    name_nb: 'Vanskelig'
  },
  {
    id: '6x6',
    rows: 6,
    columns: 6,
    name: 'Expert',
    name_nb: 'Ekspert'
  }
];

/**
 * Available card types and their contents
 */
export const availableCards = {
  'animals': {
    type: 'animals',
    name: 'Animals',
    name_nb: 'Dyr',
    'cards': [
      'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Bear', 
      'Zebra', 'Panda', 'Kangaroo', 'Monkey', 'Wolf', 
      'Dog', 'Cow', 'Fish', 'Horse', 'Sheep', 'Snake'
    ]
  },
  'letters': {
    type: 'letters',
    name: 'Letters',
    name_nb: 'Bokstaver',
    cards: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 
      'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 
      'Q', 'R', 'S', 'T', 'U', 'V'
    ]
  }
};

/**
 * Get a board size configuration by ID
 * @param id The board size ID (e.g., '4x4')
 * @returns The board size configuration or undefined if not found
 */
export function getBoardSizeById(id: string) {
  return boardSizeOptions.find(size => size.id === id);
}

/**
 * Get a card type by ID
 * @param id The card type ID (e.g., 'animals')
 * @returns The card type or undefined if not found
 */
export function getCardTypeById(id: string) {
  return availableCards[id];
}

/**
 * Get available card types as an array for component consumption
 */
export function getAvailableCardTypes() {
  return Object.values(availableCards);
}
