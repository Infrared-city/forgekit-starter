const TOKEN = /[!#$%&'*+\-.^_`|~0-9A-Za-z]/;
function splitLinkValues(header) {
    const values = [];
    let start = 0;
    let quoted = false;
    let escaped = false;
    let angled = false;
    for (let index = 0; index < header.length; index += 1) {
        const character = header[index];
        if (escaped) {
            escaped = false;
        }
        else if (quoted) {
            if (character === "\\")
                escaped = true;
            else if (character === '"')
                quoted = false;
        }
        else if (angled) {
            if (character === ">")
                angled = false;
            else if (character === "<" || character === '"')
                return undefined;
        }
        else if (character === '"') {
            quoted = true;
        }
        else if (character === "<") {
            angled = true;
        }
        else if (character === ">") {
            return undefined;
        }
        else if (character === ",") {
            const value = header.slice(start, index).trim();
            if (value.length === 0)
                return undefined;
            values.push(value);
            start = index + 1;
        }
    }
    if (quoted || escaped || angled)
        return undefined;
    const last = header.slice(start).trim();
    if (last.length === 0)
        return undefined;
    values.push(last);
    return values;
}
function readParameters(input) {
    let index = 0;
    let relations;
    const skipWhitespace = () => {
        while (input[index] === " " || input[index] === "\t")
            index += 1;
    };
    while (index < input.length) {
        skipWhitespace();
        if (index === input.length)
            break;
        if (input[index] !== ";")
            return null;
        index += 1;
        skipWhitespace();
        const nameStart = index;
        while (index < input.length && TOKEN.test(input[index]))
            index += 1;
        if (nameStart === index)
            return null;
        const name = input.slice(nameStart, index).toLowerCase();
        skipWhitespace();
        if (input[index] !== "=")
            return null;
        index += 1;
        skipWhitespace();
        let parameter = "";
        if (input[index] === '"') {
            index += 1;
            let closed = false;
            while (index < input.length) {
                const character = input[index++];
                if (character === "\\") {
                    if (index === input.length)
                        return null;
                    parameter += input[index++];
                }
                else if (character === '"') {
                    closed = true;
                    break;
                }
                else {
                    parameter += character;
                }
            }
            if (!closed)
                return null;
        }
        else {
            const valueStart = index;
            while (index < input.length && TOKEN.test(input[index]))
                index += 1;
            if (valueStart === index)
                return null;
            parameter = input.slice(valueStart, index);
        }
        skipWhitespace();
        if (index < input.length && input[index] !== ";")
            return null;
        if (name === "rel") {
            if (relations !== undefined)
                return null;
            relations = parameter.split(/[ \t]+/).filter((item) => item.length > 0);
        }
    }
    return relations;
}
/** Select one exact results relation without interpreting quoted parameter text. */
export function parseResultsLink(header) {
    const values = header === null ? undefined : splitLinkValues(header);
    if (values === undefined)
        throw new Error("results response has no usable Link header");
    const matches = [];
    let unqualified;
    for (const value of values) {
        if (!value.startsWith("<")) {
            if (values.length === 1 && value.startsWith("https://"))
                unqualified = value;
            else
                throw new Error("results response has no usable Link header");
            continue;
        }
        const end = value.indexOf(">");
        if (end <= 1)
            throw new Error("results response has no usable Link header");
        const url = value.slice(1, end);
        const relations = readParameters(value.slice(end + 1));
        if (relations === null)
            throw new Error("results response has no usable Link header");
        if (relations?.some((item) => item.toLowerCase() === "results"))
            matches.push(url);
        else if (relations === undefined && values.length === 1)
            unqualified = url;
    }
    const selected = matches.length === 1 ? matches[0] : matches.length === 0 ? unqualified : undefined;
    if (selected === undefined || !selected.startsWith("https://")) {
        throw new Error("results response has no usable Link header");
    }
    return selected;
}
