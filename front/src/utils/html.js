export const interactable = ({ tagName, className }) => {
    if (["A", "INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tagName)) {
        return true;
    }

    if (className && className.split) {
        const classList = className.split(" ");
        if (
            classList.includes("el-checkbox-button__inner") ||
            classList.includes("ql-editor") ||
            classList.includes("el-radio-button__inner") ||
            classList.includes("el-switch__core")
        ) {
            return true;
        }
    }

    return false;
};
export const writable = ({ tagName }) => {
    return ["INPUT", "TEXTAREA"].includes(tagName);
};
export const domPath = (node) => {
    const nodeSummary = (node) => ({
        id: node.id,
        classList: node.classList,
        tagName: node.tagName,
        childIndex: Array.from(node.parentElement?.children || []).indexOf(
            node
        ),
    });
    const path = [];
    let current = node;
    for (let k = 0; k < 1000; k++) {
        if (!current) {
            break;
        }
        path.push(nodeSummary(current));
        current = current.parentElement;
    }
    return path;
};
export default {
    interactable,
    writable,
    domPath,
};
