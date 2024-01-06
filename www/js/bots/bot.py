from dataclasses import dataclass


def render_matrix(matrix):
  return '\n'.join(''.join(f'{x}' + ' '*(12-len(str(x))) for x in row) for row in matrix)


@dataclass
class BotConfig():
  # Bot's own player id.
  player_id: int

  # Starting weight for squares based on min distance from sides.
  # Min distance is based on the lesser of row/col.
  # Example: ('=0', '=100', '=300')
  # Set weight to 0 for rank 1, 100 for 2, and 300 for 3+
  init_side_distance: tuple = None

  # Weights for 1, 2, 3, 4 friendly neighbors.
  # Example: ('=500', '=100', '=1', '=0').
  # Set weight to 500 for 1, 100 for 2, 1 for 3, and 0 for 4 neighbors.
  friendly_neighbors: tuple = None

  # Weights for 1, 2, 3, 4 enemy neighbors.
  # Example: ('=500', '=100', '=1', '=0').
  # Set weight to 500 for 1, 100 for 2, 1 for 3, and 0 for 4 neighbors.
  enemy_neighbors: tuple = None

  # Weights for 1, 2, etc. distance in same line.
  # Example: ('=0', '=100')
  # Set weight to 0 for distance 1, 100 for 2+
  friendly_attack_lines: tuple = None


class Bot():
  def __init__(self, num_rows, num_cols, bot_config):
    self.num_rows = num_rows
    self.num_cols = num_cols
    self.player_id = bot_config.player_id
    self.board = [[0 for _ in range(num_cols)] for _ in range(num_rows)]
    self.weights = [[1.0 for _ in range(num_cols)] for _ in range(num_rows)]
    self.config = bot_config

    if self.config.init_side_distance:
      self.update_on_init_side_distance()

  def __str__(self):
    return f'Bot {self.config.player_id}\n{render_matrix(self.board)}\n{render_matrix(self.weights)}'

  def is_valid(self, row, col):
    return (0 <= row < self.num_rows) and (0 <= col < self.num_cols)

  def update_weight(self, row, col, code):
    op, value = code[0], code[1:]
    weight = self.weights[row][col]
    if op == '=':
      new_weight = float(value)
    elif op == '+':
      new_weight =  weight + float(value)
    elif op == '-':
      new_weight = weight - float(value)
    elif op == '*':
      new_weight =  weight * float(value)
    elif op == '/':
      new_weight = weight / float(value)
    else:
      raise ValueError(f'Illegal operation: {op}')
    self.weights[row][col] = max(0, new_weight)

  def do_move(self, row, col, player_id):
    self.board[row][col] = player_id
    self.weights[row][col] = 0

    if self.config.friendly_neighbors and self.player_id == player_id:
      self.update_on_friendly_neighbors(row - 1, col)
      self.update_on_friendly_neighbors(row + 1, col)
      self.update_on_friendly_neighbors(row, col - 1)
      self.update_on_friendly_neighbors(row, col + 1)

    if self.config.enemy_neighbors and self.player_id != player_id:
      self.update_on_enemy_neighbors(row - 1, col)
      self.update_on_enemy_neighbors(row + 1, col)
      self.update_on_enemy_neighbors(row, col - 1)
      self.update_on_enemy_neighbors(row, col + 1)

    if self.config.friendly_attack_lines and self.player_id == player_id:
      self.update_on_friendly_attack_lines(row, col)

  def update_on_init_side_distance(self):
    for row in range(self.num_rows):
      for col in range(self.num_cols):
        max_allowed_ind = len(self.config.init_side_distance) - 1
        ind = min(max_allowed_ind, row, col, self.num_rows - row - 1, self.num_cols - col - 1)
        self.update_weight(row, col, self.config.init_side_distance[ind])

  def update_on_friendly_neighbors(self, row, col):
    if not self.is_valid(row, col):
      return
    num_friendly_neigbors = (
      (self.is_valid(row - 1, col) and self.board[row - 1][col] == self.player_id) +
      (self.is_valid(row + 1, col) and self.board[row + 1][col] == self.player_id) +
      (self.is_valid(row, col - 1) and self.board[row][col - 1] == self.player_id) +
      (self.is_valid(row, col + 1) and self.board[row][col + 1] == self.player_id)
    )
    self.update_weight(row, col, self.config.friendly_neighbors[num_friendly_neigbors - 1])

  def update_on_enemy_neighbors(self, row, col):
    if not self.is_valid(row, col):
      return
    num_enemy_neigbors = (
      (self.is_valid(row - 1, col) and self.board[row - 1][col] not in (self.player_id, 0)) +
      (self.is_valid(row + 1, col) and self.board[row + 1][col] not in (self.player_id, 0)) +
      (self.is_valid(row, col - 1) and self.board[row][col - 1] not in (self.player_id, 0)) +
      (self.is_valid(row, col + 1) and self.board[row][col + 1] not in (self.player_id, 0))
    )
    self.update_weight(row, col, self.config.enemy_neighbors[num_enemy_neigbors - 1])

  def update_on_friendly_attack_lines(self, row, col):
    def update_on_friendly_attack_lines_row():
      for other_row in range(self.num_rows):
        if row != other_row and self.board[other_row][col] == self.player_id:
          return
      for other_row in range(self.num_rows):
        if row == other_row:
          continue 
        max_allowed_ind = len(self.config.friendly_attack_lines) - 1
        ind = min(max_allowed_ind, abs(other_row - row) - 1)
        self.update_weight(other_row, col, self.config.friendly_attack_lines[ind])

    def update_on_friendly_attack_lines_col():
      for other_col in range(self.num_cols):
        if col != other_col and self.board[row][other_col] == self.player_id:
          return
      for other_col in range(self.num_cols):
        if col == other_col:
          continue 
        max_allowed_ind = len(self.config.friendly_attack_lines) - 1
        ind = min(max_allowed_ind, abs(other_col - col) - 1)
        self.update_weight(row, other_col, self.config.friendly_attack_lines[ind])

    update_on_friendly_attack_lines_row()
    update_on_friendly_attack_lines_col()


bot = Bot(6, 6, BotConfig(
  player_id=1, 
  # init_side_distance=('=0.1', '*50', '*100', '*1'),
  friendly_neighbors=('*50', '/5', '/100', '=0'),
  enemy_neighbors=('*10', '/10', '/10', '/10'),
  friendly_attack_lines=('*10', '*5')))
bot.do_move(1, 1, 1)
bot.do_move(3, 1, 1)
bot.do_move(2, 2, 1)
print(bot)
