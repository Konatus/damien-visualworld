#include"Parameters.h"

Parameters * Parameters::appliParam = new Parameters();

Parameters::Parameters() : _base("7.4"), _sizeRun("day"), _hoursByPeriod(40), _rule(2), _geneticAlgo(true), _weightLateness(0.5), _weightInactivity(0.5), _weightDuration(0.5), _weightCost(0), _weightCompletionTime(0.5), _bestPopSize(0.15), _newPopSize(0.08), _popSize(150), _nbIterations(1000), _cross_prob(0.5), _mutate_prob(0.01), _sel_param(20), _selector(0), _skillset(false) {
}

void Parameters::print(ostream & out) const {
	out << endl;
	out << "List Of General Parameters" << endl;
	out << "------------------" << endl;
	out << "  Weight objective lateness = " << _weightLateness << endl;
	out << "  Weight objective inactivity = " << _weightInactivity << endl;
	out << "  Weight objective completion time = " << _weightCompletionTime << endl;
	out << "  Weight objective cost = " << _weightCost << endl;
	out << "  Weight objective project duration = " << _weightDuration << endl;
	out << "  Skillset = " << _skillset << endl;
	out << "  Genetic algorithm = " << _geneticAlgo << endl;
	out << "  Priority rule = " << _rule << endl;
	out << "  Run size = " << _sizeRun << endl;
	out << "  Number of worked hours by period = " << _hoursByPeriod << endl;
	out << "------------------" << endl;
	out << "List Of Parameters Related to Genetic Algorithm" << endl;
	out << "------------------" << endl;
	out << "  Crossover probability = " << _cross_prob << endl;
	out << "  Mutation probability = " << _mutate_prob << endl;
	out << "  Population size = " << _popSize << endl;
	out << "  Number of new randomly generated individuals by iteration = " << _newPopSize << endl;
	out << "  Number of best individuals kept from one iteration to the other = " << _bestPopSize << endl;
	out << "  Number of iterations = " << _nbIterations << endl;
	out << "  Selector individuals = " << _selector << endl;
}

void Parameters::write(const string & filename) {
	ofstream fichier(filename.c_str(), ios::out | ios::app);
	if (fichier) {
		fichier << _rule << ";" << _geneticAlgo << ";" << _popSize << ";" << _bestPopSize << ";" << _newPopSize << ";" << _cross_prob << ";" << _mutate_prob << ";";
		fichier.close();
	}
	else
		cerr << "Erreur � l'ouverture !" << endl;
}

void Parameters::setGeneticAlgo(string algo) { 
	if (algo == "geneticAlgo") {
		_geneticAlgo = true;
	}
	else {
		_geneticAlgo = false;
	}
}

void Parameters::setRule(string rule) {
	if (rule == "valid") {
		_rule = 0;
	}
	else if (rule == "priority") {
		_rule = 1;
	}
	else if (rule == "duration") {
		_rule = 2;
	}
	else if (rule == "first") {
		_rule = 3;
	}
	else if (rule == "workload") {
		_rule = 4;
	}
	else if (rule == "duedate") {
		_rule = 5;
	}
	else if (rule == "releasedate") {
		_rule = 6;
	}
	else if (rule == "successors") {
		_rule = 7;
	}
	else {
		_rule = 8;
	}
}

void Parameters::printRuleName() {
	cout << endl;
	cout << "***************************************************************" << endl;
	string rule = "";
	
	if (_rule == 0) {
		rule="valid";
	}
	else if (_rule == 1) {
		rule = "priority";
	}
	else if (_rule == 2) {
		rule = "duration";
	}
	else if (_rule == 3) {
		rule = "first";
	}
	else if (_rule == 4) {
		rule = "workload";
	}
	else if (_rule == 5) {
		rule = "due date";
	}
	else if (_rule == 6) {
		rule = "release date";
	}
	else if (_rule == 7) {
		rule = "successors number";
	}
	else {
		rule = "combination of each";
	}

	if (_geneticAlgo) {
		LOG_INFO("Genetic algorithm using, rule " + rule);
		cout << "**    Genetic algorithm using " << rule + " rule    **" << endl;;
	}
	else {
		LOG_INFO("Heuristic algorithm using, rule " + rule);
		cout << "**    Heuristic using " << rule + " rule    **" << endl;;
	}
	cout << "***************************************************************" << endl;
}

void Parameters::readParameters(const string & filename) {
	ifstream is(filename);

	if (is) {
		string line;

		// Lecture des donn�es du fichier
		string type;
		string name;
		double var;
		while (!is.eof() && is >> type) {
			if (type == "--skillset") {
				Parameters::appliParam->setSkills(true);
			}
			else if (type == "--base") {
				getline(is, line);
				istringstream iss(line);
				iss >> name;
				Parameters::appliParam->setBase(name);
				if (IS_BASE_7()) {
					_hoursByPeriod = 40;
					_rule = 8;
					_sel_param = 20;
					_selector = 0;
					Parameters::appliParam->setCrossProb(0.5);
					Parameters::appliParam->setMutateProb(0.01);
					Parameters::appliParam->setPopSize(150);
					Parameters::appliParam->setBestPopSize(0.15);
					Parameters::appliParam->setNewPopSize(0.08);
					_nbIterations = 1000;
				}
				else if (IS_BASE_6()) {
					_hoursByPeriod = 40;
					_rule = 8;
					_sel_param = 20;
					_selector = 0;
					_skillset == false;
					Parameters::appliParam->setCrossProb(0.5);
					Parameters::appliParam->setMutateProb(0.01);
					Parameters::appliParam->setPopSize(150);
					Parameters::appliParam->setBestPopSize(0.15);
					Parameters::appliParam->setNewPopSize(0.08);
					Parameters::appliParam->setNbIterations(1000);
				}
				else if (IS_BASE_NOKIA()) {
					_hoursByPeriod = 40;
					_rule = 8;
					_sel_param = 20;
					_selector = 0;
					_skillset == false;
					Parameters::appliParam->setCrossProb(0.5);
					Parameters::appliParam->setMutateProb(0.01);
					Parameters::appliParam->setPopSize(50);
					Parameters::appliParam->setBestPopSize(0.15);
					Parameters::appliParam->setNewPopSize(0.08);
					Parameters::appliParam->setNbIterations(100);
				}
			}
			else if (type == "--run") {
				getline(is, line);
				istringstream iss(line);
				iss >> name;
				Parameters::appliParam->setSizeRun(name);
			}
			else if (type == "--weightInactivity") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				_weightInactivity = var;
			}
			else if (type == "--weightCompletion") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				_weightCompletionTime = var;
			}
			else if (type == "--weightLateness") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				_weightLateness = var;
			}
			else if (type == "--weightCost") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				_weightCost = var;
			}
			else if (type == "--weightDuration") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				_weightDuration = var;
			}
			else if (type == "--algo") {
				getline(is, line);
				istringstream iss(line);
				iss >> name;
				Parameters::appliParam->setGeneticAlgo(name);
			}
			else if (type == "--rule") {
				getline(is, line);
				istringstream iss(line);
				iss >> name;
				Parameters::appliParam->setRule(name);
			}
			else if (type == "--crossProb") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				Parameters::appliParam->setCrossProb(var);
			}
			else if (type == "--mutateProb") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				Parameters::appliParam->setMutateProb(var);
			}
			else if (type == "--popSize") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				Parameters::appliParam->setPopSize((int)var);
			}
			else if (type == "--bestPopSize") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				Parameters::appliParam->setBestPopSize(var);
			}
			else if (type == "--newPopSize") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				Parameters::appliParam->setNewPopSize(var);
			}
			else if (type == "--nbIterations") {
				getline(is, line);
				istringstream iss(line);
				iss >> var;
				Parameters::appliParam->setNbIterations((int)var);
			}
		}
	}
}
