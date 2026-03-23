#include "GeneticAlgo.h"

/* METHODES ASSOCIEES AU MODELE BASIQUE */
/****************************************/


GeneticAlgo::GeneticAlgo(const Data& data) : AbstractGeneticAlgo(data) {
}


void GeneticAlgo::create_individual(mt19937& gen, individual& indiv, int choice) {
	commun::sample affected_tasks;
	for (int i = 0; i < _nbActivity; i++) {
		affected_tasks.push_back(0 - _predecessors[i].size());
	}
	int g = 1;
	sample_d finish_time;
	vector<map<double, double>> remaining_capacities;
	map<double, double> remaining_capacity;

	// for skills
	vector<vector<sample_d>> remaining_capacities_skills;
	vector<sample_d> remaining_capacities_skill;
	vector<sample_d> remaining_capacities_s;
	sample_d remaining_capacity_s;
	sample_d remaining_capacity_skill;

	//  Lire la derni�re date planifi�e si disponible
	std::string last_date_str;
	std::ifstream infile("Output/last_planned_date.txt");
	int start_period_for_zero_acc = -1;
	if (infile) {
		std::getline(infile, last_date_str);
		start_period_for_zero_acc = _data.convertDateToPeriod(last_date_str);
		infile.close();
	}

	if (!WITH_SKILLS()) {
		for (int r = 0; r < _data.nbResources(); r++) {
			remaining_capacity[0] = _data.capacity(r);
			remaining_capacity[infini] = _data.capacity(r);
			remaining_capacities.push_back(remaining_capacity);
			remaining_capacity.clear();
		}
		for (int i = 0; i < _nbActivity; i++) {
			finish_time.push_back(0);
		}
	}
	else {
		setRemainingCapacitySkills(remaining_capacity_s, remaining_capacity_skill, remaining_capacities_skill, remaining_capacities_s, remaining_capacities_skills, finish_time);
	}

	int task_id;
	for (int it = 0; it < _nbActivity; it++) {
		try {
			switch (choice) {
			case 0: task_id = random_valid_activity(gen, affected_tasks); break;
			case 1: task_id = random_priority_activity(gen, affected_tasks); break;
			case 2: task_id = random_duration_activity(gen, affected_tasks); break;
			case 3: task_id = first_valid_activity(affected_tasks); break;
			case 4: task_id = random_workload_activity(gen, affected_tasks); break;
			case 5: task_id = random_duedate_activity(gen, affected_tasks); break;
			case 6: task_id = random_releasedate_activity(gen, affected_tasks); break;
			case 7: task_id = random_successors_number_activity(gen, affected_tasks); break;
			default: task_id = select_priority_task(gen, affected_tasks, indiv); break;
			}

			if (!WITH_SKILLS())
				_duration = _data.duration(task_id);
			else
				_duration = (int)(_data.duration(task_id) + 0.9);

			_load = _data.loadActivity(task_id);
			_resourceActivity = _data.affectationActivitiesResources(task_id);

			// Appliquer la date min si %acc == 0
			double percent_acc = _data.getPercentAccomplished()[task_id];
			double earliest_by_pred = earliest_finish_time(finish_time, task_id);
			double earliest;

			if (percent_acc == 0 && start_period_for_zero_acc > 0) {
				earliest = std::max((double)start_period_for_zero_acc, earliest_by_pred);
			}
			else {
				earliest = earliest_by_pred;
			}

			//  Calcul avec ou sans comp�tences
			if (!WITH_SKILLS())
				finish_time[task_id] = earliest_finish_time_capacity(earliest, remaining_capacities, task_id);
			else
				finish_time[task_id] = earliest_finish_time_capacity_skills(earliest, remaining_capacities_s, remaining_capacities_skills, task_id);

			indiv.priority[task_id] = _nbActivity - g;
			g++;
			affected_tasks[task_id] = 1;

			if (WITH_SKILLS()) {
				for (int t = finish_time[task_id] - _duration; t < finish_time[task_id]; t++) {
					remaining_capacities_s[t][_resourceActivity] -= _load;
					for (int s = 0; s < _data.nbSkills(); s++) {
						remaining_capacities_skills[t][_resourceActivity][s] -= _data.loadActivitySkill(task_id, s);
					}
				}
			}

			for (auto j : _successors[task_id]) {
				affected_tasks[j]++;
			}

			indiv.startTime[task_id] = finish_time[task_id] - _duration;

		}
		catch (const std::exception& e) {
			LOG_ERROR(e.what());
			std::cerr << e.what() << std::endl;
			throw;
		}
	}
}



void GeneticAlgo::setRemainingCapacitySkills(sample_d& remaining_capacity_s, sample_d& remaining_capacity_skill, std::vector<sample_d>& remaining_capacities_skill, std::vector<sample_d>& remaining_capacities_s, std::vector<std::vector<sample_d>>& remaining_capacities_skills, sample_d& finish_time)
{
	for (int r = 0; r < _nbResources; r++) {
		remaining_capacity_s.push_back(_data.capacity(r));
		remaining_capacity_skill.clear();
		for (int s = 0; s < _data.nbSkills(); s++) {
			remaining_capacity_skill.push_back(_data.capacitySkill(r, s));
		}
		remaining_capacities_skill.push_back(remaining_capacity_skill);
	}
	for (int t = 0; t < _data.T(); t++) {
		remaining_capacities_s.push_back(remaining_capacity_s);
		remaining_capacities_skills.push_back(remaining_capacities_skill);
	}
	remaining_capacity_s.clear();
	for (int i = 0; i < _nbActivity; i++) {
		finish_time.push_back(_data.earliestStartDate(i) + (int)(_data.duration(i) * +0.9));
	}
}

double GeneticAlgo::evaluator_function(individual& individual) {
	return _weightLateness * time_evaluator(individual) + _weightInactivity * inactivity_evaluator(individual);
}

void GeneticAlgo::crossover(individual& first, individual& second, mt19937& gen)
{
	if (uniform_real_distribution<>(0, 1)(gen) < _cross_prob) {
		int cut = uniform_int_distribution<>(1, _nbActivity - 2)(gen);
		for (int i = cut; i < _nbActivity; ++i) {
			swap((first.priority)[i], (second.priority)[i]);
		}
	}
}

individual GeneticAlgo::mutation(individual& indiv, mt19937& gen)
{
	std::uniform_real_distribution<> distribution(0, 1);
	std::uniform_int_distribution<> priority(0, _nbActivity);
	for (int i = 0; i < _nbActivity; ++i) {
		if (distribution(gen) < _mutate_prob) {
			indiv.priority[i] = priority(gen);
		}
	}
	create_individual(gen, indiv, -1);
	return indiv;
}

GeneticAlgo::~GeneticAlgo() {

}
