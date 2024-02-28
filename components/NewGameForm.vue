<template >
  <div class="new-game-form " v-if="gameState">

    <div class="game-options flex flex-col gap-4 text-center w-full" v-if="mode === 'new-game'">

      <div class="">
        <label class="block" for="name">Navn:</label>
        <input class="text-xl p-3 px-4 max-w-sm w-full rounded" name="name" v-model="playerName">
      </div>

      <div>
        <label class="block" for="card-type">Type kort:</label>
        <select class="text-xl p-3 px-4 max-w-sm w-full rounded" id="card-type" v-model="cardType">
          <option v-for="ct in availableCardTypes" :value="ct.type" :selected="ct.type === cardType">{{ ct.name_nb }}</option>
        </select>
      </div>
      <div>
        <label class="block" for="board-size">Vanskelighetsgrad:</label>
        <select class="text-xl p-3 px-4 max-w-sm w-full rounded" id="board-size" v-model="boardSizeId">
          <option v-for="board in boardSizeOptions" :value="board.id" :selected="board.id === boardSizeId">{{ board.name_nb }}</option>
        </select>
      </div>
      <div class="text-xl  max-w-sm w-full  mx-auto flex justify-start gap-4 items-center">

        <input class="flex-0 w-8 h-8 " type="checkbox" id="gfx" v-model="gfxOn">
        <label class="w-full flex-1 flex" for="gfx">
          <template v-if="gfxOn">Lyd på</template>
          <template v-else>Lyd av</template>

        </label>
      </div>
      <div class="text-xl  max-w-sm w-full  mx-auto flex justify-start gap-4">

        <input class="flex-0 w-8 h-8" type="checkbox" id="music" v-model="musicOn">
        <label class="w-full flex-1 flex" for="music">
          <template v-if="musicOn">Musikk på</template>
          <template v-else>Musikk av</template>

        </label>
      </div>
    </div>

    <div class="buttons">

      <div class="button-wrapper" v-if="mode === 'retry'">
        <button class="button button--white" @click="gotoBoardOptions"><span><svg enable-background="new 0 0 32 32" height="32px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

              <g fill="#ffffff">
                <g>
                  <path d="M29.018,17H2.982c-0.397,0-0.756-0.244-0.908-0.617c-0.152-0.374-0.068-0.804,0.213-1.09l11.789-12    c0.384-0.391,1.005-0.391,1.389,0s0.384,1.023,0,1.414L5.354,15h23.663C29.561,15,30,15.448,30,16S29.561,17,29.018,17z" />
                </g>
                <g>
                  <path d="M14.772,29c-0.251,0-0.503-0.098-0.695-0.293l-7.86-8c-0.384-0.391-0.384-1.023,0-1.414s1.005-0.391,1.389,0l7.86,8    c0.384,0.391,0.384,1.023,0,1.414C15.275,28.902,15.023,29,14.772,29z" />
                </g>
              </g>
            </svg></span></button>
      </div>

      <div class="button-wrapper">
        <button class="button" @click="startGame">
          <span>
            <template v-if="mode !== 'retry'">Nytt spill</template>
            <template v-if="mode === 'retry'">Prøv igjen</template>
          </span></button>
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';


const props = defineProps<{
  availableCardTypes: string[]
  boardSizeOptions: { id: number, name: string }[],
  mode: any,
  gameState: any,
}>();

const emit = defineEmits(['startGame', 'gotoBoardOptions']);

const playerName = useLocalStorage('playerName', '');
const cardType = ref(props.gameState.cardType);
const boardSizeId = ref(props.gameState.boardSizeId);
const gfxOn = ref(true);
const musicOn = ref(false);

function startGame() {
  emit('startGame', { cardType: cardType.value, boardSizeId: boardSizeId.value, playerName: props.gameState.playerName ? props.gameState.playerName : playerName.value, gfxOn: gfxOn.value, musicOn: musicOn.value });
}

const playerNameInputWidth = computed(() => {
  return `${playerName.value.length * .85}rem`;
});

function gotoBoardOptions() {
  emit('gotoBoardOptions');
}

</script>


<style>
.new-game-form {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem;
}
</style>  