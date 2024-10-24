import os
import heapq
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import time

# Function to count turns in a path
def count_turns_in_path(path):
    if len(path) < 2:
        return 0
    turns = 0
    prev_direction = (path[1][0] - path[0][0], path[1][1] - path[0][1])
    for i in range(2, len(path)):
        curr_direction = (path[i][0] - path[i-1][0], path[i][1] - path[i-1][1])
        if curr_direction != prev_direction:
            turns += 1
        prev_direction = curr_direction
    return turns

def count_turns(prev_direction, new_direction):
    if prev_direction is None:
        return 0  # Không có khúc cua ở bước đầu tiên
    return 1 if prev_direction != new_direction else 0

# Enhanced heuristic: balances between shortest distance and fewer turns
def heuristic_fastest(a, b, current_turns, future_turns_weight=1.5):
    distance = abs(a[0] - b[0]) + abs(a[1] - b[1])
    return distance + future_turns_weight * current_turns

# A* Fastest Algorithm: Minimizes both distance and turns
def a_star_fastest(maze, start, goal):
    neighbors = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    open_list = []
    heapq.heappush(open_list, (0, start, None))  # (f_score, current position, previous direction)

    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic_fastest(start, goal, 0)}

    while open_list:
        current_f, current, prev_direction = heapq.heappop(open_list)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        for neighbor in neighbors:
            neighbor_pos = (current[0] + neighbor[0], current[1] + neighbor[1])
            new_direction = neighbor

            if 0 <= neighbor_pos[0] < maze.shape[0] and 0 <= neighbor_pos[1] < maze.shape[1]:
                if maze[neighbor_pos[0], neighbor_pos[1]] == 1:  # Wall
                    continue

                # Move cost + turn cost
                time_to_move = 1  # Moving in a straight line
                turns_cost = count_turns(prev_direction, new_direction)
                time_to_move += turns_cost  # Adds turn cost

                tentative_g_score = g_score[current] + time_to_move

                if neighbor_pos not in g_score or tentative_g_score < g_score[neighbor_pos]:
                    came_from[neighbor_pos] = current
                    g_score[neighbor_pos] = tentative_g_score
                    total_turns = count_turns_in_path([current, neighbor_pos])
                    f_score[neighbor_pos] = tentative_g_score + heuristic_fastest(neighbor_pos, goal, total_turns)
                    heapq.heappush(open_list, (f_score[neighbor_pos], neighbor_pos, new_direction))

    return []

def heuristic_shortest(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

# A* Shortest Algorithm: Minimizes only the distance
def a_star_shortest(maze, start, goal):
    open_list = []
    heapq.heappush(open_list, (0, start))
    came_from = {}
    g_score = {start: 0}

    while open_list:
        _, current = heapq.heappop(open_list)

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        for direction in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            neighbor = (current[0] + direction[0], current[1] + direction[1])
            if maze[neighbor[0], neighbor[1]] == 1:  # Wall
                continue

            tentative_g_score = g_score[current] + 1

            if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score = tentative_g_score + heuristic_shortest(neighbor, goal)
                heapq.heappush(open_list, (f_score, neighbor))

    return []

# Function to draw both paths on the maze
def draw_paths(maze, fastest_path, shortest_path, fastest_time, shortest_time):
    plt.imshow(maze, cmap="binary")
    
    # Plot fastest path in red
    for x, y in fastest_path:
        plt.scatter(y, x, color='red', s=10)

    # Plot shortest path in blue
    for x, y in shortest_path:
        plt.scatter(y, x, color='blue', s=10)

    plt.title(f"Maze Solver\nTime 1: {fastest_time:.3f}ms\nTime 2: {shortest_time:.3f}ms", fontsize=11)
    plt.xticks([]), plt.yticks([])
    plt.show()

# Load maze and solve
def run_solver(filename):
    file_paths = [f'mazes/{filename}.npy', f'images/{filename}.png']
    maze = np.load(file_paths[0]) if os.path.exists(file_paths[0]) else np.array(Image.open(file_paths[1]).convert("L")) // 255
    start, goal = (1, 1), (maze.shape[0] - 2, maze.shape[1] - 2)

    # Solve for fastest path
    start_time = time.time()
    path_1 = a_star_fastest(maze, start, goal)
    time_1 = (time.time() - start_time) * 1000

    # Solve for shortest path
    start_time = time.time()
    path_2 = a_star_shortest(maze, start, goal)
    time_2 = (time.time() - start_time) * 1000

    # Display results
    if path_1 and path_2:
        draw_paths(maze, path_1, path_2, time_1, time_2)

run_solver('p4XUme6A')

# làm sao biết đích random từ generate.py? sửa giải thuật của a_star_fastest là kết hợp a* với đường có ít khúc cua nhất có thể, a_star_shortest là a* gốc mà hạn chế trùng đường với a_star_fastest 