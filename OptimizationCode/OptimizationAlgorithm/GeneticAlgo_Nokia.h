#ifndef GENETIC_ALGORITHM_NOKIA_H
#define GENETIC_ALGORITHM_NOKIA_H

#include "Data.h"
#include "Commun.h"
#include "Parameters.h"
#include "AbstractGeneticAlgo.h"

using namespace std;

/**
 * \class GeneticAlgo
 * \brief Définition des paramètres et fonctions nécessaires au fonctionnement de l'algorithme génétique
 */
class GeneticAlgo_Nokia : public AbstractGeneticAlgo {

	/* PARAMETRES PRIVES LIEES A L ALGORITHME GENETIQUE */
	/*****************************************************/
private:

	// Attributes related to objective function
	double _weightCompletion;
	double _weightDuration;
	double _weightCost;
	double _weightInactivity;

	// Attributes related to algorithm
	double _cross_prob_resource;
	double _mutate_prob_resource;


	/* METHODES PUBLIQUES LIEES A L ALGORITHME GENETIQUE */
	/*****************************************************/
public:
	/**
	* \brief Constructeur de l'algorithme génétique
	*/
	GeneticAlgo_Nokia(const Data & data);

	/**
	* \brief Destructeur
	*/
	~GeneticAlgo_Nokia();

	/* METHODES PRIVEES LIEES A L ALGORITHME GENETIQUE */
	/***************************************************/
private:

	/**
	* \ Specific Fonctions used in evaluator_function 
	*/
	double project_duration_evaluator(individual& individual);
	double cost_evaluator(individual& individual);
	
	/**
	* \ Abstract Functions
	*/
	void create_individual(mt19937& gen, individual& indiv, int choice);
	double evaluator_function(individual& individual);
	void crossover(individual& first, individual& second, mt19937& gen);
	individual mutation(individual& indiv, mt19937& gen);

};


#endif /* GENETIC_ALGORITHM_NOKIA_H */