#ifndef DATAUTILS_H
#define DATAUTILS_H

#include <string>
#include <ctime>


class DateUtils {
public:
    // Convert a given date to a string
    static std::string format(const std::tm& date, const std::string& format);

    // Get the current date
    static std::tm getCurrentDate();
};

#endif /* DATAUTILS_H */

