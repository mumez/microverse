// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

class LocalizedTextActor {
    async setup() {
        if (this._cardData.textLabel == null) {
            this._cardData.textLabel = "test";
        }
        this.addEventListener("pointerDown", "changeText");
        // if textDomain is set, load translations
        if (this._cardData.textDomain) {
            await this.textTranslationsManager.loadWithFallbackLanguage(this._cardData.textDomain);
        }
    }

    changeText() {
        this.say("textChanged");
    }
}

class LocalizedTextPawn {
    setup() {
        this.updateText();
        this.listen("textChanged", "updateText");
    }

    updateText() {
        let ctx = this.canvas.getContext("2d");
        ctx.textAlign = "right";
        ctx.fillStyle = "yellow";
        ctx.font = "40px Arial";
        const textContents = this.actor._cardData.textContents;
        const w = this.canvas.width;
        let h = 85;
        ctx.fillText(this.detectDefaultLanguage, w / 2, h);
        if (this.textDomain) {
            h += 30
            ctx.fillText(this.textDomain, w / 2, h);
        }
        h += 25
        ctx.fillStyle = "white";
        textContents.forEach(text => {
            const localizedText = this.localized(text);
            ctx.fillText(localizedText, w / 2, h += 45);
        });
        this.texture.needsUpdate = true;
        console.log('---textTranslationsManager :>> ', this.actor.textTranslationsManager);
    }

    // accessing
    localized(originalString) {
        if (this.textDomain) {
            return this.actor.textTranslationsManager.localize(originalString, this.textDomain);
        } else {
            // If textDomain is not given, implicitly use the textDomain based on the current behavior directory name
            return this.actor.textTranslationsManager.localize(originalString);
        }
    }

    get detectDefaultLanguage() {
        return this.actor.textTranslationsManager.detectDefaultLanguage();
    }

    get textDomain() {
        return this.actor._cardData.textDomain;
    }

}


export default {
    modules: [
        {
            name: "LocalizedTextPanel",
            actorBehaviors: [LocalizedTextActor],
            pawnBehaviors: [LocalizedTextPawn],
        },
    ]
}

/* globals Microverse */
