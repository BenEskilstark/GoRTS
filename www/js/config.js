const isLocalHost = false;

export const config = {
  isLocalHost,
  URL: isLocalHost ? null : "https://benhub.io",
  path: isLocalHost ? null : "/gorts/socket.io",


  isRealtime: true,
  turnTime: 0, // ms
  boardSize: 30,
  colors: [
    'black', 'white', 'steelblue', 'lightgreen', 'pink',
    'orange', 'red', 'purple', 'blue', 'gray',
  ],

  startingMana: 25,
  maxMana: 50,
  manaRegenRate: 1000,

  aiNeighborWeight: 500,
  apm: 150,

  fallingTime: 3000, // ms that a piece spends falling before it's placed

};

// export const config = {
//   isRealtime: true,
//   turnTime: 0, // ms
//   boardSize: 30,
//   colors: [
//     'black', 'white', 'steelblue', 'lightgreen', 'pink',
//     'orange', 'red', 'purple', 'blue', 'gray',
//   ],

//   startingMana: 25,
//   maxMana: 50,
//   manaRegenRate: 10,

//   aiNeighborWeight: 500,
//   apm: 1500,

//   fallingTime: 30, // ms that a piece spends falling before it's placed

// };
