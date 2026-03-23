export const stringToHash = (string) => {
    let hash = 0;
    let char;
    if (!string || !string.length) {
        string = `${Date.now()}`;
    }

    for (let i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }

    return `x${Math.abs(hash)}`;
};
export default stringToHash;
