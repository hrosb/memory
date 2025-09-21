import { computed } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import { useSound as useVueSound } from '@vueuse/sound';

// Import sound assets
import buttonSfx from '../assets/sounds/404740__owlstorm__retro-video-game-sfx-move.wav';
import correctSoundGfx from '../assets/sounds/665182__el_boss__item-or-material-pickup-pop-2-of-3.wav';
import gameMusic from '../assets/sounds/music.mp3';
import alfabetet from '../assets/sounds/norwegian-letter-sounds/alfabetlyder_01.mp3';

export function useGameSound() {
  const urlParams = useUrlSearchParams('history');

  // Sound settings - tied to URL
  const soundEnabled = computed({
    get: () => urlParams.sound !== 'false', // Default to true if not specified
    set: (value) => { urlParams.sound = value.toString() }
  });

  // Music setting via URL param
  const musicEnabled = computed({
    get: () => urlParams.music === 'true', // Default to false if not specified
    set: (value) => { urlParams.music = value.toString() }
  });

  // Set up sounds
  const { play: startGameSound, isPlaying: gameSoundIsPlaying, stop: stopGameMusic } = useVueSound(gameMusic, { volume: 0.3 });
  const { play: clickSound } = useVueSound(buttonSfx);
  const { play: correctSound } = useVueSound(correctSoundGfx);

  // Letter sounds with sprite definitions
  const { play: playLetterSound } = useVueSound(alfabetet, {
    sprite: {
      a: [500, 500],
      b: [1600, 200],
      c: [2550, 350],
      d: [3600, 200],
      e: [4750, 350],
      f: [7500, 250],
      g: [8900, 200],
      h: [10100, 200],
      i: [11250, 450],
      j: [12400, 250],
      k: [13450, 200],
      l: [14550, 450],
      m: [15700, 500],
      n: [16900, 600],
      o: [18000, 600],
      p: [19250, 250],
      q: [20350, 450],
      r: [21600, 400],
      s: [22750, 550],
      t: [24000, 250],
      u: [25000, 500],
      v: [26300, 400],
      w: [26300, 400],
      x: [27300, 300],
      y: [28250, 250],
      z: [29200, 300],
      ae: [30400, 350],
      oe: [31800, 350],
      aa: [32850, 300],
    },
  });

  // Handle sound for different events
  const playCardSound = (cardInfo: { type?: string; name?: string } | null, isMatch = false) => {
    if (!soundEnabled.value) return;
    
    if (isMatch) {
      correctSound();
    } else {
      if (cardInfo?.type === 'letters' && cardInfo?.name) {
        playLetterSound({ id: cardInfo.name.toLowerCase() as any });
      } else {
        clickSound();
      }
    }
  };

  // Control music based on game settings
  const handleGameMusic = (musicOn: boolean): void => {
    if (musicOn && !gameSoundIsPlaying.value) {
      startGameSound();
    } else if (!musicOn && gameSoundIsPlaying.value) {
      stopGameMusic();
    }
  };

  return {
    soundEnabled,
    musicEnabled,
    gameSoundIsPlaying,
    startGameSound,
    stopGameMusic,
    playCardSound,
    handleGameMusic
  };
}
