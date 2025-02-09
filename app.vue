<template>
  <div class="game-container">

    <NewGameForm :game-state="gameState" mode="new-game" v-if="!gameState.currentGame.started" :availableCardTypes="availableCardTypes" :boardSizeOptions="boardSizeOptions" @startGame="startGame" />

    <div class="game-content">
      <GameBoard
        :cards="gameState.cards"
        :boardSizeId="boardSizeId"
        :cardType="cardType"
        @cardClicked="handleCardClick"
        :game-state="gameState"
        v-if="gameIsOngoing">
      </GameBoard>

      <div class="current-score" v-if="gameIsOngoing">
        <p>Time: {{ gameState.elapsedTime }}s</p>
        <p>Accuracy: {{ currentAccuracy }}%</p>
      </div>

      <!-- Changed: Static retry section -->
      <div class="bottom-controls" v-if="gameIsOngoing && !gameState.gameCompleted">
        <NewGameForm 
          :game-state="gameState" 
          mode="retry" 
          @gotoBoardOptions="stopCurrentGame"
          :availableCardTypes="availableCardTypes" 
          :boardSizeOptions="boardSizeOptions" 
          @startGame="restartGame"
        />
      </div>
    </div>

    <!-- Updated result modal with new button styles -->
    <Modal v-if="showResultModal" @closeModal="handleModalClose">
      <div class="result-modal">
        <div class="result-modal-content">
          <h2 class="result-title">
            {{ currentGameScoreBoardReactive.some(s => s.isNew) ? 'Game Complete!' : 'Almost There!' }}
          </h2>
          
          <div class="result-stats">
            <div class="stat-item">
              <span class="stat-label">Time</span>
              <span class="stat-value">{{ gameState.elapsedTime }}s</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value">{{ currentAccuracy }}%</span>
            </div>
          </div>

          <!-- Show either scoreboard or encouragement -->
          <div v-if="currentGameScoreBoardReactive.some(s => s.isNew)" class="scoreboard">
            <h3>Top Scores</h3>
            <ul class="score-list">
              <li v-for="(score, index) in currentGameScoreBoardReactive" 
                  :key="index" 
                  :class="{ 'new-score': score.isNew }">
                <span class="score-rank">{{ index + 1 }}</span>
                <span class="score-name">{{ score.playerName }}</span>
                <span class="score-time">{{ score.timeSpent }}s</span>
                <span class="score-accuracy">{{ (score.accuracy * 100).toFixed(2) }}%</span>
              </li>
            </ul>
          </div>
          <div v-else class="encouragement">
            <p class="encouragement-message">{{ randomEncouragement }}</p>
            <div class="current-stats">
              <p>Your Time: {{ gameState.elapsedTime }}s</p>
              <p>Your Accuracy: {{ currentAccuracy }}%</p>
            </div>
          </div>

          <div class="result-actions">
            <button class="result-button result-button--secondary" @click="returnToMenu">
              Menu
            </button>
            <button class="result-button result-button--primary" @click="restartGame">
              Play Again
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Only show retry form after game completion -->
    <NewGameForm 
      v-if="gameState.gameCompleted"
      :game-state="gameState" 
      mode="retry" 
      @gotoBoardOptions="stopCurrentGame"
      :availableCardTypes="availableCardTypes" 
      :boardSizeOptions="boardSizeOptions" 
      @startGame="startGame"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue';
import { useStorage } from '@vueuse/core';
import { useSound } from '@vueuse/sound'
import buttonSfx from '../assets/sounds/404740__owlstorm__retro-video-game-sfx-move.wav'
import correctSoundGfx from '../assets/sounds/665182__el_boss__item-or-material-pickup-pop-2-of-3.wav'
import gameMusic from '../assets/sounds/music.mp3'


import alfabetet from '../assets/sounds/norwegian-letter-sounds/alfabetlyder_01.mp3';



const { play: startGameSound, isPlaying: gameSoundIsPlaying, stop: stopGameMusic } = useSound(gameMusic, { volume: 0.3 })
const { play: clickSound } = useSound(buttonSfx)
const { play: correctSound } = useSound(correctSoundGfx);

const { play: playLetterSound } = useSound(alfabetet, {
  sprite: {
    a: [500, 500], // duration: 500ms, endTime: 1000
    b: [1600, 200], // duration: 200ms, endTime: 1800
    c: [2550, 350], // duration: 350ms, endTime: 2900
    d: [3600, 200], // duration: 200ms, endTime: 3800
    e: [4750, 350], // duration: 350ms, endTime: 5100
    f: [7500, 250], // duration: 250ms, endTime: 7750
    g: [8900, 200], // duration: 200ms, endTime: 9100
    h: [10100, 200], // duration: 200ms, endTime: 10300
    i: [11250, 450], // duration: 450ms, endTime: 11700
    j: [12400, 250], // duration: 250ms, endTime: 12650
    k: [13450, 200], // duration: 200ms, endTime: 13650
    l: [14550, 450], // duration: 450ms, endTime: 15000
    m: [15700, 500], // duration: 500ms, endTime: 16200
    n: [16900, 600], // duration: 600ms, endTime: 17500
    o: [18000, 600], // duration: 600ms, endTime: 18600
    p: [19250, 250], // duration: 250ms, endTime: 19500
    q: [20350, 450], // duration: 450ms, endTime: 20800
    r: [21600, 400], // duration: 400ms, endTime: 22000
    s: [22750, 550], // duration: 550ms, endTime: 23300
    t: [24000, 250], // duration: 250ms, endTime: 24250
    u: [25000, 500], // duration: 500ms, endTime: 25500
    v: [26300, 400], // duration: 400ms, endTime: 26700
    w: [26300, 400], // duration: 400ms, endTime: 26700
    x: [27300, 300], // duration: 300ms, endTime: 27600
    y: [28250, 250], // duration: 250ms, endTime: 28500
    z: [29200, 300], // duration: 300ms, endTime: 29500
    ae: [30400, 350], // duration: 350ms, endTime: 30750
    oe: [31800, 350], // duration: 350ms, endTime: 32150
    aa: [32850, 300], // duration: 300ms, endTime: 33150
  },
}) 

const clickedCards = ref([]);


const gameState = reactive({
  cardType: 'animals', // Changed from 'letters' to match default cardType ref
  boardSizeId: '2x2', // Changed to match default boardSizeId ref
  cards: [],
  elapsedTime: 0,
  gameStartTime: null,
  hits: 0,
  misses: 0,
  gameCompleted: false,
  currentGame: { uuid: '', playerName: 'Anonymous', started: false },
  clickedCards: [],
  // Add other properties here as needed
});

const gameIsOngoing = computed(() => gameState.currentGame.started);

function stopCurrentGame () {
  gameState.gameCompleted = false;
  gameState.currentGame.uuid = '';
  gameState.currentGame.started = false;
  highScoreModalVisible.value = false;
  clearInterval(intervalId);
  stopGameMusic(); // Add this line to stop music when stopping game
}
const cardType = ref('animals');
const boardSizeId = ref('2x2');
const storeBoardLocalStorage = useStorage('memoryGameScoreBoardReactive', {});

const currentGameScoreBoardReactive = computed(() => {
  const scoreKey = `${gameState.boardSizeId}-${gameState.cardType}`;
  return storeBoardLocalStorage.value?.[scoreKey]?.splice(0, 10) || [];
});


let intervalId = null;


const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};


function startGame (gameOptions) {

  console.log(gameOptions);

  // Handle music control
  if (gameOptions.musicOn && !gameSoundIsPlaying.value) {
    startGameSound();
  } else if (!gameOptions.musicOn && gameSoundIsPlaying.value) {
    stopGameMusic();
  }

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
  gameState.cards = generateAndShuffleCards(gameOptions.cardType, gameOptions.boardSizeId);
  gameState.gameCompleted = false;
  highScoreModalVisible.value = false;
  /*   gameState.currentGame = { uuid: generateUUID(), playerName: gameOptions.playerName, started: true };
   */
  // Clear existing interval if any
  if (intervalId !== null) {
    clearInterval(intervalId);
  }

  // Start a new interval to update elapsed time every second
  intervalId = setInterval(() => {
    gameState.elapsedTime = ((Date.now() - gameState.gameStartTime) / 1000).toFixed(2);
  }, 10);

};

function restartGame() {
  const currentSettings = {
    cardType: gameState.cardType,
    boardSizeId: gameState.boardSizeId,
    playerName: gameState.currentGame.playerName,
    gfxOn: true, // Or get from current settings
    musicOn: false, // Or get from current settings
  };
  
  startGame(currentSettings);
  hideHighScoreModal();
}

const boardSizeOptions = [
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
]

const availableCards = {
  'animals': {
    type: 'animals',
    name: 'Animals',
    name_nb: 'Dyr',
    'cards': ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Bear', 'Zebra', 'Panda', 'Kangaroo', 'Monkey', 'Wolf', 'Dog', 'Cow', 'Fish', 'Horse', 'Sheep', 'Snake',]
  },

/* 
  'fruits': ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Strawberry', 'Cherry', 'Peach', 'Pear'],
  'numbers': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], */
  'letters': {
    type: 'letters',
    name: 'Letters',
    name_nb: 'Bokstaver',
    cards: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', ]
  }
  //'W', 'X', 'Y', 'Z', 'Æ', 'Ø', 'Å'
  
};

// Convert availableCards to array format before passing to components
const availableCardTypes = computed(() => Object.values(availableCards));

const generateAndShuffleCards = (type, sizeId) => {
  // Extract rows and columns from the sizeId, e.g., '4x4' -> [4, 4]
  const [rows, columns] = sizeId.split('x').map(Number);
  const totalCards = rows * columns;

  // Ensure there are enough unique cards for the chosen type
  if (availableCardTypes[type]?.cards.length < totalCards / 2) {
    throw new Error('Not enough unique cards for the selected board size');
  }

  // Randomly select unique cards for the game
  const selectedCards = shuffleArray(availableCards[type]?.cards).slice(0, totalCards / 2);

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

function handleCardClick (index) {

  const card = gameState.cards[index];

  if (card.revealed || clickedCards.value.length >= 2) {
    return; // Ignore click if the card is already revealed or two cards are clicked
  }

  card.revealed = true;  // Reveal the clicked card
  clickedCards.value.push(index);

  let clickIsMatch;

  if (clickedCards.value.length === 2) {
    clickIsMatch = checkForMatch();
  }

  if (clickIsMatch) {
    correctSound();
  }
  else {

    if(gameState.cardType === 'letters'){
      console.log(card.name.toLowerCase())
      playLetterSound({id: card.name.toLowerCase()});
    }
    else{
      clickSound();
    }

    
  }




};



const checkForMatch = () => {
  const [firstIndex, secondIndex] = clickedCards.value;
  const firstCard = gameState.cards[firstIndex];
  const secondCard = gameState.cards[secondIndex];
  let clickIsMatch = false;

  if (firstCard.name === secondCard.name) {
    // Match found, keep cards revealed and reset clickedCards
    gameState.hits++;
    clickedCards.value = [];
    clickIsMatch = true;
  } else {
    gameState.misses++;
    // No match, hide both cards after a short delay
    setTimeout(() => {
      firstCard.revealed = false;
      secondCard.revealed = false;
      clickedCards.value = [];
      clickIsMatch = false;
    }, 1000);
  }

  if (gameState.cards.every(card => card.revealed)) {
    gameState.gameCompleted = true;
    setTimeout(() => {
      updateScoreBoard(); // This will now also handle the top 10 check
    }, 100);
    clearInterval(intervalId);
  }
  return clickIsMatch;
};

const encouragementMessages = [
  "Nice try, but these high scores are tougher than a two-dollar steak! 🥩",
  "Close, but no banana! 🍌 The top players have been practicing since the Stone Age.",
  "Well, at least you didn't break your keyboard! 😅 Want another shot?",
  "The good news: you completed the game! The bad news: the high scores are being difficult. 🎮",
  "Even Einstein had to practice! (But he probably would've gotten a high score) 🧠",
  "You're getting better! The high scores are just playing hard to get. 💫",
  "Remember: every master was once a beginner! (Except maybe these high score holders) 🌟"
];

const randomEncouragement = computed(() => 
  encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
);

const updateScoreBoard = () => {
  const finalScore = {
    timeSpent: parseFloat(gameState.elapsedTime),
    accuracy: parseFloat(currentAccuracy.value) / 100,
    boardSize: gameState.boardSizeId,
    cardType: gameState.cardType
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
  const newScore = {
    ...finalScore,
    uuid: gameState.currentGame.uuid,
    playerName: gameState.currentGame.playerName,
    isNew: true // Mark as new
  };
  storedScoreBoard[scoreKey].push(newScore);

  storedScoreBoard[scoreKey].forEach(score => {
    if (score.uuid !== newScore.uuid) {
      score.isNew = false;
    }
  });

  // Sort the scores and keep only the top 10
  storedScoreBoard[scoreKey].sort((a, b) => {
    // Sorting logic based on time spent and accuracy
    // Adjust this based on how you want to calculate the top scores
    return a.timeSpent - b.timeSpent || b.accuracy - a.accuracy;
  });


  const isHighScore = storedScoreBoard[scoreKey].some((score, index) => {
    return score.uuid === gameState.currentGame.uuid && index < 10;
  });

  if (isHighScore) {

    showHighScoreModal();

    //newScore.playerName = playerName.value;
    storedScoreBoard[scoreKey] = storedScoreBoard[scoreKey].map(score => {
      return score.uuid === newScore.uuid ? newScore : score;
    });
  } else {
    showEncouragementModal();
  }

  // Check if the player's score is in the top 10
  localStorage.setItem('memoryGameScoreBoard', JSON.stringify(storedScoreBoard));

  storeBoardLocalStorage.value[scoreKey] = storedScoreBoard[scoreKey];

};

const highScoreModalVisible = ref(false);

function showHighScoreModal () {
  highScoreModalVisible.value = true;

}

function hideHighScoreModal () {
  highScoreModalVisible.value = false;
}

const showResultModal = computed(() => 
  gameState.gameCompleted && 
  highScoreModalVisible.value
);

function handleModalClose() {
  hideHighScoreModal();
  // Don't stop the game here, let user see their score and retry options
}

const showEncouragementModal = () => {
  gameState.gameCompleted = true;
  highScoreModalVisible.value = true;
};

const currentAccuracy = computed(() => {
  const totalAttempts = gameState.hits + gameState.misses;
  return totalAttempts > 0 ? ((gameState.hits / totalAttempts) * 100).toFixed(2) : 0;
});

function gotoNewGameForm () {
  gameState.currentGame = { uuid: '', playerName: 'Anonymous', started: false };
  clearInterval(intervalId);
}

function returnToMenu() {
  hideHighScoreModal();
  stopCurrentGame();
}

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
  display: grid;
  justify-content: center;
  align-items: center;
  transform-origin: top center;
  gap: 10px;
  user-select: none;
  /* Grid layout will be set dynamically */
}

.card {
  background: #fff;
  border: 1px solid ccc;
  padding: 20px;
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

/* 
.button-wrapper .button--white{
  background-color: white;
  box-shadow: inset 0 1px 0 #ccc, 0 10px 0 #444;

}
.button-wrapper .button--white:active{
  background-color: white;
} */

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

.buttons {
  display: flex;
  justify-content: center;
  align-items: center;

}


.score-board-modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-board-modal {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.3);
  width: 80%;
  max-width: 600px;
  max-height: 80%;
  overflow-y: auto;
}

.new-score {
  background-color: lightgreen; /* or any highlight color */
  /* Other styling as needed */
}

.result-modal {
  width: 90%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(8px);
}

.result-title {
  font-size: 2rem;
  color: #2d3748;
  text-align: center;
  margin-bottom: 1.5rem;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #4a5568;
  display: block;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
}

.scoreboard {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.score-list {
  list-style: none;
  padding: 0;
}

.score-list li {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.new-score {
  background: rgba(72, 187, 120, 0.2);
  border-radius: 4px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .result-modal {
    padding: 1rem;
    margin: 1rem;
  }

  .result-title {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }
}

.retry-options {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.bottom-controls {
  display: flex;
  justify-content: center;
  margin: 2rem auto;
  width: 100%;
  max-width: 480px;
}

/* New result button styles */
.result-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-button--primary {
  background: linear-gradient(135deg, #4299e1, #667eea);
  color: white;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
}

.result-button--secondary {
  background: linear-gradient(135deg, #718096, #4a5568);
  color: white;
  box-shadow: 0 4px 6px rgba(74, 85, 104, 0.3);
}

.result-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

.result-button:active {
  transform: translateY(0);
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.encouragement {
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.encouragement-message {
  font-size: 1.2rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.current-stats {
  font-size: 1.1rem;
  color: #4a5568;
  display: flex;
  justify-content: center;
  gap: 2rem;
}
</style>