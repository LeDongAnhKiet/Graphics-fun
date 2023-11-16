#include <cmath>
#include <iostream>
#include <string>
#include <thread>
#include <chrono>

float A, B, C, X, Y, Z, Z1, K1;

float canh = 20, zBuffer[160 * 44], tocDo = 0.6;
int rong = 160, cao = 44, xa = 100;
char buffer[160 * 44];
int ascii = ' ', xp, yp, idx;

float toadoX (int i, int j, int k)
{
	return j * sin(A) * sin(B) * cos(C)
		- k * cos(A) * sin(B) * cos(C) + j * cos(A) * sin(C)
		+ k * sin(A) * sin(C) + i * cos(B) * cos(C);
}

float toadoY (int i, int j, int k)
{
	return j * cos(A) * cos(C) + k * sin(A) * cos(C)
		- j * sin(A) * sin(B) * sin(C)
		+ k * cos(A) * sin(B) * sin(C) - i * cos(B) * sin(C);
}

float toadoZ(int i, int j, int k)
{
	return k * cos(A)* cos(B) - j * sin(A) * cos(B) + i * sin(B);
}

void beMat(float x, float y, float z, int ch)
{
	X = toadoX(x, y, z);
	Y = toadoY(x, y, z);
	Z = toadoZ(x, y, z) + xa;

	Z1 = 1 / Z;
	xp = (int)(rong / 2 - 2 * canh + K1 * Z1 * X * 2);
	yp = (int)(cao / 2 + K1 * Z1 * Y);
	idx = xp + yp * rong;

	if (idx >= 0 && idx < rong * cao)
	{
		if (Z1 > zBuffer[idx])
		{
			zBuffer[idx] = Z1;
			buffer[idx] = ch;
		}
	}
}

int main()
{
	std::cout << "\x1b[2J";
	while (true)
	{
		std::memset(buffer, ascii, rong * cao);
		std::memset(zBuffer, 0, rong * cao * 4);
		
		for (float X = -canh; X < canh; X += tocDo)
		{
			for (float Y = -canh; Y < canh; Y += tocDo)
			{
				beMat(X, Y, -canh, '#');
				beMat(canh, Y, X, '$');
				beMat(-canh, Y, -X, '@');
				beMat(-X, Y, canh, '%');
				beMat(X, -canh, X - Y, '&');
				beMat(X, canh, Y, '*');
			}
		}
		
		std::cout << "\x1b[H";
		for (int k = 0; k < rong * cao; k++)
		{
			std::putchar(k % rong ? buffer[k] : 10);
		}
		
		A += 0.005;
		B += 0.005;
		std::this_thread::sleep_for(std::chrono::seconds(1));
	}
	return 0;
}