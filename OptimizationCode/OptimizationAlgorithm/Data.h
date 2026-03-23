#ifndef DATA_H
#define	DATA_H

#include "Commun.h"
#include "Parameters.h"


/**
 * \class Data
 * \brief Lecture et traitement des donn�es utilis�es par l'application
 */
class Data {

public:

	Data();

	
	//by wi�al (get the last date of 0<%acc<100 ids
	const std::vector<int>& getPercentAccomplished() const;
	void loadPercentAccomplished(const std::string& filename);
	int convertDateToPeriod(const std::string& date) const;
	/**
	 *
	 * @return the number of jobs
	 */
	int nbJobs() const;
	int nbProjects() const;

	/**
	 *
	 * @return the number of skills
	 */
	int nbSkills() const { return _nbSkills; }

	/**
	 *
	 * @return the number of ressources
	 */
	int nbResources() const;

	int nbBatchs() const { return _nbBatchs; }
	/**
	 *
	 * @return horizon
	 */
	int T() const { return _horizon; }

	int timeWindow() const { return _timeWindow; }

	/**
	 *
	 * @return the vector of tasks
	 */
	vector<task> activities() const { return _activities; }

	/**
	 *
	 * @return the vector of resources
	 */
	vector<resource> resources() const { return _resources; }

	double duration(int i) const { return _duration[i]; }
	double priority(int i) const { return _priority[i]; }
	int dueDate(int i) const { return _dueDate[i]; }
	int deadline(int i) const { return _deadline[i]; }
	int releaseDate(int i) const { return _releaseDate[i]; }
	double tardCost(int i) const { return _tardinessCost[i]; }

	int succList(int i, int j) const { return _succList[i][j]; }
	int predList(int i, int j) const { return _predList[i][j]; }
	int nbSuccActivity(int i) const { return _nbSuccActivity[i]; }
	int nbPredActivity(int i) const { return _nbPredActivity[i]; }
	int earliestStartDate(int i) const { return _earliestStartDate[i]; }
	double loadActivity(int i) const { return _loadActivity[i]; }
	double loadActivitySkill(int i, int s) const { return _loadActivitySkill[i][s]; }
	int project(int i) const { return _project[i]; }
	int batches(int i) const { return _batchActivity[i]; }
	int identifiant(int i) const { return _identifiant[i]; }

	double capacity(int i) const { return _capacity[i]; }
	double cost(int r) const { return _cost[r]; }
	double capacitySkill(int i, int s) const { return _capacitySkill[i][s]; }
	int affectationActivitiesResources(int i) const { return _affectationActivitiesResources[i]; }
	int affectationActivitiesTypeResources(int i) const { return _affectationActivitiesTypeResources[i]; }
	int affectationBatchTypeResources(int i) const { return _affectationBatchTypeResources[i]; }

	bool getSolution() const { return _solution; }

private:


	//by wi�al
	std::vector<int> percentAccomplished;

	/*
	 * Horizon
	 */
	int _horizon;
	int _timeWindow;

	bool _solution;

	/*
	 * number Of jobs
	 */
	int _nbJobs;
	int _nbProjects;

	/*
	 * number of skills
	 */
	int _nbSkills;

	/*
	 * number Of ressouces
	 */
	int _nbResources;
	int _nbBatchs;


	vector<task> _activities;

	vector<resource> _resources;

	map<int, int> _indexResource;

	map<int, int> _indexActivity;
	map<int, int> _indexProject;

	double* _duration;
	int* _project;
	double* _priority;
	int* _dueDate;
	int* _deadline;
	int* _releaseDate;
	double* _tardinessCost;

	int** _succList;
	int** _predList;
	int* _nbSuccActivity;
	int* _nbPredActivity;
	double* _earliestStartDate;
	double* _loadActivity;
	double** _loadActivitySkill;
	int* _batchActivity;
	int* _identifiant;

	double* _capacity;
	double** _capacitySkill;
	double* _cost;
	int* _affectationActivitiesResources;
	int* _affectationActivitiesTypeResources;
	int* _affectationBatchTypeResources;

	string _firstDate;


public:

	/* Instance reading */
	void readResources(const string& filename);
	void readSkills(const string& filename);
	void readActivities(const string& filename);
	void readTeams(const string& filename);
	void readAffectations(const string& filename);
	void readProjectByActivity(const string& filename);
	void readPrecedences(const string& filename);
	//void readData(const string& resourceFilename, const string& activityFilename, const string& precedenceFilename, const string& affectationFilename, const string& projectActivityFilename, const string& skillsFilename);
	void readBatches(const string& filename);
	void readData(const string& batchFilename, const string& resourceFilename, const string& activityFilename, const string& precedenceFilename, const string& teamFilename, const string& affectationFilename, const string& projectActivityFilename, const string& skillsFilename);
	//void readData(const string& batchFilename, const string& resourceFilename, const string& activityFilename, const string& precedenceFilename, const string& affectationFilename, const string& projectActivityFilename);


	/* Date conversion into periods */
	int findIndexPrimaryDate(vector<string>& dates);
	int convertDateToPeriod(std::string dateMin, std::string date) const;
	string convertPeriodToDate(int period) const;

	/* Matching index-id of activities */
	int indexActivity(int id) { return _indexActivity[id]; }
	/* Matching index-id of projects */
	int indexProject(int id) { return _indexProject[id]; }
	/* Matching index-id of resources */
	int indexResource(int id) { return _indexResource[id]; }

	/* Instance writting */
	void write(const string& filename);

	/* Functions that check if precedence constraints are satisfying */
	bool isCyclic();
	bool DFSUtil(int vertex, int color[]);
	bool hasEnoughCapacity();

	/* Destroyer */
	~Data();

};


#endif	/* DATA_H */