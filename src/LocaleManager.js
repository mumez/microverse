// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

const FallbackLocale = "en";

function detectPrimaryLanguage() {
    // Check url param 'lang' first, if not specified, use browser language preference
    const searchParams = new URLSearchParams(window.location.search);
    const langInUrl = searchParams.get("lang");
    if (langInUrl) return langInUrl;
    return navigator.language;
}

class LocaleManager {

    systemLocalizableStringsBaseUrl;
    userLocalizableStringsBaseUrl;
    systemLocalizedStringsMap = new Map();
    localizedStringsMap = new Map();

    // loading
    setupLoadingLocalizableStrings({ isSystem, root, directory }) {
        const basePath = `${root}${directory}`;
        if (isSystem) {
            this.systemLocalizableStringsBaseUrl = basePath;
        } else {
            this.userLocalizableStringsBaseUrl = basePath;
        }
        if (this.systemLocalizableStringsBaseUrl && this.userLocalizableStringsBaseUrl) {
            this.loadFallbackLocalizableStrings();
            this.loadLocalizableStrings();
        }
    }

    async loadFallbackLocalizableStrings() {
        await this.loadLocalizableStrings(FallbackLocale);
    }
    async loadLocalizableStrings(language = detectPrimaryLanguage()) {
        const langKey = language.toLowerCase();
        await this.loadSystemLocalizableStrings(langKey);
        this.loadUserLocalizableStrings(langKey);
    }

    async loadSystemLocalizableStrings(langKey) {
        const localizableStrings = await this.tryLoadLocalizableStrings(this.systemLocalizableStringsBaseUrl, langKey);
        this.systemLocalizedStringsMap.set(langKey, localizableStrings);
    }

    async loadUserLocalizableStrings(langKey) {
        const localizableStrings = await this.tryLoadLocalizableStrings(this.userLocalizableStringsBaseUrl, langKey);
        const systemLocalizableStrings = this.systemLocalizedStringsMap.get(langKey) || {};

        // Register user-level localizedStrings overriding system level localizedStrings
        this.localizedStringsMap.set(langKey, { ...systemLocalizableStrings, ...localizableStrings });
    }

    // actions
    localize(stringKey, language = detectPrimaryLanguage()) {
        const langKey = language.toLowerCase();

        // Try language specific localizedStrings first
        let localizableStrings = this.localizedStringsMap.get(langKey);

        // If not found, try with shorter key (ja-JP -> ja)
        if (!localizableStrings && (langKey.indexOf("-") > 0)) {
            const tokens = langKey.split("-");
            let shorterLangKey;
            while (!(tokens.length == 1 || localizableStrings)) {
                tokens.pop();
                shorterLangKey = tokens.join("-");
                localizableStrings = this.localizedStringsMap.get(shorterLangKey);
            }
        }

        // If still not found, try fallback localizedStrings
        if (!localizableStrings) {
            localizableStrings = this.localizedStringsMap.get(FallbackLocale);
        }
        const value = localizableStrings[stringKey];
        if (!value) return stringKey; // If there is no localization entry, return the original stringKey
        return value;
    }

    mergeLocalizableStrings(partialLocalizableStrings, language = detectPrimaryLanguage()) {
        const langKey = language.toLowerCase();
        let localizableStrings = this.localizedStringsMap.get(langKey);
        if (!localizableStrings) return;
        partialLocalizableStrings.forEach((value, key) => {
            localizableStrings.set(key, value);
        });
    }

    // private
    async tryLoadLocalizableStrings(baseUrl, language) {
        const url = this.localizableStringsUrlFor(baseUrl, language);
        return await fetch(url).then(res => {
            if (res.status >= 300) {
                return {}
            }
            return res.json();
        }).catch(err => {
            console.error(err);
            return {};
        })
    }

    localesDirectoryFor(baseDirectory, language) {
        return `${baseDirectory}/locales/${language}`;
    }

    localizableStringsUrlFor(baseDirectory, language) {
        return `${this.localesDirectoryFor(baseDirectory, language)}/localizable-strings.json`;
    }

    // debugging
    detectPrimaryLanguage() {
        return detectPrimaryLanguage();
    }

}

const DefaultLocaleManager = new LocaleManager();

export default DefaultLocaleManager;
