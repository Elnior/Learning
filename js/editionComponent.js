import PlayTest from './realizeTest.js';

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
    static modify ({english, spanish, ID}) {
        const $actualArticle = document.getElementById(ID);
        $actualArticle.querySelector("p.en").textContent = english;
        $actualArticle.querySelector("p.es").textContent = spanish;
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
    async viewEditor (delay) {
        const { content } = this.formTemplate;
        let $article = document.getElementById(this.identification),
        $p1 = $article.querySelector("p.en"),
        $p2 = $article.querySelector("p.es");

        let $form = content.querySelector("form");
        $form.id = "modifying";
        $form.className = "modifying";
        let $legend = content.querySelector("legend");
        $legend.textContent = "Edit words";
        content.querySelector("input#en").value = $p1.textContent;
        content.querySelector("input#es").value = $p2.textContent;

        let node = document.importNode(content, true);
        document.body.appendChild(node);
        await delay(10);
        $form = document.getElementById($form.id);
        $form.classList.add("visible");
        this.prayerSetter.classList.add("process");
    }
    bigEffect () {
        let qtnReference = document.body.querySelector("section#confirm-deletion");
        if(qtnReference) qtnReference.classList.add("big");
    }
    runTest (mode, delay) {
        PlayTest.Start(
            document.importNode(this.mainTest.content, true),
            Array.from(document.querySelectorAll("article[id]")).map(el => ({
                ID: el.id,
                en: el.querySelector("p.en").textContent,
                es: el.querySelector("p.es").textContent
            })),
            mode,
            delay
        )
        .then(()=> window.location.reload())
        .catch(err=> alert(err.message));
    }
    async selectMode (delay) {
        let nd = document.importNode(this.modeSelector.content, true);
        document.body.appendChild(nd);
        let $selector = document.getElementById("select-m");
        await delay(10);
        $selector.classList.add("visible");
        return $selector;
    }
    cancelTest (selector) {
        selector.ontransitionend = ()=> selector.parentElement? selector.parentElement.removeChild(selector) : null;
        selector.classList.remove("visible");
    }
}