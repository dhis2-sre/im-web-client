export const toTitleCase = (str: string): string =>
    str
        .toLowerCase()
        .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())

export const mapStringToValueLabel = (str: string): { value: string; label: string } => ({ value: str, label: str })
