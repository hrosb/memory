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
      <div class="button-wrapper"><button class="button" @click="startGame"><span>Nytt spill</span></button></div>
    </template>

    <div class="game-board grid grid-cols-4">
      <div v-for="(card, index) in cards" :key="index" class="card" :class="{ 'revealed': card.revealed }" @click="handleCardClick(index)">
        <span v-if="cardType !== 'animals'" :class="{ 'hidden': !card.revealed }">{{ card.name }}</span>
        <img v-else :class="{ 'hidden': !card.revealed }" :src="`/images/${card.name.toLowerCase()}.png`">
        <!--   <div> {{  `images/${card.name.toLowerCase()}.jpeg` }} </div> -->

      </div>
    </div>

    <div class="current-score">
      <h2>Current Score</h2>
      <p>Time: {{ elapsedTime }}s</p>
      <p>Accuracy: {{ currentAccuracy }}%</p>
    </div>

    <div class="score-board">
      <h2>Score Board Reactive</h2>
      <div>
        <ul>
          <li v-for="(score, index) in currentGameScoreBoardReactive" :key="index">
            {{ index + 1 }} : {{ score.playerName }} : Time: {{ score.timeSpent }}s, Accuracy: {{ (score.accuracy * 100).toFixed(2) }}%
          </li>
        </ul>
      </div>
      <div class="button-wrapper"><button class="button" @click="startGame"><span>Prøv igjen</span></button></div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useSound } from '@vueuse/sound'
import buttonSfx from '../assets/sounds/404740__owlstorm__retro-video-game-sfx-move.wav'
import gameMusic from '../assets/sounds/music.mp3'


const { play: startGameSound, isPlaying: gameSoundIsPlaying } = useSound(gameMusic, { volume: 0.3 })
const { play: clickSound } = useSound(buttonSfx)


const cardType = ref('animals');
const boardSizeId = ref('2x2');
const cards = ref([]);
const elapsedTime = ref(0);
const storeBoardLocalStorage = useStorage('memoryGameScoreBoardReactive', {})

const currentGame = ref({ uuid: '', playerName: 'Anonymous', started: false });

const currentGameScoreBoardReactive = computed(() => {
  const scoreKey = `${boardSizeId.value}-${cardType.value}`;
  return storeBoardLocalStorage.value?.[scoreKey]?.splice(0, 10) || [];
});

const gameStartTime = ref(null);
const hits = ref(0);
const misses = ref(0);
let intervalId = null;


const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const startGame = () => {

  if(!gameSoundIsPlaying.value){
    startGameSound();
  }

  
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
  'animals': ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Bear', 'Zebra', 'Panda', 'Kangaroo', 'Monkey', 'Wolf', 'Dog', 'Cow', 'Fish', 'Horse', 'Sheep', 'Snake',],


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
  clickSound();
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
    setTimeout(() => {
      updateScoreBoard(); // This will now also handle the top 10 check
    }, 100);
    clearInterval(intervalId);
  }
};



const updateScoreBoard = () => {
  const finalScore = {
    timeSpent: parseFloat(elapsedTime.value),
    accuracy: parseFloat(currentAccuracy.value) / 100,
    boardSize: boardSizeId.value,
    cardType: cardType.value
  };

  const scoreKey = `${finalScore.boardSize}-${finalScore.cardType}`;
  let storedScoreBoard = JSON.parse(localStorage.getItem('memoryGameScoreBoard')) || {};


  if (!storedScoreBoard[scoreKey]) {
    storedScoreBoard[scoreKey] = [];
  }

  if (!storeBoardLocalStorage.value[scoreKey]) {
    storeBoardLocalStorage.value[scoreKey] = [];
  }

  // Add the new score (temporarily without a name)
  const newScore = { ...finalScore, uuid: currentGame.value.uuid, playerName: currentGame.value.playerName };
  storedScoreBoard[scoreKey].push(newScore);

  // Sort the scores and keep only the top 10
  storedScoreBoard[scoreKey].sort((a, b) => {
    // Sorting logic based on time spent and accuracy
    // Adjust this based on how you want to calculate the top scores
    return a.timeSpent - b.timeSpent || b.accuracy - a.accuracy;
  });


  const isHighScore = storedScoreBoard[scoreKey].some((score, index) => {
    return score.uuid === currentGame.value.uuid && index < 10;
  });

  if (isHighScore) {
    const playerName = prompt("Congratulations! You've achieved a high score! Enter your name:");
    if (playerName) {
      newScore.playerName = playerName;
      storedScoreBoard[scoreKey] = storedScoreBoard[scoreKey].map(score => {
        return score.uuid === newScore.uuid ? newScore : score;
      });
    }
  }

  // Check if the player's score is in the top 10
  localStorage.setItem('memoryGameScoreBoard', JSON.stringify(storedScoreBoard));

  storeBoardLocalStorage.value[scoreKey] = storedScoreBoard[scoreKey];

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
html,
body {
  min-height: 100vh;
}

body {
  background:
    linear-gradient(322deg,
      #ba4aff, rgba(186, 74, 255, 0) 70%),
    linear-gradient(178deg,
      #008aff, rgba(0, 138, 255, 0) 70%),
    linear-gradient(24deg,
      #00ffc6, rgba(0, 255, 198, 0) 35%);

  background-size: cover;
  min-height: 100%;
}

.game-board {
  justify-content: center;
  margin-top: 20px;
  user-select: none;
}

.card {
  background: #fff;
  border: 1px solid ccc;
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
  transition: all 0.2s ease-in-out;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card.revealed {
  opacity: 1;
}

.card:hover {
  opacity: 1;
}

.card:active {
  transform: translateY(2px);

}

.hidden {
  visibility: hidden;
}



.button-wrapper {
  position: relative;
  display: inline-block;
  margin: 20px;
}

.button-wrapper .button {
  color: white;
  font-family: Helvetica, sans-serif;
  font-weight: bold;
  font-size: 36px;
  text-align: center;
  text-decoration: none;
  background-color: #FFA12B;
  display: block;
  position: relative;
  padding: 20px 40px;

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  text-shadow: 0px 1px 0px #000;
  filter: dropshadow(color=#000, offx=0px, offy=1px);

  -webkit-box-shadow: inset 0 1px 0 #FFE5C4, 0 10px 0 #915100;
  -moz-box-shadow: inset 0 1px 0 #FFE5C4, 0 10px 0 #915100;
  box-shadow: inset 0 1px 0 #FFE5C4, 0 10px 0 #915100;

  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}

.button-wrapper .button:active {
  top: 10px;
  background-color: #F78900;

  -webkit-box-shadow: inset 0 1px 0 #FFE5C4, inset 0 -3px 0 #915100;
  -moz-box-shadow: inset 0 1px 0 #FFE5C4, inset 0 -3pxpx 0 #915100;
  box-shadow: inset 0 1px 0 #FFE5C4, inset 0 -3px 0 #915100;
}

.button-wrapper:after {
  content: "";
  height: 100%;
  width: 100%;
  padding: 4px;
  position: absolute;
  bottom: -15px;
  left: -4px;
  z-index: -1;
  background-color: #2B1800;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}
</style>