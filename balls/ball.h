#ifndef BALL_H
#define BALL_H

#include <SDL2/SDL.h>
#include <cmath>
#include <vector>
#include <cstdlib>

class Ball {
public:
    Ball(float x, float y, float vx, float vy);
    void update(float gravity, int screenWidth, int screenHeight);
    void draw(SDL_Renderer* renderer) const;
    bool isOutOfBounds(int screenWidth, int screenHeight) const;
    bool isInArc(float circleX, float circleY, float radius, float startAngle, float endAngle) const;
    void handleCollisionWithCircle(float circleX, float circleY, float radius, float ballRadius, float spinningSpeed);
    
    float getX() const { return posX; }
    float getY() const { return posY; }

private:
    float posX, posY;
    float velX, velY;
    SDL_Color color;
};

void drawArc(SDL_Renderer* renderer, float centerX, float centerY, float radius, float startAngle, float endAngle);

#endif
