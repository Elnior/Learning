export default class Manager {
	#elementForDeletion = null;
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
		if (sections.length == 0) {
			this.thereAreNoNode.textContent = "There are no sections.";
			fragment.appendChild(this.thereAreNoNode);
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
						$div.parentElement.removeChild($div);

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
				console.log(error);
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
	async confirmDeleteSection (evArg, delay) {
		this.processing = true;
		const $template = document.getElementById("@notifying"),
			$i = $template.content.querySelector("i.section-name"),
		$buttonForDelete = $template.content.querySelector("button#yeah");
		$buttonForDelete.dataset.mainurl = evArg.target.parentElement.dataset.reference;

		$i.textContent = evArg.target.parentElement.dataset.reference.replaceAll(/http\:\/{2}.*\//ig, "").replaceAll("-", " ");
		
		let node = document.importNode($template.content.querySelector("div#toConfirm"), true);
		document.body.appendChild(node);
		await delay(0);
		let $toConfirm = document.getElementById("toConfirm");
		$toConfirm.classList.add("down");
	}
	// here there are error
	async viewNotification (htmlCode, delay, time) {
		try {
			const $template = document.getElementById("@notifying"),
				$div = $template.content.querySelector("div#notifying");
				$div.innerHTML = htmlCode;

			let node = document.importNode($template.content.querySelector("div#notifying"), true);
			document.body.appendChild(node);
			await delay(10);
			let $notifying = document.getElementById("notifying");
			$notifying.classList.add("visible");
			await delay(time);
			$notifying.classList.remove("visible");
			await delay(200);
			$notifying.parentElement.removeChild($notifying);
		}
		catch {}
	}
	async cancelDeleteSection (delay) {
		let $toConfirm = document.getElementById("toConfirm");
		$toConfirm.classList.remove("down");
		await delay(500);

		document.body.removeChild($toConfirm);

		this.processing = false;
	}
	async deleteSection (mainURL, delay) {
		let options = {
			method: "Delete",
			headers: {
				accept: "text/txt",
				date: Date.now()
			},
			body: null
		}
		try {
			const response = await fetch(mainURL, options);
			/* What's status code?
				the status code is 202 */
			if (response.status == 202) {
				this.liSelected.parentElement.removeChild(this.liSelected);

				const $list = document.getElementsByTagName("li");

				if ($list.length == 0) {
					this.thereAreNoNode.textContent = "There are no sections.";
					this.$nav.appendChild(this.thereAreNoNode);
				}

				let $toConfirm = document.getElementById("toConfirm");
				$toConfirm.classList.remove("down");
				await delay(500);

				document.body.removeChild($toConfirm);

				await this.viewNotification(
					`Already deleted the <i class="actual-section">${await response.text()}</i> section`,
					 delay,
					 3000
				);
				this.processing = false;
			}
			else 
				await this.viewNotification(
					await response.text(),
					delay,
					3000
				);
		}
		catch (error) {
			await this.viewNotification(error.message, delay, 4000);
		}
	}
	viewInformationThere ({ reference }, delay) {
		this.processing = true;
		let options = {
			method: "checkout",
			headers: {
				accept: "application/json",
				"accept-language": "en",
				date: Date.now()
			},
			body: null
		}
		fetch(reference, options)
		.then(async resp=> {
			if (resp.status == 290) {
				let sectionInformation = await resp.json();
				let $p = this.infoToSide.querySelector("p");
				let date = new Date(sectionInformation.birthTime),
					ndx = date.toString().indexOf(":") - 3,
					validDate  = date.toString().split("").filter((el, index)=> index < ndx).join("");
					// writed short date
				$p.innerHTML = `Creation Date: <i>${validDate}</i> <br>Name: <i>${sectionInformation.name}</i>`;
				this.infoToSide.classList.remove("toSide");
			}
			else
				this.viewNotification(await resp.text(), delay, 4000)
				.then(()=> this.processing = false);
		})
		.catch(error => this.viewNotification(error.message, delay, 4000)
				.then(()=> this.processing = false));
	}
	closeWindowsInformation (delay) {
		this.infoToSide.classList.add("toSide");
		delay(210)
		.then(()=> this.processing = false);
	}
}