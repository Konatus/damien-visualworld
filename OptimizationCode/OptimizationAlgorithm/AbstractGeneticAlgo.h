#pragma once
#include "Commun.h"
#include "Parameters.h"

using namespace std;

/**
 * \class AbstractGeneticAlgo
 * \brief D�finition des param�tres et fonctions communes n�cessaires au fonctionnement de l'algorithme g�n�tique
 */
class AbstractGeneticAlgo
{
protected:

	/* PARAMETRES PRIVES LIEES A L ALGORITHME GENETIQUE */
	/*****************************************************/
	// Attributes related to data
	const Data& _data;
	int _nbActivity;
	int _nbResources;
	int _resourceActivity;
	double _duration;
	double _load;
	vector<vector<int>> _predecessors;
	vector<vector<int>> _successors;

	// Attributes related to objective function
	double _weightLateness;
	double _weightInactivity;

	// Best solution every run confounded
	individual _finalResult;

	// Attributes related to algorithm
	population _pop;
	int _popSize;
	int _newPopSize;
	int _bestPopSize;
	int _nbIterations;
	double _cross_prob;
	double _mutate_prob;
	int _sel_param;
	double _bestCost;
	int _lastImprovement;
	int _rule;


	/* METHODES PUBLIQUES LIEES A L ALGORITHME GENETIQUE */
	/*****************************************************/
public:
	/**
	* \brief Constructeur de l'algorithme g�n�tique
	*/
	AbstractGeneticAlgo(const Data& data);

	individual basicAlgo();

	/**
	* \brief M�thode d'initialisation de l'algorithme g�n�tique
	*/
	void initialize(mt19937& gen);

	/**
	* \brief M�thode de lancement de l'algorithme g�n�tique
	*/
	bool solve(mt19937& gen, const string& progressfilename);

	/**
	* \brief M�thode d'initialisation et de lancement de l'algorithme g�n�tique et de sauvegarde du r�sultat
	*/
	bool run(const string& filename, const string& progressfilename);

	/**
	* \brief Fonction d'�criture de la solution de l'algorithme g�n�tique dans un fichier
	* \param filename nom du fichier de la sauvegarde
	*/
	void write(const string& filename) const;
	void write(const string& filename, individual& indiv) const;

	individual getFinalResult() { return _finalResult; }

	double bestCost() { return _bestCost; }

	int lastImprovement() { return _lastImprovement; }


	/* METHODES PRIVEES LIEES A L ALGORITHME GENETIQUE */
	/***************************************************/
protected:

	int first_valid_activity(commun::sample& tasksv, int* startBatch = NULL);
	int random_valid_activity(mt19937& gen, commun::sample& tasks, int* startBatch = NULL);
	int random_duration_activity(mt19937& gen, commun::sample& tasks, int* startBatch = NULL);
	int random_workload_activity(mt19937& gen, commun::sample& tasks, int* startBatch = NULL);
	int random_duedate_activity(mt19937& gen, commun::sample& tasks);
	int random_releasedate_activity(mt19937& gen, commun::sample& tasks);
	int random_priority_activity(mt19937& gen, commun::sample& tasks);
	int random_successors_number_activity(mt19937& gen, commun::sample& tasks, int* startBatch = NULL);
	int select_priority_task(mt19937& gen, commun::sample& tasks, individual& indiv, int* startBatch = NULL);

	/**
	* \brief Fonction retournant le temps de fin d'une activit� seulement en fonction de ses pr�d�cesseurs
	*/
	double earliest_finish_time(sample_d& finish_time, int task_id);

	/**
	* \brief Fonction retournant le temps de fin d'une activit� en fonction de ses pr�d�cesseurs et de la capacit� des ressources
	*/
	double earliest_finish_time_capacity(double earliest, vector<map<double, double>>& remaining_capacities, int task_id);
	double earliest_finish_time_capacity_skills(double earliest, vector<sample_d>& remaining_capacities, vector<vector<sample_d>>& remaining_capacities_skills, int task_id);

	/**
	* \brief Fonction construisant un individu: construction de la solution d'un individu
	*/
	virtual void create_individual(mt19937& gen, individual& indiv, int choice) = 0;

	/**
	* \brief Fonctions permettant de calculer la valeur de la fonction objectif d'un individu
	*/
	double time_evaluator(individual& individual);
	double completion_time_evaluator(individual& indiv);
	double inactivity_evaluator(individual& individual);
	virtual double evaluator_function(individual& individual) = 0;

	/**
	* \brief Fonction permettant d'�valuer la population et calculer le pire et le meilleur individu
	*/
	double evaluation(sample_d& scores, double& best, double& avg, double& worst, int& best_id, int& worst_id, commun::sample& indexSortedScores);

	/**
	* \brief Fonctions de s�lection des individus � conserver
	*/
	int roulette_selector(sample_d& scores, mt19937& gen);
	int tournament_selector(sample_d& scores, mt19937& gen);

	/**
	* \brief Fonctions correspondant aux op�rateurs de mutation et de crossover de l'algorithme g�n�tique
	*/
	virtual void crossover(individual& first, individual& second, mt19937& gen) = 0;
	virtual individual mutation(individual& indiv, mt19937& gen) = 0;



};

