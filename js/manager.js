export default class Manager {
	getFragmentOfDocument (sections) {
		const fragment = document.createDocumentFragment();

		for (let section of sections) {
			// for everything element collection
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
				let sections = await response.json();

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
	async createSection (evArg, delay) {
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
					this.processing = false;
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
	async renameSection (evArg, delay) {
		evArg.preventDefault();
		const obj = {
			method: 'PUT',
			headers: {
				"content-type": "application/json",
				"accept": "text/txt",
				"date": Date.now()
			},
			body: JSON.stringify(
				{
					before: evArg.target.dataset.beforeName,
					after: evArg.target.section.value
				}
			)
		},
		{ action } = evArg.target;
		const $message = evArg.target.querySelector("div.message");
		try {
			let response = await fetch(action, obj);
			if(response.status == 210) {
				if (this.sectionActual) {
					let $a = this.sectionActual.querySelector("a");
					$a.textContent = evArg.target.section.value;
					$a.href = $a.textContent.replaceAll(" ", "-");
				}
				this.sectionActual = null;
				// the last instructions
				const $sectionToDelete = document.querySelector("section#renameSection");
				document.body.removeChild($sectionToDelete);
				this.processing = false;
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