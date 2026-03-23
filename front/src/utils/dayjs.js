import dayjs from "dayjs";

// import locale
import "dayjs/locale/fr";

// import plugin
import isLeapYear from "dayjs/plugin/isLeapYear";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween"; // required by user-invitation
import weekOfYear from "dayjs/plugin/weekOfYear";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

// use plugin
dayjs.extend(relativeTime);
dayjs.extend(isLeapYear);
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

// use locale
dayjs.locale("fr");

export default dayjs;
