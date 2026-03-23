#include "AbstractGeneticAlgo.h"
#include <fstream>
#include <sstream>
#include <map>
#include <iostream>
#include <cmath>   // pour std::round

AbstractGeneticAlgo::AbstractGeneticAlgo(const Data& data)
	: _data(data),
	_lastImprovement(0),
	_rule(Parameters::appliParam->getRule()),
	_bestPopSize((int)(Parameters::appliParam->getPopSize()* Parameters::appliParam->getBestPopSize())),
	_newPopSize((int)(Parameters::appliParam->getPopSize()* Parameters::appliParam->getNewPopSize())),
	_bestCost(10000000000),
	_weightLateness(Parameters::appliParam->getWeightLateness()),
	_weightInactivity(Parameters::appliParam->getWeightInactivity()),
	_popSize(Parameters::appliParam->getPopSize()),
	_nbIterations(Parameters::appliParam->getNbIterations()),
	_cross_prob(Parameters::appliParam->getCrossProb()),
	_mutate_prob(Parameters::appliParam->getMutateProb()),
	_sel_param(Parameters::appliParam->getSelectParam()) {

	_nbActivity = _data.nbJobs();
	_nbResources = _data.nbResources();
	std::vector<int> pred;
	std::vector<int> succ;

	for (int i = 0; i < _nbActivity; i++) {
		pred.clear();
		succ.clear();
		for (int j = 0; j < _data.nbPredActivity(i); j++) {
			pred.push_back(_data.predList(i, j));
		}
		_predecessors.push_back(pred);
		for (int j = 0; j < _data.nbSuccActivity(i); j++) {
			succ.push_back(_data.succList(i, j));
		}
		_successors.push_back(succ);
	}
	if (WITH_SKILLS()) {
		_bestPopSize = Parameters::appliParam->getBestPopSize();
		_newPopSize = Parameters::appliParam->getNewPopSize();
	}
}

individual AbstractGeneticAlgo::basicAlgo() {
	std::random_device rd;
	std::mt19937 gen(rd());
	std::vector<double> priority;
	std::vector<double> solution;
	double initPriority;
	commun::sample resource;

	for (int i = 0; i < _nbActivity; i++) {
		initPriority = 0;
		if (!IS_BASE_NOKIA())
			initPriority = _data.priority(i);
		priority.push_back(initPriority);
		solution.push_back(0);
	}
	if (!IS_BASE_NOKIA()) {
		individual indivi(solution, priority);
		std::cout << "Result : " << evaluator_function(indivi) << std::endl;
		return indivi;
	}
	else {
		for (int i = 0; i < _data.nbBatchs(); i++) {
			resource.push_back(std::uniform_int_distribution<>(0, _data.nbResources() - 2)(gen));
		}
		individual indivi(solution, priority, resource);
		create_individual(gen, indivi, _rule);
		write("Output/solution.csv", indivi);
		std::cout << "Result : " << evaluator_function(indivi) << std::endl;
		return indivi;
	}
}

void AbstractGeneticAlgo::initialize(std::mt19937& gen) {
	LOG_INFO("Start initialize GeneticAlgo");
	std::uniform_int_distribution<> distribution(0, 3);
	std::vector<double> priority;
	std::vector<double> solution;
	commun::sample resource;
	int random_max = 5;
	if (IS_BASE_NOKIA())
		random_max = 3;

	for (int i = 0; i < _nbActivity; i++) {
		if (!IS_BASE_NOKIA())
			priority.push_back(_data.priority(i));
		else
			priority.push_back(0);
		solution.push_back(0);
	}
	individual indivi(solution, priority);
	for (int i = 0; i < _popSize; i++) {
		if (IS_BASE_NOKIA()) {
			for (int i = 0; i < _data.nbBatchs(); i++)
				resource.push_back(std::uniform_int_distribution<>(0, _data.nbResources() - 2)(gen));
			indivi = individual(solution, priority, resource);
		}
		_pop.push_back(indivi);
	}
	int rule;
	for (auto& indiv : _pop) {
		rule = _rule;
		if (!WITH_SKILLS())
			if (rule == 8) {
				rule = std::uniform_int_distribution<>(0, random_max)(gen);
			}
		create_individual(gen, indiv, rule);
	}
	LOG_INFO("End initialize GeneticAlgo");
}

bool AbstractGeneticAlgo::solve(std::mt19937& gen, const std::string& progressfilename) {
	LOG_INFO("Start solve GeneticAlgo");
	clock_t startGA = clock();
	double best, avg, worst;
	int best_id, worst_id, firstIt;
	int step = _nbIterations / 20;
	int random_max = 5;
	int modulo = 10;
	if (IS_BASE_NOKIA()) {
		random_max = 6;
		modulo = 5;
	}
	if (WITH_SKILLS())
		modulo = 100;

	std::vector<double> priority;
	std::vector<double> solution;
	commun::sample indexSortedScore;
	for (int i = 0; i < _nbActivity; i++) {
		priority.push_back(_data.priority(i));
		solution.push_back(0);
	}
	individual indivi(solution, priority);

	sample_d scores(_popSize, 0);
	int index = 0;
	evaluation(scores, best, avg, worst, best_id, worst_id, indexSortedScore);
	firstIt = best;
	population new_population;
	individual child1;
	individual child2;
	double timeGA;
	std::ofstream fichier(progressfilename, std::ios::app);
	for (int epoch = 0; epoch < _nbIterations; ++epoch) {
		new_population.clear();
		index = 0;
		while (new_population.size() < _bestPopSize) {
			new_population.push_back(_pop.at(indexSortedScore[index]));
			index++;
		}
		while (new_population.size() < _popSize - _newPopSize) {
			switch (Parameters::appliParam->getSelector()) {
			case 0: {
				child1 = _pop.at(tournament_selector(scores, gen));
				child2 = _pop.at(tournament_selector(scores, gen));
				break;
			}
			case 1: {
				child1 = _pop.at(roulette_selector(scores, gen));
				child2 = _pop.at(roulette_selector(scores, gen));
				break;
			}
			default: {
				child1 = _pop.at(tournament_selector(scores, gen));
				child2 = _pop.at(tournament_selector(scores, gen));
				break;
			}
			}
			crossover(child1, child2, gen);
			new_population.push_back(mutation(child1, gen));
			new_population.push_back(mutation(child2, gen));
		}

		int rule;
		while (new_population.size() < _popSize) {
			rule = _rule;
			if (!WITH_SKILLS())
				if (rule == 8) {
					rule = std::uniform_int_distribution<>(0, random_max)(gen);
				}
			create_individual(gen, indivi, rule);
			new_population.push_back(indivi);
		}
		_pop = new_population;
		evaluation(scores, best, avg, worst, best_id, worst_id, indexSortedScore);
		_lastImprovement++;
		if (best < _bestCost) {
			_finalResult = _pop[best_id];
			_bestCost = best;
			_lastImprovement = 0;
		}
		if (!(epoch % step)) std::cerr << (100 * epoch / _nbIterations) << "%" << std::endl;

		if ((epoch + 1) % modulo == 0) {
			timeGA = (clock() - startGA) / (double)CLOCKS_PER_SEC;
			if (fichier) {
				fichier << _rule << ";" << Parameters::appliParam->getGeneticAlgo() << ";" << _popSize << ";" << _bestPopSize << ";" << _newPopSize << ";" << _cross_prob << ";" << _mutate_prob << ";";
				fichier << epoch + 1 << ";" << firstIt << ";" << _bestCost << ";" << _lastImprovement << ";" << timeGA << std::endl;
			}
			else
				std::cerr << "Erreur à l'ouverture !" << std::endl;
		}
	}
	fichier.close();
	LOG_INFO("End solve GeneticAlgo");
	return true;
}

bool AbstractGeneticAlgo::run(const std::string& filename, const std::string& progressfilename) {
	LOG_INFO("Start run GeneticAlgo");

	std::random_device rd;
	std::mt19937 gen(rd());

	// 1) Initialisation et exécution de l'algorithme
	initialize(gen);
	bool t = false;

	if (solve(gen, progressfilename)) {
		// 2) Sauvegarde de la solution principale (solution.csv)
		write(filename);

		// 3) Chargement des attributs pour récupérer % d'accomplissement
		std::map<int, std::vector<std::string>> attribut_data;
		std::ifstream attribut_file("Input/Konatus_instances/attribut_6.4.3.txt");
		std::string line;
		while (std::getline(attribut_file, line)) {
			std::istringstream iss(line);
			std::vector<std::string> tokens;
			std::string token;
			while (iss >> token) tokens.push_back(token);
			if (tokens.size() >= 17) { // on veut au moins accéder à [16]
				int id = std::stoi(tokens[0]); // att_id
				attribut_data[id] = tokens;
			}
		}

		// 4) Parcours des tâches pour logger + calculer la dernière date planifiée
		int max_planned_period = -1;

		for (int i = 0; i < _data.nbJobs(); i++) {
			int id_tache = _data.activities()[i].id;
			int periode_debut = _finalResult.startTime[i];
			std::string nouvelle_date = _data.convertPeriodToDate(periode_debut);
			double duration = _data.duration(i);

			// Récupérer % d’accomplissement
			double percent_accomplished = 0.0;
			if (attribut_data.count(id_tache)) {
				// colonne 16 = %accomplissement (index 16 car 0-based)
				percent_accomplished = std::stod(attribut_data[id_tache][16]);
			}

			// Pour les tâches 0 < %acc < 100 → on veut la dernière période planifiée
			if (percent_accomplished > 0.0 && percent_accomplished < 100.0) {
				if (periode_debut > max_planned_period) {
					max_planned_period = periode_debut;
				}
			}

			// Récupérer ID ressource
			int resource_id = IS_BASE_NOKIA() ?
				_finalResult.resource[_data.batches(i)] + 1 :
				_data.resources()[_data.affectationActivitiesResources(i)].id;

			// Déterminer statut
			std::string statut = (percent_accomplished == 100.0) ? "ignorée" : "replanifiée";

			// Log détaillé
			std::ostringstream oss;
			oss << "Tâche ID: " << id_tache
				<< " | Période début: " << periode_debut
				<< " | Nouvelle date: " << nouvelle_date
				<< " | Durée: " << duration
				<< " | %Accomplissement: " << percent_accomplished
				<< " | Ressource: " << resource_id
				<< " | Statut: " << statut;

			Logger::getInstance()->info("AbstractGeneticAlgo", __LINE__, oss.str());
		}

		// 5) Après la boucle : sauvegarder la dernière date planifiée pour 0 < %acc < 100
		if (max_planned_period != -1) {
			std::string last_planned_date = _data.convertPeriodToDate(max_planned_period);
			std::ofstream outfile("Output/last_planned_date.txt");
			outfile << last_planned_date;
			outfile.close();
			LOG_INFO("Dernière date planifiée pour 0 < %acc < 100 : " + last_planned_date);
		}

		t = true;
	}

	LOG_INFO("End run GeneticAlgo");
	return t;
}

/**
 * NOUVELLE VERSION DE write(filename) AVEC LES COLONNES DEMANDÉES
 */
void AbstractGeneticAlgo::write(const std::string& filename) const {
	LOG_INFO("Start write GeneticAlgo");

	// 1) Lecture des attributs
	std::map<int, std::vector<std::string>> attribut_data;
	std::ifstream attribut_file("Input/Konatus_instances/attribut_6.4.3.txt");
	std::string line;
	while (std::getline(attribut_file, line)) {
		std::istringstream iss(line);
		std::vector<std::string> tokens;
		std::string token;
		while (iss >> token) tokens.push_back(token);
		// on suppose au moins 22 colonnes comme avant
		if (tokens.size() >= 22) {
			int id = std::stoi(tokens[0]);
			attribut_data[id] = tokens;
		}
	}

	// 2) Lecture des anciens team_id depuis team_backlog
	std::map<int, std::string> old_teamid_map;
	std::ifstream team_file("Input/Konatus_instances/team_backlog_6.4.3.txt");
	while (std::getline(team_file, line)) {
		std::istringstream iss(line);
		std::vector<std::string> tokens;
		std::string token;
		while (iss >> token) tokens.push_back(token);
		if (tokens.size() >= 7) {
			int id = std::stoi(tokens[6]);     // id_work_element / att_id
			std::string old_teamid = tokens[1];
			old_teamid_map[id] = old_teamid;
		}
	}

	// 3) Lecture des noms de work element
	std::map<int, std::string> workelement_name_map;
	std::ifstream work_file("Input/Konatus_instances/work_element_6.4.3.txt");
	while (std::getline(work_file, line)) {
		std::istringstream iss(line);
		std::vector<std::string> tokens;
		std::string token;
		while (iss >> token) tokens.push_back(token);

		// Format attendu : skillsetid gateid name id_work_element
		if (tokens.size() >= 4) {
			int id_work_element = std::stoi(tokens[3]); // 4ᵉ colonne
			std::string work_name = tokens[2];          // 3ᵉ colonne
			workelement_name_map[id_work_element] = work_name;
		}
	}

	// 4) Écriture du fichier solution
	std::ofstream fichier(filename.c_str(), std::ios::out);
	if (!fichier) {
		std::cerr << "Erreur à l'ouverture du fichier !" << std::endl;
		LOG_INFO("End write GeneticAlgo (ERROR opening file)");
		return;
	}

	// ===== NOUVEL EN-TÊTE =====
	fichier << "id_work_element ; workelement_name ; attributepriority ; gateid ; date_update ; load_engage ; duration_engage ; fte_allocated_engage ; percent_accomplished ; team ; start_date ; end_date ; due_start_date ; due_date" << std::endl;
	for (int i = 0; i < _data.nbJobs(); i++) {
		int id = _data.activities()[i].id; // id_work_element / att_id

		// start_date (nouvelle date de début optimisée)
		std::string start_date = _data.convertPeriodToDate(_finalResult.startTime[i]);

		// Team id (New_Team_id)
		int team_id = IS_BASE_NOKIA() ?
			_finalResult.resource[_data.batches(i)] + 1 :
			_data.resources()[_data.affectationActivitiesResources(i)].id;

		// Nom du work element
		std::string workelement_name = workelement_name_map.count(id)
			? workelement_name_map.at(id)
			: "\\N";

		// Ancien team id
		std::string old_teamid = old_teamid_map.count(id) ? old_teamid_map.at(id) : "\\N";

		// Attributs issus du fichier attribut_6.4.3
		std::string attributepriority = "\\N";
		std::string gateid = "\\N";
		std::string date_update = "2025-01-01";
		std::string load_engage = "\\N";
		std::string duration_engage = "\\N";
		std::string fte_allocated = "\\N";
		std::string percent_accomplished = "\\N";
		std::string old_start_engage = "\\N";  // pour due_start_date
		std::string old_end_engage = "\\N";    // pour due_date (OLD_end_date_engage)

		if (attribut_data.count(id)) {
			const auto& vec = attribut_data.at(id);
			// on suppose le même mapping que précédemment :
			// [2] skillsetid
			// [4] attributepriority
			// [8] gateid
			// [9] load_engage
			// [12] duration_engage
			// [15] fte_allocated
			// [16] percent_accomplished
			// [18] OLD_start_date_engage
			// [20] OLD_end_date_demande
			// [21] OLD_end_date_engage  (supposé ici)
			if (vec.size() > 4)  attributepriority = vec[4];
			if (vec.size() > 8)  gateid = vec[8];
			if (vec.size() > 9)  load_engage = vec[9];
			if (vec.size() > 12) duration_engage = vec[12];
			if (vec.size() > 15) fte_allocated = vec[15];
			if (vec.size() > 16) percent_accomplished = vec[16];
			if (vec.size() > 18) old_start_engage = vec[18];
			// OLD_end_date_engage supposée à l'index 21 si présente
			if (vec.size() > 21) old_end_engage = vec[21];
		}

		// Calcul de end_date (nouvelle date de fin optimisée)
		std::string end_date = "\\N";
		try {
			int start_period = _finalResult.startTime[i];

			// Durée dans la même unité que start_period (run=jour ⇒ start_period est en jours)
			int dur_period = 0;
			if (!WITH_SKILLS())
				dur_period = (int)std::ceil(_data.duration(i));
			else
				dur_period = (int)(_data.duration(i) + 0.9); // même logique que create_individual()

			int end_period = start_period + dur_period - 1;
			end_date = _data.convertPeriodToDate(end_period);
		}
		catch (...) {
			end_date = "\\N";
		}

		// due_start_date = OLD_start_date_engage
		std::string due_start_date = old_start_engage;

		// due_date = OLD_end_date_engage
		std::string due_date = old_end_engage;

		// ===== LIGNE FINALE =====
		fichier << id << " ; "
			<< workelement_name << " ; "
			<< attributepriority << " ; "
			<< gateid << " ; "
			<< date_update << " ; "
			<< load_engage << " ; "
			<< duration_engage << " ; "
			<< fte_allocated << " ; "
			<< percent_accomplished << " ; "
			<< team_id << " ; "
			<< start_date << " ; "
			<< end_date << " ; "
			<< due_start_date << " ; "
			<< due_date
			<< std::endl;
	}

	fichier.close();
	LOG_INFO("End write GeneticAlgo");
}

void AbstractGeneticAlgo::write(const std::string& filename, individual& indiv) const {
	/* Writting of the solution returned by the genetic algorithm in a .csv file */
	std::ofstream fichier(filename.c_str(), std::ios::out);
	if (fichier) {
		fichier << "Work_element_id ; Start_date_engage ; Team_id";
		fichier << std::endl;
		int resource;
		for (int i = 0; i < _data.nbJobs(); i++) {
			if (_data.affectationActivitiesTypeResources(i) == 2) {
				resource = indiv.resource[_data.batches(i)] + 1;
			}
			else {
				resource = _data.nbResources();
			}
			fichier << _data.identifiant(i) << " ; " << (int)indiv.startTime[i] << " ; " << resource;
			fichier << std::endl;
		}

		fichier.close();
	}
	else
		std::cerr << "Erreur à l'ouverture !" << std::endl;

	std::cout << "Solution backup done" << std::endl;
}

int AbstractGeneticAlgo::first_valid_activity(commun::sample& tasks, int* startBatch) {
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0) {
			return i;
		}
	}
	return -1;
}

int AbstractGeneticAlgo::random_valid_activity(std::mt19937& gen, commun::sample& tasks, int* startBatch) {
	std::vector<int> valid;
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0) {
			valid.push_back(i);
		}
	}
	if (valid.empty()) {
		throw std::invalid_argument("No activity to assign");
	}
	return valid.at(std::uniform_int_distribution<>(0, valid.size() - 1)(gen));
}

int AbstractGeneticAlgo::random_duration_activity(std::mt19937& gen, commun::sample& tasks, int* startBatch) {
	std::vector<int> valid;
	double maxLongestDuration = 0;
	for (int i = 0; i < _nbActivity; i++) {
		if (IS_BASE_NOKIA())
			if (tasks[i] == 0 && startBatch[_data.batches(i)] == 0 && (_data.affectationActivitiesTypeResources(i) == 1 || _data.duration(i) == 0)) {
				return i;
			}
		if (tasks[i] == 0) {
			if (_data.duration(i) >= maxLongestDuration) {
				maxLongestDuration = _data.duration(i);
			}
		}
	}
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0 && maxLongestDuration == _data.duration(i)) {
			valid.push_back(i);
		}
	}
	if (valid.empty()) {
		throw std::invalid_argument("No activity to assign");
	}
	return valid.at(std::uniform_int_distribution<>(0, valid.size() - 1)(gen));
}

int AbstractGeneticAlgo::random_workload_activity(std::mt19937& gen, commun::sample& tasks, int* startBatch) {
	std::vector<int> valid;
	int maxBiggestLoad = 0;
	for (int i = 0; i < _nbActivity; i++) {
		if (IS_BASE_NOKIA()) {
			if (tasks[i] == 0 && startBatch[_data.batches(i)] == 0 && (_data.affectationActivitiesTypeResources(i) == 1 || _data.duration(i) == 0)) {
				return i;
			}
		}
		else {
			if (tasks[i] == 0 && _data.loadActivity(i) > maxBiggestLoad) {
				maxBiggestLoad = _data.loadActivity(i);
			}
		}
		if (tasks[i] == 0 && maxBiggestLoad == _data.loadActivity(i)) {
			valid.push_back(i);
		}
	}
	if (valid.empty()) {
		throw std::invalid_argument("No activity to assign");
	}
	return valid.at(std::uniform_int_distribution<>(0, valid.size() - 1)(gen));
}

int AbstractGeneticAlgo::random_duedate_activity(std::mt19937& gen, commun::sample& tasks) {
	std::vector<int> valid;
	int minEarliestDate = 1000000;
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0) {
			if (_data.dueDate(i) < minEarliestDate) {
				minEarliestDate = _data.dueDate(i);
			}
		}
	}
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0 && minEarliestDate == _data.dueDate(i)) {
			valid.push_back(i);
		}
	}
	if (valid.empty()) {
		throw std::invalid_argument("No activity to assign");
	}
	return valid.at(std::uniform_int_distribution<>(0, valid.size() - 1)(gen));
}

int AbstractGeneticAlgo::random_releasedate_activity(std::mt19937& gen, commun::sample& tasks) {
	std::vector<int> valid;
	int minEarliestDate = 1000000;
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0) {
			if (_data.releaseDate(i) < minEarliestDate) {
				minEarliestDate = _data.releaseDate(i);
			}
		}
	}
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0 && minEarliestDate == _data.releaseDate(i)) {
			valid.push_back(i);
		}
	}
	if (valid.empty()) {
		throw std::invalid_argument("No activity to assign");
	}
	return valid.at(std::uniform_int_distribution<>(0, valid.size() - 1)(gen));
}

int AbstractGeneticAlgo::random_priority_activity(std::mt19937& gen, commun::sample& tasks) {
	std::vector<int> valid;
	int maxPriority = 0;
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0) {
			if (_data.priority(i) > maxPriority) {
				maxPriority = _data.priority(i);
			}
		}
	}
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0 && maxPriority == _data.priority(i)) {
			valid.push_back(i);
		}
	}
	if (valid.empty()) {
		throw std::invalid_argument("No activity to assign");
	}
	int ind = std::uniform_int_distribution<>(0, valid.size() - 1)(gen);
	return valid.at(ind);
}

int AbstractGeneticAlgo::random_successors_number_activity(std::mt19937& gen, commun::sample& tasks, int* startBatch) {
	std::vector<int> valid;
	int maxSuccessorNumber = 0;
	for (int i = 0; i < _nbActivity; i++) {
		if (IS_BASE_NOKIA()) {
			if (tasks[i] == 0 && startBatch[_data.batches(i)] == 0 && (_data.affectationActivitiesTypeResources(i) == 1 || _data.duration(i) == 0)) {
				return i;
			}
		}
		else
			if (tasks[i] == 0) {
				if ((int)_successors[i].size() > maxSuccessorNumber) {
					maxSuccessorNumber = (int)_successors[i].size();
				}
			}
	}
	for (int i = 0; i < _nbActivity; i++) {
		if (tasks[i] == 0 && maxSuccessorNumber == (int)_successors[i].size()) {
			valid.push_back(i);
		}
	}
	if (valid.empty()) {
		LOG_INFO("INVALID ARGUMENT ");
		throw std::invalid_argument("No activity to assign");
	}
	return valid.at(std::uniform_int_distribution<>(0, valid.size() - 1)(gen));
}

int AbstractGeneticAlgo::select_priority_task(std::mt19937& gen, commun::sample& tasks, individual& indiv, int* startBatch) {
	int indice_max = -1;
	double priority_max = 0;
	for (int i = 0; i < _nbActivity; i++) {
		if (IS_BASE_NOKIA())
			if (tasks[i] == 0 && startBatch[_data.batches(i)] == 0 && (_data.affectationActivitiesTypeResources(i) == 1 || _data.duration(i) == 0)) {
				return i;
			}
		if (priority_max <= indiv.priority[i] && tasks[i] == 0) {
			priority_max = indiv.priority[i];
			indice_max = i;
		}
	}
	return indice_max;
}

double AbstractGeneticAlgo::earliest_finish_time(sample_d& finish_time, int task_id) {
	double time_max = 0;
	for (auto j : _predecessors[task_id]) {
		if (time_max < finish_time[j]) {
			time_max = finish_time[j];
		}
	}
	return time_max + _duration;
}

double AbstractGeneticAlgo::earliest_finish_time_capacity(double earliest, std::vector<std::map<double, double>>& remaining_capacities, int task_id) {
	double t = earliest - _duration;
	double result = 0;
	int r = _resourceActivity;
	bool ok = false;
	if (remaining_capacities[r].count(t) > 0) {
		// Si t est déjà dans le dictionnaire
		auto index1 = remaining_capacities[r].find(t);
		auto index2 = index1;
		auto it2 = index1;
		while (!ok && index1 != remaining_capacities[r].end()) {
			ok = true;
			it2 = index1;
			while (ok && it2->first < index1->first + _data.duration(task_id)) {
				if (_data.loadActivity(task_id) > it2->second) {
					ok = false;
					index1++;
				}
				it2++;
			}
		}
		if (!ok) std::cout << "Erreur !" << std::endl;
		else {
			result = index1->first;
			if (remaining_capacities[r].count(index1->first + _data.duration(task_id)) > 0) {
				index2 = remaining_capacities[r].find(index1->first + _data.duration(task_id));
				it2 = index1;
				while (it2 != index2) {
					it2->second -= _data.loadActivity(task_id);
					it2++;
				}
			}
			else {
				double load;
				index2 = it2;
				it2 = index1;
				while (it2 != index2) {
					it2->second -= _data.loadActivity(task_id);
					it2++;
				}
				load = (it2--)->second;
				remaining_capacities[r].emplace_hint(index2, index1->first + _data.duration(task_id), load);
			}
		}
	}
	else {
		// Si t n'est pas dans le dictionnaire
		auto index1 = remaining_capacities[r].begin();
		double load;
		while (index1->first < t) {
			load = index1->second;
			index1++;
		}
		auto index2 = index1;
		auto it2 = index1;
		ok = true;
		it2 = index1;
		if (_data.loadActivity(task_id) > load) {
			ok = false;
		}
		while (ok && it2->first < t + _data.duration(task_id)) {
			if (_data.loadActivity(task_id) > it2->second) {
				ok = false;
				index1 = it2++;
			}
			it2++;
		}
		if (ok) {
			// Si commencer à t est ok
			result = t;
			index1 = remaining_capacities[r].emplace_hint(index1, t, load);
			if (remaining_capacities[r].count(index1->first + _data.duration(task_id)) > 0) {
				index2 = remaining_capacities[r].find(index1->first + _data.duration(task_id));
				it2 = index1;
				while (it2 != index2) {
					it2->second -= _data.loadActivity(task_id);
					it2++;
				}
			}
			else {
				double load2;
				index2 = it2++;
				it2 = index1;
				while (it2 != index2) {
					it2->second -= _data.loadActivity(task_id);
					it2++;
				}
				load2 = (it2--)->second;
				remaining_capacities[r].emplace_hint(index2, index1->first + _data.duration(task_id), load2);
			}
		}
		else {
			// Si commencer à t n'est pas ok
			index1 = remaining_capacities[r].begin();
			while (index1->first < t) {
				load = index1->second;
				index1++;
			}
			index2 = index1;
			it2 = index1;
			ok = false;
			while (!ok && index1 != remaining_capacities[r].end()) {
				ok = true;
				it2 = index1;
				while (ok && it2->first < index1->first + _data.duration(task_id)) {
					if (_data.loadActivity(task_id) > it2->second) {
						ok = false;
						index1++;
					}
					it2++;
				}
			}
			if (!ok) std::cout << "Erreur !" << std::endl;
			else {
				result = index1->first;
				if (remaining_capacities[r].count(index1->first + _data.duration(task_id)) > 0) {
					index2 = remaining_capacities[r].find(index1->first + _data.duration(task_id));
					it2 = index1;
					while (it2 != index2) {
						it2->second -= _data.loadActivity(task_id);
						it2++;
					}
				}
				else {
					double load2;
					index2 = it2;
					it2 = index1;
					while (it2 != index2) {
						it2->second -= _data.loadActivity(task_id);
						it2++;
					}
					load2 = (it2--)->second;
					remaining_capacities[r].emplace_hint(index2, index1->first + _data.duration(task_id), load2);
				}
			}
		}
	}
	return result + _data.duration(task_id);
}

double AbstractGeneticAlgo::earliest_finish_time_capacity_skills(double earliest, std::vector<sample_d>& remaining_capacities, std::vector<std::vector<sample_d>>& remaining_capacities_skills, int task_id) {
	double t = earliest - _duration;
	bool ok = false;
	while (t < _data.T() - _duration && !ok) {
		ok = true;
		for (int t2 = t; t2 < t + _duration; t2++) {
			if (_load > remaining_capacities[t2][_resourceActivity]) {
				ok = false;
				t = t2;
				break;
			}
			for (int s = 0; s < _data.nbSkills(); s++) {
				if (_data.loadActivitySkill(task_id, s) > remaining_capacities_skills[t2][_resourceActivity][s]) {
					ok = false;
					t = t2;
					break;
				}
			}
		}
		t++;
	}
	if (!ok) std::cout << "Erreur !" << std::endl;
	return t + _duration - 1;
}

double AbstractGeneticAlgo::time_evaluator(individual& indiv) {
	double result = 0;
	for (int i = 0; i < _nbActivity; i++) {
		result += _data.priority(i) * (_data.duration(i) + indiv.startTime[i] - _data.dueDate(i))
			+ _data.tardCost(i) * (_data.duration(i) + indiv.startTime[i] - _data.deadline(i));
	}
	return result;
}

double AbstractGeneticAlgo::completion_time_evaluator(individual& indiv) {
	double result = 0;
	for (int i = 0; i < _nbActivity; i++) {
		if (result < _data.duration(i) + indiv.startTime[i]) {
			result = _data.duration(i) + indiv.startTime[i];
		}
	}
	return result;
}

double AbstractGeneticAlgo::inactivity_evaluator(individual& indiv) {
	double result = 0;
	int T, t;
	if (WITH_SKILLS()) {
		for (int r = 0; r < _nbResources; r++) {
			for (int t = 0; t < _data.timeWindow(); t++) {
				result += _data.capacity(r);
				for (int i = 0; i < _nbActivity; i++) {
					if (indiv.startTime[i] <= t && t <= indiv.startTime[i] + _data.duration(i)
						&& _data.affectationActivitiesResources(i) == r) {
						result -= _data.loadActivity(i);
					}
				}
			}
		}
	}
	else {
		T = _data.timeWindow();
		for (int i = 0; i < _nbActivity; i++) {
			if (_data.duration(i) != 0) {
				if (indiv.startTime[i] < T) {
					if (T < indiv.startTime[i] + _data.duration(i)) {
						t = T;
					}
					else {
						t = indiv.startTime[i] + _data.duration(i);
					}
					result += _data.loadActivity(i) * (t - indiv.startTime[i]);
				}
			}
		}
	}
	return result;
}

double AbstractGeneticAlgo::evaluation(sample_d& scores, double& best, double& avg, double& worst, int& best_id, int& worst_id, commun::sample& indexSortedScores) {
	worst = std::numeric_limits<int>::min();
	best = std::numeric_limits<int>::max();
	avg = 0;
	indexSortedScores.clear();

	for (unsigned i = 0; i < _popSize; ++i) {
		double score = evaluator_function(_pop.at(i));
		scores[i] = score;
		avg += score;
		if (worst < score) {
			worst = score;
			worst_id = i;
		}
		if (best > score) {
			best = score;
			best_id = i;
		}
		if (!WITH_SKILLS()) {
			int index = 0;
			auto it = indexSortedScores.begin();
			int j = 0;
			bool ok = false;
			while (j < (int)indexSortedScores.size() && !ok) {
				if (scores[indexSortedScores[j]] > score) {
					ok = true;
					index = j;
				}
				j++;
			}
			if (!ok) index = (int)indexSortedScores.size();
			indexSortedScores.insert(it + index, i);
		}
	}

	avg /= _popSize;
	return avg;
}

int AbstractGeneticAlgo::roulette_selector(sample_d& scores, std::mt19937& gen) {
	int max = *std::max_element(scores.begin(), scores.end());
	int min = *std::min_element(scores.begin(), scores.end());

	for (auto& i : scores) {
		i = max - i + (min / _sel_param);
	}

	int sum = std::accumulate(scores.begin(), scores.end(), 0);
	int target = std::uniform_int_distribution<>(0, sum - 1)(gen);
	int current = 0;

	for (unsigned i = 0; i < _popSize; ++i) {
		if (current + scores.at(i) > target) {
			return i;
		}
		current += scores.at(i);
	}
	return 0;
}

int AbstractGeneticAlgo::tournament_selector(sample_d& scores, std::mt19937& gen) {
	int best = -1, best_score = std::numeric_limits<int>::max();
	std::set<int> individuals;
	std::uniform_int_distribution<> distribution(0, _popSize - 1);

	while (individuals.size() < (size_t)_sel_param) {
		individuals.emplace(distribution(gen));
	}

	for (auto& i : individuals) {
		if (scores.at(i) < best_score) {
			best_score = scores.at(i);
			best = i;
		}
	}
	return best;
}
