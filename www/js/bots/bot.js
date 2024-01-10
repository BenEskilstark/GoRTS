// BotConfig properties:
//
// ---- initSideDistance
// Starting weight for squares based on min distance from sides.
// Min distance is based on the lesser of row/col.
// Example: ('=0', '=100', '=300')
// Set weight to 0 for rank 1, 100 for 2, and 300 for 3+
//
// ---- friendlyNeighbors
// Weights for 1, 2, 3, 4 friendly neighbors.
// This is cumulative.
// Example: ('=500', '=100', '=1', '=0').
// Set weight to 500 for 1, 100 for 2, 1 for 3, and 0 for 4 neighbors.
//
// ---- enemyNeighbors
// Weights for 1, 2, 3, 4 enemy neighbors.
// This is cumulative.
// Example: ('=500', '=100', '=1', '=0').
// Set weight to 500 for 1, 100 for 2, 1 for 3, and 0 for 4 neighbors.
//
// ---- friendlyAttackLines
// Weights for 1, 2, etc. friendly neighbors in same row/col.
// This is cumulative.
// Example: ('=10', '=100')
// Set weight to 10 for 1, 100 for 2+
//
// ---- friendlyDiagonals
// Weights for 1, 2, 3, 4 friendly diagonal neighbors.
// This is cumulative.
// Example: ('=500', '=100', '=1', '=0').
// Set weight to 500 for 1, 100 for 2, 1 for 3, and 0 for 4 neighbors.
class BotConfig {
  constructor({ 
      playerId,
      initSideDistance = null,
      friendlyNeighbors = null,
      enemyNeighbors = null,
      friendlyAttackLines = null,
      friendlyDiagonals = null }) {
    this.playerId = playerId;
    this.initSideDistance = initSideDistance;
    this.friendlyNeighbors = friendlyNeighbors;
    this.enemyNeighbors = enemyNeighbors;
    this.friendlyAttackLines = friendlyAttackLines;
    this.friendlyDiagonals = friendlyDiagonals;
  }
}

class Bot {
  constructor(numRows, numCols, botConfig) {
    this.numRows = numRows;
    this.numCols = numCols;
    this.playerId = botConfig.playerId;
    this.config = botConfig;

    // Initializes board and weights.
    this.reset();
  }

  reset() {
    this.board = new Array(this.numRows).fill().map(() => new Array(this.numCols).fill(0));
    this.weights = new Array(this.numRows).fill().map(() => new Array(this.numCols).fill(1.0));
    if (this.config.initSideDistance) {
      this.updateOnInitSideDistance();
    }
  }

  isValid(row, col) {
    return (0 <= row && row < this.numRows) && (0 <= col && col < this.numCols);
  }

  updateWeight(row, col, code) {
    let op = code[0];
    let value = parseFloat(code.substring(1));
    let weight = this.weights[row][col];
    let newWeight;

    switch (op) {
      case '=':
        newWeight = value;
        break;
      case '+':
        newWeight = weight + value;
        break;
      case '-':
        newWeight = weight - value;
        break;
      case '*':
        newWeight = weight * value;
        break;
      case '/':
        newWeight = weight / value;
        break;
      default:
        throw new Error(`Illegal operation: ${op}`);
    }

    this.weights[row][col] = Math.max(0, newWeight);
  }

  doMove(row, col, playerId) {
    this.board[row][col] = playerId;
    this.weights[row][col] = 0;

    if (this.config.friendlyNeighbors && this.playerId == playerId) {
      this.updateOnFriendlyNeighbors(row - 1, col);
      this.updateOnFriendlyNeighbors(row + 1, col);
      this.updateOnFriendlyNeighbors(row, col - 1);
      this.updateOnFriendlyNeighbors(row, col + 1);
    }

    if (this.config.friendlyDiagonals && this.playerId == playerId) {
      this.updateOnFriendlyDiagonals(row - 1, col - 1);
      this.updateOnFriendlyDiagonals(row + 1, col + 1);
      this.updateOnFriendlyDiagonals(row + 1, col - 1);
      this.updateOnFriendlyDiagonals(row - 1, col + 1);
    }

    if (this.config.enemyNeighbors && this.playerId != playerId) {
      this.updateOnEnemyNeighbors(row - 1, col);
      this.updateOnEnemyNeighbors(row + 1, col);
      this.updateOnEnemyNeighbors(row, col - 1);
      this.updateOnEnemyNeighbors(row, col + 1);
    }

    if (this.config.friendlyAttackLines && this.playerId == playerId) {
      this.updateOnFriendlyAttackLines(row, col);
    }
  }

  updateOnInitSideDistance() {
    for (let row = 0; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        let maxAllowedInd = this.config.initSideDistance.length - 1;
        let ind = Math.min(maxAllowedInd, row, col, this.numRows - row - 1, this.numCols - col - 1);
        this.updateWeight(row, col, this.config.initSideDistance[ind]);
      }
    }
  }

  updateOnFriendlyNeighbors(row, col) {
    if (!this.isValid(row, col)) {
      return;
    }
    let numFriendlyNeighbors = (
      (this.isValid(row - 1, col) && this.board[row - 1][col] == this.playerId) +
      (this.isValid(row + 1, col) && this.board[row + 1][col] == this.playerId) +
      (this.isValid(row, col - 1) && this.board[row][col - 1] == this.playerId) +
      (this.isValid(row, col + 1) && this.board[row][col + 1] == this.playerId)
    );
    this.updateWeight(row, col, this.config.friendlyNeighbors[numFriendlyNeighbors - 1]);
  }

  updateOnFriendlyDiagonals(row, col) {
    if (!this.isValid(row, col)) {
      return;
    }
    let numFriendlyNeighbors = (
      (this.isValid(row - 1, col - 1) && this.board[row - 1][col - 1] == this.playerId) +
      (this.isValid(row + 1, col + 1) && this.board[row + 1][col + 1] == this.playerId) +
      (this.isValid(row + 1, col - 1) && this.board[row + 1][col - 1] == this.playerId) +
      (this.isValid(row - 1, col + 1) && this.board[row - 1][col + 1] == this.playerId)
    );
    this.updateWeight(row, col, this.config.friendlyDiagonals[numFriendlyNeighbors - 1]);
  }

  updateOnEnemyNeighbors(row, col) {
    if (!this.isValid(row, col)) {
      return;
    }
    let numEnemyNeighbors = (
      (this.isValid(row - 1, col) && this.board[row - 1][col] != this.playerId && this.board[row - 1][col] != 0) +
      (this.isValid(row + 1, col) && this.board[row + 1][col] != this.playerId && this.board[row + 1][col] != 0) +
      (this.isValid(row, col - 1) && this.board[row][col - 1] != this.playerId && this.board[row][col - 1] != 0) +
      (this.isValid(row, col + 1) && this.board[row][col + 1] != this.playerId && this.board[row][col + 1] != 0)
    );
      this.updateWeight(row, col, this.config.enemyNeighbors[numEnemyNeighbors - 1]);
  }

  updateOnFriendlyAttackLines(row, col) {
    const updateOnFriendlyAttackLinesRow = () => {
      let count = 0;
      for (let otherRow = 0; otherRow < this.numRows; otherRow++) {
        if (this.board[otherRow][col] == this.playerId) {
          count++;
        }
      }
      const maxAllowedInd = this.config.friendlyAttackLines.length - 1;
      const ind = Math.min(maxAllowedInd, count - 1);
      for (let otherRow = 0; otherRow < this.numRows; otherRow++) {
        this.updateWeight(otherRow, col, this.config.friendlyAttackLines[ind]);
      }
    }

    const updateOnFriendlyAttackLinesCol = () => {
      let count = 0;
      for (let otherCol = 0; otherCol < this.numCols; otherCol++) {
        if (this.board[row][otherCol] == this.playerId) {
          count++;
        }
      }
      const maxAllowedInd = this.config.friendlyAttackLines.length - 1;
      const ind = Math.min(maxAllowedInd, count - 1);
      for (let otherCol = 0; otherCol < this.numCols; otherCol++) {
        this.updateWeight(row, otherCol, this.config.friendlyAttackLines[ind]);
      }
    }

    updateOnFriendlyAttackLinesRow();
    updateOnFriendlyAttackLinesCol();
  }
}

export function createBot({numRows, numCols, config}) {
  return new Bot(numRows, numCols, new BotConfig(config));
}


// let bot = new Bot(
//   6, 
//   6, 
//   new BotConfig({
//     playerId: 1,
//     friendlyNeighbors: ['*50', '/5', '/100', '=0'],
//     enemyNeighbors: ['*10', '/10', '/10', '/10'],
//     friendlyAttackLines: ['*10', '*5']
//   }));
// bot.doMove(1, 1, 1);
// bot.doMove(3, 1, 1);
// bot.doMove(2, 2, 1);
// console.log(bot); 
