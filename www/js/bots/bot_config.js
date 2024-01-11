export const botConfigs = {
  random: {},
  alpha: {
    initSideDistance: ['=0.001', '=1', '=5', '=5', '=5', '=1'],
    friendlyNeighbors: ['*500', '/5', '/100', '=0'],
  },
  beta: {
    initSideDistance: ['=0.001', '=1', '=5', '=10', '=5', '=1'],
    friendlyNeighbors: ['*500', '/5', '/100', '=0'],
    enemyNeighbors: ['*500', '/5', '/100', '/10'],
    friendlyDiagonals: ['*50', '*1', '*1', '*1'],
  },
  gamma: {
    initSideDistance: ['=0.001', '=1', '=5', '=10', '=5', '=1'],
    friendlyNeighbors: ['*500', '/5', '/100', '=0'],
    friendlyAttackLines: ['*10', '*2', '+10'],
    friendlyDiagonals: ['*50', '*2', '*5', '*2'],
  },
  zerg: {
    initSideDistance: ['=0.001', '=1', '=5', '=10', '=5', '=1'],
    enemyNeighbors: ['*1000000', '/2', '/250', '/10'],
  },
};