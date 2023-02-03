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
        console.log('this :>> ', this);
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
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        const text = this.actor._cardData.textLabel;
        const w = this.canvas.width;
        ctx.fillText(this.localized(text), w - (w / 2), 85);
        this.texture.needsUpdate = true;
        console.log('--updateText--', text);
        console.log('---DefaultLocaleManager :>> ', this.actor.localeManager);
    }

    // accessing
    localized(originalString) {
        return this.actor.localeManager.localize(originalString);
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
