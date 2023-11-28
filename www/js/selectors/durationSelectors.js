
// convert a duration in millis to a number of turns based on the most recent
// turn rate
export const msToTurns = ({avgTurnRate}, duration) => {
  return duration / 1000 * avgTurnRate;
}

