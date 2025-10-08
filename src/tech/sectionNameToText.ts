type TranslationFunction = (key: string) => string

export const sectionNameToText = (name: string, t: TranslationFunction) => {
    const letter = (name.charAt(0) || "").toUpperCase();
    
    const postNumber = name.slice(1, name.length) || "";
    switch(letter){
        case 'V': return t('verse') + " " + postNumber;
        case 'R': return t('chorus') + " " + postNumber;
        case 'B': return t('bridge') + " " + postNumber

    }
    return name
}