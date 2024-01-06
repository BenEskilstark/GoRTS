import {createBot} from './bot.js';

let bot = createBot({
  numRows: 6, 
  numCols: 6, 
  config: {
    playerId: 1,
    friendlyNeighbors: ['*50', '/5', '/100', '=0'],
    enemyNeighbors: ['*10', '/10', '/10', '/10'],
    friendlyAttackLines: ['*10', '*5']
  }});
bot.doMove(1, 1, 1);
bot.doMove(3, 1, 1);
bot.doMove(2, 2, 1);
console.log(bot)