export const validateUrl = (string) => {
    const urlregex =
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/i;
    return urlregex.test(string);
};
export default validateUrl;
