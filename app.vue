<template>
  <div>

    <NewGameForm :game-state="gameState" mode="new-game" v-if="!gameIsOngoing" :availableCardTypes="availableCardTypes" :boardSizeOptions="boardSizeOptions" @startGame="startGame" />

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

    <Modal v-if="highScoreModalVisible" @closeModal="hideHighScoreModal">
      <div class="score-board-modal-wrapper">
        <div class="score-board-modal">
          <div class="score-board-modal-content">
            <h2>Score Board</h2>
            <div>
              <ul>
                <li v-for="(score, index) in currentGameScoreBoardReactive" :key="index" :class="{ 'new-score': score.isNew }">
                  {{ index + 1 }} : {{ score.playerName }} : Time: {{ score.timeSpent }}s, Accuracy: {{ (score.accuracy * 100).toFixed(2) }}%
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </Modal>

    <div class="" v-if="gameIsOngoing">

      <NewGameForm :game-state="gameState" mode="retry" @gotoBoardOptions="stopCurrentGame" :availableCardTypes="availableCardTypes" :boardSizeOptions="boardSizeOptions" @startGame="startGame" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useSound } from '@vueuse/sound'
import buttonSfx from '../assets/sounds/404740__owlstorm__retro-video-game-sfx-move.wav'
import correctSoundGfx from '../assets/sounds/665182__el_boss__item-or-material-pickup-pop-2-of-3.wav'
import gameMusic from '../assets/sounds/music.mp3'


import alfabetet from '../assets/sounds/norwegian-letter-sounds/alfabetlyder_01.mp3';



const { play: startGameSound, isPlaying: gameSoundIsPlaying } = useSound(gameMusic, { volume: 0.3 })
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
  cardType: 'letters',
  boardSizeId: '4x4',
  cards: [],
  elapsedTime: 0,
  gameStartTime: null,
  hits: 0,
  misses: 0,
  currentGame: { uuid: '', playerName: 'Anonymous', started: false },
  clickedCards: [],
  // Add other properties here as needed
});

const gameIsOngoing = computed(() => gameState.currentGame.started);

function stopCurrentGame () {
  gameState.currentGame.uuid = '';
  gameState.currentGame.started = false;
  clearInterval(intervalId);
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

  if (!gameSoundIsPlaying.value && gameOptions.musicOn) {
    startGameSound();
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



const boardSizeOptions = [
  {
    id: '2x2',
    rows: 2,
    columns: 2,
    name: 'Too easy'
  },
  {
    id: '2x3',
    rows: 3,
    columns: 2,
    name: 'Very easy'
  },
  {
    id: '3x4',
    rows: 4,
    columns: 3,
    name: 'Easy'
  },
  {
    id: '4x4',
    rows: 4,
    columns: 4,
    name: 'Normal'
  },
  {
    id: '4x5',
    rows: 5,
    columns: 5,
    name: 'Hard'
  },
  {
    id: '6x6',
    rows: 6,
    columns: 6,
    name: 'Expert'
  }
]

const availableCards = {
  'animals': ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Bear', 'Zebra', 'Panda', 'Kangaroo', 'Monkey', 'Wolf', 'Dog', 'Cow', 'Fish', 'Horse', 'Sheep', 'Snake',],


  'fruits': ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pineapple', 'Strawberry', 'Cherry', 'Peach', 'Pear'],
  'numbers': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  'letters': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 
  //'W', 'X', 'Y', 'Z', 'Æ', 'Ø', 'Å'
  ]
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
    setTimeout(() => {
      updateScoreBoard(); // This will now also handle the top 10 check
    }, 100);
    clearInterval(intervalId);
  }
  return clickIsMatch;
};



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

const currentAccuracy = computed(() => {
  const totalAttempts = gameState.hits + gameState.misses;
  return totalAttempts > 0 ? ((gameState.hits / totalAttempts) * 100).toFixed(2) : 0;
});

function gotoNewGameForm () {
  gameState.currentGame = { uuid: '', playerName: 'Anonymous', started: false };
  clearInterval(intervalId);
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
</style>