// dilatator
function delay (time) {
	return new Promise ((resolve, reject)=> 
		setTimeout(resolve, time)
	);
}

class HandlerSection {
	#processing = false;
	#IsPresent = false;
	#listOfSections = null;
	constructor (loader, $nav) {
		this.loader = loader;
		this.$nav = $nav;
		// the Nodes for documents
		this.thereAreNoNode = document.createElement("div");
		this.thereAreNoNode.className = "thereAreNo";
	}
	getFragmentOfDocument (sections) {
		const fragment = document.createDocumentFragment();

		for (let section of sections) {
			// each elements collection
			let	$button = document.createElement("button");
			$button.textContent = "...";
			$button.className = "moreActions";

			let $li = document.createElement("li"),
				$a = document.createElement("a");
			$a.href = `/${section.replaceAll(" ", "-")}`;
			$a.textContent = section;
			$li.appendChild($a);
			$li.appendChild($button);
			fragment.appendChild($li);
		}

		return fragment;
	}
	async loadSections() {
		try {
			const response = await fetch(window.location.href, {
				method: 'get',
				headers: {
					accept: "application/json",
					date: new Date()
				},
				mode: 'cors',
				body: null
			});
			if (response.ok) {
				let sections = this.#listOfSections = await response.json();

				let $ul = document.createElement("ul");
						$ul.id = "section-list";

					let $list = this.getFragmentOfDocument( sections.map(object=> object.name) );
					$ul.appendChild($list);
						
					this.$nav.appendChild($ul);
			}
			else {
				this.thereAreNoNode.textContent = await response.text();
				this.$nav.appendChild(this.thereAreNoNode);
			}
		}
		catch (error) {
			this.thereAreNoNode.textContent = error.message;
			this.$nav.appendChild(this.thereAreNoNode);
		}
		finally {
			this.loader.parentElement.removeChild(this.loader);
		}
	}
	async handlerEventSubmit (evArg) {
		if (evArg.target.matches("form#creatingSection")) {
			evArg.preventDefault();
			const obj = {
				method: evArg.target.method,
				headers: {
					"content-type": "text/txt",
					"accept": "text/txt",
					"date": new Date()
				},
				body: evArg.target.section.value
			},
			{ action } = evArg.target;
			const $message = evArg.target.querySelector("div.message");

			try {
				let response = await fetch(action, obj);
				if(response.status == 206) {
					let $ul = this.$nav.querySelector("ul#section-list");
					if ($ul) {
						let $list = this.getFragmentOfDocument([obj.body]);
						$ul.appendChild($list);
						
						this.$nav.appendChild($ul);
					}
					else {
						$ul = document.createElement("ul");
						$ul.id = "section-list";

						let $list = this.getFragmentOfDocument([obj.body]);
						$ul.appendChild($list);
						
						this.$nav.appendChild($ul);
					}
					// Remove boxs
					let $div = this.$nav.querySelector("div.thereAreNo");

					if ($div)
						this.$nav.removeChild($div);

					const $sectionToDelete = document.querySelector("section#createSection");
					document.body.removeChild($sectionToDelete);
					this.#processing = false;
				}
				else {
					$message.textContent = await response.text();
					await delay(3500);
					$message.textContent = '';
				}
			}
			catch (error) {
				$message.textContent = error.message;
				await delay(3500);
				$message.textContent = '';
			}
		}
	}
	handlerEventClick (evArg) {
		if (evArg.target.matches("button#set-new-section") && !this.#processing) {
			this.#processing = true;
			let $generateSection = document.getElementById("@generateSection");
			let imported = document.importNode($generateSection.content, true);
			document.body.appendChild(imported);
		}
		else if (evArg.target.matches("div.controls input#cancel")) {
			const $sectionToDelete = document.querySelector("section#createSection");
			document.body.removeChild($sectionToDelete);
			this.#processing = false;
		}
	}
	static async Main () {
		const handling = new HandlerSection( document.getElementById("loader"), document.getElementById("all-sections") );
		await delay (4000);
		await handling.loadSections();

		// The click event Handler..
		document.addEventListener("click", handling.handlerEventClick.bind(handling));

		//The submit event Handler..
		document.addEventListener("submit", handling.handlerEventSubmit.bind(handling));
	}
}

window.addEventListener("DOMContentLoaded", HandlerSection.Main);