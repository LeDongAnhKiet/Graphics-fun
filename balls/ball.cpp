#include "Ball.h"
#include <SDL2/SDL.h>
#include <cmath>
#include <cstdlib>

Ball::Ball(float x, float y, float vx, float vy)
    : posX(x), posY(y), velX(vx), velY(vy) {
    color = { rand() % 256, rand() % 256, rand() % 256, 255 };
}

void Ball::update(float gravity, int screenWidth, int screenHeight) {
    velY += gravity;
    posX += velX;
    posY += velY;
}

void Ball::draw(SDL_Renderer* renderer) const {
    SDL_SetRenderDrawColor(renderer, color.r, color.g, color.b, 255);
    SDL_Rect rect = { (int)posX, (int)posY, 15, 15 };  // Khởi tạo hình vuông trước
    SDL_RenderFillRect(renderer, &rect);
}

bool Ball::isOutOfBounds(int screenWidth, int screenHeight) const {
    return (posX < 0 || posX > screenWidth || posY < 0 || posY > screenHeight);
}

bool Ball::isInArc(float circleX, float circleY, float radius, float startAngle, float endAngle) const {
    float dx = posX - circleX;
    float dy = posY - circleY;
    float ballAngle = atan2(dy, dx);
    
    startAngle = fmod(startAngle, 2 * M_PI);
    endAngle = fmod(endAngle, 2 * M_PI);
    if (startAngle > endAngle) {
        endAngle += 2 * M_PI;
    }

    return startAngle <= ballAngle && ballAngle <= endAngle;
}

void Ball::handleCollisionWithCircle(float circleX, float circleY, float radius, float ballRadius, float spinningSpeed) {
    float dist = sqrt(pow(posX - circleX, 2) + pow(posY - circleY, 2));
    if (dist + ballRadius > radius) {
        float directionX = posX - circleX;
        float directionY = posY - circleY;
        float directionLen = sqrt(directionX * directionX + directionY * directionY);
        
        // Bóng di chuyển
        posX = circleX + (radius - ballRadius) * (directionX / directionLen);
        posY = circleY + (radius - ballRadius) * (directionY / directionLen);
        
        // Ánh xạ
        float tangentX = -directionY;
        float tangentY = directionX;
        float tangentLen = sqrt(tangentX * tangentX + tangentY * tangentY);
        
        float projVelTangent = (velX * tangentX + velY * tangentY) / tangentLen;
        
        velX = 2 * projVelTangent * tangentX / tangentLen - velX;
        velY = 2 * projVelTangent * tangentY / tangentLen - velY;

        // Xoay
        velX += tangentX * spinningSpeed;
        velY += tangentY * spinningSpeed;
    }
}

void drawArc(SDL_Renderer* renderer, float centerX, float centerY, float radius, float startAngle, float endAngle) {
    for (float angle = startAngle; angle <= endAngle; angle += 0.01) {
        int x = centerX + radius * cos(angle);
        int y = centerY + radius * sin(angle);
        SDL_RenderDrawPoint(renderer, x, y);
    }
}
