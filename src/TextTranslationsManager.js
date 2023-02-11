// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

const FallbackLanguage = "en";
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
    behaviorDirectoryName = '';
    localizableStringsMapByDomain = new Map();

    // setup
    setup({ baseUrl, behaviorDirectoryName }) {
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
        let localizableStrings = await this.tryLoadLocalizableStrings(this.localesUrl, domain, langKey);
        this.ensureLocalizableStringsMapByDomain(domain).set(langKey, localizableStrings);
        // If not found, try with shorter key (ja-JP -> ja)
        const tokens = langKey.split("-");
        let shorterLangKey;
        while (this.isEmpty(localizableStrings) && tokens.length > 1) {
            tokens.pop();
            shorterLangKey = tokens.join("-");
            localizableStrings = await this.load(domain, shorterLangKey);
        }
        return localizableStrings;
    }

    async loadOnDefaultDomain() {
        const defaultDomain = this.detectDefaultDomain();
        await this.load(defaultDomain, FallbackLanguage);
        const langKey = this.detectDefaultLanguage().toLowerCase();
        await this.load(defaultDomain, langKey);
    }

    // actions
    localize(stringKey, domain = this.detectDefaultDomain(), language = this.detectDefaultLanguage()) {

        const localizableStringsMap = this.ensureLocalizableStringsMapByDomain(domain);

        const langKey = language.toLowerCase();
        // Try language specific localizableStrings first
        let localizableStrings = localizableStringsMap.get(langKey);

        // If not found, try with shorter key (ja-JP -> ja)
        const tokens = langKey.split("-");
        let shorterLangKey;
        while (this.isEmpty(localizableStrings) && tokens.length > 1) {
            tokens.pop();
            shorterLangKey = tokens.join("-");
            localizableStrings = localizableStringsMap.get(shorterLangKey);
        }

        if (!localizableStrings) {
            localizableStrings = {};
        }
        let value = localizableStrings[stringKey];
        if (value) return value;

        // If still not found, try fallback localizableStrings
        const fallbackLocalizableStrings = localizableStringsMap.get(FallbackLanguage) || {};
        value = fallbackLocalizableStrings[stringKey];
        if (value) return value;

        // If there is no localization entry, return the original stringKey
        return stringKey;;
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

    isEmpty(obj) {
        return Object.keys(obj).length === 0;
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
