
#include "Data.h"
#include "Parameters.h"
#include "GeneticAlgo.h"
#include "Commun.h"
#include "GeneticAlgo_Nokia.h"
#include "Logger.h"
#include "DateUtils.h"
#include "StringUtils.h"

//using namespace std;
using namespace CPlusPlusLogging;
using namespace utils;


#define infinity 100000000


void read_arguments(int argc, char *argv[], string & affectationFilename, string & precedenceFilename, string & activityFilename, string & resourceFilename, string & projectActivityFilename, string & parametersFilename, string & solutionFilename, string & logFilename);

int main(int argc, char *argv[]) {

	cout << "******************************" << endl;
	cout << "**   Begin of the program   **" << endl;
	cout << "******************************" << endl << endl;
	
	cout << "*** Set file input path ******" << endl;
	string solutionFilename("Output/solution.csv");
	string logFilename("Output/log.csv");
	string logFilenameO("Output/log.csv");
	string logFileDirectory = "log";
	string parametersFilename("Input/parameters.txt");
	string affectationFilename("Input/Konatus_instances/team_backlog_");
	string precedenceFilename("Input/Konatus_instances/depends_");
	string activityFilename("Input/Konatus_instances/attribut_");
	string resourceFilename("Input/Konatus_instances/team_resources_");
	string skillsFilename("Input/Konatus_instances/skillset_");
	string projectActivityFilename("Input/Konatus_instances/work_element_");
	string batchFilename("Input/Konatus_instances/batch_");
	string teamFilename("Input/Konatus_instances/team_");
	read_arguments(argc, argv, affectationFilename, precedenceFilename, activityFilename, resourceFilename, projectActivityFilename, parametersFilename, solutionFilename, logFileDirectory);
	affectationFilename += GET_BASE() + ".txt";
	precedenceFilename += GET_BASE() + ".txt";
	activityFilename += GET_BASE() + ".txt";
	resourceFilename += GET_BASE() + ".txt";
	skillsFilename += GET_BASE() + ".txt";
	projectActivityFilename += GET_BASE() + ".txt";
	batchFilename += GET_BASE() + ".txt";
	teamFilename += GET_BASE() + ".txt";
	cout << "*** End set file input path ******" << endl << endl;

	cout << "*** Initilisation Log4 C++ Instance ******" << endl;
	std::tm currentDate = DateUtils::getCurrentDate();
	string day = DateUtils::format(currentDate, "%Y%m%d");
	logFilename = logFileDirectory + "/" + day + ".log";
	Logger::getInstance()->setFileLogging(logFilename);
	cout << "*** End initilisation Log4 C++ Instance ******" << endl;


	LOG_INFO("Start of the program Process with config param: ");
	Parameters::appliParam->print();
	Parameters::appliParam->print(Logger::getInstance()->getM_File());


	Data data;
	double timeGA = 0;
	data.readData(batchFilename, resourceFilename, activityFilename, precedenceFilename, teamFilename, affectationFilename, projectActivityFilename, skillsFilename);
	//data.write(instanceKonatusFilen
	cout << "Initialization data done for base " << GET_BASE() << endl;
	if (!data.isCyclic() && (IS_BASE_NOKIA() || data.hasEnoughCapacity())) {

		cout << "Checking data done" << endl;
		AbstractGeneticAlgo * algo;
		if(IS_BASE_NOKIA())
			algo = new GeneticAlgo_Nokia(data);
		else
			algo = new GeneticAlgo(data);
		Parameters::appliParam->printRuleName();
		clock_t startGA = clock();
		if (Parameters::appliParam->getGeneticAlgo()) {
			algo->run(solutionFilename, logFilenameO);
		}
		else {
			algo->basicAlgo();
		}
		timeGA = (clock() - startGA) / (double)CLOCKS_PER_SEC;
		cout << "Time: " << timeGA << endl;
	
	}

	LOG_INFO("End of the program process");

	cout << endl;
	cout << "****************************" << endl;
	cout << "**   End of the program   **" << endl;
	cout << "****************************" << endl;

	return 0;
}

void read_arguments(int argc, char *argv[], string & affectationFilename, string & precedenceFilename, string & activityFilename, string & resourceFilename, string & projectActivityFilename, string & parametersFilename, string & solutionFilename, string & logFileDirectory) {
	
	cout << "Arguments program= ";
	for (int i = 1; i < argc; i++) {
		cout << argv[i] << " ";
	}

	cout << endl << "Set parameters config: " << endl;
	for (int i = 1; i<argc; i++) {
		string arg = argv[i];
		cout << "Set parameter " << arg << endl;
		if ((arg == "-h") || (arg == "--help")) {
			cout << "Usage: " << argv[0] << " <option(s)>" << endl << "Options:" << endl;
			cout << "  --affectation filename\tSpecify the affectation input filename if there is or specify that affectation decisions have to be made if no filename argument is given" << endl;
			cout << "  --resource filename\tSpecify the resource input filename" << endl;
			cout << "  --activity filename\tSpecify the activity input filename" << endl;
			cout << "  --project filename\tSpecify the project input filename" << endl;
			cout << "  --precedence filename\tSpecify the precedence input filename" << endl;
			cout << "  --solution filename\tSpecify the solution output filename" << endl;
			cout << "  -r,--results filename\tSpecify the result output filename" << endl;
			cout << "  -p,--parameters filename\tSpecify the parameters input filename" << endl;
			cout << "  --crossProb\tSpecify the crossover probability used in genetic algorithms" << endl;
			cout << "  --mutateProb\tSpecify the mutation probability used in genetic algorithms" << endl;
			cout << "  --selectParam\tSpecify the selection parameter used in genetic algorithms" << endl;
			cout << "  --popSize\tSpecify the number of individuals used in genetic algorithms" << endl;
			cout << "  --nbIterations\tSpecify the number of iterations used in genetic algorithms" << endl;
			cout << "  --skillset\tSpecify that skillsets have to be considered" << endl;
			cout << "  --period duration\tSpecify the duration of a time period in days" << endl;
			cout << "  --rule\tSpecify the priority rule used in algorithm among: valid, priority, duration, workload, successors, duedate, releasedate" << endl;
			cout << "  --algo\tSpecify the used algorithm among: geneticalgo, heuristic" << endl;
			cout << "  --run\tSpecify the size of a run among: day, week, month" << endl;
			cout << "  --base\tSpecify the base to be treated" << endl;
		}
		else if (arg == "--skillset") {
			Parameters::appliParam->setSkills(true);
		}
		else if (arg == "--run") {
			if (i + 1 < argc) {
				Parameters::appliParam->setSizeRun(argv[++i]);
			}
			else {
				throw "ERROR in main() - Invalid option \"--run\" (requires one argument)";
			}
		}
		else if (arg == "--base") {
			if (i + 1 < argc) {
				Parameters::appliParam->setBase(argv[++i]);
			}
			else {
				throw "ERROR in main() - Invalid option \"--base\" (requires one argument)";
			}
		}
		else if (arg == "--algo") {
			if (i + 1 < argc) {
				Parameters::appliParam->setGeneticAlgo(argv[++i]);
			}
			else {
				throw "ERROR in main() - Invalid option \"--algo\" (requires one argument)";
			}
		}
		else if (arg == "--rule") {
			if (i + 1 < argc) {
				Parameters::appliParam->setRule(argv[++i]);
			}
			else {
				throw "ERROR in main() - Invalid option \"--rule\" (requires one argument)";
			}
		}
		else if (arg == "--crossProb") {
			if (i + 1 < argc) {
				Parameters::appliParam->setCrossProb(atof(argv[++i]));
			}
			else {
				throw "ERROR in main() - Invalid option \"--crossProb\" (requires one argument)";
			}
		}
		else if (arg == "--mutateProb") {
			if (i + 1 < argc) {
				Parameters::appliParam->setMutateProb(atof(argv[++i]));
			}
			else {
				throw "ERROR in main() - Invalid option \"--mutateProb\" (requires one argument)";
			}
		}
		else if (arg == "--selectParam") {
			if (i + 1 < argc) {
				Parameters::appliParam->setSelectParam(atoi(argv[++i]));
			}
			else {
				throw "ERROR in main() - Invalid option \"--selectParam\" (requires one argument)";
			}
		}
		else if (arg == "--popSize") {
			if (i + 1 < argc) {
				Parameters::appliParam->setPopSize(atoi(argv[++i]));
			}
			else {
				throw "ERROR in main() - Invalid option \"--popSize\" (requires one argument)";
			}
		}
		else if (arg == "--bestPopSize") {
			if (i + 1 < argc) {
				Parameters::appliParam->setBestPopSize(atof(argv[++i]));
			}
			else {
				throw "ERROR in main() - Invalid option \"--bestpopSize\" (requires one argument)";
			}
		}
		else if (arg == "--newPopSize") {
			if (i + 1 < argc) {
				Parameters::appliParam->setNewPopSize(atof(argv[++i]));
			}
			else {
				throw "ERROR in main() - Invalid option \"--newpopSize\" (requires one argument)";
			}
		}
		else if (arg == "--nbIterations") {
			if (i + 1 < argc) {
				Parameters::appliParam->setNbIterations(atoi(argv[++i]));
			}
			else {
				throw "ERROR in main() - Invalid option \"--nbIterations\" (requires one argument)";
			}
		}
		else if (arg == "--precedence") {
			if (i + 1 < argc) {
				precedenceFilename = argv[++i];
			}
			else {
				throw "ERROR in main() - Invalid option \"--precedence\" (requires one argument)";
			}
		}
		else if (arg == "--activity") {
			if (i + 1 < argc) {
				activityFilename = argv[++i];
			}
			else {
				throw "ERROR in main() - Invalid option \"--activity\" (requires one argument)";
			}
		}
		else if (arg == "--project") {
			if (i + 1 < argc) {
				projectActivityFilename = argv[++i];
			}
			else {
				throw "ERROR in main() - Invalid option \"--project\" (requires one argument)";
			}
		}
		else if (arg == "--resource") {
			if (i + 1 < argc) {
				resourceFilename = argv[++i];
			}
			else {
				throw "ERROR in main() - Invalid option \"--resource\" (requires one argument)";
			}
		}
		else if ((arg == "-l") || (arg == "--log")) {
			if (i + 1 < argc) {
				logFileDirectory = argv[++i];
			}
			else {
				throw "ERROR in main() - Invalid option \"--solution\" (requires one argument)";
			}
		}
		else if ((arg == "-r") || (arg == "--results")) {
			if (i + 1 < argc) {
				solutionFilename = argv[++i];
			}
			else {
				throw "ERROR in main() - Invalid option \"--results\" (requires one argument)";
			}
		}
		else if ((arg == "-p") || (arg == "--param")) {
			if (i + 1 < argc) {
				parametersFilename = argv[++i];
				Parameters::appliParam->readParameters(parametersFilename);
			}
			else {
				throw "ERROR in main() - Invalid option \"--param\" (requires one argument)";
			}
		}
		else {
			string mssg("ERROR in main() - Invalid argument for " + string(argv[0]));
			throw mssg.c_str();
		}
	}
	cout << "End set parameters config " << endl;
}
