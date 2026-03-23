/* https://github.com/GavinZhuLei/vue-form-making/blob/master/src/components/componentsConfig.js */
import previewImage from "../assets/icons/preview-image.svg";
import { formatDate } from "element-ui/src/utils/date-util";
export const dataSample = (field) => {
    try {
        if (
            field.options.defaultValue !== null &&
            field.options.defaultValue !== undefined &&
            field.options.defaultValue.length !== 0
        ) {
            return field.options.defaultValue;
        }
    } catch (e) {
        // Nothing to do
    }

    let sample;
    switch (field.type) {
        case "input":
            sample = field.name;
            break;
        case "textarea":
            sample = `${field.name}\n${field.name}\n${field.name} ... `;
            break;
        case "number":
            sample = sampleNumber(
                field.options.min,
                field.options.max,
                field.options.step
            );
            break;
        case "radio":
            sample = field.options.options[0].value;
            break;
        case "checkbox":
            sample = [field.options.options[0].value];
            break;
        case "time":
            sample = formatDate(Date(), field.options.format);
            break;
        case "date":
            sample = formatDate(Date(), field.options.format);
            break;
        case "rate":
            sample = sampleNumber(0, field.options.max, 1);
            break;
        case "color":
            sample = "#171E36";
            break;
        case "select":
            if (field.options.multiple) {
                sample = field.options.options
                    .filter((_, index, arr) => index < arr.length / 2)
                    .map(({ value }) => value);
            } else {
                sample = field.options.options[0]?.value;
            }
            break;
        case "switch":
            sample = true;
            break;
        /*case "slider":
            sample = sampleNumber( field.options.min, field.options.max, field.options.step )
            break;*/
        case "text":
            sample = "Label";
            break;
        case "imgupload":
            sample = [{ url: previewImage }];
            break;
        case "editor":
            sample = `<div>${field.name}\n${field.name}\n${field.name} ... </div>`;
            break;
        default:
            sample = `{{ ${field.model} }}`;
    }

    return sample;
};

function sampleNumber(min, max, step = 1) {
    const middle = (max - min) / 2;
    const okForStep = middle - (middle % step);
    return okForStep;
}

export default dataSample;
