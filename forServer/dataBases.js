import fs from 'node:fs';
import path from 'node:path';
// Classes for database handler
export class DataBaseOfTheSections extends Object {
    static processing = false;

    #sectionsReadableStream = null;
    constructor (location = `./interactivity/sections.json`) {
        super(null);
        this.location = location;
        DataBaseOfTheSections.processing = true;
    }
    open () {
        // I'm set new object block
        return new Promise ((resolve, reject)=> {
            this.#sectionsReadableStream = fs.createReadStream(this.location);
            let isCalled = false;
            const done = arg => {
                if (isCalled) null;
                else resolve(arg);
                isCalled = true;
            }
            this.#sectionsReadableStream
            .on("ready", done)
            .on("error", done);
        });
    }
    async addSection (newObject) {
        let posibleError = await this.open();
        if (posibleError) return [posibleError.message, false];

        let isEqualToBeforeName = false;

        let beFromHere = fs.createWriteStream(`${path.dirname(this.location)}/temporal-29.json`);
        beFromHere.write("[\r\n");
        let stringForObject = "";

        let isOpen = false;
        let isClose = false;

        return new Promise((resolve, reject)=> {
            this.#sectionsReadableStream.on("data", chunk => {
                for (let each of chunk.toString('utf-8')) {
                    // verifing
					if (each == "{")
						isOpen = true;
					else if (each == "}")
						isClose = true;
					else {}

					if (isOpen)
						stringForObject += each;
					else {}

                    if (isClose) {
						// for each object
						let forEvaluate = JSON.parse(stringForObject);
						if (forEvaluate.name == newObject.name) {
							isEqualToBeforeName = true;
							this.#sectionsReadableStream.destroy();
							break;
						}

						beFromHere.write(stringForObject + ",\r\n");
						// reset values
						isOpen = false;
						isClose = false;
						stringForObject = "";
					}
                }
            })
            .on("close", ()=> {
                beFromHere.write(JSON.stringify(newObject) + "\r\n");
                beFromHere.write("]");
                beFromHere.close();
                if (isEqualToBeforeName) {
					let message = "This name already exists, please write another one.";
                    resolve([message, false]);
                }
                else {
                    const theRealName = this.#sectionsReadableStream.path;
                    // block of name change
                    fs.rename(beFromHere.path, `${path.dirname(this.location)}/tr-29.json`, (posibleError)=> {
                        if (posibleError) resolve([posibleError.message, false]);
                        else fs.rename(this.#sectionsReadableStream.path, `${path.dirname(this.location)}/train-29.json`, (posibleError)=> {
                            if (posibleError) resolve([posibleError.message, false]);
                            else fs.rename(`${path.dirname(this.location)}/tr-29.json`, theRealName, (posibleError)=> {
                                if (posibleError) resolve([posibleError.message, false]);
                                else fs.rename(`${path.dirname(this.location)}/train-29.json`, `${path.dirname(this.location)}/temporal-29.json`, (posibleError)=> {
                                    if (posibleError) resolve([posibleError.message, false]);
                                    else resolve(["Inserted successfully", true]);
                                });
                            });
                        });
                    });
                }
            });
        });
    }

    async renameSection (before, after) {
        let posibleError = await this.open();
        if (posibleError) return [posibleError.message, false];

        let isRenowned = false;

        let beFromHere = fs.createWriteStream(`${path.dirname(this.location)}/temporal-29.json`);
        beFromHere.write("[\r\n");
        let stringForObject = "";

        let isOpen = false;
        let isClose = false;

        return new Promise((resolve, reject)=> {
            this.#sectionsReadableStream.on("data", chunk=> {
                for (let each of chunk.toString('utf-8')) {
                    // verifing
					if (each == "{")
						isOpen = true;
					else if (each == "}")
						isClose = true;
					else {}

					if (isOpen)
						stringForObject += each;
					else if (each == ",")
						beFromHere.write(each + "\r\n");
					else {}

					if (isClose) {
						// for each object
						let forEvaluate = JSON.parse(stringForObject);

						if (forEvaluate.name == after) {
							isRenowned = false;
							this.#sectionsReadableStream.destroy();
							break;
						}
						else if (forEvaluate.name == before) {
							isRenowned = true;
							forEvaluate.name = after;
							before = forEvaluate.reference; // old reference
							after = forEvaluate.reference = after.replace(/\s/g, "-");
						}

						beFromHere.write(JSON.stringify(forEvaluate));
						// reset values
						isOpen = false;
						isClose = false;
						stringForObject = "";
					}
				}
			})
            .on("close", ()=> {
                beFromHere.write("\r\n");
                beFromHere.write("]");
                beFromHere.close();
                if (!isRenowned) {
					let message = "No previous name for name change or already exists in the collection.";
                    resolve([message, false]);
                }
                else {
                    const theRealName = this.#sectionsReadableStream.path;
                    // block of name change
                    fs.rename(`${path.dirname(this.location)}/${before.replace(/\s/g, "-")}.json`, `${path.dirname(this.location)}/${after.replace(/\s/g, "-")}.json`, (posibleFirstError)=> {
                        fs.rename(beFromHere.path, `${path.dirname(this.location)}/tr-29.json`, (posibleError)=> {
                            if (posibleError) resolve([posibleError.message, false]);
                            else fs.rename(this.#sectionsReadableStream.path, `${path.dirname(this.location)}/train-29.json`, (posibleError)=> {
                                if (posibleError) resolve([posibleError.message, false]);
                                else fs.rename(`${path.dirname(this.location)}/tr-29.json`, theRealName, (posibleError)=> {
                                    if (posibleError) resolve([posibleError.message, false]);
                                    else fs.rename(`${path.dirname(this.location)}/train-29.json`, `${path.dirname(this.location)}/temporal-29.json`, (posibleError)=> {
                                        if (posibleError) resolve([posibleError.message, false]);
                                        else resolve(["Renowned successfully", true]);
                                    });
                                });
                            });
                        });
                    });
                }
            });
        });
    }

    async deleteSection (reference) {
        let posibleError = await this.open();
        if (posibleError) return [posibleError.message, false];

        let isDeleted = false;
        let isExec = false;
        let twoSections = [];

        let beFromHere = fs.createWriteStream(`${path.dirname(this.location)}/temporal-29.json`);
        beFromHere.write("[\r\n");
        let stringForObject = "";

        let isOpen = false;
        let isClose = false;

        return new Promise((resolve, reject)=> {
            this.#sectionsReadableStream
            .on("data", chunk=> {
                for (let each of chunk.toString('utf-8')) {
    				// verifing
    				if (each == "{")
    				    isOpen = true;
    				else if (each == "}")
    				    isClose = true;
    				else {}

    				if (isOpen)
    				    stringForObject += each;
    				else {}

    				if (isClose) {
    				    // for two objects
    				    let processed = JSON.parse(stringForObject);
    				    twoSections.push(processed);
    				    if (twoSections.length == 2) {
    				        let [first, second] = twoSections;

    				        if(first.reference == reference) {
    				            isDeleted = true;
    				            beFromHere.write((isExec? ",\r\n":"") + JSON.stringify(second));
    				            isExec = true;
    				        }
    				        else if (second.reference == reference) {
    				            isDeleted = true;
    				            beFromHere.write((isExec? ",\r\n":"") + JSON.stringify(first));
    				            isExec = true;
    				        }
    				        else {
    				            beFromHere.write((isExec? ",\r\n":"") + JSON.stringify(first) + ",\r\n");
    				            beFromHere.write(JSON.stringify(second));
    				            isExec = true;
    				        }
    				        twoSections = [];
    				    }
    				    else {}
    				    // reset values
    				    isOpen = false;
    				    isClose = false;
    				    stringForObject = "";
    				}
                }
            })
            .on("end", ()=> {
                let [ missing ] = twoSections;

                if (missing !== undefined)
                    missing.reference == reference? isDeleted = true : beFromHere.write(",\r\n" + JSON.stringify(missing));
                else {}

                if (!isDeleted) return beFromHere.end();

                beFromHere.write("\r\n]");
                beFromHere.close();
            })
            .on("close", ()=> {
                if (!isDeleted) {
					let message = "Falied deletion!";
                    resolve([message, false]);
                }
                else {
                    const theRealName = this.#sectionsReadableStream.path;
                    // block of name change
                    fs.rm(`${path.dirname(this.location)}/${reference}.json`, posibleFirstError => {
                        fs.rename(beFromHere.path, `${path.dirname(this.location)}/tr-29.json`, (posibleError)=> {
                            if (posibleError) resolve([posibleError.message, false]);
                            else fs.rename(this.#sectionsReadableStream.path, `${path.dirname(this.location)}/train-29.json`, (posibleError)=> {
                                if (posibleError) resolve([posibleError.message, false]);
                                else fs.rename(`${path.dirname(this.location)}/tr-29.json`, theRealName, (posibleError)=> {
                                    if (posibleError) resolve([posibleError.message, false]);
                                    else fs.rename(`${path.dirname(this.location)}/train-29.json`, `${path.dirname(this.location)}/temporal-29.json`, (posibleError)=> {
                                        if (posibleError) resolve([posibleError.message, false]);
                                        else resolve(["Already to deleted section successfully", true]);
                                    });
                                });
                            });
                        });
                    });
                }
            });
        });
    }
}

export class ContentSectionDataBase {
    static processing = false;
    #content = null;
    constructor (location) {
        ContentSectionDataBase.processing = true;
        this.location = location;
    }

    open () {
        // I'm set new object block
        return new Promise ((resolve, reject)=> {
            this.#content = fs.createReadStream(this.location);
            let isCalled = false;
            const done = arg => {
                if (isCalled) null;
                else resolve(arg);
                isCalled = true;
            }
            this.#content
            .on("ready", done)
            .on("error", done);
        });
    }

    async addContent (newObject) {
        let posibleError = await this.open();
        if (posibleError) return [posibleError.message, false];

        let beFromHere = fs.createWriteStream(`${path.dirname(this.location)}/NtemporaliOr-29.json`);
        let integer = 1;
        beFromHere.write("[\r\n");
        newObject.id = `0x${integer.toString(16)}`;
        beFromHere.write(JSON.stringify(newObject));
        let stringForObject = "";

        let isOpen = false;
        let isClose = false;

        return new Promise((resolve, reject)=> {
            this.#content.on("data", chunk => {
                for (let each of chunk.toString('utf-8')) {
                    // verifing
					if (each == "{")
						isOpen = true;
					else if (each == "}")
						isClose = true;
					else {}

					if (isOpen)
						stringForObject += each;
					else {}

                    if (isClose) {
						// for each object
						let forEvaluate = JSON.parse(stringForObject);
						integer++;
						forEvaluate.id = `0x${integer.toString(16)}`;
						beFromHere.write(`,\r\n${JSON.stringify(forEvaluate)}`);
						// reset values
						isOpen = false;
						isClose = false;
						stringForObject = "";
					}
                }
            })
            .on("close", ()=> {
                beFromHere.write("\r\n]");
                beFromHere.close();
                 const theRealName = this.#content.path;
                    // block of name change
                    fs.rename(beFromHere.path, `${path.dirname(this.location)}/three-29.json`, (posibleError)=> {
                        if (posibleError) resolve([posibleError.message, false]);
                        else fs.rename(this.#content.path, `${path.dirname(this.location)}/four-29.json`, (posibleError)=> {
                            if (posibleError) resolve([posibleError.message, false]);
                            else fs.rename(`${path.dirname(this.location)}/three-29.json`, theRealName, (posibleError)=> {
                                if (posibleError) resolve([posibleError.message, false]);
                                else fs.rename(`${path.dirname(this.location)}/four-29.json`, `${path.dirname(this.location)}/NtemporaliOr-29.json`, (posibleError)=> {
                                    if (posibleError) resolve([posibleError.message, false]);
                                    else resolve(["Inserted successfully", true]);
                                });
                            });
                        });
                    });
             });
        });
    }

    async modifyContent (newObject) {
        let posibleError = await this.open();
        if (posibleError) return [posibleError.message, false];

        let beFromHere = fs.createWriteStream(`${path.dirname(this.location)}/NtemporaliOr-29.json`);
        let modified = false;
        beFromHere.write("[\r\n");
        let stringForObject = "";

        let isOpen = false;
        let isClose = false;

        return new Promise((resolve, reject)=> {
            this.#content.on("data", chunk => {
                for (let each of chunk.toString('utf-8')) {
                    // verifing
					if (each == "{")
						isOpen = true;
					else if (each == "}")
						isClose = true;
					else {}

					if (isOpen)
						stringForObject += each;
					else if (each == ",")
					    beFromHere.write(`,\r\n`);
					else {}

                    if (isClose) {
						// for each object
						let forEvaluate = JSON.parse(stringForObject);
						if (forEvaluate.id == newObject.ID && !modified) {
						    delete newObject.ID;
						    newObject.id = forEvaluate.id;
						    forEvaluate = newObject;
						    modified = true;
						}
						beFromHere.write(`${JSON.stringify(forEvaluate)}`);
						// reset values
						isOpen = false;
						isClose = false;
						stringForObject = "";
					}
                }
            })
            .on("close", ()=> {
                beFromHere.write("\r\n]");
                beFromHere.close();
                 const theRealName = this.#content.path;
                    // block of name change
                    fs.rename(beFromHere.path, `${path.dirname(this.location)}/three-29.json`, (posibleError)=> {
                        if (posibleError) resolve([posibleError.message, false]);
                        else fs.rename(this.#content.path, `${path.dirname(this.location)}/four-29.json`, (posibleError)=> {
                            if (posibleError) resolve([posibleError.message, false]);
                            else fs.rename(`${path.dirname(this.location)}/three-29.json`, theRealName, (posibleError)=> {
                                if (posibleError) resolve([posibleError.message, false]);
                                else fs.rename(`${path.dirname(this.location)}/four-29.json`, `${path.dirname(this.location)}/NtemporaliOr-29.json`, (posibleError)=> {
                                    if (posibleError) resolve([posibleError.message, false]);
                                    else resolve(["Done!", modified]);
                                });
                            });
                        });
                    });
             });
        });
    }

    async deleteContent (identification) {
        let posibleError = await this.open();
        if (posibleError) return [posibleError.message, false];

        let beFromHere = fs.createWriteStream(`${path.dirname(this.location)}/NtemporaliOr-29.json`);
        beFromHere.write("[\r\n");
        let deleted = false;
		let twoPrayers = [];
		let isExec = false;
		let stringForObject = "";

		let isOpen = false;
		let isClose = false;

        return new Promise((resolve, reject)=> {
            this.#content.on("data", chunk=> {
						for (let each of chunk.toString('utf-8')) {
							// verifing
							if (each == "{")
								isOpen = true;
							else if (each == "}")
								isClose = true;
							else {}

							if (isOpen)
								stringForObject += each;
							else {}

							if (isClose) {
								// for two objects
								let processed = JSON.parse(stringForObject);
								twoPrayers.push(processed);
								if (twoPrayers.length == 2) {
									let [first, second] = twoPrayers;

									if(first.id == identification) {
										deleted = true;
										beFromHere.write((isExec? ",\r\n":"") + JSON.stringify(second));
										isExec = true;
									}
									else if (second.id == identification) {
										deleted = true;
										beFromHere.write((isExec? ",\r\n":"") + JSON.stringify(first));
										isExec = true;
									}
									else {
										beFromHere.write((isExec? ",\r\n":"") + JSON.stringify(first) + ",\r\n");
										beFromHere.write(JSON.stringify(second));
										isExec = true;
									}
									twoPrayers = [];
								}
								else {}
								// reset values
								isOpen = false;
								isClose = false;
								stringForObject = "";
							}
						}
					})
					.on("end", ()=> {
					    let [ missing ] = twoPrayers;

						if (missing !== undefined)
							missing.id == identification? deleted = true : beFromHere.write(",\r\n" + JSON.stringify(missing));
						else {}

						if (!deleted) return beFromHere.end();

						beFromHere.write("\r\n]");
						beFromHere.close();
					})
            .on("close", ()=> {
                 if (!deleted) return resolve([`The "${identification}" identification does not exist`, deleted]);
                 const theRealName = this.#content.path;
                    // block of name change
                    fs.rename(beFromHere.path, `${path.dirname(this.location)}/three-29.json`, (posibleError)=> {
                        if (posibleError) resolve([posibleError.message, false]);
                        else fs.rename(this.#content.path, `${path.dirname(this.location)}/four-29.json`, (posibleError)=> {
                            if (posibleError) resolve([posibleError.message, false]);
                            else fs.rename(`${path.dirname(this.location)}/three-29.json`, theRealName, (posibleError)=> {
                                if (posibleError) resolve([posibleError.message, false]);
                                else fs.rename(`${path.dirname(this.location)}/four-29.json`, `${path.dirname(this.location)}/NtemporaliOr-29.json`, (posibleError)=> {
                                    if (posibleError) resolve([posibleError.message, false]);
                                    else resolve(["Done!", deleted]);
                                });
                            });
                        });
                    });
             });
        });
    }

    async evaluateContent (evaluationData) {
        let posibleError = await this.open();
        if (posibleError) return [posibleError.message, false];

        let beFromHere = fs.createWriteStream(`${path.dirname(this.location)}/NtemporaliOr-29.json`);
        let isCorrect = false,
        isAdyacent = false;
        beFromHere.write("[\r\n");
        let stringForObject = "";

        let isOpen = false;
        let isClose = false;

        return new Promise((resolve, reject)=> {
            this.#content.on("data", chunk => {
                for (let each of chunk.toString('utf-8')) {
                    // verifing
					if (each == "{")
						isOpen = true;
					else if (each == "}")
						isClose = true;
					else {}

					if (isOpen)
						stringForObject += each;
					else if (each == ",")
					    beFromHere.write(`,\r\n`);
					else {}

                    if (isClose) {
						// for each object
						let forEvaluate = JSON.parse(stringForObject);
						if (forEvaluate.id == evaluationData.ID && evaluationData.mode == 'es') {
						    isAdyacent = true;
						    if (forEvaluate.english.trim().toLowerCase() == evaluationData.response.trim().toLowerCase()) {
						        isCorrect = true;
						        forEvaluate.state = isCorrect;
						    }
						    else {
						        forEvaluate.state = isCorrect;
						    }
						}
						else if (forEvaluate.id == evaluationData.ID) {
						    isAdyacent = true;
						    if (forEvaluate.spanish.trim().toLowerCase() == evaluationData.response.trim().toLowerCase()) {
						        isCorrect = true;
						        forEvaluate.state = isCorrect;
						    }
						    else {
						        forEvaluate.state = isCorrect;
						    }
						}
						else {}
						beFromHere.write(`${JSON.stringify(forEvaluate)}`);
						// reset values
						isOpen = false;
						isClose = false;
						stringForObject = "";
					}
                }
            })
            .on("close", ()=> {
                beFromHere.write("\r\n]");
                beFromHere.close();
                 const theRealName = this.#content.path;
                    // block of name change
                    fs.rename(beFromHere.path, `${path.dirname(this.location)}/three-29.json`, (posibleError)=> {
                        if (posibleError) resolve([posibleError.message, false]);
                        else fs.rename(this.#content.path, `${path.dirname(this.location)}/four-29.json`, (posibleError)=> {
                            if (posibleError) resolve([posibleError.message, false]);
                            else fs.rename(`${path.dirname(this.location)}/three-29.json`, theRealName, (posibleError)=> {
                                if (posibleError) resolve([posibleError.message, false]);
                                else fs.rename(`${path.dirname(this.location)}/four-29.json`, `${path.dirname(this.location)}/NtemporaliOr-29.json`, (posibleError)=> {
                                    if (posibleError) resolve([posibleError.message, false]);
                                    else resolve([isCorrect? "You win!" : "You lose!", isAdyacent]);
                                });
                            });
                        });
                    });
             });
        });
    }
}
