#include <cmath>

float A, B, C;

float toadoX (int i, int j, int k)
{
	return j * sin(A) * sin(B) * cos(C) - k * cos(A) * sin(B) * cos(C) +
		j * cos(A) * sin(C) + k * sin(A) * sin(C) + i * cos(B) * cos(C);
}

float toadoY(int i, int j, int k)
{

}

int main()
{

	return 0;
}