#include"DateUtils.h"


    // Convert a given date to a string
    std::string DateUtils::format(const std::tm& date, const std::string& format) {
        char buffer[80];
        std::strftime(buffer, sizeof(buffer), format.c_str(), &date);
        return std::string(buffer);
    }

    // Get the current date
    std::tm DateUtils::getCurrentDate() {
        std::time_t now = std::time(nullptr);
        return *std::localtime(&now);
    }

