import pygame
import numpy as np
import math
import random

class Ball:
    def __init__(self, position, velocity):
        self.pos = np.array(position, dtype=np.float64)
        self.v = np.array(velocity, dtype=np.float64)
        self.color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        self.is_in_arc = True

def draw_arc(window, center, radius, start_angle, end_angle):
    p1 = center + (radius + 1000) * np.array([math.cos(start_angle), math.sin(start_angle)])
    p2 = center + (radius + 1000) * np.array([math.cos(end_angle), math.sin(end_angle)])
    pygame.draw.polygon(window, (0, 0, 0), [center, p1, p2], 0)

def is_ball_in_arc(ball_pos, center, start_angle, end_angle):
    dx, dy = ball_pos - center
    ball_angle = math.atan2(dy, dx)
    start_angle = start_angle % (2 * math.pi)
    end_angle = end_angle % (2 * math.pi)
    if start_angle > end_angle:
        end_angle += 2 * math.pi
    return start_angle <= ball_angle <= end_angle or (start_angle <= ball_angle + 2 * math.pi <= end_angle)

# Hằng số
WIDTH, HEIGHT = 500, 500
BLACK = (0, 0, 0)
ORANGE = (255, 165, 0)
GRAVITY = 0.18
SPINNING_SPEED = 0.025
ARC_DEGREE = 60
BALL_RADIUS = 7.5
CIRCLE_RADIUS = 150
CIRCLE_CENTER = np.array([WIDTH / 2 + 1, HEIGHT / 2 + 1], dtype=np.float64)

# Khởi tạo màn hình
pygame.init()
window = pygame.display.set_mode((WIDTH, HEIGHT))
bounce_sound = pygame.mixer.Sound('boing.mp3')
pygame.display.set_caption("Bóng Nảy")
clock = pygame.time.Clock()
running = True

# Tạo banh
initial_ball_pos = np.array([WIDTH / 2, HEIGHT / 2 - 120], dtype=np.float64)
initial_ball_vel = np.array([0, 0], dtype=np.float64)
balls = [Ball(initial_ball_pos, initial_ball_vel)]
start_angle = math.radians(-ARC_DEGREE / 2)
end_angle = math.radians(ARC_DEGREE / 2)

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    start_angle += SPINNING_SPEED
    end_angle += SPINNING_SPEED

    # Đếm các số banh ra khỏi vòng
    balls_out = []

    for ball in balls[:]:
        ball.v[1] += GRAVITY
        ball.pos += ball.v

        if not (0 < ball.pos[0] < WIDTH and 0 < ball.pos[1] < HEIGHT):
            balls_out.append(ball)

    # Thêm banh mới mỗi khi ra khỏi vòng
    for ball in balls_out:
        balls.remove(ball)

    if balls_out:
        num_new_balls = min(len(balls_out) * 2, 2)
        for _ in range(num_new_balls):
            balls.append(Ball(initial_ball_pos, [random.uniform(-4, 4), random.uniform(-1, 1)]))

    # Cập nhật lại chỉ số thông tin banh mới
    for ball in balls[:]:
        distance_to_center = np.linalg.norm(ball.pos - CIRCLE_CENTER)
        if distance_to_center + BALL_RADIUS > CIRCLE_RADIUS:
            if is_ball_in_arc(ball.pos, CIRCLE_CENTER, start_angle, end_angle):
                ball.is_in_arc = False
            
            if ball.is_in_arc:
                direction = ball.pos - CIRCLE_CENTER
                direction_unit = direction / np.linalg.norm(direction)
                ball.pos = CIRCLE_CENTER + (CIRCLE_RADIUS - BALL_RADIUS) * direction_unit
                tangent = np.array([-direction[1], direction[0]], dtype=np.float64)
                proj_v_t = (np.dot(ball.v, tangent) / np.dot(tangent, tangent)) * tangent
                ball.v = 2 * proj_v_t - ball.v
                ball.v += tangent * SPINNING_SPEED
                bounce_sound.play()

    window.fill(BLACK)
    pygame.draw.circle(window, ORANGE, CIRCLE_CENTER.astype(int), CIRCLE_RADIUS, 3)
    draw_arc(window, CIRCLE_CENTER, CIRCLE_RADIUS, start_angle, end_angle)
    for ball in balls:
        pygame.draw.circle(window, ball.color, ball.pos.astype(int), BALL_RADIUS)

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
