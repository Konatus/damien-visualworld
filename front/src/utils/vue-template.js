const compiler = require("vue-template-compiler");
import stringToHash from "./string-to-hash";
import merge from "lodash.merge";
const FIT_TAG = "fit";
const EXPRESSION_SPLIT = /\{\{(\s*)(\w+)(\s*)(\|(.*?))?\}\}/gi;

/**
 * Utils from vue/src/compiler/helpers
 *  */

// Nota bene: the name RegExp must NOT be global (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test#using_test_on_a_regex_with_the_global_flag)
function getAndRemoveAttrByRegex(el, name, comment = {}) {
    const out = [];
    const list = el.attrsList;
    for (let i = list.length - 1; i >= 0; i--) {
        const attr = list[i];
        if (name.test(attr.name)) {
            out.push({
                start: attr.start,
                end: attr.end,
                ...comment,
            });
            list.splice(i, 1);
        }
    }
    return out;
}
function addAttr(el, name, value, comment = {}) {
    const attr = {
        name: `:${name}`,
        value,
    };
    el.attrsList.push(attr);
    return {
        start: el.start,
        end: el.end,
        ...comment,
    };
}
function removeNode(el, comment = {}) {
    el.attrsList.push({ name: "v-if", value: "false" });
    el.attrsMap["v-if"] = "false";
    return {
        start: el.start,
        end: el.end,
        ...comment,
    };
}
function getTextContent(el) {
    if (el.children) {
        const out = [];
        for (const child of el.children) {
            out.push(getTextContent(child));
        }
        return out.join("");
    } else if (el.text) {
        return el.text;
    } else {
        return "";
    }
}

/**
 * End of utils
 */

// Special VW module compiler
const customCompilerModules = (
    {
        fieldTag = "field-view",
        fieldAbacusProp = "abacus",
        componentAbacusBind = "VW_componentAbacus",
    },
    { warnings, infos }
) => [
    {
        preTransformNode(el) {
            // Remove buggy attributes
            warnings.push(
                ...getAndRemoveAttrByRegex(el, /^[^:@#a-z]/is, {
                    msg: "attribute_first_char",
                })
            );
            warnings.push(
                ...getAndRemoveAttrByRegex(el, /^..*[^a-z0-9-:]/is, {
                    msg: "attribute_non_letter_char",
                })
            );
            // warnings.push( ...getAndRemoveAttrByRegex( el, /[^a-z]$/is, {msg:'attribute_last_char'} ) ) // some SVG attributes have attributes with numeric characters

            // Remove html event handler
            warnings.push(
                ...getAndRemoveAttrByRegex(
                    el,
                    /^on(abort|afterprint|animationend|animationiteration|animationstart|beforeprint|beforeunload|blur|canplay|canplaythrough|change|click|contextmenu|copy|cut|dblclick|drag|dragend|dragenter|dragleave|dragover|dragstart|drop|durationchange|ended|error|focus|focusin|focusout|fullscreenchange|fullscreenerror|hashchange|input|invalid|keydown|keypress|keyup|load|loadeddata|loadedmetadata|loadstart|message|mousedown|mouseenter|mouseleave|mousemove|mouseover|mouseout|mouseup|mousewheel|offline|online|open|pagehide|pageshow|paste|pause|play|playing|popstate|progress|ratechange|resize|reset|scroll|search|seeked|seeking|select|show|stalled|storage|submit|suspend|timeupdate|toggle|touchcancel|touchend|touchmove|touchstart|transitionend|unload|volumechange|waiting|wheel)$/is,
                    { msg: "html_event_handler" }
                )
            );

            // Remove element with non white-listed tag
            if (
                !/^(chart-js|drawing-view|field-view|fit|html)$/is.test(
                    el.tag
                ) && // technically necessary
                !/^(br|hr|h1|h2|h3|h4|h5|h6|p|b|i|u|s|a|em|strong|ul|ol|li|img|svg|g|rect|circle|ellipse|line|polygon|path|div|span|section|header|footer|bdi|bdo|blockquote|cite|code|del|ins|meter|pre|progress|small|sub|sup|var|table|caption|th|tr|td|thead|tbody|tfoot|col|colgroup|input|altGlyph|altGlyphDef|altGlyphItem|animate|animateMotion|animateTransform|circle|clipPath|color-profile|cursor|defs|desc|ellipse|feBlend|feColorMatrix|feComponentTransfer|feComposite|feConvolveMatrix|feDiffuseLighting|feDisplacementMap|feDistantLight|feFlood|feFuncA|feFuncB|feFuncG|feFuncR|feGaussianBlur|feImage|feMerge|feMergeNode|feMorphology|feOffset|fePointLight|feSpecularLighting|feSpotLight|feTile|feTurbulence|filter|font|font-face|font-face-format|font-face-name|font-face-src|font-face-uri|foreignObject|g|glyph|glyphRef|hkern|image|line|linearGradient|marker|mask|metadata|missing-glyph|mpath|path|pattern|polygon|polyline|radialGradient|rect|script|set|stop|style|svg|switch|symbol|text|textPath|title|tref|tspan|use|view|vkern)$/is.test(
                    el.tag
                ) // user necessary
            ) {
                warnings.push(removeNode(el, { msg: "non_white_listed_tag" }));
            }

            return el;
        },
    },
    {
        transformNode(el) {
            if (el.tag === FIT_TAG) {
                if (
                    !el.children.length ||
                    el.children.some((node) => node.expression || node.tag)
                ) {
                    infos.push({
                        msg: `fit_should_be_static_text`,
                        start: el.start,
                        end: el.end,
                    });
                }

                // Replace <fit...> by <field-view...>
                el.tag = fieldTag;
                const text = getTextContent(el);
                const hash = stringToHash(text);
                infos.push(
                    addAttr(
                        el,
                        fieldAbacusProp,
                        `${componentAbacusBind}.${hash}`,
                        { tag: FIT_TAG, hash, text }
                    )
                );
                infos.push(addAttr(el, "widget", "{type:'fit_text'}"));
            }
            return el;
        },
    },
];

// Compile template
export const compile = (template, opts = {}) => {
    try {
        const msg = { warnings: [], infos: [] };
        const modules = customCompilerModules(opts, msg);
        const compiled = compiler.compile(
            template,
            merge({}, opts, {
                modules,
                outputSourceRange: true,
            })
        );
        if (compiled.errors?.length) {
            return {
                template,
                ...compiled,
                ...msg,
            };
        }

        // Build functions with custom render try catch
        compiled.render = new Function(
            `h`,
            `try{` +
                compiled.render +
                `;` +
                `if(this.$emit){this.$emit('renderError',null)}` +
                `}catch(e){` +
                `if(this.$emit){this.$emit('renderError',e)}` +
                `}`
        );
        compiled.staticRenderFns = compiled.staticRenderFns.map(
            (code) => new Function(code)
        );

        return {
            template,
            ...compiled,
            ...msg,
        };
    } catch (e) {
        return {
            template,
            errors: Array.isArray(e) ? e : [e],
        };
    }
};

// Retrieve errors in a vue template
export const lint = (template, opts = {}) => {
    const prefix = "<html>";
    const suffix = "</html>";
    const templatePipeReplaced = template.replace(
        EXPRESSION_SPLIT,
        (_, s1, content, s2, __, attr = "") =>
            `{{${s1}${content}${s2}${attr && "|"}${attr
                .replaceAll("'", "`")
                .replaceAll('"', "'")}}}`
    ); // replace | by ,
    const compiledTemplate = compile(
        `${prefix}${templatePipeReplaced}${suffix}`,
        opts
    );
    const format = (e) => ({
        ...e,
        codeFrame: compiler.generateCodeFrame(
            template,
            e.start - prefix.length,
            e.end - prefix.length
        ),
    });
    return {
        errors: (compiledTemplate.errors || []).map(format),
        warnings: (compiledTemplate.warnings || []).map(format),
        infos: (compiledTemplate.infos || []).map(format),
    };
};

// eg: {{ toto | fontSize='14px' }}
export const splitPipe = (template, callback) => {
    return template.replace(
        EXPRESSION_SPLIT,
        (_, __, content, ___, ____, attr) => callback(content, attr)
    );
};

export default { compile, lint, splitPipe };
