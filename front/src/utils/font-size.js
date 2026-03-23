// Please see: https://github.com/shrhdk/text-to-svg/blob/2ea4c5f2cda193c3e86f34e89f2b03e04acd88fe/src/index.js#L30
let FONT;
import opentype from "opentype.js";
import fontTTF from "../assets/theme/fonts/Raleway/Raleway-Regular.ttf";
opentype.load(fontTTF, (err, data) => {
    if (err) {
        throw err;
    }
    FONT = data;
});

// Please see: https://github.com/shrhdk/text-to-svg/blob/2ea4c5f2cda193c3e86f34e89f2b03e04acd88fe/src/index.js#L40
export const getWidth = ({ fontSize, text }) => {
    const fontScale = (1 / FONT.unitsPerEm) * fontSize;

    let width = 0;
    const glyphs = FONT.stringToGlyphs(text);
    for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];

        if (glyph.advanceWidth) {
            width += glyph.advanceWidth * fontScale;
        }

        if (i < glyphs.length - 1) {
            const kerningValue = FONT.getKerningValue(glyph, glyphs[i + 1]);
            width += kerningValue * fontScale;
        }
    }
    return width;
};

// Please see: https://github.com/shrhdk/text-to-svg/blob/2ea4c5f2cda193c3e86f34e89f2b03e04acd88fe/src/index.js#L68
export const getHeight = ({ fontSize }) => {
    const fontScale = (1 / FONT.unitsPerEm) * fontSize;
    return (FONT.ascender - FONT.descender) * fontScale;
};

export const getWidthByWord = ({ text, fontSize }) => {
    const BREAKLINE_CHARS = [".notdef"];
    const SPACE_CHARS = ["space", "hyphen"];
    const fontScale = fontSize / FONT.unitsPerEm;

    let current = { text: [], width: 0, newline: false };
    let wordList = [];
    const glyphs = FONT.stringToGlyphs(text);
    for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];

        if (glyph.advanceWidth) {
            current.width += glyph.advanceWidth * fontScale;
        }

        if (i < glyphs.length - 1) {
            const kerningValue = FONT.getKerningValue(glyph, glyphs[i + 1]);
            current.width += kerningValue * fontScale;
        }

        current.text.push(glyph);
        if (
            SPACE_CHARS.includes(glyph.name) ||
            BREAKLINE_CHARS.includes(glyph.name)
        ) {
            wordList.push(current);
            current = {
                text: [],
                width: 0,
                newline: BREAKLINE_CHARS.includes(glyph.name),
            };
        }
    }
    wordList.push(current);
    return wordList.filter(({ text }) => text.length > 0);
};

export const fit = ({ text, width, height }) => {
    if (height === null) {
        const arbitraryFontSize = width / text.length;
        const experimentalWidth = getWidth({
            text,
            fontSize: arbitraryFontSize,
        });
        return {
            fontSize:
                Math.floor(
                    ((arbitraryFontSize * width) / experimentalWidth) * 10000
                ) / 10000,
            usedHeight: null,
        };
    } else {
        let fontSize,
            minSize = 1,
            maxSize = height;
        let lineCount, lineHeight;

        loopFontSize: for (let k = 0; k < height; k++) {
            // loop count ~ Math.log2( wrapperHeight )

            // Break if it has converged enough (1px or 1%) or compute a new fontSize
            if (
                maxSize < minSize ||
                maxSize - minSize < 1 ||
                maxSize - minSize < 0.01 * maxSize
            ) {
                fontSize = Math.min(minSize, maxSize);
                break;
            } else {
                fontSize = (minSize + maxSize) / 2;
            }

            // A single line cant be heighter than the given height
            lineHeight = getHeight({ fontSize }) * 1.15; // defaut line-height is 1.15
            if (lineHeight > height) {
                maxSize = fontSize;
                continue;
            }

            // A single word cant be longer than the given width
            const widthByWord = getWidthByWord({ text, fontSize });
            const longestWord = Math.max(
                ...widthByWord.map(({ width }) => width)
            );
            if (longestWord > width) {
                maxSize = fontSize;
                continue;
            }

            const maxLineCount = height / lineHeight;
            lineCount = 1;
            let lineWidth = 0;
            for (let wordId = 0; wordId < widthByWord.length; wordId++) {
                const word = widthByWord[wordId];
                lineWidth += word.width;
                if (lineWidth > width || word.newline) {
                    lineCount++;
                    if (lineCount > maxLineCount) {
                        maxSize = fontSize;
                        continue loopFontSize;
                    }
                    lineWidth = word.width;
                }
            }
            minSize = fontSize;
        }
        return {
            fontSize: Math.floor(fontSize * 10000) / 10000,
            usedHeight:
                Math.floor(((lineHeight * lineCount) / height) * 10000) / 10000,
        };
    }
};

export default {
    getWidth,
    getHeight,
    getWidthByWord,
    fit,
};
