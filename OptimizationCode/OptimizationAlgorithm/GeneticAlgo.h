#ifndef GENETIC_ALGORITHM_H
#define GENETIC_ALGORITHM_H

#include "Data.h"
#include "AbstractGeneticAlgo.h"

using namespace std;

/**
 * \class GeneticAlgo
 * \brief Définition des paramètres et fonctions nécessaires au fonctionnement de l'algorithme génétique
 */
class GeneticAlgo : public AbstractGeneticAlgo {

	/* PARAMETRES PRIVES LIEES A L ALGORITHME GENETIQUE */
	/*****************************************************/
private:



	/* METHODES PUBLIQUES LIEES A L ALGORITHME GENETIQUE */
	/*****************************************************/
public:
	/**
	* \brief Constructeur de l'algorithme génétique
	*/
	GeneticAlgo(const Data& data);
	/**
	* \brief Destructeur
	*/
	~GeneticAlgo();

	/* METHODES PRIVEES LIEES A L ALGORITHME GENETIQUE */
	/***************************************************/
private:
	/**
	* \ Specific Functions used in create_individual when activated Skills
	*/
	void setRemainingCapacitySkills(sample_d& remaining_capacity_s, sample_d& remaining_capacity_skill, std::vector<sample_d>& remaining_capacities_skill, std::vector<sample_d>& remaining_capacities_s, std::vector<std::vector<sample_d>>& remaining_capacities_skills, sample_d& finish_time);

	/**
	* \ Abstract Functions
	*/
	void create_individual(mt19937& gen, individual& indiv, int choice);
	double evaluator_function(individual& individual);
	void crossover(individual& first, individual& second, mt19937& gen);
	individual mutation(individual& indiv, mt19937& gen);


};


#endif /* GENETIC_ALGORITHM_H */