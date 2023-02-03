// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

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
            this.loadLocalizableStrings();
        }
    }

    async loadLocalizableStrings(language = navigator.language) {
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
        this.localizedStringsMap.set(langKey, { ...systemLocalizableStrings, ...localizableStrings });
        
        console.log('this.localizedStringsMap :>> ', this.localizedStringsMap);
    }

    // actions

    // private
    async tryLoadLocalizableStrings(baseUrl, language) {
        const url = this.localizableStringsUrlFor(baseUrl, language);
        const resp = await fetch(url);
        return resp.json();
    }

    localesDirectoryFor(baseDirectory, language) {
        return `${baseDirectory}/locales/${language}`;
    }

    localizableStringsUrlFor(baseDirectory, language) {
        return `${this.localesDirectoryFor(baseDirectory, language)}/localizable-strings.json`;
    }

}

const DefaultLocaleManager = new LocaleManager();

export default DefaultLocaleManager;
