@REM install
sudo apt-get install libsdl2-dev libsdl2-image-dev libsdl2-ttf-dev libsdl2-mixer-dev

@REM run
g++ main.cpp Ball.cpp -o bounce -lSDL2 -lSDL2_image -lSDL2_ttf -lSDL2_mixer
./bounce