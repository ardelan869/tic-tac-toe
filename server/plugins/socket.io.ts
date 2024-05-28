import type { NitroApp } from 'nitropack';
import { Server as Engine } from 'engine.io';
import { Server } from 'socket.io';
import { defineEventHandler } from 'h3';

type Indicator = 'cross' | 'circle';
type GameField = Array<Indicator | null>;

const possibleSolutions: [number, number, number][] = [
  // Horizontal
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Vertical
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonal
  [0, 4, 8],
  [2, 4, 6]
];

const generateGameField = () => Array.from(Array(9), () => null);

const getWinner = (gameField: GameField): Indicator | null => {
  for (const indicator of ['cross', 'circle']) {
    for (const solution of possibleSolutions) {
      const crossed = solution.every((field) => gameField[field] === indicator);

      if (crossed) return indicator as Indicator;
    }
  }

  return null;
};

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const io = new Server();
  const engine = new Engine({
    allowRequest(_, fn) {
      fn(null, io.engine.clientsCount < 2);
    }
  });
  let gameField: GameField = generateGameField();
  let currentTurn = 'cross';

  io.bind(engine);

  io.on('connection', (socket) => {
    socket.emit('setIndicator', io.engine.clientsCount === 1 ? 'cross' : 'circle');
    socket.emit('setGameField', gameField);
    socket.emit('setCurrentTurn', currentTurn);

    socket.on('place', (field: number, indicator: Indicator) => {
      gameField[field] = indicator;
      currentTurn = currentTurn === 'cross' ? 'circle' : 'cross';

      const winner = getWinner(gameField);
      const tied = gameField.every((field) => field !== null);

      if (winner || tied) gameField = generateGameField();

      io.sockets.emit('updateGame', gameField, winner ?? (tied && 'tied'), currentTurn);
    });
  });

  nitroApp.router.use(
    '/socket.io/',
    defineEventHandler({
      handler(event) {
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          const nodeContext = peer.ctx.node;
          const req = nodeContext.req;

          // @ts-expect-error private method
          engine.prepare(req);

          const rawSocket = nodeContext.req.socket;
          const websocket = nodeContext.ws;

          // @ts-expect-error private method
          engine.onWebSocket(req, rawSocket, websocket);
        }
      }
    })
  );
});
