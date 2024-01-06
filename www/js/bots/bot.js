class BotConfig {
  constructor({ playerId, initSideDistance = null, friendlyNeighbors = null, enemyNeighbors = null, friendlyAttackLines = null }) {
    this.playerId = playerId;
    this.initSideDistance = initSideDistance;
    this.friendlyNeighbors = friendlyNeighbors;
    this.enemyNeighbors = enemyNeighbors;
    this.friendlyAttackLines = friendlyAttackLines;
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
      for (let otherRow = 0; otherRow < this.numRows; otherRow++) {
        if (row == otherRow) {
          continue;
        }
        let maxAllowedInd = this.config.friendlyAttackLines.length - 1;
        let ind = Math.min(maxAllowedInd, Math.abs(otherRow - row) - 1);
        this.updateWeight(otherRow, col, this.config.friendlyAttackLines[ind]);
      }
    }

    const updateOnFriendlyAttackLinesCol = () => {
      for (let otherCol = 0; otherCol < this.numCols; otherCol++) {
        if (col == otherCol) {
          continue;
        }
        let maxAllowedInd = this.config.friendlyAttackLines.length - 1;
        let ind = Math.min(maxAllowedInd, Math.abs(otherCol - col) - 1);
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
