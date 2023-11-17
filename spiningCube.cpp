#include <iostream>
#include <cmath>
#include <cstring>
//#include <thread>
//#include <chrono>
using namespace std;

float A, B, C, x, y, z;

float canh = 20, offset, K0 = 40;
int rong = 160, cao = 44, xa = 100;
float zBuffer[160 * 44], tocDo = 0.6, Z0;
char buffer[160 * 44];
int nenAscii = ' ', X0, Y0, i;

float toadoX(int i, int j, int k)
{
    return j * sin(A) * sin(B) * cos(C)
        - k * cos(A) * sin(B) * cos(C) + j * cos(A) * sin(C)
        + k * sin(A) * sin(C) + i * cos(B) * cos(C);
}

float toadoY(int i, int j, int k)
{
    return j * cos(A) * cos(C) + k * sin(A) * cos(C)
        - j * sin(A) * sin(B) * sin(C)
        + k * cos(A) * sin(B) * sin(C) - i * cos(B) * sin(C);
}

float toadoZ(int i, int j, int k)
{
    return k * cos(A) * cos(B) - j * sin(A) * cos(B) + i * sin(B);
}

void beMat(float X, float Y, float Z, int ch)
{
    x = toadoX(X, Y, Z);
    y = toadoY(X, Y, Z);
    z = toadoZ(X, Y, Z) + xa;

    Z0 = 1 / z;
    X0 = static_cast<int>(rong / 2 + offset + K0 * Z0 * x * 2);
    Y0 = static_cast<int>(cao / 2 + K0 * Z0 * y);

    i = X0 + Y0 * rong;
    if (i >= 0 && i < rong * cao)
        if (Z0 > zBuffer[i])
        {
            zBuffer[i] = Z0;
            buffer[i] = ch;
        }
}

int main()
{
    cout << "\x1b[2J";
    while (true)
    {
        memset(buffer, nenAscii, rong * cao);
        memset(zBuffer, 0, rong * cao * 4);

        canh = 20;
        offset = -2 * canh;
        // hình lớn
        for (float X = -canh; X < canh; X += tocDo)
            for (float Y = -canh; Y < canh; Y += tocDo)
            {
                beMat(X, Y, -canh, '@');
                beMat(canh, Y, X, '#');
                beMat(-canh, Y, -X, '$');
                beMat(-X, Y, canh, '%');
                beMat(X, -canh, -Y, '&');
                beMat(X, canh, Y, '+');
            }

        canh = 10;
        offset = 1 * canh;
        // hình giữa
        for (float X = -canh; X < canh; X += tocDo)
            for (float Y = -canh; Y < canh; Y += tocDo)
            {
                beMat(X, Y, -canh, '@');
                beMat(canh, Y, X, '#');
                beMat(-canh, Y, -X, '$');
                beMat(-X, Y, canh, '%');
                beMat(X, -canh, -Y, '&');
                beMat(X, canh, Y, '+');
            }

        canh = 5;
        offset = 8 * canh;
        // hình cuối
        for (float X = -canh; X < canh; X += tocDo)
            for (float Y = -canh; Y < canh; Y += tocDo)
            {
                beMat(X, Y, -canh, '@');
                beMat(canh, Y, X, '#');
                beMat(-canh, Y, -X, '$');
                beMat(-X, Y, canh, '%');
                beMat(X, -canh, -Y, '&');
                beMat(X, canh, Y, '+');
            }

        cout << "\x1b[H";
        for (int k = 0; k < rong * cao; k++)
            putchar(k % rong ? buffer[k] : 10);

        A += 0.05;
        B += 0.05;
        C += 0.01;
        //this_thread::sleep_for(chrono::seconds(1));
    }
    return 0;
}
