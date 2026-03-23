const BLACK = "black";
const WHITE = "white";
import colorParser from "element-ui/packages/color-picker/src/color";
export default function (color, limit = 130) {
    try {
        const colorParserInstance = new colorParser();
        colorParserInstance.fromString(color);
        const rgb = colorParserInstance.toRgb();
        const intensity = (rgb.r + rgb.g + rgb.b) / 3;
        return intensity < limit ? WHITE : BLACK;
    } catch {
        return BLACK;
    }
}
