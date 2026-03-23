export const parse = (cssString) => {
    const lines = cssString
        .split(";")
        .map((line) => line.trim())
        .filter((line) => line.length)
        .map((line) => {
            const splittedLine = line.split(":");
            return {
                [kebabToCamel(splittedLine[0])]: splittedLine
                    .filter((elt, id) => id > 0)
                    .join("")
                    .trim(),
            };
        });
    return Object.assign({}, ...lines);
};
export default {
    parse,
};

// Utils
const kebabToCamel = (kebabString) => {
    return kebabString
        .split("-")
        .filter((word) => word.length)
        .map((word, id) => (id === 0 ? word.toLowerCase() : capitalize(word)))
        .join("");
};
const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
};
