// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

const FallbackLocale = "en";
const BaseSubDirectoryPath = "assets/locales";

function detectDefaultLanguage() {
    // Check url param 'lang' first, if not specified, use browser language preference
    const searchParams = new URLSearchParams(window.location.search);
    const langInUrl = searchParams.get("lang");
    if (langInUrl) return langInUrl;
    return navigator.language;
}

class TextTranslationsManager {
    localesUrl;
    behaviorDirectoryName;
    localizableStringsMapByDomain = new Map();

    // setup
    setup({ baseUrl, behaviorDirectoryName, isSystem }) {
        this.behaviorDirectoryName = behaviorDirectoryName;
        this.setLocalesUrl(`${baseUrl}${BaseSubDirectoryPath}`);
        this.loadOnDefaultDomain();
    }

    setLocalesUrl(url) {
        this.localesUrl = url;
    }

    // loading
    async load(domain, language) {
        const langKey = language.toLowerCase();
        const localizableStrings = await this.tryLoadLocalizableStrings(this.localesUrl, domain, langKey);
        this.ensureLocalizableStringsMapByDomain(domain).set(langKey, localizableStrings);
    }

    async loadOnDefaultDomain() {
        await this.load(this.detectDefaultDomain(), this.detectDefaultLanguage());
    }

    // actions
    localize(stringKey, domain = this.detectDefaultDomain(), language = this.detectDefaultLanguage()) {

        const localizableStringsMap = this.ensureLocalizableStringsMapByDomain(domain);

        const langKey = language.toLowerCase();
        // Try language specific localizableStrings first
        let localizableStrings = localizableStringsMap.get(langKey);

        // If not found, try with shorter key (ja-JP -> ja)
        if (!localizableStrings && (langKey.indexOf("-") > 0)) {
            const tokens = langKey.split("-");
            let shorterLangKey;
            while (!(tokens.length == 1 || localizableStrings)) {
                tokens.pop();
                shorterLangKey = tokens.join("-");
                localizableStrings = this.localizableStrings.get(shorterLangKey);
            }
        }

        // If still not found, try fallback localizableStrings
        if (!localizableStrings) {
            localizableStrings = localizableStringsMap.get(FallbackLocale) || {};
        }
        const value = localizableStrings[stringKey];
        if (!value) return stringKey; // If there is no localization entry, return the original stringKey
        return value;
    }

    //accessing
    ensureLocalizableStringsMapByDomain(domain) {
        let localizableStrings = this.localizableStringsMapByDomain.get(domain);
        if (!localizableStrings) {
            localizableStrings = new Map();
            this.localizableStringsMapByDomain.set(domain, localizableStrings);
        }
        return localizableStrings;
    }

    // private
    async tryLoadLocalizableStrings(baseUrl, domain, language) {
        const url = this.urlForFetch(baseUrl, domain, language);
        return await fetch(url).then(res => {
            if (res.status >= 300) {
                return {}
            }
            return res.json(); //TODO: use .tsv or .po format
        }).catch(err => {
            console.error(err);
            return {};
        })
    }

    urlForFetch(baseDirectory, domain, language) {
        return `${baseDirectory}/${domain}/${language}.json`; //TODO: use .tsv or .po format
    }

    // detecting defaults
    detectDefaultDomain() {
        return this.behaviorDirectoryName.replaceAll('behaviors/', '');
    }
    detectDefaultLanguage() {
        return detectDefaultLanguage();
    }

}

const singleton = new TextTranslationsManager();

// For user library translation
export function _(stringKey, domain, language) {
    return singleton.localize(stringKey, domain, language)
}

// For core library translation
export function __(stringKey, language) {
    return singleton.localize(stringKey, 'croquet', language)
}

export default singleton;
