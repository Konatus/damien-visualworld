#ifndef PARAMETERS_H
#define PARAMETERS_H

#include "Commun.h"
#include "Data.h"

//using namespace std;

/**
 * \class Parameters
 * \brief Définition des paramètres de l'application
 */

#define GET_BASE()		Parameters::appliParam->getBase()
#define IS_BASE_6()		Parameters::appliParam->isBase6()
#define IS_BASE_7()		Parameters::appliParam->isBase7()
#define IS_BASE_NOKIA()	Parameters::appliParam->isBaseNokia()
#define WITH_SKILLS()	Parameters::appliParam->getSkills()



class Parameters {
public:
	static Parameters * appliParam;

private:

	/*
	* General parameters
	*/
	bool _skillset;

	double _weightInactivity;

	double _weightLateness;

	double _weightCost;

	double _weightCompletionTime;

	double _weightDuration;

	bool _geneticAlgo;

	int _rule;

	string _sizeRun;

	double _hoursByPeriod;

	string _base;

	bool _is_base_6 = false;
	bool _is_base_7 = true;
	bool _is_base_nokia = false;


	/*
	* Parameters linked to the genetic algorithm
	*/
	int _selector;

	int _popSize;

	double _newPopSize;

	double _bestPopSize;

	int _nbIterations;

	double _cross_prob;

	double _mutate_prob;

	int _sel_param;


public:

	/**
	 * \brief Constructeur des paramètres
	 */
	Parameters();

	/*
	 * Setters
	 */
	void setBase(string base) { 
		_base = StringUtils::toLower(base);
		_is_base_nokia = _base.find("nokia", 0) != -1;
		_is_base_6 = _base.rfind("6", 0) == 0;
		_is_base_7 = _base.rfind("7", 0) == 0;
	}

	void setGeneticAlgo(string algo);

	void setRule(string rule);

	void setHoursByPeriod(double hours) { _hoursByPeriod = hours; }

	void setSizeRun(string sizeRun) { _sizeRun = sizeRun; }

	void setSelector(int selector) { _selector = selector; }

	void setPopSize(int popSize) { _popSize = popSize; }

	void setNewPopSize(double popSize) { _newPopSize = popSize; }

	void setBestPopSize(double popSize) { _bestPopSize = popSize; }

	void setNbIterations(int nbIterations) { _nbIterations = nbIterations; }

	void setWeightInactivity(double weight) { _weightInactivity = weight; }
	void setWeightLateness(double weight) { _weightLateness = weight; }
	void setWeightCompletion(double weight) { _weightCompletionTime = weight; }
	void setWeightCost(double weight) { _weightCost = weight; }
	void setWeightDuration(double weight) { _weightDuration = weight; }

	void setSkills(bool skills) { _skillset = skills; }

	void setCrossProb(double crossProb) { _cross_prob = crossProb; }

	void setMutateProb(double mutateProb) { _mutate_prob = mutateProb; }

	void setSelectParam(int selParam) { _sel_param = selParam; }

	/*
	 * Getters
	 */
	string getBase() { return _base; }

	bool isBase6() { return _is_base_6; }
	bool isBase7() { return _is_base_7; }
	bool isBaseNokia() { return _is_base_nokia; }

	int getSelector() { return _selector; }

	double getWeightLateness(){ return _weightLateness;}
	double getWeightInactivity() { return _weightInactivity; }
	double getWeightCompletion() { return _weightCompletionTime; }
	double getWeightCost() { return _weightCost; }
	double getWeightDuration() { return _weightDuration; }

	bool getSkills() { return _skillset; }

	int getRule() { return _rule; }

	string getSizeRun() { return _sizeRun; }

	void printRuleName();

	double getHoursByPeriod() { return _hoursByPeriod; }

	bool getGeneticAlgo() { return _geneticAlgo; }

	int getPopSize() { return _popSize; }

	double getNewPopSize() { return _newPopSize; }

	double getBestPopSize() { return _bestPopSize; }

	int getNbIterations() { return _nbIterations; }

	int getSelectParam() { return _sel_param; }

	double getCrossProb() { return _cross_prob; }

	double getMutateProb() { return _mutate_prob; }

	/**
	 * \brief Fonction d'affichage des paramètres
	 * \param out flux de sortie choisi
	 */
	void print(std::ostream & out = std::cout) const;

	void write(const string & filename);

	void readParameters(const string & filename);

};

inline std::ostream & operator<<(std::ostream & os, const Parameters & parameters) {
	parameters.print(os);
	return os;
}

#endif /* PARAMETERS_H */
