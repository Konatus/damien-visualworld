#include "Commun.h"

int checkNew = 0;
int logLevel = 5;
FILE *logFile = NULL;

int IsLeapYear(int year) {
	return ((year & 3) == 0) && (((year % 100) != 0) || ((year % 400) == 0));
}

int rdn(int y, int m, int d) { /* Rata Die day one is 0001-01-01 */
	if (m < 3)
		y--, m += 12;
	return 365 * y + y / 4 - y / 100 + y / 400 + (153 * m - 457) / 5 + d - 306;
}

double rnd()
{
	return (double(rand()) / double(RAND_MAX));
}
unsigned int random(unsigned int x)
{
	return (unsigned int)(rand() % x);
}

int STDCALL myStrcmp(char* st1, char* st2)
{
	return strcmp(st1, st2);
}

bool dblEqual(double a, double b)
{
	return (fabs(a - b) < 0.000001);
}

void f_LOGN(char *st, int level)
{
	if (logLevel >= level)
	{
		char t[20] = "";
		//		_strtime(t);
		for (int l = 0; l < level; l++)
			fprintf(logFile, "\t");
		fprintf(logFile, "lev %i at %s : %s", level, t, st);
		fflush(logFile);
	}
}

void f_LOG(char *st, int level)
{
	if (logLevel >= level)
	{
		for (int l = 0; l < level; l++)
			fprintf(logFile, "\t");
		fprintf(logFile, st);
		fflush(logFile);
	}
}

/*
   RAND is a macro which returns a pseudo-random numbers from a uniform
   distribution on the interval [0 1]
*/
#define RAND ((double) rand())/((double) RAND_MAX)

/*
   TWOPI = 2.0*pi
*/
#define TWOPI 2.0*3.141592653589793238462643383279502884197169399375

/*
   RANDN is a macro which returns a pseudo-random numbers from a normal
   distribution with mean zero and standard deviation one. This macro uses Box
   Muller's algorithm
*/
#define RANDN sqrt(-2.0*log(RAND))*cos(TWOPI*RAND)


double NormalDistribution(double mu, double sigma)
{
	/*
	   This function returns a pseudo-random numbers from a normal distribution with
	   mean equal at mu and standard deviation equal at sigma > 0
	*/
	if (sigma <= 0.0)
	{
		fprintf(stderr, "Error in file %s line %u function %s : sigma must be > 0\nExit program\n", __FILE__, __LINE__, __FUNCTION__);
		exit(EXIT_FAILURE);
	}

	return (mu + sigma * RANDN);

}
