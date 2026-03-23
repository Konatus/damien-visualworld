#include "Data.h"


using namespace std;

Data::Data() : _nbResources(0), _nbJobs(0), _activities(0), _timeWindow(40), _nbSkills(0), _solution(false) {
}

//by wi�al

const std::vector<int>& Data::getPercentAccomplished() const {
	return percentAccomplished;
}

void Data::loadPercentAccomplished(const std::string& filename) {
	std::ifstream infile(filename);
	std::string line;
	percentAccomplished.clear();

	if (!infile.is_open()) {
		throw std::runtime_error("Impossible d'ouvrir le fichier " + filename);
	}

	while (std::getline(infile, line)) {
		if (line.empty()) continue;
		std::istringstream iss(line);
		std::vector<std::string> tokens;
		std::string value;
		while (iss >> value) {
			tokens.push_back(value);
		}
		if (tokens.size() > 16) {
			percentAccomplished.push_back(std::stoi(tokens[16]));  // colonne 17
		}
	}
	infile.close();
}

int Data::findIndexPrimaryDate(vector<string>& dates) {
	size_t size = 11;
	char* minDate = new char[size];
	char* date = new char[size];
	strncpy(minDate, dates[0].c_str(), size);
	int indexMin = 0;
	for (int i = 1; i < dates.size(); i++) {
		strncpy(date, dates[i].c_str(), size);
		if (strncmp(minDate, date, 10) > 0) {
			minDate = date;
			indexMin = i;
		}
	}
	return indexMin;
}

int Data::convertDateToPeriod(string dateMin, string date) const {

	int days, period, week, month;
	dateMin[4] = dateMin[7] = '\0';
	struct tm tmdateMin = { 0 };
	tmdateMin.tm_year = atoi(&dateMin[0]);
	tmdateMin.tm_mon = atoi(&dateMin[5]);
	tmdateMin.tm_mday = atoi(&dateMin[8]);

	struct tm tmdateActual = { 0 };
	tmdateActual.tm_year = atoi(&date[0]);
	tmdateActual.tm_mon = atoi(&date[5]);
	tmdateActual.tm_mday = atoi(&date[8]);

	time_t t_min = mktime(&tmdateMin);
	time_t t_actual = mktime(&tmdateActual);
	days = (int)(difftime(t_actual, t_min) / 86400 + 0.00005);

	week = (int)(days / 7);
	month = (int)(days / 30);

	if (Parameters::appliParam->getSizeRun() == "day" || Parameters::appliParam->getSizeRun() == "jour") period = days;
	else if (Parameters::appliParam->getSizeRun() == "week" || Parameters::appliParam->getSizeRun() == "semaine") period = week;
	else period = month;

	return period;
}




int Data::convertDateToPeriod(const std::string& date) const {
	return convertDateToPeriod(_firstDate, date);  // _firstDate est utilis� comme base
}




string Data::convertPeriodToDate(int period) const {
	set<int> list31days = { 1,3,5,7,8,10,12 };
	set<int> list30days = { 4,6,9,11 };
	string firstDate(_firstDate);
	firstDate[4] = firstDate[7] = '\0';
	struct tm tmdateMin = { 0 };
	tmdateMin.tm_year = atoi(&firstDate[0]);
	tmdateMin.tm_mon = atoi(&firstDate[5]);
	tmdateMin.tm_mday = atoi(&firstDate[8]);
	int j, m, y;

	if (Parameters::appliParam->getSizeRun() == "week" || Parameters::appliParam->getSizeRun() == "semaine") {
		for (int i = 0; i < period; i++) {
			if ((list31days.count(tmdateMin.tm_mon) != 0 && tmdateMin.tm_mday + 7 <= 31) || (list30days.count(tmdateMin.tm_mon) != 0 && tmdateMin.tm_mday + 7 <= 30) || (tmdateMin.tm_mon == 2 && tmdateMin.tm_mday + 7 <= 28) || (tmdateMin.tm_mon == 2 && tmdateMin.tm_mday + 7 == 29 && IsLeapYear(tmdateMin.tm_year))) {
				j = tmdateMin.tm_mday + 7;
				m = tmdateMin.tm_mon;
				y = tmdateMin.tm_year;
			}
			else if ((list31days.count(tmdateMin.tm_mon) != 0 && tmdateMin.tm_mon != 12)) {
				j = tmdateMin.tm_mday + 7 - 31;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			else if (tmdateMin.tm_mon == 12) {
				j = tmdateMin.tm_mday + 7 - 31;
				m = 1;
				y = tmdateMin.tm_year + 1;
			}
			else if ((list30days.count(tmdateMin.tm_mon) != 0)) {
				j = tmdateMin.tm_mday + 7 - 30;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			else if (IsLeapYear(tmdateMin.tm_year)) {
				j = tmdateMin.tm_mday + 7 - 29;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			else {
				j = tmdateMin.tm_mday + 7 - 28;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			tmdateMin.tm_mday = j;
			tmdateMin.tm_mon = m;
			tmdateMin.tm_year = y;
		}
	}
	else if (Parameters::appliParam->getSizeRun() == "month" || Parameters::appliParam->getSizeRun() == "mois") {
		for (int i = 0; i < period; i++) {
			if (tmdateMin.tm_mon != 12) {
				j = 1;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			else {
				j = 1;
				m = 1;
				y = tmdateMin.tm_year + 1;
			}
			tmdateMin.tm_mday = j;
			tmdateMin.tm_mon = m;
			tmdateMin.tm_year = y;
		}
	}
	else if (Parameters::appliParam->getSizeRun() == "day" || Parameters::appliParam->getSizeRun() == "jour") {
		int jours = period + 2 * (int)(period / 5);
		for (int i = 0; i < jours; i++) {
			if ((list31days.count(tmdateMin.tm_mon) != 0 && tmdateMin.tm_mday + 1 <= 31) || (list30days.count(tmdateMin.tm_mon) != 0 && tmdateMin.tm_mday + 1 <= 30) || (tmdateMin.tm_mon == 2 && tmdateMin.tm_mday + 1 <= 28) || (tmdateMin.tm_mon == 2 && tmdateMin.tm_mday + 1 == 29 && IsLeapYear(tmdateMin.tm_year))) {
				j = tmdateMin.tm_mday + 1;
				m = tmdateMin.tm_mon;
				y = tmdateMin.tm_year;
			}
			else if ((list31days.count(tmdateMin.tm_mon) != 0 && tmdateMin.tm_mon != 12)) {
				j = tmdateMin.tm_mday + 1 - 31;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			else if (tmdateMin.tm_mon == 12) {
				j = tmdateMin.tm_mday + 1 - 31;
				m = 1;
				y = tmdateMin.tm_year + 1;
			}
			else if ((list30days.count(tmdateMin.tm_mon) != 0)) {
				j = tmdateMin.tm_mday + 1 - 30;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			else if (IsLeapYear(tmdateMin.tm_year)) {
				j = tmdateMin.tm_mday + 1 - 29;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			else {
				j = tmdateMin.tm_mday + 1 - 28;
				m = tmdateMin.tm_mon + 1;
				y = tmdateMin.tm_year;
			}
			tmdateMin.tm_mday = j;
			tmdateMin.tm_mon = m;
			tmdateMin.tm_year = y;
		}
	}
	string str = to_string(tmdateMin.tm_year) + "-";
	if (tmdateMin.tm_mon < 10) str += "0" + to_string(tmdateMin.tm_mon) + "-";
	else str += to_string(tmdateMin.tm_mon) + "-";
	if (tmdateMin.tm_mday < 10) str += "0" + to_string(tmdateMin.tm_mday);
	else str += to_string(tmdateMin.tm_mday);
	return str;
}

void Data::readSkills(const string& filename) {
	LOG_INFO("Start read file " + filename);
	ifstream is(filename);

	if (is) {
		string line, tmp;
		_nbSkills = 0;
		// Lecture des donn�es du fichier et cr�ation de la liste des ar�tes
		while (getline(is, line) && !line.empty()) {
			//getline(is, line);
			_nbSkills++;
		}
	}
	else {
		throw "ERROR in Data::readSkills() - Impossible to open dataFile";
	}
	is.close();
	LOG_INFO("END read and close file " + filename);
}


void Data::readResources(const string& filename) {
	LOG_INFO("Start read file " + filename);
	ifstream is(filename);

	if (is) {
		string line, tmp;
		int T(0);
		if (!IS_BASE_NOKIA())
			_nbResources = 0;
		// Lecture des donn�es du fichier et cr�ation de la liste des ar�tes
		string name;
		int id(-1), teamid, skill;
		double capacity;
		while (getline(is, line) && !line.empty()) {
			capacity = -999;
			teamid = -999;

			//getline(is, line);
			istringstream iss(line);
			if (!IS_BASE_NOKIA()) {
				if (WITH_SKILLS())
					iss >> id >> capacity >> tmp >> tmp >> tmp >> teamid >> tmp >> skill;
				else
					iss >> id >> capacity >> tmp >> tmp >> tmp >> teamid >> tmp >> tmp;
			}
			else {
				iss >> tmp >> tmp >> teamid >> tmp >> tmp >> capacity >> tmp >> tmp;
			}
			if (capacity == -999 || teamid == -999) {
				LOG_ERROR("Error when read file " + filename + " verify content of row: " + line);
				throw "ERROR in Data::readResources() - incorrect struc dataFile";
			}

			if (_indexResource.count(teamid) <= 0) {
				if (!IS_BASE_NOKIA()) {
					_resources.push_back(resource(teamid, capacity * Parameters::appliParam->getHoursByPeriod() / 100));
					_indexResource[teamid] = _nbResources;
					if (Parameters::appliParam->getSkills()) {
						_resources[_indexResource[teamid]].capacitySkill[skill] = capacity * Parameters::appliParam->getHoursByPeriod() / 100;
					}
					_nbResources++;
				}
			}
			else {
				_resources[_indexResource[teamid]].capacity += capacity * Parameters::appliParam->getHoursByPeriod() / 100;
				if (WITH_SKILLS()) {
					_resources[_indexResource[teamid]].capacitySkill[skill] += capacity * Parameters::appliParam->getHoursByPeriod() / 100;
				}
			}
		}
	}
	else {
		throw "ERROR in Data::readResources() - Impossible to open dataFile";
	}

	is.close();
	_capacity = new double[_nbResources];
	if (WITH_SKILLS())
		_capacitySkill = new double* [_nbResources];
	for (int r = 0; r < _nbResources; r++) {
		_capacity[r] = _resources[r].capacity;
		if (WITH_SKILLS()) {
			monNewTInit(_capacitySkill[r], double, _nbSkills, 0);
			for (map<int, double>::iterator it = _resources[r].capacitySkill.begin(); it != _resources[r].capacitySkill.end(); ++it) {
				_capacitySkill[r][it->first - 1] = it->second;
			}
		}
	}

	LOG_INFO("END read and close file " + filename);
}

void Data::readAffectations(const string& filename) {
	LOG_INFO("Start read file " + filename);
	_affectationActivitiesResources = new int[_nbJobs];
	ifstream is(filename);

	if (is) {
		string line, tmp;
		int T(0);
		// Lecture des donn�es du fichier et cr�ation de la liste des ar�tes
		char type;
		string name;
		int team_id, activity_id;
		while (getline(is, line) && !line.empty()) {

			team_id = -999;
			activity_id = -999;
			//getline(is, line);
			istringstream iss(line);

			if (IS_BASE_7())
				iss >> team_id >> activity_id;
			else
				iss >> activity_id >> team_id;

			if (activity_id == -999 || team_id == -999) {
				LOG_ERROR("Error when read file " + filename + " verify content of row: " + line);
				throw "ERROR in Data::readAffectations() - incorrect struc dataFile";
			}

			if (_indexActivity.count(activity_id) > 0) {
				_activities[_indexActivity[activity_id]].resource = _indexResource[team_id];
				_affectationActivitiesResources[_indexActivity[activity_id]] = _indexResource[team_id];
			}

		}
	}
	else {
		throw "ERROR in Data::readAffectations() - Impossible to open dataFile";
	}

	is.close();
	LOG_INFO("END read and close file " + filename);
}


void Data::readTeams(const string& filename) {
	//_affectationActivitiesTypeResources = new int[_nbJobs];
	ifstream is(filename);

	if (is) {
		string line, tmp;
		// Lecture des donn�es du fichier et cr�ation de la liste des ar�tes
		char type;
		string name;
		int team_id, job_type;
		while (getline(is, line) && !line.empty()) {

			job_type = -999;
			//getline(is, line);
			istringstream iss(line);

			iss >> team_id >> tmp >> tmp >> tmp >> job_type;
			if (job_type == -999) {
				LOG_ERROR("Error when read file "+ filename+" verify content of row: "+ line);
				throw "ERROR in Data::readTeams() - incorrect struc dataFile";
			}
					

			if (_indexResource.count(team_id) <= 0) {
				_indexResource[team_id] = _nbResources;
				_resources.push_back(resource(team_id));
				_resources[_indexResource[team_id]].type = job_type;
				_nbResources++;
			}
		}
	}
	else {
		throw "ERROR in Data::readTeams() - Impossible to open dataFile";
	}

	is.close();
}

void Data::readProjectByActivity(const string& filename) {
	LOG_INFO("Start read file " + filename);
	ifstream is(filename);

	if (is) {
		string line, tmp;
		int T(0);
		// Lecture des donn�es du fichier et cr�ation de la liste des ar�tes
		_nbJobs = 0;
		int index = 0;
		char type;
		string name;
		int activity_id, program_id;
		while (getline(is, line) && !line.empty()) {



			//getline(is, line);
			istringstream iss(line);
			if (!IS_BASE_NOKIA()) {
				iss >> activity_id >> program_id >> tmp;
				index = _nbJobs + 1;
			}
			else {
				iss >> activity_id >> tmp >> program_id;
				index = activity_id;
			}

			/*if (_indexActivity.count(activity_id) == 0) {
				_indexActivity[activity_id] = _nbJobs;
				_activities.push_back(task());
				_activities[_indexActivity[activity_id]].id = activity_id;
				_activities[_indexActivity[activity_id]].project = program_id;
				//_activities[_indexActivity[activity_id]].short_id = short_id;
				//_indexActivity[short_id] = _indexActivity[activity_id];
				_nbJobs++;
			}*/

			if (_indexActivity.count(index) == 0) {
				_indexActivity[index] = _nbJobs;
				_activities.push_back(task());
				_activities[_indexActivity[index]].id = index;
				_activities[_indexActivity[index]].project = program_id;
				if (IS_BASE_NOKIA())
					_activities[_indexActivity[index]].batch = program_id - 1;
				_nbJobs++;
			}
		}
	}
	else {
		throw "ERROR in Data::readResources() - Impossible to open dataFile";
	}

	is.close();
	LOG_INFO("END read and close file " + filename);
}

void Data::readActivities(const string& filename) {
	LOG_INFO("Start read file " + filename);

	ifstream is(filename);

	_duration = new double[_nbJobs];
	_earliestStartDate = new double[_nbJobs];
	_loadActivity = new double[_nbJobs];
	if (!IS_BASE_NOKIA()) {
		_priority = new double[_nbJobs];
		_dueDate = new int[_nbJobs];
		_deadline = new int[_nbJobs];
		_releaseDate = new int[_nbJobs];
		_tardinessCost = new double[_nbJobs];
		_loadActivitySkill = new double* [_nbJobs];
	}
	else {

		_affectationActivitiesTypeResources = new int[_nbJobs];
		_batchActivity = new int[_nbJobs];
		_identifiant = new int[_nbJobs];
	}
	if (is) {
		string line;
		// Lecture des donn�es du fichier et creation des tableaux de donn�es
		char type;
		double T = 0;
		string name, tmp;
		int activity_id, skill_id, phase_id, batch_id, job_type;
		double load, fte, duration, attributePriority;

		string startDate = "", endDate = "";
		string startDate_sol = "", endDate_sol = "";
		vector<string> startDates;
		vector<string> endDates;
		vector<string> startDates_sol;
		if (!IS_BASE_NOKIA()) {
			for (int i = 0; i < _nbJobs; i++) {
				startDates.push_back(startDate);
				endDates.push_back(endDate);
				startDates_sol.push_back(startDate_sol);
			}
		}
		while (getline(is, line) && !line.empty()) {

			endDate = "-999";
			job_type = -999;
			//getline(is, line);
			istringstream iss(line);
			if (!IS_BASE_NOKIA()) {
				if(WITH_SKILLS())
					iss >> tmp >> activity_id >> skill_id >> tmp >> attributePriority >> tmp >> tmp >> tmp >> phase_id >> load >> tmp >> tmp >> tmp >> tmp >> tmp >> fte >> tmp >> startDate >> startDate_sol >> tmp >> endDate >> tmp >> tmp >> tmp;
				else
					iss >> tmp >> activity_id >> tmp >> tmp >> attributePriority >> tmp >> tmp >> tmp >> phase_id >> load >> tmp >> tmp >> tmp >> tmp >> tmp >> fte >> tmp >> startDate >> startDate_sol >> tmp >> endDate >> tmp >> tmp >> tmp;
			}
			else {
				iss >> tmp >> activity_id >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> load >> tmp >> tmp >> duration >> tmp >> tmp >> fte >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> batch_id >> tmp >> job_type;
			}
			if (endDate == "-999" && job_type == -999) {
				LOG_ERROR("Error when read file " + filename + " verify content of row: " + line);
				throw "ERROR in Data::readActivities() - incorrect struc dataFile";
			}

			if (!IS_BASE_NOKIA())
				duration = load / fte;
			if (_indexActivity.count(activity_id) != 0) {
				if (!IS_BASE_NOKIA()) {
					_activities[_indexActivity[activity_id]].priority = 6 - attributePriority;
					_activities[_indexActivity[activity_id]].phase = phase_id;
				}
				if (Parameters::appliParam->getSizeRun() == "week" || Parameters::appliParam->getSizeRun() == "semaine") {
					_activities[_indexActivity[activity_id]].load = fte * Parameters::appliParam->getHoursByPeriod();
					_activities[_indexActivity[activity_id]].duration = duration / 5;
				}
				else if (Parameters::appliParam->getSizeRun() == "month" || Parameters::appliParam->getSizeRun() == "mois") {
					_activities[_indexActivity[activity_id]].load = fte * Parameters::appliParam->getHoursByPeriod();
					_activities[_indexActivity[activity_id]].duration = duration / 22;
				}
				else {
					_activities[_indexActivity[activity_id]].load = fte * Parameters::appliParam->getHoursByPeriod();
					_activities[_indexActivity[activity_id]].duration = duration;
				}
				if (!IS_BASE_NOKIA()) {
					_activities[_indexActivity[activity_id]].duration = (double)(round(_activities[_indexActivity[activity_id]].duration * 1000) / 1000);

					_activities[_indexActivity[activity_id]].tardCost = 0;
					_activities[_indexActivity[activity_id]].resource = 0;
					startDates[_indexActivity[activity_id]] = startDate;
					/*if (_solution) {
						startDates_sol[_indexActivity[activity_id]] = startDate_sol;
						_activities[_indexActivity[activity_id]].sol_str = startDate_sol;
					}*/
					endDates[_indexActivity[activity_id]] = endDate;
					if (Parameters::appliParam->getSkills()) {
						_activities[_indexActivity[activity_id]].loadSkill[skill_id] = fte * Parameters::appliParam->getHoursByPeriod();
					}
				}
				else {
					_activities[_indexActivity[activity_id]].resource = job_type;
				}
				T += _activities[_indexActivity[activity_id]].duration;
			}
		}

		/* Calculer la premi�re date qui correspondra � la p�riode 0 et trouver � quelle tache �a correspond pour le mettre dans le vector _rDate */
		if (!IS_BASE_NOKIA()) {
			//int indexFirstDate = findIndexPrimaryDate(startDates);
			//_firstDate = startDates[indexFirstDate];
			
				_firstDate = "2025-01-01"; // base 3
				//_firstDate = "2025-02-04"; // base 4
			

		}
		else {
			_firstDate = "2022-01-01\0";
		}

		/* Calculer les p�riodes des autres taches en fonction des dates de fin */
		int period = 0;
		string date(_firstDate);
		for (auto i = 0; i < _nbJobs; i++) {
			_duration[i] = _activities[i].duration;
			_loadActivity[i] = _activities[i].load;
			if (!IS_BASE_NOKIA()) {
				period = convertDateToPeriod(date, startDates[i]);
				period = period - 2 * (int)(period / 7);
				_activities[i].releaseDate = period;
				period = convertDateToPeriod(date, endDates[i]);
				period = period - 2 * (int)(period / 7);
				_activities[i].dueDate = period;
				_activities[i].deadline = period;
				if (_solution) {
					period = convertDateToPeriod(date, startDates_sol[i]);
					period = period - 2 * (int)((period + 1) / 7);
					_activities[i].sol = period;

				}

				_priority[i] = _activities[i].priority;
				_dueDate[i] = _activities[i].dueDate;
				_deadline[i] = _activities[i].deadline;
				_releaseDate[i] = _activities[i].releaseDate;
				_tardinessCost[i] = _activities[i].tardCost;

				if (WITH_SKILLS()) {
					_loadActivity[i] = 0;
					monNewTInit(_loadActivitySkill[i], double, _nbSkills, 0);
					for (map<int, double>::iterator it = _activities[i].loadSkill.begin(); it != _activities[i].loadSkill.end(); ++it) {
						_loadActivitySkill[i][it->first - 1] = it->second;
						_loadActivity[i] += _loadActivitySkill[i][it->first - 1];
					}
				}
			}
			else {
				_batchActivity[i] = _activities[i].batch;
				_identifiant[i] = _activities[i].id;
				_affectationActivitiesTypeResources[i] = _activities[i].resource;
			}
		}
		_horizon = (int)(T + 0.99999);
		if (!IS_BASE_NOKIA())
			_timeWindow = (int)(_horizon * 0.05);
	}
	else {
		throw "ERROR in Data::readActivities() - Impossible to open dataFile";
	}
	is.close();
	LOG_INFO(("END read and close file " + filename).data());
}

void Data::readBatches(const string& filename) {
	LOG_INFO("Start read file " + filename);
	ifstream is(filename);

	if (is) {
		string line;
		// Lecture des donn�es du fichier et creation des tableaux de donn�es
		char type;
		double T = 0;
		string name, tmp;
		_nbBatchs = 0;
		while (getline(is, line) && !line.empty()) {

			//getline(is, line);
			istringstream iss(line);

			//iss >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> load >> tmp >> tmp >> tmp >> tmp >> tmp >> fte >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> tmp >> batch_id >> tmp >> job_type;

			_nbBatchs++;
		}
	}
	else {
		throw "ERROR in Data::readBatches() - Impossible to open dataFile";
	}
	is.close();
	LOG_INFO("END read and close file " + filename);
}

void Data::readPrecedences(const string& filename) {
	LOG_INFO("Start read file " + filename);
	_succList = new int* [_nbJobs];
	_predList = new int* [_nbJobs];
	_nbSuccActivity = new int[_nbJobs];
	_nbPredActivity = new int[_nbJobs];
	ifstream is(filename);
	if (is) {
		string line;
		// Lecture des donn�es du fichier
		int tmp;

		int task_id, pred_id;
		while (getline(is, line) && !line.empty()) {

			task_id = -999;
			//getline(is, line);
			istringstream iss(line);

			iss >> tmp >> pred_id >> task_id;
			if (task_id == -999) {
				LOG_ERROR("Error when read file " + filename + " verify content of row: " + line);
				throw "ERROR in Data::readPrecedences() - incorrect struc dataFile";
			}

			if (_indexActivity.count(task_id) != 0 && _indexActivity.count(pred_id) != 0)
				if (IS_BASE_NOKIA() || (_activities[_indexActivity[pred_id]].phase <= _activities[_indexActivity[task_id]].phase || _activities[_indexActivity[pred_id]].project != _activities[_indexActivity[task_id]].project)) {

					_activities[_indexActivity[task_id]].predecessors.push_back(_indexActivity[pred_id]);
					_activities[_indexActivity[pred_id]].successors.push_back(_indexActivity[task_id]);
				}
		}
	}
	else {
		throw "ERROR in Data::readPrecedences() - Impossible to open dataFile";
	}

	is.close();
	LOG_INFO("END read and close file " + filename);
}

void Data::readData(const string& batchFilename, const string& resourceFilename, const string& activityFilename, const string& precedenceFilename, const string& teamFilename, const string& affectationFilename, const string& projectActivityFilename, const string& skillsFilename) {
	LOG_INFO("Start read and initialize data from all inputs");
	if (WITH_SKILLS()) {
		readSkills(skillsFilename);
	}
	if (IS_BASE_NOKIA())
		readTeams(teamFilename);
	readResources(resourceFilename);
	if (IS_BASE_NOKIA()) 
		readBatches(batchFilename);
	readProjectByActivity(projectActivityFilename);
	readActivities(activityFilename);
	readPrecedences(precedenceFilename);
	if (!IS_BASE_NOKIA()) {
		readAffectations(affectationFilename);
	}
	else {
		_affectationBatchTypeResources = new int[_nbBatchs];
		for (int i = 0; i < _nbBatchs; i++) {
			_affectationBatchTypeResources[i] = 0;
		}
		for (int i = 0; i < _nbJobs; i++) {
			if (_affectationBatchTypeResources[_batchActivity[i]] == 0) {
				_affectationBatchTypeResources[_batchActivity[i]] = _affectationActivitiesTypeResources[i];
			}
			else if (_affectationBatchTypeResources[_batchActivity[i]] != _affectationActivitiesTypeResources[i]) {
				//cout << "Erreur ! Affectation multiple" << endl;
				_affectationBatchTypeResources[_batchActivity[i]] = 2;

			}
			/*else {
				_affectationBatchTypeResources[_batchActivity[i]] = _affectationActivitiesTypeResources[i];
			}*/
		}
	}

	bool ok;
	if (!IS_BASE_NOKIA())
		for (int j = 0; j < _nbJobs; j++) {
			for (int i = 0; i < _nbJobs; i++) {
				if (i != j && _activities[i].project == _activities[j].project && _activities[i].phase == _activities[j].phase + 1) {
					ok = true;
					for (auto l : _activities[j].successors) {
						if (_activities[l].phase == _activities[j].phase) ok = false;
					}
					for (auto k : _activities[i].predecessors) {
						if (_activities[k].phase == _activities[i].phase) ok = false;
					}

					for (auto k : _activities[i].predecessors) {
						for (auto l : _activities[j].successors) {
							if (k == l || j == k || i == l) ok = false;
						}
					}
					if (ok) {
						_activities[j].successors.push_back(i);
						_activities[i].predecessors.push_back(j);
					}
				}
			}
		}

	int nbPred = 0, nbSucc = 0;
	for (int i = 0; i < _nbJobs; i++) {
		_nbPredActivity[i] = _activities[i].predecessors.size();
		_nbSuccActivity[i] = _activities[i].successors.size();
		nbPred += _nbPredActivity[i];
		nbSucc += _nbSuccActivity[i];
		_succList[i] = new int[_nbSuccActivity[i]];
		_predList[i] = new int[_nbPredActivity[i]];
		for (int j = 0; j < _nbPredActivity[i]; j++) {
			_predList[i][j] = _activities[i].predecessors[j];
		}
		for (int j = 0; j < _nbSuccActivity[i]; j++) {
			_succList[i][j] = _activities[i].successors[j];
		}
		if (!IS_BASE_NOKIA())
			_activities[i].earliestStart = _activities[i].releaseDate;
		else
			_activities[i].earliestStart = 0;
		for (auto j : _activities[i].predecessors) {
			_activities[i].earliestStart = (_activities[j].earliestStart + _activities[j].duration >= _activities[i].earliestStart) ? _activities[j].earliestStart + _activities[j].duration : _activities[i].earliestStart;
		}
	}

	if (!IS_BASE_NOKIA()) {
		double* durationUntilActivity;
		double* durationCriticalPath;
		monNewTInit(durationUntilActivity, double, _nbJobs, 0);
		_horizon = 0;
		for (int i = 0; i < _nbJobs; i++) {
			for (auto j : _activities[i].successors) {
				if (durationUntilActivity[i] + _activities[i].duration > durationUntilActivity[j]) {
					durationUntilActivity[j] = durationUntilActivity[i] + _activities[i].duration;
				}
			}
			for (auto j : _activities[i].predecessors) {
				_activities[i].earliestStart = (_activities[j].earliestStart + durationUntilActivity[j] >= _activities[i].earliestStart) ? _activities[j].earliestStart + durationUntilActivity[j] : _activities[i].earliestStart;
			}
		}
		for (int i = 0; i < _nbJobs; i++) {
			_earliestStartDate[i] = _activities[i].earliestStart;
			if (_activities[i].successors.size() == 0) {
				_horizon += durationUntilActivity[i];
			}
		}
	}
	loadPercentAccomplished("Input/Konatus_instances/attribut_6.4.3.txt");

	LOG_INFO("End read and initialize data from all inputs");

	
}

void Data::write(const string& filename) {
	LOG_INFO("Start write output file " + filename);
	ofstream fichier(filename.c_str(), ios::out);
	if (fichier) {
		fichier << "WE number: " << _nbJobs << endl;
		fichier << "horizon: " << _horizon << endl;
		fichier << "team number: " << _nbResources << endl;
		fichier << "**********************************************************" << endl;
		fichier << "PRECEDENCE RELATIONS:" << endl;
		fichier << "WE_id. #successors successors_id" << endl;
		fichier << "----------------------------------------------------------" << endl;
		for (int i = 0; i < _nbJobs; i++) {
			fichier << _activities[i].id << " " << _activities[i].successors.size() << " ";
			for (auto& k2 : _activities[i].successors) {
				fichier << _activities[k2].id << " ";
			}
			fichier << endl;
		}
		/*fichier << "**********************************************************" << endl;
		fichier << "PRECEDENCE RELATIONS:" << endl;
		fichier << "jobnr. #predecessors predecessors" << endl;
		for (int i = 0; i < _nbJobs; i++) {
			fichier << _activities[i].id << " " << _activities[i].predecessors.size() << " ";
			for (auto& k2 : _activities[i].predecessors) {
				fichier << _activities[k2].id << " ";
			}
			fichier << endl;
		}*/
		fichier << "********************************************************************" << endl;
		fichier << "WORK ELEMENTS PARAMETERS:" << endl;
		if (!IS_BASE_NOKIA())
			fichier << "WE_id. duration load releaseDate dueDate deadline  priority tardcost" << endl;
		else
			fichier << "WE_id. duration load" << endl;
		fichier << "--------------------------------------------------------------------" << endl;
		for (int i = 0; i < _nbJobs; i++) {

			fichier << _activities[i].id << " " << _activities[i].duration << " " << _activities[i].load << " ";
			if (!IS_BASE_NOKIA())
				fichier << _activities[i].releaseDate << " " << _activities[i].dueDate << " " << _activities[i].deadline << " " << _activities[i].priority << " " << _activities[i].tardCost;
			fichier << endl;
		}
		fichier << "**********************************************************" << endl;
		fichier << "TEAM AVAILABILITIES:" << endl;
		for (int r = 0; r < _nbResources; r++) {
			fichier << "T " << _resources[r].id << " ";
		}
		fichier << endl;
		for (int r = 0; r < _nbResources; r++) {
			fichier << _resources[r].capacity << " ";
		}
		fichier << endl;
		fichier << "**********************************************************" << endl;
		fichier << "REQUEST:" << endl;
		if (!IS_BASE_NOKIA())
			fichier << "WE_id. team_id" << endl;
		else
			fichier << "WE_id. resource_type" << endl;
		fichier << "----------------------------------------------------------" << endl;
		for (int i = 0; i < _nbJobs; i++) {
			fichier << _activities[i].id << " " << _resources[_indexResource[_activities[i].resource]].id << endl;
		}
		fichier << "**********************************************************" << endl;

		fichier.close();
	}
	else
		cerr << "Erreur � l'ouverture !" << endl;

	LOG_INFO("End write and close output file " + filename);
}


/**
 *
 * @return the number of jobs
 */
int Data::nbJobs() const {
	return _nbJobs;
}

/**
 *
 * @return the number of ressources
 */
int Data::nbResources() const {
	return _nbResources;
}

Data::~Data() {
}

/*
* Recursive function to find if there is back edge
* in DFS subtree tree rooted with 'u'
*/
bool Data::DFSUtil(int vertex, int color[])
{
	color[vertex] = 1;
	for (auto u : _activities[vertex].successors)
	{
		if (color[u] == 1)
			return true;
		if (color[u] == 0 && DFSUtil(u, color))
			return true;
	}
	color[vertex] = 2;
	return false;
}

/*
*
* @returns true if there is a cycle in precedence graph
*/
bool Data::isCyclic()
{
	LOG_INFO("Check data  isCyclic");
	// Initialize color of all vertices as 0
	int* color = new (nothrow) int[_nbJobs];
	for (int i = 0; i < _nbJobs; i++)
		color[i] = 0;

	// Do a DFS traversal beginning with all 
	// vertices 
	for (int i = 0; i < _nbJobs; i++)
		if (color[i] == 0)
			if (DFSUtil(i, color) == true) {
				LOG_INFO("isCyclic return true");
				return true;
			}

	LOG_INFO("isCyclic return false");
	return false;
}

bool Data::hasEnoughCapacity() {
	LOG_INFO("Check data hasEnoughCapacity");
	for (int i = 0; i < _nbJobs; i++) {
		if (_loadActivity[i] > _capacity[_activities[i].resource]) {
			cout << "There is not enough capacity in resource " << _activities[i].resource << " to perform activity " << i << endl;
			LOG_INFO("There is not enough capacity in resource " + _activities[i].resource);
			return false;
		}
	}
	if (Parameters::appliParam->getSkills()) {
		for (int i = 0; i < _nbJobs; i++) {
			for (int s = 0; s < _nbSkills; s++) {
				if (_loadActivitySkill[i][s] > _capacitySkill[_activities[i].resource][s]) {
					cout << "There is not enough capacity in resource " << _activities[i].resource << " for skill " << s << " to perform activity " << i << endl;
					LOG_INFO("There is not enough capacity in resource " + _activities[i].resource);
					return false;
				}
			}
		}
	}
	LOG_INFO("hasEnoughCapacity return true");
	return true;
}