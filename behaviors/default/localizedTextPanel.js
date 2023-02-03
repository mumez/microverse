// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

class LocalizedTextActor {
    setup() {
        if (this._cardData.textLabel == null) {
            this._cardData.textLabel = "test";
        }
        this.addEventListener("pointerDown", "changeText");
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
        ctx.fillText(this.detectedPrimaryLanguage, w / 2, h);
        h += 25
        ctx.fillStyle = "white";
        textContents.forEach(text => {
            const localizedText = this.localized(text);
            ctx.fillText(localizedText, w / 2, h += 45);
        });
        this.texture.needsUpdate = true;
        console.log('---localeManager :>> ', this.actor.localeManager);
    }

    // accessing
    localized(originalString) {
        return this.actor.localeManager.localize(originalString);
    }

    get detectedPrimaryLanguage() {
        return this.actor.localeManager.detectPrimaryLanguage();
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
