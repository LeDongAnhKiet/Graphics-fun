#include <SDL2/SDL.h>
#include <SDL2/SDL_mixer.h>
#include <iostream>
#include <vector>
#include <cmath>
#include <cstdlib>
#include "Ball.h"

#define WIDTH 800
#define HEIGHT 800

int main(int argc, char* argv[]) {
    // SDL
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO) < 0) {
        std::cerr << "Failed to initialize SDL: " << SDL_GetError() << std::endl;
        return -1;
    }
    // SDL_mixer
    if (Mix_OpenAudio(44100, MIX_DEFAULT_FORMAT, 2, 2048) < 0) {
        std::cerr << "SDL_mixer could not initialize! SDL_mixer Error: " << Mix_GetError() << std::endl;
        return -1;
    }

    SDL_Window* window = SDL_CreateWindow("Bouncing Balls", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, WIDTH, HEIGHT, 0);
    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

    // Audio
    Mix_Chunk* bounceSound = Mix_LoadWAV("boing.mp3");
    if (bounceSound == nullptr) {
        std::cerr << "Failed to load sound effect! SDL_mixer Error: " << Mix_GetError() << std::endl;
        return -1;
    }

    bool running = true;
    SDL_Event event;

    float gravity = 0.2;
    float spinningSpeed = 0.01;
    float startAngle = -M_PI / 3;
    float endAngle = M_PI / 3;
    float circleRadius = 150.0;
    float circleX = WIDTH / 2;
    float circleY = HEIGHT / 2;

    std::vector<Ball> balls;
    balls.emplace_back(WIDTH / 2, HEIGHT / 2 - 120, 0, 0);

    while (running) {
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) {
                running = false;
            }
        }

        startAngle += spinningSpeed;
        endAngle += spinningSpeed;

        // Cập nhật bóng
        for (Ball& ball : balls) {
            ball.update(gravity, WIDTH, HEIGHT);
        }

        // Xử lý va chạm vòng
        std::vector<Ball> newBalls;
        for (size_t i = 0; i < balls.size(); ++i) {
            if (balls[i].isOutOfBounds(WIDTH, HEIGHT)) {
                // Xóa bóng ra khỏi vòng + Tạo bóng mới
                newBalls.emplace_back(circleX, circleY - 120, rand() % 8 - 4, rand() % 4 - 1);
                newBalls.emplace_back(circleX, circleY - 120, rand() % 8 - 4, rand() % 4 - 1);
                balls.erase(balls.begin() + i);
                --i;
            } else {
                // Âm thanh va chạm
                if (balls[i].handleCollisionWithCircle(circleX, circleY, circleRadius, 7.5, spinningSpeed)) {
                    Mix_PlayChannel(-1, bounceSound, 0);
                }
            }
        }

        balls.insert(balls.end(), newBalls.begin(), newBalls.end());

        // Render
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
        SDL_RenderClear(renderer);

        // Vẽ vòng
        SDL_SetRenderDrawColor(renderer, 255, 165, 0, 255);
        SDL_RenderDrawCircle(renderer, circleX, circleY, circleRadius);
        drawArc(renderer, circleX, circleY, circleRadius, startAngle, endAngle);

        // Vẽ bóng
        for (const Ball& ball : balls) {
            ball.draw(renderer);
        }

        SDL_RenderPresent(renderer);
        SDL_Delay(16);
    }

    // Giải phóng
    Mix_FreeChunk(bounceSound);
    bounceSound = nullptr;

    // Dọn dẹp SDL
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    Mix_Quit();
    SDL_Quit();
    
    return 0;
}
