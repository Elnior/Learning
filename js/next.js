import delay from '/dilatator.js';
import OrationEditor from '/editionComponent.js';

class NextInterface extends OrationEditor {
	static CONDITION = /\w+/i;
	static testable = false;
	static loadingElement = null;
	static verbose = document.createElement("div");
	#workingLv1 = false;
	#workingLv2 = false;
	#workingMaxLevel = true;
	constructor (prayerSetter, formTemplate, confirmT, startTestButton) {
		super(confirmT);
		this.prayerSetter = prayerSetter;
		this.formTemplate = formTemplate;
		this.startTestBox = startTestButton.parentElement;
	}
	static getElements (all, startTest) {
		const $fragment = document.createDocumentFragment();
		const $templateElement = document.getElementById("@element");
		// the iterator
		for (const element of all) {
			// Content reference
			let { content } = $templateElement;
			content.querySelector("p.en").textContent = element.english;
			content.querySelector("p.es").textContent = element.spanish;
			let $article = content.querySelector("article");
			$article.id = element.id;
			
			if (element.state !== null)
				$article.className = element.state? "aproved" : "missing";
			let node = document.importNode(content, true);
			$fragment.appendChild(node);
		}

		if (all.length == 0)
			document.body.appendChild(NextInterface.verbose);
		else {
			NextInterface.testable = true;
			startTest.classList.remove("disabled");
		}

		return $fragment;
	}
	static setNext (obj) {
		const $templateElement = document.getElementById("@element");
		let selection = document.querySelector("div.thereAreNo");
		// Content reference
		let { content } = $templateElement;
		content.querySelector("p.en").textContent = obj.english;
		content.querySelector("p.es").textContent = obj.spanish;
		let $article = content.querySelector("article");
		$article.id = obj.id;
			
		if (obj.state !== null)
			$article.className = obj.state? "aproved" : "missing";
		else {}

		if (selection)
			document.body.removeChild(selection);

		let node = document.importNode(content, true);
		document.body.appendChild(node);
	}
	async setPrayer (generated, method) {
		let $messager1 = generated["en-data"].previousElementSibling;
		let { value } = generated["en-data"];

		let $messager2 = generated["es-data"].previousElementSibling;
		let otherValue = generated["es-data"].value;
		
		if (NextInterface.CONDITION.test(value)) {
			if (NextInterface.CONDITION.test(otherValue)) {
				let dataForSend = {
					spanish: otherValue,
					english: value,
					ID: this.identification
				},
				body = JSON.stringify(dataForSend),
				opt = {
					method,
					headers: {
						accept: "application/json",
						"accept-language": "en",
						"accept-charset": "UTF-8",
						"content-type": "application/json",
						"content-length": body.length
					},
					body
				}
				let response = await fetch(window.location.href, opt);
				if (response.status == 256) {
					NextInterface.setNext(await response.json());
					this.closeForm();
					this.startTestBox.classList.remove("disabled");
				}
				else if (response.status == 272) {
					OrationEditor.modify(dataForSend);
					this.#workingMaxLevel = true;
					this.closeForm("modifying");
					this.startTestBox.classList.remove("disabled");
				}
				else 
					$messager1.textContent = response.statusText;
			}
			else 
				$messager2.textContent = "Write valid words please!";
		}
		else
			$messager1.textContent = "Write valid words please!";
	}
	async viewPrayersInterface () {
		let { content }  = this.formTemplate;

		let $form = content.querySelector("form");
		$form.id = "generating";
		$form.className = "generating";

		content.querySelector("legend").textContent = "Generate words";
		content.querySelector("input#en").value = "";
        content.querySelector("input#es").value = "";

		let imported = document.importNode(content, true);
		
		document.body.appendChild(imported);

		$form = document.getElementById($form.id);
		await delay(1);
		$form.classList.add("visible");
		this.prayerSetter.classList.add("process");
	}
	closeForm (id = "generating") {
		let $form = document.getElementById(id);
		$form.ontransitionend = ()=> {
			$form.ontransitionend = null;
			$form.parentElement.removeChild($form);
			this.#workingLv1 = false;
		}
		$form.classList.remove("visible");
		this.prayerSetter.classList.remove("process");
	}
	handlerClickEvents (evArg) {
		let selected = null;
		if (this.#workingMaxLevel) {
			if ((selected = evArg.target.closest("div.controls svg.del-prayer")) && !this.#workingLv2) {
				this.#workingLv2 = true;
				this.identification = selected.parentElement.parentElement.id;
				this.showQuestion(delay);
			}
			else if (evArg.target.matches("section#confirm-deletion button#no")) {
				this.#workingLv2 = false;
				this.identification = null;
				this.hideQuestion(delay);
			}
			else if (evArg.target.matches("section#confirm-deletion button#yes")) {
				this.#workingLv2 = false;
				this.deletePrayers(delay);
			}
			else if (this.#workingLv2) 
				this.bigEffect();

			else if (evArg.target.closest("div.add-prayer") && !this.#workingLv1) {
				this.viewPrayersInterface();
				this.#workingLv1 = true;
			}
			else if (evArg.target.closest("div.add-prayer") && this.#workingLv1)
				this.closeForm();
			else if ((selected = evArg.target.closest("div.controls svg.edit-prayer")) && !this.#workingLv2) {
				this.identification = selected.parentElement.parentElement.id;
				this.#workingMaxLevel = false;
				this.viewEditor(delay);
			}
		}
		else {
			if (evArg.target.closest("div.add-prayer")) {
				this.closeForm("modifying");
				this.#workingMaxLevel = true;
			}
		}
	}
	handlerSubmitEvents (evArg) {
		if (evArg.target.matches("form#generating")) {
			evArg.preventDefault();
			this.setPrayer(evArg.target, "POST");
		}
		else if (evArg.target.matches("form#modifying")) {
			evArg.preventDefault();
			this.setPrayer(evArg.target, "PUT");
		}
	}
	// init
	static async Main () {
		// initializing..
		NextInterface.verbose.classList.add("thereAreNo");
		NextInterface.verbose.textContent = "There are no test elements.";

		const $h1 = document.querySelector("header h1"),
		$startTest = document.getElementById("start-test").parentElement,
		$loadingIndication = document.querySelector("div.simpleLoader"),
		opt = {
			method: 'CHECKOUT',
			headers: {
				accept: "application/json",
				"accept-language": "en",
				"accept-charset": "UTF-8"
			},
			mode: 'cors'
		}
		try {
			let response = await fetch (window.location.href, opt);

			if (response.status == 290) {
				const { name } = await response.json();
				$h1.textContent = name;
				
				delete opt.mode;
				await delay(2500);

				opt.method = "GET";
				response = await fetch (window.location.href + ".json", opt);
				if (response.status == 288) {
					let $chunk = NextInterface.getElements(await response.json(), $startTest);
					document.body.appendChild($chunk);
				}
				else 
					document.body.appendChild(NextInterface.verbose);
			}
			else {
				$h1.textContent = "Falied!";
				$h1.style.color = "red";
			}
		}
		catch (error) {
			let $chunk = NextInterface.getElements([], $startTest);
			document.body.appendChild($chunk);
		}
		finally {
			NextInterface.loadingElement = $loadingIndication.parentElement.removeChild($loadingIndication);
		}


		const next = new NextInterface( 
			document.querySelector("div.add-prayer"), document.getElementById("@form"),
			document.getElementById("@confirm"),
			document.getElementById("start-test")
		);
		document.addEventListener("click", next.handlerClickEvents.bind(next));
		document.addEventListener("submit", next.handlerSubmitEvents.bind(next));
	}
}


window
.addEventListener("DOMContentLoaded", NextInterface.Main, { once: true, capture: false });