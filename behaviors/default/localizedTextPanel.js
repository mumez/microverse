// Copyright 2022 by Croquet Corporation, Inc. All Rights Reserved.
// https://croquet.io
// info@croquet.io

/*

This module manages a list of recent values from a bitcoin position
server. It is used with the Elected module, so that one of
participants is chosen to fetch values.

*/

/*

BitcoinTrackerActor's history is a list of {date<milliseconds>, and amount<dollar>}

*/

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
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        const text = this.actor._cardData.textLabel;
        ctx.fillText(text, this.canvas.width - 40, 85);
        this.texture.needsUpdate = true;
        console.log('--updateText--', text);
    }

    teardown() {
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
