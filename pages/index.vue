<script setup lang="ts">
import { io } from 'socket.io-client';

const socket = io({
  reconnection: false
});

type Indicator = 'cross' | 'circle';
type GameField = Array<Indicator | null>;

const connected = ref(false);
const tied = ref(false);
const indicator = ref<Indicator | null>(null);
const currentTurn = ref<Indicator>('cross');
const gameField = ref<GameField>([]);
const winner = ref<Indicator | null>(null);
const score = ref(0);
const icons: Record<Indicator, string> = {
  cross: '❌',
  circle: '⭕'
};

const eventMap: Record<string, (...args: any) => any> = {
  connect: () => (connected.value = true),
  disconnect: () => (connected.value = false),
  setIndicator: (newIndicator: Indicator) => (indicator.value = newIndicator),
  setCurrentTurn: (turn: Indicator) => (currentTurn.value = turn),
  setGameField: (field: GameField) => {
    tied.value = false;
    gameField.value = field;
  },
  updateGame: (field: GameField, newWinner: Indicator | 'tied' | null, turn: Indicator) => {
    currentTurn.value = turn;

    gameField.value = field;

    if (newWinner) {
      if (newWinner === 'tied') {
        tied.value = true;

        return setTimeout(() => {
          tied.value = false;
        }, 1000);
      }

      winner.value = newWinner;

      if (newWinner === indicator.value) score.value += 1;

      setTimeout(() => (winner.value = null), 1000);
    }
  }
};

const place = (field: number) => {
  if (currentTurn.value !== indicator.value) return;

  socket.emit('place', field, indicator.value);
};

if (socket.connected) eventMap.connect();
else socket.connect();

for (const event in eventMap) socket.on(event, eventMap[event]);

onBeforeUnmount(() => {
  for (const event in eventMap) socket.off(event, eventMap[event]);

  socket.disconnect();
});
</script>

<template>
  <main class="min-w-screen min-h-screen grid place-items-center">
    <div v-if="connected && indicator" class="flex flex-col items-center justify-center gap-12">
      <h1 class="text-2xl">Score: {{ score }}</h1>
      <div class="relative max-w-96 max-h-96 w-96 h-96">
        <Transition>
          <div
            v-if="winner || tied"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <h1 v-if="winner" class="text-3xl">
              {{ winner.charAt(0).toUpperCase() + winner.slice(1) }} has won the Game !
            </h1>
            <h1 v-else class="text-3xl">Tie!</h1>
          </div>
        </Transition>
        <section class="grid grid-cols-3 grid-rows-3 h-full w-full aspect-1">
          <button
            v-for="(placement, i) in gameField"
            :key="i"
            class="h-full w-full inset-0 grid place-items-center border border-white/25 text-4xl"
            :disabled="winner !== undefined && placement !== null"
            @click="place(i)"
          >
            {{ placement && icons[placement] }}
          </button>
        </section>
      </div>
    </div>
    <h1 v-else class="text-3xl">Game is full</h1>
  </main>
</template>
