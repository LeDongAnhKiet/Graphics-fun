import random
import numpy as np
import matplotlib.pyplot as plt
import string

# Hàm khởi tạo mê cung với độ phức tạp cao hơn
def initialize_maze(size):
    maze = np.ones((size, size), dtype=int)  # Khởi tạo với 1 (tường)
    start_x, start_y = random.randrange(1, size, 2), random.randrange(1, size, 2)
    maze[start_x, start_y] = 0  # Tạo ô bắt đầu
    return maze, [(start_x, start_y)]

# Hàm kiểm tra ô hợp lệ
def is_valid_cell(maze, x, y):
    if 0 < x < maze.shape[0]-1 and 0 < y < maze.shape[1]-1:
        return maze[x, y] == 1
    return False

# Hàm chọn ngẫu nhiên vị trí tạo đường và tăng độ phức tạp bằng việc thêm đường hầm
def prims_maze_generator_with_multiple_paths(size):
    maze, frontier = initialize_maze(size)
    
    # Các hướng di chuyển
    directions = [(2, 0), (-2, 0), (0, 2), (0, -2)]
    
    while frontier:
        # Chọn ngẫu nhiên một ô biên
        current_cell = frontier.pop(random.randint(0, len(frontier)-1))
        x, y = current_cell
        
        # Chọn một hướng ngẫu nhiên
        random.shuffle(directions)
        
        for direction in directions:
            new_x, new_y = x + direction[0], y + direction[1]
            if is_valid_cell(maze, new_x, new_y):
                # Tạo lối đi
                maze[(x + new_x) // 2, (y + new_y) // 2] = 0
                maze[new_x, new_y] = 0
                frontier.append((new_x, new_y))
    
    # Tạo các đường hầm bổ sung để tạo thêm đường đi
    for _ in range(size // 3):  # Tăng số lượng đường hầm so với code ban đầu
        tunnel_x, tunnel_y = random.randrange(1, size, 2), random.randrange(1, size, 2)
        maze[tunnel_x, tunnel_y] = 0

    # Bổ sung thêm các đường có thể giải được (1 ít góc cua, 1 nhiều góc cua)
    for _ in range(2):
        extra_tunnel_x, extra_tunnel_y = random.randrange(1, size, 2), random.randrange(1, size, 2)
        maze[extra_tunnel_x, extra_tunnel_y] = 0

    return maze

# Hàm random vị trí đích từ giữa đến góc phải dưới
def random_goal(size):
    goal_x = random.randrange(size//2 + 1, size-2, 2)
    goal_y = random.randrange(size//2 + 1, size-2, 2)
    return goal_x, goal_y

# Hàm vẽ mê cung
def display_maze(maze, start, goal, filename=None):
    maze_with_points = np.copy(maze)
    maze_with_points[start] = 0.5  # Đánh dấu điểm bắt đầu
    maze_with_points[goal] = 0.75  # Đánh dấu điểm kết thúc
    plt.imshow(maze_with_points, cmap="binary")
    plt.xticks([]), plt.yticks([])
    if filename: plt.savefig(f'images/{filename}')
    plt.show()

def random_name(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# Tạo mê cung phức tạp hơn với ít nhất 2 đường giải
size = 51  # Kích thước mê cung
maze = prims_maze_generator_with_multiple_paths(size)
name = random_name()

# Random điểm đích từ giữa mê cung đến góc phải dưới
goal = random_goal(size)

# Hiển thị mê cung với điểm bắt đầu (1,1) và điểm đích ngẫu nhiên
display_maze(maze, (1, 1), goal, name)

# Lưu mê cung
np.save(f'mazes/{name}.npy', maze)
