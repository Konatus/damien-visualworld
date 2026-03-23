
#ifndef COMMUN_H
#define COMMUN_H
#include <math.h>
#include <string>
#include <fstream>
#include <iostream>
#include <stdlib.h>
#include <stdio.h>
#include "ctime"
#include <vector>
#include <map>
#include <random>
#include <set>
#include <sstream>
#include <functional>
#include <numeric>
#include "Logger.h"
#include "DateUtils.h"
#include "StringUtils.h"

#ifdef _WIN32
#define STDCALL __stdcall
#else
#define STDCALL
#endif


using namespace std;
using namespace CPlusPlusLogging;
using namespace utils;

#ifdef LOG_LEVEL6
#define LOG_LEVEL 6
#else
#define LOG_LEVEL 0
#endif

typedef int indTime;
typedef double indCout;
typedef int indJob;

extern int checkNew;

extern int logLevel;
extern FILE* logFile;
void f_LOGN(char* st, int level);
void f_LOG(char* st, int level);

const int INFINI = 9999999;
const double f_INFINI = 1000.0 * 1000.0 * 1000.0 * 1000.0;
const double EPSILON = 0.0001;
const int TLIMIT = 10;

inline double fround(double n, int d) {
	return floor(n * pow((double)10.0, d) + .5) / pow((double)10., d);
}

int rdn(int y, int m, int d);
double rnd();
unsigned int random(unsigned int x);

double NormalDistribution(double mu, double sigma);

int IsLeapYear(int year);


int STDCALL myStrcmp(char* st1, char* st2);

typedef struct
{
	indJob j, c;
} tOcc;

inline int double2int(double x)
{
	return (int)(x + EPSILON);
};

typedef struct task
{
	int		  id;
	int			  short_id;
	int			  project;
	int			  phase;
	double        duration;
	int			  priority;
	int			  dueDate;
	int			  releaseDate;
	int			  deadline;
	int			  tardCost;
	int			  sol;
	int			  batch;

	int			  resource;
	map<int, double> loadSkill;
	vector<int> successors;
	vector<int> predecessors;
	int			  load;
	int			  earliestStart;

	task(int id, int project, int phase, double duration, int resource, int load, vector<int> successors, vector<int> predecessors, int earliestStart) : id(id), project(project), batch(batch), duration(duration), resource(resource), load(load), successors(successors), predecessors(predecessors), earliestStart(earliestStart) {}
	task() : id(0), project(-1), batch(-1), duration(0), resource(0), load(0), earliestStart(0), sol(0) {}
	~task() {}

} task;

typedef struct resource
{
	int id;
	int type;
	double capacity;
	double cost;
	map<int, double> capacitySkill;

	resource(int id, double capacity) : id(id), capacity(capacity), cost(0) {}
	resource(int id, map<int, double> capacitySkill) : id(id), capacitySkill(capacitySkill) {}
	resource(int id) : id(id), type(0), cost(0), capacity(0) {}
	resource() : type(0), cost(0) {}
	~resource() {}
} resource;

typedef struct individual
{
	vector<double>     startTime;
	vector<double>  priority;
	vector<int>		resource;
	double objective1;
	double objective2;

	individual(vector<double> solution, vector<double> priority) : startTime(solution), priority(priority), objective1(0), objective2(0) {}
	individual(vector<double> solution, vector<double> priority, vector<int> resource) : startTime(solution), priority(priority), resource(resource), objective1(0), objective2(0) {}
	individual() {}
	~individual() {}
} individual;

namespace commun {
	typedef vector<int> sample;
}
typedef vector<double> sample_d;
typedef vector<individual> population;


#define MaxM 1
#define MaxN 200
#define MaxOp MaxM*MaxN+2
#define MaxDis MaxM*MaxN*(MaxN-1)/2
#define MaxPile MaxDis*5
#define MaxDecisions MaxDis/2
#define infini INFINI
#define RESFILE "d:\\prog\\res\\res.txt"
#define MaxTps 5000

#define print_individual(v) { std::cout << "[ "; for (auto i : v) { std::cout << i << " ";} std::cout << "]\n";}

#define monNew(var,arg) {var = new arg;checkNew++;}
#define monNewTInit(var,type,dim,init) {var=new type[dim];checkNew++;for (int iter=0;iter<dim;iter++) var[iter]=init;}
#define monNew2(var,type,dim1,dim2) {var=new type*[dim1];checkNew++;for (int iter=0;iter<dim1;iter++) {if (dim2>0) {var[iter]=new type[dim2];checkNew++;}else var[iter]=NULL;}}
#define monNew2Init(var,type,dim1,dim2,init) {var=new type*[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {if (dim2>0) {var[iter1]=new type[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){var[iter1][iter2]=init;}}else var[iter1]=NULL;}}
#define monNew3(var,type,dim1,dim2,dim3) {var=new type**[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {var[iter1]=new type*[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){var[iter1][iter2]=new type[dim3];checkNew++;}}}
#define monNew3Init(var,type,dim1,dim2,dim3,init) {var=new type**[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {var[iter1]=new type*[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){if (dim3>0) {var[iter1][iter2]=new type[dim3];checkNew++;for (int iter3=0;iter3<dim3;iter3++){var[iter1][iter2][iter3]=init;}}else var[iter1][iter2]=NULL;}}}
#define monNew4(var,type,dim1,dim2,dim3,dim4) {var=new type***[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {var[iter1]=new type**[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){var[iter1][iter2]=new type*[dim3];checkNew++;for (int iter3=0;iter3<dim3;iter3++){var[iter1][iter2][iter3]=new type[dim4];checkNew++;}}}}
#define monNew5(var,type,dim1,dim2,dim3,dim4,dim5) {var=new type****[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {var[iter1]=new type***[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){var[iter1][iter2]=new type**[dim3];checkNew++;for (int iter3=0;iter3<dim3;iter3++){var[iter1][iter2][iter3]=new type*[dim4];checkNew++;for (int iter4=0;iter4<dim4;iter4++){var[iter1][iter2][iter3][iter4]=new type[dim5];checkNew++;}}}}}
#define monNew5Init(var,type,dim1,dim2,dim3,dim4,dim5,init) {var=new type****[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {var[iter1]=new type***[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){var[iter1][iter2]=new type**[dim3];checkNew++;for (int iter3=0;iter3<dim3;iter3++){var[iter1][iter2][iter3]=new type*[dim4];checkNew++;for (int iter4=0;iter4<dim4;iter4++){if (dim5>0) {var[iter1][iter2][iter3][iter4]=new type[dim5];checkNew++;for (int iter5=0;iter5<dim5;iter5++){var[iter1][iter2][iter3][iter4][iter5]=init;}} else var[iter1][iter2][iter3][iter4]=NULL;}}}}}
#define monNew6(var,type,dim1,dim2,dim3,dim4,dim5,dim6) {var=new type*****[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {var[iter1]=new type****[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){var[iter1][iter2]=new type***[dim3];checkNew++;for (int iter3=0;iter3<dim3;iter3++){var[iter1][iter2][iter3]=new type**[dim4];checkNew++;for (int iter4=0;iter4<dim4;iter4++){var[iter1][iter2][iter3][iter4]=new type*[dim5];checkNew++;for (int iter5=0;iter5<dim5;iter5++){var[iter1][iter2][iter3][iter4][iter5]=new type[dim6];checkNew++;}}}}}}
#define monNew7(var,type,dim1,dim2,dim3,dim4,dim5,dim6,dim7) {var=new type******[dim1];checkNew++;for (int iter1=0;iter1<dim1;iter1++) {var[iter1]=new type*****[dim2];checkNew++;for (int iter2=0;iter2<dim2;iter2++){var[iter1][iter2]=new type****[dim3];checkNew++;for (int iter3=0;iter3<dim3;iter3++){var[iter1][iter2][iter3]=new type***[dim4];checkNew++;for (int iter4=0;iter4<dim4;iter4++){var[iter1][iter2][iter3][iter4]=new type**[dim5];checkNew++;for (int iter5=0;iter5<dim5;iter5++){var[iter1][iter2][iter3][iter4][iter5]=new type*[dim6];checkNew++;for (int iter6=0;iter6<dim6;iter6++){var[iter1][iter2][iter3][iter4][iter5][iter6]=new type[dim7];checkNew++;}}}}}}}
#define monDelete(var)  {delete var;checkNew--;}
#define monDeleteT(var) {delete[] var;checkNew--;}
#define monDeleteTS(var,dim) {for (int i=0;i<dim;i++) monDelete(var[i]);monDeleteT(var);}
#define monDeleteT2(var,dim) {for (int i=0;i<dim;i++) monDeleteT(var[i]);monDeleteT(var);}
#define monDeleteT3(var,dim1,dim2) {for (int iter1=0;iter1<dim1;iter1++) {for (int iter2=0;iter2<dim2;iter2++) {monDeleteT(var[iter1][iter2]);}monDeleteT(var[iter1]);}monDeleteT(var);}
#define monDeleteT4(var,dim1,dim2,dim3) {for (int iter1=0;iter1<dim1;iter1++) {for (int iter2=0;iter2<dim2;iter2++) {for (int iter3=0;iter3<dim3;iter3++) {monDeleteT(var[iter1][iter2][iter3]);}monDeleteT(var[iter1][iter2]);}monDeleteT(var[iter1]);}monDeleteT(var);}
#define monDeleteT5(var,dim1,dim2,dim3,dim4) {for (int iter1=0;iter1<dim1;iter1++) {for (int iter2=0;iter2<dim2;iter2++) {for (int iter3=0;iter3<dim3;iter3++) {for (int iter4=0;iter4<dim4;iter4++){monDeleteT(var[iter1][iter2][iter3][iter4]);}monDeleteT(var[iter1][iter2][iter3]);}monDeleteT(var[iter1][iter2]);}monDeleteT(var[iter1]);}monDeleteT(var);}
#define monDeleteT6(var,dim1,dim2,dim3,dim4,dim5) {for (int iter1=0;iter1<dim1;iter1++) {for (int iter2=0;iter2<dim2;iter2++) {for (int iter3=0;iter3<dim3;iter3++) {for (int iter4=0;iter4<dim4;iter4++){for (int iter5=0;iter5<dim5;iter5++){monDeleteT(var[iter1][iter2][iter3][iter4][iter5]);}monDeleteT(var[iter1][iter2][iter3][iter4]);}monDeleteT(var[iter1][iter2][iter3]);}monDeleteT(var[iter1][iter2]);}monDeleteT(var[iter1]);}monDeleteT(var);}
#define monDeleteT7(var,dim1,dim2,dim3,dim4,dim5,dim6) {for (int iter1=0;iter1<dim1;iter1++) {for (int iter2=0;iter2<dim2;iter2++) {for (int iter3=0;iter3<dim3;iter3++) {for (int iter4=0;iter4<dim4;iter4++){for (int iter5=0;iter5<dim5;iter5++){for (int iter6=0;iter6<dim6;iter6++){monDeleteT(var[iter1][iter2][iter3][iter4][iter5][iter6]);}monDeleteT(var[iter1][iter2][iter3][iter4][iter5]);}monDeleteT(var[iter1][iter2][iter3][iter4]);}monDeleteT(var[iter1][iter2][iter3]);}monDeleteT(var[iter1][iter2]);}monDeleteT(var[iter1]);}monDeleteT(var);}

#define monInitTab(var,dim,init) {for (int iter=dim-1;iter>=0;--iter) var[iter]=init;}
#define monInitTab2(var,dim1,dim2,init) {for (int iter1=dim1-1;iter1>=0;--iter1) for (int iter2=dim2-1;iter2>=0;--iter2) var[iter1][iter2]=init;}
#define monInitTab3(var,dim1,dim2,dim3,init) {for (int iter1=dim1-1;iter1>=0;--iter1) for (int iter2=dim2-1;iter2>=0;--iter2) for (int iter3=dim3-1;iter3>=0;--iter3)var[iter1][iter2][iter3]=init;}

#define monMin(varMin,expr,debut,fin) {varMin=INFINI;for (int iter=fin;iter>=debut;--iter){if (varMin>expr) varMin=expr;}}
#define monMax(varMax,expr,debut,fin) {varMax=-INFINI;for (int iter=debut;iter<=fin;++iter){if (varMax<expr) varMax=expr;}}
#define monArgMin(varArgMin,type,expr,debut,fin) {varArgMin=-1;type _tempMin=INFINI;for (int iter=debut;iter<=fin;++iter){if (_tempMin>expr) {_tempMin=expr;varArgMin=iter;}}}
#define monArgMax(varArgMax,type,expr,debut,fin) {varArgMax=-1;type _tempMax=-2*INFINI;for (int iter=debut;iter<=fin;++iter){if (_tempMax<expr) {_tempMax=expr;varArgMax=iter;}}}

#define Display1(var,min,max){for(int i=min;i<=max;i++){cout<< var[i] << " ";}cout<<endl;}
#define Display2(var,min1,max1,min2,max2){cout<<endl;for(int i=min1;i<=max1;i++){for(int j=min2;j<=max2;j++){cout<< var[i][j] << " ";}cout<<endl;}}
#define Display3LastDim(var,min1,max1,min2,max2,dim3){cout<<endl;for(int i=min1;i<=max1;i++){for(int j=min2;j<=max2;j++){cout<< var[i][j][dim3] << " ";}cout<<endl;}}


#if (LOG_LEVEL >= 1)
#define LOGN1(param_st) f_LOGN(param_st,1);
#if (LOG_LEVEL >= 2)
#define LOGN2(param_st) f_LOGN(param_st,2);
#if (LOG_LEVEL >= 3)
#define LOGN3(param_st) f_LOGN(param_st,3);
#if (LOG_LEVEL >= 4)
#define LOGN4(param_st) f_LOGN(param_st,4);
#if (LOG_LEVEL >= 5)
#define LOGN5(param_st) f_LOGN(param_st,5);
#if (LOG_LEVEL >= 6)
#define LOGN6(param_st) f_LOGN(param_st,6);
#else
#define LOGN6(param_st) {}
#endif
#else
#define LOGN5(param_st) {}
#define LOGN6(param_st) {}
#endif
#else
#define LOGN4(param_st) {}
#define LOGN5(param_st) {}
#define LOGN6(param_st) {}
#endif
#else
#define LOGN3(param_st) {}
#define LOGN4(param_st) {}
#define LOGN5(param_st) {}
#define LOGN6(param_st) {}
#endif
#else
#define LOGN2(param_st) {}
#define LOGN3(param_st) {}
#define LOGN4(param_st) {}
#define LOGN5(param_st) {}
#define LOGN6(param_st) {}
#endif
#else
#define LOGN1(param_st) {}
#define LOGN2(param_st) {}
#define LOGN3(param_st) {}
#define LOGN4(param_st) {}
#define LOGN5(param_st) {}
#define LOGN6(param_st) {}
#endif

#if (LOG_LEVEL >= 1)
#define LOG1(param_st) f_LOG(param_st,1);
#if (LOG_LEVEL >= 2)
#define LOG2(param_st) f_LOG(param_st,2);
#if (LOG_LEVEL >= 3)
#define LOG3(param_st) f_LOG(param_st,3);
#if (LOG_LEVEL >= 4)
#define LOG4(param_st) f_LOG(param_st,4);
#if (LOG_LEVEL >= 5)
#define LOG5(param_st) f_LOG(param_st,5);
#if (LOG_LEVEL >= 6)
#define LOG6(param_st) f_LOG(param_st,6);
#else
#define LOG6(param_st) {}
#endif
#else
#define LOG5(param_st) {}
#define LOG6(param_st) {}
#endif
#else
#define LOG4(param_st) {}
#define LOG5(param_st) {}
#define LOG6(param_st) {}
#endif
#else
#define LOG3(param_st) {}
#define LOG4(param_st) {}
#define LOG5(param_st) {}
#define LOG6(param_st) {}
#endif
#else
#define LOG2(param_st) {}
#define LOG3(param_st) {}
#define LOG4(param_st) {}
#define LOG5(param_st) {}
#define LOG6(param_st) {}
#endif
#else
#define LOG1(param_st) {}
#define LOG2(param_st) {}
#define LOG3(param_st) {}
#define LOG4(param_st) {}
#define LOG5(param_st) {}
#define LOG6(param_st) {}
#endif

bool dblEqual(double a, double b);

#endif /* COMMUN_H */
