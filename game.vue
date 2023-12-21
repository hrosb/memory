<template>
  <div>
    

    <template v-if="!currentGame.started">

      
      <div>
        <label for="card-type">Choose Card Type:</label>
        <select id="card-type" v-model="cardType">
          <option v-for="cardType in availableCardTypes" :value="cardType">{{ cardType }}</option>
        </select>
      </div>
      <div>
        <label for="board-size">Board Size:</label>
        <select id="board-size" v-model="boardSizeId">
          <option v-for="board in boardSizeOptions" :value="board.id">{{ board.id }}</option>
        </select>
      </div>
      <button @click="startGame">Start Game</button>
    </template>

    <div class="game-board grid grid-cols-4">
      <div v-for="(card, index) in cards" :key="index" class="card" :class="{ 'revealed': card.revealed }" @click="handleCardClick(index)">
        <span v-if="cardType !== 'animals'" :class="{ 'hidden': !card.revealed }">{{ card.name }}</span>
        <img v-else :class="{ 'hidden': !card.revealed }" :src="`/images/${card.name.toLowerCase()}.png`"> 
<!--         <div> {{  `images/${card.name.toLowerCase()}.jpeg` }} </div>
 -->      </div>
    </div>

    <div class="current-score">
      <h2>Current Score</h2>
      <p>Time: {{ elapsedTime }}s</p>
      <p>Accuracy: {{ currentAccuracy }}%</p>
    </div>

    <div class="score-board">
      <h2>Score Board</h2>
      <div>
        <ul>
          <li v-for="(score, index) in currentGameScoreBoard" :key="index">
         {{ index + 1 }} :   {{ score.playerName }} : Time: {{ score.timeSpent }}s, Accuracy: {{ (score.accuracy * 100).toFixed(2) }}%
          </li>
        </ul>
      </div>
      <button @click="startGame">Start Game</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';

const cardType = ref('animals');
const boardSizeId = ref('2x2');
const cards = ref([]);
const elapsedTime = ref(0);

const storeBoardLocalStorage = useStorage('memoryGameScoreBoard', {})


const currentGame = ref({ uuid: '', playerName: 'Anonymous', started: false });

const currentGameScoreBoard = computed(() => {
  const scoreKey = `${boardSizeId.value}-${cardType.value}`;
  return storeBoardLocalStorage.value?.[scoreKey]?.splice(0, 10) || [];
});

const gameStartTime = ref(null);
const hits = ref(0);
const misses = ref(0);

// Initialize scoreBoard as a reactive reference
let intervalId = null;


const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const startGame = () => {
  gameStartTime.value = Date.now(); // Set the start time to the current time
  hits.value = 0;
  misses.value = 0;
  cards.value = generateAndShuffleCards(cardType.value, boardSizeId.value);
  currentGame.value = { uuid: generateUUID(), playerName: 'Anonymous', started: true };
  // Clear existing interval if any
  if (intervalId !== null) {
    clearInterval(intervalId);
  }



  // Start a new interval to update elapsed time every second
  intervalId = setInterval(() => {
    elapsedTime.value = ((Date.now() - gameStartTime.value) / 1000).toFixed(2);
  }, 10);

};



const boardSizeOptions = [
  {
    id: '2x2',
    rows: 2,
    columns: 2
  },
  {
    id: '2x3',
    rows: 3,
    columns: 2
  },
  {
    id: '3x4',
    rows: 4,
    columns: 3
  },
  {
    id: '4x4',
    rows: 4,
    columns: 4
  },
  {
    id: '4x5',
    rows: 5,
    columns: 5
  },
  {
    id: '6x6',
    rows: 6,
    columns: 6
  }
]

const availableCards = {
  'animals': ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Bear', 'Zebra', 'Panda', 'Kangaroo', 'Monkey', 'Wolf'],


  'fruits': ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Strawberry', 'Cherry', 'Peach', 'Pear'],
  'numbers': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  'letters': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Æ', 'Ø', 'Å']
};

const availableCardTypes = Object.keys(availableCards);

const generateAndShuffleCards = (type, sizeId) => {
  // Extract rows and columns from the sizeId, e.g., '4x4' -> [4, 4]
  const [rows, columns] = sizeId.split('x').map(Number);
  const totalCards = rows * columns;

  // Ensure there are enough unique cards for the chosen type
  if (availableCards[type].length < totalCards / 2) {
    throw new Error('Not enough unique cards for the selected board size');
  }

  // Randomly select unique cards for the game
  const selectedCards = shuffleArray(availableCards[type]).slice(0, totalCards / 2);

  // Convert each card name to an object with name and revealed properties
  let gameCards = selectedCards.map(name => ({ name, revealed: false }));

  // Duplicate each card to create pairs, ensuring each is a unique object
  gameCards = gameCards.reduce((acc, card) => {
    return [...acc, { ...card }, { ...card }]; // Duplicate with new objects
  }, []);

  // Shuffle the cards
  return shuffleArray(gameCards);
};

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

const clickedCards = ref([]);
const handleCardClick = (index) => {
  const card = cards.value[index];
  if (card.revealed || clickedCards.value.length >= 2) {
    return; // Ignore click if the card is already revealed or two cards are clicked
  }

  card.revealed = true;  // Reveal the clicked card
  clickedCards.value.push(index);

  if (clickedCards.value.length === 2) {
    checkForMatch();
  }
};

const checkForMatch = () => {
  const [firstIndex, secondIndex] = clickedCards.value;
  const firstCard = cards.value[firstIndex];
  const secondCard = cards.value[secondIndex];

  if (firstCard.name === secondCard.name) {
    // Match found, keep cards revealed and reset clickedCards
    hits.value++;
    clickedCards.value = [];
  } else {
    misses.value++;
    // No match, hide both cards after a short delay
    setTimeout(() => {
      firstCard.revealed = false;
      secondCard.revealed = false;
      clickedCards.value = [];
    }, 1000);
  }

  if (cards.value.every(card => card.revealed)) {
    clearInterval(intervalId);
    updateScoreBoard(); // This will now also handle the top 10 check
  }
};



const updateScoreBoard = () => {
  const finalScore = {
    timeSpent: parseFloat(elapsedTime.value),
    accuracy: parseFloat(currentAccuracy.value) / 100,
    boardSize: boardSizeId.value,
    cardType: cardType.value,
    uuid: currentGame.value.uuid,
    playerName: currentGame.value.playerName
  };

  const scoreKey = `${finalScore.boardSize}-${finalScore.cardType}`;

  // Ensure there's an array to hold scores for this key
  if (!storeBoardLocalStorage.value[scoreKey]) {
    storeBoardLocalStorage.value[scoreKey] = [];
  }

  // Add the new score
  const updatedScores = [...storeBoardLocalStorage.value[scoreKey], finalScore];

  // Sort the scores and keep only the top 10
  const sortedScores = updatedScores.sort((a, b) => {
    // Sorting logic based on time spent and accuracy
    return a.timeSpent - b.timeSpent || b.accuracy - a.accuracy;
  }).slice(0, 10);

  // Check if the current game's score is in the top 10
  const isHighScore = sortedScores.includes(finalScore);

  if (isHighScore) {
    const playerName = prompt("Congratulations! You've achieved a high score! Enter your name:");
    if (playerName) {
      finalScore.playerName = playerName;
      // insert the score
      sortedScores.push(finalScore);

      // Update the score with the player name
      const index = sortedScores.findIndex(score => score.uuid === finalScore.uuid);
      if (index !== -1) sortedScores[index] = finalScore;
      
    }
  }

  // Update the storeBoardLocalStorage with the new sorted and sliced scores
  storeBoardLocalStorage.value[scoreKey] = sortedScores;
};





const currentAccuracy = computed(() => {
  const totalAttempts = hits.value + misses.value;
  return totalAttempts > 0 ? ((hits.value / totalAttempts) * 100).toFixed(2) : 0;
});


onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});

</script>



<style>
.game-board {

  justify-content: center;
  margin-top: 20px;
}

.card {
  border: 1px solid black;
  padding: 20px;
  margin: 5px;
  text-align: center;
  cursor: pointer;
  flex-basis: calc(100% / var(--board-size) - 10px);
  aspect-ratio: 1 / 1;
  /* Adjust based on board size */
  opacity: 0.8;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card:hover {
  opacity: 1;
}

.hidden {
  visibility: hidden;
}
</style>