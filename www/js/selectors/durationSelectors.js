
// convert a duration in millis to a number of turns based on the most recent
// turn rate
export const msToTurns = ({avgTurnRate}, duration) => {
  return Math.ceil(duration / 1000 * avgTurnRate);
}

/**
 *  type Turn = Number; // which turn in the game
 *  type Duration = {
 *    startTurn: Turn,
 *    numTurns: Number,
 *    endTurn: Turn, // = startTurn + numTurns
 *  }
 */

export const newDuration = ({turn}, numTurns) => {
  return {
    startTurn: turn,
    numTurns,
    endTurn: Math.ceil(turn + numTurns),
  };
}
