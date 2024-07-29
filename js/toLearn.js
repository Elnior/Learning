// dilatator
function delay (time) {
	return new Promise ((resolve, reject)=> 
		setTimeout(resolve, time)
	);
}

class HandlerSection {
	constructor (loader, $nav) {
		this.loader = loader;
		this.$nav = $nav;
		// the Nodes for documents
		this.thereAreNoNode = document.createElement("div");
		this.thereAreNoNode.className = "thereAreNo";
		this.thereAreNoNode.textContent = "There are no sections.. create a new section (+)";
	}
	getFragmentOfDocument (parsedSections) {
		const fragment = document.createDocumentFragment();
		let $ul = document.createElement("ul"),
		$li = document.createElement("li"),
		$a = document.createElement("a"),
		$button = document.createElement("button");
		$button.textContent = "...";
		$button.className = "moreActions";

		//...

		return fragment;
	}
	static async Main () {
		const handling = new HandlerSection( document.getElementById("loader"), document.getElementById("all-sections") );
		// handling.loadSections();
	}
}

window.addEventListener("DOMContentLoaded", HandlerSection.Main);