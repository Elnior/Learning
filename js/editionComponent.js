export default class OrationEditor {
    #id = null;
    get identification () {
        return this.#id;
    }
    set identification (value) {
        this.#id = value;
    }
    constructor (confirmTemplate) {
        this.confirmTemplate = confirmTemplate;
    }
    async deletePrayers (delay) {
        // more codes..
        let body = JSON.stringify({ identification: this.identification });
        let opt = {
            method: 'DELETE',
            headers: {
                accept: 'text/txt',
                "accept-language": "en",
                "accept-charset": "utf-8",
                "content-type": "application/json",
                "content-length": body.length,
                "date": Date.now()
            },
            body
        }
        const res = await fetch (window.location.href + ".json", opt);
        if (res.status == 242) {
            let $elementForDeletion = document.getElementById(this.identification);
            $elementForDeletion.parentElement.removeChild($elementForDeletion);
            this.hideQuestion(delay);
        }
        else 
            alert(`Message: ${await res.text()}`);
    }
    async showQuestion (delay) {
        let { content } = this.confirmTemplate;
        let qtnToUser = document.importNode(content, true);
        document.body.appendChild(qtnToUser);
        let qtnReference = document.body.querySelector("section#confirm-deletion");
        qtnReference.ontransitionend = ()=>  qtnReference.classList.remove("big");
        await delay(10);
        qtnReference.classList.add("show");
    }
    async hideQuestion (delay) {
        let qtnReference = document.body.querySelector("section#confirm-deletion");
        if (qtnReference) {
            qtnReference.ontransitionend = ()=>  qtnReference.parentElement.removeChild(qtnReference);
            await delay(10);
            qtnReference.classList.remove("show");
        }
    }
    bigEffect () {
        let qtnReference = document.body.querySelector("section#confirm-deletion");
        if(qtnReference) qtnReference.classList.add("big");
    }
}