export const botConfigs = {
  random: {},
  alpha: {
    friendlyNeighbors: ['*500', '/5', '/100', '=1'],
  },
  beta: {
    friendlyNeighbors: ['*50', '/10', '/2', '/1'],
    friendlyDiagonals: ['*50', '*2', '*1', '*1'],
  },
  gamma: {
    initSideDistance: ['=0.0001', '=1', '=2', '=3', '=3', '=2'],
    friendlyNeighbors: ['*500', '/5', '/100', '=1'],
    friendlyAttackLines: ['+10'],
  },
  zerg: {
    initSideDistance: ['=0'],
    enemyNeighbors: ['=100000', '/10', '/10', '/1000'],
    friendlyNeighbors: ['*1', '*1', '*1', '=1'],
  },
};