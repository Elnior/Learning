import delay from './dilatator.js';
import Manager from './manager.js';

class HandlerSection extends Manager {
	#selected = false;
	#processing = false;
	#IsPresent = false;
	#sectionActual = null;
	get sectionActual () {
		return this.#sectionActual;
	}
	set sectionActual (value) {
		this.#sectionActual = value;
	}
	get processing () {
		return this.#processing;
	}
	set processing (value) {
		this.#processing = value;
	}
	// the main constructor
	constructor (loader, $nav) {
		// call up contructor..
		super(null);
		// the Nodes of documents
		this.loader = loader;
		this.$nav = $nav;
		// the Nodes for documents
		this.thereAreNoNode = document.createElement("div");
		this.thereAreNoNode.className = "thereAreNo";
	}
	async handlerEventSubmit (evArg) {
		if (evArg.target.matches("form#creatingSection"))
			await this.createSection(evArg, delay);
		else if (evArg.target.matches("form#renSection"))
			await this.renameSection(evArg, delay);
	}
	handlerEventClick (evArg) {
		if (evArg.target.matches("button#set-new-section") && !this.#processing) {
			this.#processing = true;
			let $generateSection = document.getElementById("@generateSection");
			let imported = document.importNode($generateSection.content, true);
			document.body.appendChild(imported);
		}
		else if (evArg.target.matches("div.controls input#cancel")) {
			const $sectionToDelete = (document.querySelector("section#createSection") || document.querySelector("section#renameSection"));
			document.body.removeChild($sectionToDelete);
			this.#processing = false;
		}
		else if (evArg.target.matches("button.moreActions")) {
			let list = document.getElementsByTagName("li");
			
			for (let li of list) {
				if (li.querySelector("button.moreActions") == null) {
					let $menu = li.querySelector("div#ctx-menu");
					let $button = document.createElement("button");
					$button.className = "moreActions";
					$button.textContent = "...";

					li.replaceChild($button, $menu);
				}
				li.classList.remove("selected");
			}

			evArg.target.parentElement.className = "selected";

			let $options = document.getElementById("@context-menu");
			let $menu = $options.content.querySelector("div#ctx-menu");
			$menu.dataset.reference = evArg.target.previousElementSibling.href;

			// import nodes:
			let node = document.importNode($options.content, true);
			// replace node
			evArg.target.parentElement.replaceChild(node, evArg.target);

			this.#selected = true;
		}
		else if (this.#selected) {
			this.#selected = false;

			let list = document.getElementsByTagName("li");
			
			for (let li of list)
				li.classList.remove("selected");

			let $menu = document.querySelector("div#ctx-menu");
			let $button = document.createElement("button");
			$button.className = "moreActions";
			$button.textContent = "...";
			
			this.#sectionActual = evArg.target.parentElement.parentElement;

			$menu.parentElement.replaceChild($button, $menu);

			if (evArg.target.matches("button#rename")) {
				this.#processing = true;
				let $renameSection = document.getElementById("@generateSection");
				// modifier elements for change name..
				let imported = document.importNode($renameSection.content, true);
				let $s = imported.querySelector("section");
				$s.id = "renameSection";
				$s.className = "changeSectionName";
				let $form = imported.querySelector("form");
				$form.section.value = $button.parentElement.querySelector("a").textContent;
				$form.dataset.beforeName = $form.section.value;
				$form.action = "/rename/section";
				$form.id = "renSection";
				$form.sender.value = "Change";
				document.body.appendChild(imported);
			}
		}
	}
	static async Main () {
		const handling = new HandlerSection( document.getElementById("loader"), document.getElementById("all-sections") );
		await delay (2000);
		await handling.loadSections();

		// The click event Handler..
		document.addEventListener("click", handling.handlerEventClick.bind(handling));

		//The submit event Handler..
		document.addEventListener("submit", handling.handlerEventSubmit.bind(handling));
	}
}

window.addEventListener("DOMContentLoaded", HandlerSection.Main);