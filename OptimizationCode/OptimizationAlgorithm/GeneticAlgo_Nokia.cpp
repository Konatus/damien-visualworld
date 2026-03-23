#include "GeneticAlgo_Nokia.h"


/* METHODES ASSOCIEES AU MODELE BASIQUE */
/****************************************/

GeneticAlgo_Nokia::GeneticAlgo_Nokia(const Data & data) : AbstractGeneticAlgo(data), _mutate_prob_resource(0.05), _cross_prob_resource(0.5), _weightCompletion(Parameters::appliParam->getWeightCompletion()), _weightDuration(Parameters::appliParam->getWeightDuration()), _weightCost(Parameters::appliParam->getWeightCost()){

}

double GeneticAlgo_Nokia::project_duration_evaluator(individual& indiv)
{
	double result = 0;
	int *startBatch, *endBatch;
	monNewTInit(startBatch, int, _data.nbBatchs(), 0);
	monNewTInit(endBatch, int, _data.nbBatchs(), 0);
	for (int i = 0; i < _nbActivity; i++) {
		if (startBatch[_data.batches(i)] > indiv.startTime[i]) {
			startBatch[_data.batches(i)] = indiv.startTime[i];
		}
		if (endBatch[_data.batches(i)] < indiv.startTime[i]+_data.duration(i)) {
			endBatch[_data.batches(i)] = indiv.startTime[i]+_data.duration(i);
		}
	}
	for (int i = 0; i < _data.nbBatchs(); i++) {
		result += endBatch[i] - startBatch[i];
	}
	return result;
}

double GeneticAlgo_Nokia::cost_evaluator(individual& indiv)
{
	double result = 0;
	/*for (int i = 0; i < _nbActivity; i++) {
		if (_data.affectationActivitiesTypeResources(i) == 2) {
			result += _data.cost(indiv.resource[i])*_data.loadActivity(i)*_data.duration(i);
		}
	}*/
	return result;
}

void GeneticAlgo_Nokia::create_individual(mt19937& gen, individual& indiv, int choice) {
	// Initialisation of selectable tasks and start_time
	commun::sample affected_tasks;
	for (int i = 0; i < _nbActivity; i++) {
		affected_tasks.push_back(0 - _predecessors[i].size());
	}
	int g = 1;
	int* startBatch;
	monNewTInit(startBatch, int, _data.nbBatchs(), -1);
	sample_d finish_time;
	vector<map<double, double>> remaining_capacities;
	map<double, double> remaining_capacity;
	for (int r = 0; r < _data.nbResources() - 1; r++) {
		remaining_capacity[0] = _data.capacity(r);
		remaining_capacity[infini] = _data.capacity(r);
		remaining_capacities.push_back(remaining_capacity);
		remaining_capacity.clear();
	}
	for (int i = 0; i < _nbActivity; i++) {
		finish_time.push_back(0);
	}
	for (int it = 0; it < _nbActivity; it++) {
		// Select activity 
		int task_id;
		switch (choice) {
		case 0: {
			task_id = random_valid_activity(gen, affected_tasks, startBatch);
			break;
		}
		case 1: {
			task_id = random_duration_activity(gen, affected_tasks, startBatch);
			break;
		}
		case 2: {
			task_id = first_valid_activity(affected_tasks, startBatch);
			break;
		}
		case 3: {
			task_id = random_successors_number_activity(gen, affected_tasks, startBatch);
			break;
		}
		default: {
			task_id = select_priority_task(gen, affected_tasks, indiv, startBatch);
			break;
		}
		}
		_duration = _data.duration(task_id);
		_load = _data.loadActivity(task_id);
		_resourceActivity = indiv.resource[_data.batches(task_id)];
		// Calculate earliest finish time (in terms of precedence only)
		double earliest = earliest_finish_time(finish_time, task_id);
		// Calculate earliest finish time (in terms of precedence and capacity)
		if (_data.duration(task_id) != 0 && _data.affectationActivitiesTypeResources(task_id) == 2) {
			earliest = earliest_finish_time_capacity(earliest, remaining_capacities, task_id);
		}
		finish_time[task_id] = earliest;
		//cout << finish_time[task_id] << endl;
		// Update the priority of the activity in chromosome
		indiv.priority[task_id] = _nbActivity - g;
		// Update the parameters and the data
		g++;
		affected_tasks[task_id] = 1;
		for (auto j : _successors[task_id]) {
			affected_tasks[j]++;
		}
		if (startBatch[_data.batches(task_id)] == -1) {
			startBatch[_data.batches(task_id)] = 0;
		}
		//indiv.objective1 += _data.priority(task_id) * (finish_time[task_id] - _data.dueDate(task_id)) + _data.tardCost(task_id) * (finish_time[task_id] - _data.deadline(task_id));

		indiv.startTime[task_id] = finish_time[task_id] - _duration;
	}
}

double GeneticAlgo_Nokia::evaluator_function(individual& individual) {
	return _weightCompletion * completion_time_evaluator(individual) + _weightDuration*project_duration_evaluator(individual) + _weightCost*cost_evaluator(individual)+ _weightInactivity*inactivity_evaluator(individual);
}

void GeneticAlgo_Nokia::crossover(individual& first, individual& second, mt19937& gen)
{
	if (uniform_real_distribution<>(0, 1)(gen) < _cross_prob) {
		int cut = uniform_int_distribution<>(1, _nbActivity - 2)(gen);
		for (int i = cut; i < _nbActivity; ++i) {
			swap((first.priority)[i], (second.priority)[i]);
		}
	}
	if (uniform_real_distribution<>(0, 1)(gen) < _cross_prob_resource) {
		int cut = uniform_int_distribution<>(1, _data.nbBatchs() - 2)(gen);
		for (int i = cut; i < _data.nbBatchs(); ++i) {
			swap((first.resource)[i], (second.resource)[i]);
		}
	}
}

individual GeneticAlgo_Nokia::mutation(individual& indiv, mt19937& gen)
{
	std::uniform_real_distribution<> distribution(0, 1);
	std::uniform_int_distribution<> priority(0, _nbActivity-1);
	std::uniform_int_distribution<> resource(0, _data.nbResources()-2);
	for (int i = 0; i < _nbActivity; ++i) {
		if (distribution(gen) < _mutate_prob  && _data.affectationActivitiesTypeResources(i) == 2 && _data.duration(i)!=0) {
			indiv.priority[i] = priority(gen);
		}
	}
	for (int i = 0; i < _data.nbBatchs(); ++i) {
		if (distribution(gen) < _mutate_prob_resource && _data.affectationBatchTypeResources(i)==2) {
			indiv.resource[i] = resource(gen);
		}
	}
	create_individual(gen, indiv, -1);
	return indiv;
}


GeneticAlgo_Nokia::~GeneticAlgo_Nokia() {

}
