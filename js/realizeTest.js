export default class PlayTest {
    #prayers = [];
    #mode = "";
    constructor (imported, prayers, mode, delay) {
        this.#prayers = prayers;
        this.#mode = mode;
        document.body.appendChild(imported);
        this.$h2 = document.body.querySelector("main#testing h2");
        this.$form = document.body.querySelector("form#working-now-in-test");
        this.oration = this.$form.oration;
        this.$message = this.$form.querySelector("div.message");
        this.response = this.$form.response;
        const mainMethod = async evArg => {
            this.$form.onsubmit = ev => ev.preventDefault();
            evArg.preventDefault();
            const dataForEvaluate = {
                ID: this.response.dataset.ID,
                response: this.response.value,
                mode: this.#mode
            }
            if (dataForEvaluate.response.trim() != "" && dataForEvaluate.response.length > 1) {
                try {
                    let body = JSON.stringify(dataForEvaluate);
                    const calification = await fetch(window.location.href + ".json", {
                        method: 'PATCH',
                        mode: 'cors',
                        headers: {
                            accept: "text/txt",
                            "accept-charset": "utf-8",
                            "accept-language": "en",
                            "content-type": "application/json"
                        },
                        body
                    });
                    this.$message.textContent = await calification.text();
                    await delay(2000);
                    this.resolve();
                }
                catch (error) {
                    this.reject(error);
                }
            }
            else 
                this.$message.textContent = "Write a valid response please!";
            
            this.$form.onsubmit = mainMethod;
        }
        // the submit event
        this.$form.onsubmit = mainMethod;
        // the click event
        this.$form.onclick = evArg => {
            if (evArg.target.matches("form#working-now-in-test button[type='button']"))
                window.location.reload();
        }
    }
    async next (index) {
        try {
            if (index >= this.#prayers.length)
                return false;
            await new Promise ((resolve, reject)=> {
                const data = this.#prayers[index];
                this.$h2.innerHTML = `${this.#mode}:<br>${index+1}/${this.#prayers.length}`;
                this.response.dataset.ID = data.ID;
                this.response.value = "";
                this.$message.textContent = "";

                if (this.#mode == "en") 
                    this.oration.value = data.en;
                else 
                    this.oration.value = data.es;

                this.resolve = resolve;
                this.reject = reject;
            });
            return true;
        }
        catch (error) {
            alert(error.message);
            return false;
        }
    }
    static async Start ( imported, prayers, mode, delay ) {
        const playingTest = new PlayTest(imported, prayers, mode, delay);
        await delay(100);

        playingTest.$h2.parentElement.classList.add("visible");
        let index = 0;

        while (await playingTest.next(index++));
    }
}