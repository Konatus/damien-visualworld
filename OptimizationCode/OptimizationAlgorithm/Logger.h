///////////////////////////////////////////////////////////////////////////////
// @File Name:     Logger.h                                                  //
// @Author:        Pankaj Choudhary                                          //
// @Version:       0.0.1                                                     //
// @L.M.D:         13th April 2015                                           //
// @Description:   For Logging into file                                     //
//                                                                           // 
// Detail Description:                                                       //
// Implemented complete logging mechanism, Supporting multiple logging type  //
// like as file based logging, console base logging etc. It also supported   //
// for different log type.                                                   //
//                                                                           //
// Thread Safe logging mechanism. Compatible with VC++ (Windows platform)   //
// as well as G++ (Linux platform)                                           //
//                                                                           //
// Supported Log Type: ERROR, ALARM, ALWAYS, INFO, BUFFER, TRACE, DEBUG      //
//                                                                           //
// No control for ERROR, ALRAM and ALWAYS messages. These type of messages   //
// should be always captured.                                                //
//                                                                           //
// BUFFER log type should be use while logging raw buffer or raw messages    //
//                                                                           //
// Having direct interface as well as C++ Singleton inface. can use          //
// whatever interface want.                                                   //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

#ifndef _LOGGER_H_
#define _LOGGER_H_


// C++ Header File(s)
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

#ifdef WIN32
// Win Socket Header File(s)
#include <Windows.h>
#include <process.h>
#else
// POSIX Socket Header File(s)
#include <errno.h>
//#include <pthread.h>
#endif

namespace CPlusPlusLogging
{

#define __FILENAME__ (strrchr(__FILE__, '\\') ? strrchr(__FILE__, '\\') + 1 : __FILE__)
#define __LINENUMBER__ __LINE__    
    
// Direct Interface for logging into log file or console using MACRO(s)
#define LOG_ERROR(x)    Logger::getInstance()->error(__FILENAME__,__LINENUMBER__,x)
#define LOG_ALARM(x)	Logger::getInstance()->alarm(__FILENAME__,__LINENUMBER__,x)
#define LOG_ALWAYS(x)	Logger::getInstance()->always(__FILENAME__,__LINENUMBER__,x)
#define LOG_INFO(x)     Logger::getInstance()->info(__FILENAME__,__LINENUMBER__,x)
#define LOG_BUFFER(x)   Logger::getInstance()->buffer(__FILENAME__,__LINENUMBER__,x)
#define LOG_TRACE(x)    Logger::getInstance()->trace(__FILENAME__,__LINENUMBER__,x)
#define LOG_DEBUG(x)    Logger::getInstance()->debug(__FILENAME__,__LINENUMBER__,x)

// enum for LOG_LEVEL
    typedef enum LOG_LEVEL_NEW
    {
        DISABLE_LOG = 1,
        LOG_LEVEL_INFO = 2,
        LOG_LEVEL_BUFFER = 3,
        LOG_LEVEL_TRACE = 4,
        LOG_LEVEL_DEBUG = 5,
        ENABLE_LOG = 6,
    }LogLevel;

    // enum for LOG_TYPE
    typedef enum LOG_TYPE
    {
        NO_LOG = 1,
        CONSOLE = 2,
        FILE_LOG = 3,
    }LogType;

    class Logger
    {
    public:
        static Logger* getInstance() throw ();


        // Interface for Error Log 
        void error(const char* nameClass, const int lineNumber, const char* text) throw();
        void error(const char* nameClass, const int lineNumber, const std::string& text) throw();
        void error(const char* nameClass, const int lineNumber, const std::ostringstream& stream) throw();

        // Interface for Alarm Log 
        void alarm(const char* nameClass, const int lineNumber, const char* text) throw();
        void alarm(const char* nameClass, const int lineNumber, const std::string& text) throw();
        void alarm(const char* nameClass, const int lineNumber, const std::ostringstream& stream) throw();

        // Interface for Always Log 
        void always(const char* nameClass, const int lineNumber, const char* text) throw();
        void always(const char* nameClass, const int lineNumber, const std::string& text) throw();
        void always(const char* nameClass, const int lineNumber, const std::ostringstream& stream) throw();

        // Interface for Buffer Log 
        void buffer(const char* nameClass, const int lineNumber, const char* text) throw();
        void buffer(const char* nameClass, const int lineNumber, const std::string& text) throw();
        void buffer(const char* nameClass, const int lineNumber, const std::ostringstream& stream) throw();

        // Interface for Info Log 
        void info(const char* nameClass, const int lineNumber, const char* text) throw();
        void info(const char* nameClass, const int lineNumber, const std::string& text) throw();
        void info(const char* nameClass, const int lineNumber, const std::ostringstream& stream) throw();

        // Interface for Trace log 
        void trace(const char* nameClass, const int lineNumber, const char* text) throw();
        void trace(const char* nameClass, const int lineNumber, const std::string& text) throw();
        void trace(const char* nameClass, const int lineNumber, const std::ostringstream& stream) throw();

        // Interface for Debug log 
        void debug(const char* nameClass, const int lineNumber, const char* text) throw();
        void appendContentLog(std::string& data, const char* nameClass, const int& lineNumber, const char* text);
        void debug(const char* nameClass, const int lineNumber, const std::string& text) throw();
        void debug(const char* nameClass, const int lineNumber, const std::ostringstream& stream) throw();

        // Error and Alarm log must be always enable
        // Hence, there is no interfce to control error and alarm logs

        // Interfaces to control log levels
        void updateLogLevel(LogLevel logLevel);
        void enaleLog();  // Enable all log levels
        void disableLog(); // Disable all log levels, except error and alarm

        // Interfaces to control log Types
        void updateLogType(LogType logType);
        void enableConsoleLogging();
        void enableFileLogging();
        void setFileLogging(const std::string& logFileNames);
        std::ofstream & getM_File() noexcept;

    protected:
        Logger();
        ~Logger();

        // Wrapper function for lock/unlock
        // For Extensible feature, lock and unlock should be in protected
        void lock();
        void unlock();

        std::string getCurrentTime();

    private:
        void logIntoFile(std::string& data);
        void logOnConsole(std::string& data);
        Logger(const Logger& obj) {}
        void operator=(const Logger& obj) {}

    private:
        static Logger* m_Instance;
        std::ofstream           m_File;

#ifdef	WIN32
        CRITICAL_SECTION        m_Mutex;
#else
        //  pthread_mutexattr_t     m_Attr;
        //  pthread_mutex_t         m_Mutex;
#endif

        LogLevel                m_LogLevel;
        LogType                 m_LogType;
    };

} // End of namespace

#endif // End of _LOGGER_H_

