import fs from 'node:fs';
import net from 'node:net';
import anully from 'anully';
import condition from './forServer/condition.js';
import { DataBaseOfTheSections, ContentSectionDataBase } from './forServer/dataBases.js';

class TransferManager {
    static statistic = null;
    static processQueue = [];
    static processQueue2 = [];
    static processQueue3 = [];
    static processQueue4 = [];
    static processQueue5 = [];
    static processQueue6 = [];
    static processQueue7 = [];
    activeTransfer = false;
    dataCollection = new Set();
}

function isSource (name, dir) {
	return new Promise((resolve, reject)=> {
        fs.stat(`${dir}/${name}`, function (error, statActual) {
            if (error)
                resolve(false);
            else
                resolve(statActual);
        });
    });
}

function isAdyacent (path) {
	return new Promise ((resolve, reject)=>
		fs.exists(path, resolve)
	);
}

function getSection (name) {
	return {
		name,
		birthTime: Date.now(),
		reference: name.replace(/\s/g, "-")
	}
}

function getReferenceSection (ref) {
	return new Promise ((resolve, reject)=> {
		// Searching reference object
		let allSection = fs.createReadStream(`./interactivity/sections.json`);
		let searched = false;

		let stringForObject = "";
		let isOpen = false;
		let isClose = false;

		allSection.on("data", chunk=> {
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
					if (processed.reference == ref.replace("/", "")) {
						allSection.destroy();
						searched = true;
						resolve(processed);
						break;
					}
					// reset values
					isOpen = false;
					isClose = false;
					stringForObject = "";
				}
			}
		})
		.on("end", ()=> searched? null : resolve(new Error(`The are no ${ref} reference`)))
		.on("error", error => resolve(error));
	});
}

async function dispatchSocket (obR, socketActual, transfering) {
	switch (obR.method.toLowerCase()) {
		case 'get' :
			if(obR.path == "/")
                fs.stat("./interface.html", function (error, stat) {
                    if (error) {
                        socketActual.write(
							"HTTP/1.1 504 Falied\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);
						socketActual.write("there are internal errors..");
						socketActual.end();
                    }
                    const interfaceStream = fs.createReadStream("./interface.html");

					socketActual.write(
						"HTTP/1.1 200 Ok\r\n" +
						"content-type: text/html; charset=utf-8\r\n" +
						`content-length: ${stat.size}\r\n` +
						"connection: close\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);

					interfaceStream
					.on("data", chunk=> socketActual.write(chunk))
					.on("close", ()=> socketActual.end());
                });

			else if (obR.path == "/53ct10n5-actual" && obR.headers.accept.indexOf("application/json") == 0)
                fs.stat("./interactivity/sections.json", function (error, stat) {
                    if (error) {
                        socketActual.write(
							"HTTP/1.1 419 there are no\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);
						socketActual.write("There are no sections.. Create a new section (+)");
						socketActual.end();
                    }
                    else {
                        const sectionStream = fs.createReadStream("./interactivity/sections.json");

					    socketActual.write(
						    "HTTP/1.1 200 ready\r\n" +
						    "content-type: application/json\r\n" +
						    `content-length: ${stat.size}\r\n` +
						    "connection: close\r\n" +
						    "server: NElniorS\r\n" +
						    "\r\n"
       					);
					    sectionStream.on("data", chunk => socketActual.write(chunk))
					    .on("close", ()=> socketActual.end());
                    }
                });

		   else if (TransferManager.statistic = await isSource(obR.path.replace("/", ""), "./css")) {
                    const fileCssStream = fs.createReadStream(`./css${obR.path}`);
					socketActual.write(
						"HTTP/1.1 200 \r\n" +
						`content-type: ${/\.css$/i.test(obR.path)? "text/css" : "image/jpg"}\r\n` +
						`content-length: ${TransferManager.statistic.size}\r\n` +
						"connection: close\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);

					fileCssStream.on("data", chunk => socketActual.write(chunk))
					.on("close", ()=> socketActual.end());
           }

           else if (TransferManager.statistic = await isSource(obR.path.replace("/", ""), "./js")) {
                    const fileJsStream = fs.createReadStream(`./js${obR.path}`);

					socketActual.write(
						"HTTP/1.1 200 Ok\r\n" +
						"content-type: application/javascript\r\n" +
						`content-length: ${TransferManager.statistic.size}\r\n` +
						"connection: close\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);

					fileJsStream
					.on("data", chunk=> socketActual.write(chunk))
					.on("close", ()=> socketActual.end());
           }

           else if (TransferManager.statistic = await isSource(obR.path.replace("/", ""), "./interactivity")) {
                    const dataForLearn = fs.createReadStream(`./interactivity${obR.path}`);

					socketActual.write(
						"HTTP/1.1 288 Great\r\n" +
						"content-type: application/json\r\n" +
						`content-length: ${TransferManager.statistic.size}\r\n` +
						"connection: close\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);

					dataForLearn.on("data", chunk=> socketActual.write(chunk))
					.on("close", ()=> socketActual.end());
           }

			else if (obR.path == "/learn.png")
                fs.stat("./learn.ico", function (error, statistic) {
                    if (error) {
                        socketActual.write(
							"HTTP/1.1 504 Falied\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);
						socketActual.write("there are internal errors..");
						socketActual.end();
                    }
                    else {
                        const iconStream = fs.createReadStream("./learn.ico");
						socketActual.write(
							"HTTP/1.1 200 Ready icon\r\n" +
							"content-type: image/x-icon\r\n" +
							`content-length: ${statistic.size}\r\n` +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);

    					iconStream.on("data", chunk=> socketActual.write(chunk))
                        .on("close", ()=> socketActual.end());
                    }
                });

			else {
				try {
					let posibleReference = await getReferenceSection(obR.path);
					// if is error, go to catch block..
					if (posibleReference instanceof Error)
						throw null;
                    else fs.stat("./forServer/nextInterface.html", function (error, statistic) {
                        if (error) {
                            socketActual.write(
								"HTTP/1.1 504 Falied\r\n" +
								"content-type: text/txt\r\n" +
								"connection: close\r\n" +
								"server: NElniorS\r\n" +
								"\r\n"
							);
							socketActual.write("there are internal errors..");
							socketActual.end();
                        }
                        else {
                            const nextInterfaceStream = fs.createReadStream("./forServer/nextInterface.html");
    						socketActual.write(
	    						"HTTP/1.1 200 Well\r\n" +
	    						"content-type: text/html; charset=utf-8\r\n" +
	    						`content-length: ${statistic.size}\r\n` +
	    						"connection: close\r\n" +
	    						"server: NElniorS\r\n" +
	    						"\r\n"
	    					);

	    					nextInterfaceStream.on("data", chunk=> socketActual.write(chunk))
    						.on("end", ()=> socketActual.end());
                        }
                    });
				}
				catch (err) {
					let forSend = Buffer.from(`<h1 style="color: red; text-align:center">Not found direction: ${obR.path}</h1>`, "utf-8");
					socketActual.write(
						"HTTP/1.1 404 Not Found\r\n" +
						"content-type: text/html; charset=utf-8\r\n" +
						`content-length: ${forSend.length}\r\n` +
						"connection: close\r\n" +
						"Server: NElniorS\r\n" +
						`Date: ${Date.now()}\r\n` +
						"\r\n"
					);
					socketActual.write(forSend);
				}
			}
		break;

		case 'post' :
			if (obR.path == "/create/section" && obR.headers['content-type'] == "text/txt") {
				if ( condition.test(String.fromCharCode(...obR.body)) ) {
					try {
						let dir = "./interactivity";

						if (await isAdyacent(dir)) {
							if (await isAdyacent(`${dir}/sections.json`)) {
                                let theNewSection = getSection(String.fromCharCode(...obR.body));
                                TransferManager.processQueue.push({theNewSection, socketActual});
                                // continue process..
                                if (!DataBaseOfTheSections.processing) {
                                    while (true) {
                                        let context = TransferManager.processQueue.shift();
                                        if (context == undefined) break;
                                        let dataBaseOfTheSections = new DataBaseOfTheSections(`${dir}/sections.json`);
                                        let [message, isWellDone] = await dataBaseOfTheSections.addSection(context.theNewSection);

                                        if (isWellDone)
                                            context.socketActual.write(
                								"HTTP/1.1 206 Created\r\n" +
            									"content-type: text/txt\r\n" +
            									"connection: close\r\n" +
            									"Server: NElniorS\r\n" +
            									`Date: ${Date.now()}\r\n` +
               									"\r\n"
		            						);
                                        else
                                            context.socketActual.write(
                								"HTTP/1.1 215 Some faild\r\n" +
            									"content-type: text/txt\r\n" +
            									"connection: close\r\n" +
            									"Server: NElniorS\r\n" +
            									`Date: ${Date.now()}\r\n` +
               									"\r\n"
		            						);

								        context.socketActual.write(message);
                                        context.socketActual.end();
                                    }
                                    DataBaseOfTheSections.processing = false;
                                }
							}
							else {
								// I'm creating the file
								let sectionsStream = fs.createWriteStream(`${dir}/sections.json`);

								sectionsStream.on("close", ()=> {
									socketActual.write(
										"HTTP/1.1 206 Created\r\n" +
										"content-type: text/txt\r\n" +
										"connection: close\r\n" +
										"Server: NElniorS\r\n" +
										`Date: ${Date.now()}\r\n` +
										"\r\n"
									);
									socketActual.end();
								}).write("[\r\n");

								sectionsStream.write(JSON.stringify(getSection(String.fromCharCode(...obR.body))) + "\r\n");
								sectionsStream.write("]");
								sectionsStream.end();
							}
						}
						else {
							// I'm creating directory..
							await fs.promises.mkdir(dir);
							// I'm create the file
							let sectionsStream = fs.createWriteStream(`${dir}/sections.json`);

							sectionsStream.on("close", ()=> {
								socketActual.write(
									"HTTP/1.1 206 Created\r\n" +
									"content-type: text/txt\r\n" +
									"connection: close\r\n" +
									"Server: NElniorS\r\n" +
									`Date: ${Date.now()}\r\n` +
									"\r\n"
								);
    							socketActual.end();
                            });

							sectionsStream.write("[\r\n");
							sectionsStream.write(JSON.stringify(getSection(String.fromCharCode(...obR.body))) + "\r\n");
							sectionsStream.write("]");
							sectionsStream.end();
						}
					}
					catch (error) {
						socketActual.write(
							"HTTP/1.1 211 Expected\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"Server: NElniorS\r\n" +
							`Date: ${Date.now()}\r\n` +
							"\r\n"
						);
						socketActual.write("Falied to create section!");
					}
				}
				else {
					socketActual.write(
						"HTTP/1.1 230 invalid name\r\n" +
						"content-type: text/txt\r\n" +
						"connection: close\r\n" +
						"Server: NElniorS\r\n" +
						`Date: ${Date.now()}\r\n` +
						"\r\n"
					);
					socketActual.write(`the name "${String.fromCharCode(...obR.body)}" is not acceptable, numbers and symbols is not acceptable; write again.`);
                    socketActual.end();
				}
			}

			else if (!(await getReferenceSection(obR.path) instanceof Error)) {
				if (await isAdyacent(`./interactivity${obR.path}.json`)) {
					// I'm set new prayer element
					let dataB = Buffer.from(obR.body, "utf-8");
					let value = JSON.parse(dataB.toString("UTF-8"));
					value.state = null;
					delete value.ID;
					let processedB = JSON.stringify(value);
					let binaryData = Buffer.from(processedB + "\r\n", "utf-8");
                    TransferManager.processQueue4.push({value, socketActual});
                    // continue process..
                    if (!ContentSectionDataBase.processing) {
                        while (true) {
                            let context = TransferManager.processQueue4.shift();
                            if (context == undefined) break;
                            let content = new ContentSectionDataBase (`./interactivity${obR.path}.json`);
                            let [message, isWellDone] = await content.addContent(context.value);

                            if (isWellDone) {
                                context.socketActual.write(
							        "HTTP/1.1 256 Inserted successfully\r\n" +
							        "content-type: application/json\r\n" +
							        "connection: close\r\n" +
							        `content-length: ${binaryData.byteLength}\r\n` +
							        "Server: NElniorS\r\n" +
							        `Date: ${Date.now()}\r\n` +
							        "\r\n"
						        );
						        context.socketActual.write(binaryData);
								context.socketActual.end();
						    }

                            else {
                                context.socketActual.write(
                                    "HTTP/1.1 215 Some faild\r\n" +
                                    "content-type: text/txt\r\n" +
                                    "connection: close\r\n" +
                                    "Server: NElniorS\r\n" +
                                    `Date: ${Date.now()}\r\n` +
                                    "\r\n"
                                );
								context.socketActual.write(message);
								context.socketActual.end();
                            }
                        }
                        ContentSectionDataBase.processing = false;
                    }
				}
				else {
					// I'm create the prayers file
					let dataStream = fs.createWriteStream(`./interactivity${obR.path}.json`);
					let dataB = Buffer.from(obR.body, "utf-8");
					// the first data object
					let obj = JSON.parse(dataB.toString("utf-8"));
					obj.id = "0x1";
					obj.state = null;
					delete obj.ID;
					let processedB = JSON.stringify(obj);
					let binaryData = Buffer.from(processedB + "\r\n", "utf-8");

					dataStream.on("close", ()=> {
    					socketActual.write(
							"HTTP/1.1 256 Inserted successfully\r\n" +
							"content-type: application/json\r\n" +
							"connection: close\r\n" +
							`content-length: ${binaryData.byteLength}\r\n` +
							"Server: NElniorS\r\n" +
							`Date: ${Date.now()}\r\n` +
							"\r\n"
						);
						socketActual.write(binaryData);
						socketActual.end();
					});

					dataStream.write("[\r\n");
					dataStream.write(binaryData);
					dataStream.write("]");
					dataStream.end();
    			}
	    	}
			else {
				socketActual.write(
					"HTTP/1.1 400 Bad Request\r\n" +
					"content-type: text/html; charset=utf-8\r\n" +
					"connection: close\r\n" +
					"Server: NElniorS\r\n" +
					`Date: ${Date.now()}\r\n` +
					"\r\n"
				);
				socketActual.write(`<h1 style="color: red; text-align:center">Error (400): the request is not valid.</h1>`);
			}
		break;

		case 'put' :
			if (obR.path == "/rename/section") {
				let { after, before } = JSON.parse(String.fromCharCode(...obR.body));
				let dir = "./interactivity";

				if (after == before) {
					socketActual.write(
						"HTTP/1.1 250 They are the same\r\n" +
						"content-type: text/txt\r\n" +
						"connection: close\r\n" +
						"Sever: NElniorS\r\n" +
						`Date: ${Date.now()}\r\n` +
						"\r\n"
					);
					socketActual.write("They are the same as this one");
                    socketActual.end();
				}
				else if(!condition.test(after)) {
					socketActual.write(
						"HTTP/1.1 230 invalid name\r\n" +
						"content-type: text/txt\r\n" +
						"connection: keep-alive\r\n" +
						"Server: NElniorS\r\n" +
						`Date: ${Date.now()}\r\n` +
						"\r\n"
					);
					socketActual.write(`the name "${after}" is not acceptable, numbers and symbols is not acceptable; write again.`);
                    socketActual.end();
				}
				else {
                    TransferManager.processQueue2.push({before, after, socketActual});
                    // continue process..
                    if (!DataBaseOfTheSections.processing) {
                        while (true) {
                            let context = TransferManager.processQueue2.shift();
                            if (context == undefined) break;
                            let dataBaseOfTheSections = new DataBaseOfTheSections(`${dir}/sections.json`);
                            let [message, isWellDone] = await dataBaseOfTheSections.renameSection(context.before, context.after);
                            if (isWellDone)
                                context.socketActual.write(
    								"HTTP/1.1 210 changed\r\n" +
    								"content-type: text/txt\r\n" +
    								"connection: close\r\n" +
    								"Server: NElniorS\r\n" +
    								`Date: ${Date.now()}\r\n` +
    								"\r\n"
    							);

                            else
                                context.socketActual.write(
								   "HTTP/1.1 231 No previous\r\n" +
        						   "content-type: text/txt\r\n" +
								   "connection: close\r\n" +
								   "Server: NElniorS\r\n" +
								   `Date: ${Date.now()}\r\n` +
								   "\r\n"
        						);

                            context.socketActual.write(message);
                            context.socketActual.end();
                        }
                        DataBaseOfTheSections.processing = false;
                    }
                }
			}
			else if (await isAdyacent(`./interactivity${obR.path}.json`)) {
        			let modified = JSON.parse(Buffer.from(obR.body, "utf-8").toString("utf-8"));
        			modified.state = null;

                    TransferManager.processQueue5.push({modified, socketActual});
                    // continue process..
                    if (!ContentSectionDataBase.processing) {
                        while (true) {
                            let context = TransferManager.processQueue5.shift();
                            if (context == undefined) break;
                            let content = new ContentSectionDataBase (`./interactivity${obR.path}.json`);
                            let [message, isWellDone] = await content.modifyContent(context.modified);

                            if (isWellDone) {
                                context.socketActual.write(
								    "HTTP/1.1 272 edited\r\n" +
								    "content-type: text/txt\r\n" +
								    "connection: close\r\n" +
								    "Server: NElniorS\r\n" +
								    `Date: ${Date.now()}\r\n` +
								    "\r\n"
							    );
							    context.socketActual.write("changed successfully!");
								context.socketActual.end();
						    }

                            else {
                                context.socketActual.write(
								    "HTTP/1.1 291 does not exist\r\n" +
								    "content-type: text/txt\r\n" +
								    "connection: close\r\n" +
								    "Server: NElniorS\r\n" +
								    `Date: ${Date.now()}\r\n` +
								    "\r\n"
							    );
    							context.socketActual.write(`The ${modified.ID} id does not exist`);
								context.socketActual.end();
                            }
                        }
                        ContentSectionDataBase.processing = false;
                    }
			}

			else {
				socketActual.write(
					"HTTP/1.1 470 bad put\r\n" +
					"content-type: text/txt\r\n" +
					"connection: close\r\n" +
					"Sever: NElniorS\r\n" +
					"Date: " + Date.now() + "\r\n" +
					"\r\n"
				);
				socketActual.write("bad_put_request");
			}
		break;

		case 'patch':
			if (await isAdyacent(`./interactivity${obR.path}`)) {
			    let value = JSON.parse(Buffer.from(obR.body, "utf-8").toString("utf-8"));

                    TransferManager.processQueue7.push({value, socketActual});
                    // continue process..
                    if (!ContentSectionDataBase.processing) {
                        while (true) {
                            let context = TransferManager.processQueue7.shift();
                            if (context == undefined) break;
                            let content = new ContentSectionDataBase (`./interactivity${obR.path}`);
                            let [message, isWellDone] = await content.evaluateContent(context.value);
                            if (isWellDone) {
                                context.socketActual.write(
							        "HTTP/1.1 265 evaluated\r\n" +
							        "content-type: text/txt\r\n" +
							        "connection: close\r\n" +
							        "Server: NElniorS\r\n" +
							        `Date: ${Date.now()}\r\n` +
							        "\r\n"
						        );

						        context.socketActual.write(message);
								context.socketActual.end();
						    }

                            else {
                                context.socketActual.write(
							        "HTTP/1.1 493 invalid ID\r\n" +
							        "content-type: text/txt\r\n" +
							        "connection: close\r\n" +
							        "Server: NElniorS\r\n" +
							        `Date: ${Date.now()}\r\n` +
							        "\r\n"
						        );
						        context.socketActual.write(`Does not exist`);
								context.socketActual.end();

                            }
                        }
                        ContentSectionDataBase.processing = false;
                    }
			}

			else {
				socketActual.write(
					"HTTP/1.1 405 bad patch\r\n" +
					"content-type: text/txt\r\n" +
					"connection: close\r\n" +
					"Sever: NElniorS\r\n" +
					"Date: " + Date.now() + "\r\n" +
					"\r\n"
				);
				socketActual.write("bad_patch");
			}
		break;

		case 'delete' :
			let reference = obR.path.replace("/", "");
			let dir = "./interactivity";
			if (await isAdyacent(dir + obR.path)) {
			    let reference = JSON.parse(Buffer.from(obR.body, "utf-8").toString("utf-8"));
			    TransferManager.processQueue6.push({identification: reference.identification, socketActual});
                    // continue process..
                    if (!ContentSectionDataBase.processing) {
                        while (true) {
                            let context = TransferManager.processQueue6.shift();
                            if (context == undefined) break;
                            let content = new ContentSectionDataBase (dir + obR.path);
                            let [message, isWellDone] = await content.deleteContent(context.identification);

                            if (isWellDone)
                                context.socketActual.write(
								    "HTTP/1.1 242 deleted\r\n" +
								    "content-type: text/txt\r\n" +
								    "connection: close\r\n" +
								    "Server: NElniorS\r\n" +
								    `Date: ${Date.now()}\r\n` +
								    "\r\n"
							    );

                            else
                                context.socketActual.write(
								    "HTTP/1.1 264 Falied to delete\r\n" +
								    "content-type: text/txt\r\n" +
								    "connection: close\r\n" +
								    "Server: NElniorS\r\n" +
								    `Date: ${Date.now()}\r\n` +
								    "\r\n"
							    );

                            context.socketActual.write(message);
						    context.socketActual.end();
                        }
                        ContentSectionDataBase.processing = false;
                    }
			}

			else {
			    TransferManager.processQueue3.push({reference, socketActual});
                    // continue process..
                    if (!DataBaseOfTheSections.processing) {
                        while (true) {
                            let context = TransferManager.processQueue3.shift();
                            if (context == undefined) break;
                            let dataBaseOfTheSections = new DataBaseOfTheSections(`${dir}/sections.json`);
                            let [message, isWellDone] = await dataBaseOfTheSections.deleteSection(context.reference);

                            if (isWellDone)
                                context.socketActual.write(
    								"HTTP/1.1 202 deleted\r\n" +
    								"content-type: text/txt\r\n" +
    								"connection: close\r\n" +
    								"Server: NElniorS\r\n" +
    								`Date: ${ Date.now() }\r\n` +
    								"\r\n"
    							);

                            else
                                context.socketActual.write(
								    "HTTP/1.1 214 falied deletion\r\n" +
    								"content-type: text/txt\r\n" +
	    							"connection: close\r\n" +
	    							"Server: NElniorS\r\n" +
	    							`Date: ${Date.now()}\r\n` +
	    							"\r\n"
	    						);

                            context.socketActual.write(message);
                            context.socketActual.end();
                        }
                        DataBaseOfTheSections.processing = false;
                    }
			}

		break;

		case 'checkout' :
			const posibleObject = await getReferenceSection(obR.path);
			if (posibleObject instanceof Error) {
				socketActual.write(
					"HTTP/1.1 487 there are no reference\r\n" +
					"content-type: text/txt\r\n" +
					"connection: keep-alive\r\n" +
					"Sever: NElniorS\r\n" +
					"Date: " + Date.now() + "\r\n" +
					"\r\n"
				);
				socketActual.write("Error(487): There are no reference");
				socketActual.end();
			}
			else {
				socketActual.write(
					"HTTP/1.1 290 there are reference\r\n" +
					"content-type: application/json\r\n" +
					"connection: keep-alive\r\n" +
					"Sever: NElniorS\r\n" +
					"Date: " + Date.now() + "\r\n" +
					"\r\n"
				);
				socketActual.write( JSON.stringify(posibleObject) );
				socketActual.end();
			}
		break;

		default :
			socketActual.write(
				"HTTP/1.1 409 there are no method\r\n" +
				"content-type: text/txt\r\n" +
				"connection: keep-alive\r\n" +
				"Sever: NElniorS\r\n" +
				"Date: " + Date.now() + "\r\n" +
				"\r\n"
			);
			socketActual.write("There are no method");
			socketActual.end();
		break;
	}
}

function serverHandler (socket) {
    let transferManager = new TransferManager();
    socket
    // readable event
	.on("data", data => {
        if (!transferManager.activeTransfer) {
            transferManager.activeTransfer = true;
            let obRequest = anully(data);
            if (obRequest)
                dispatchSocket(obRequest, socket, transferManager)
                .catch(error=> {
                    socket.write(
				        "HTTP/1.1 540\r\n" +
				        "content-type: text/txt\r\n" +
				        "connection: keep-alive\r\n" +
				        "Sever: NElniorS\r\n" +
				        "Date: " + Date.now() + "\r\n" +
				        "\r\n"
			        );
			        socket.write(error.message);
			        socket.end();
                });
            else socket.end();
        }
        else transferManager.dataCollection.add(data);
     })
	 // general error event
	 .on("error", error=> console.log("Error(0x000): ", error))
	 // readable event
	 .on("end", ()=> {
        "end"
      })
      // writable event
      .on("finish",()=> {
          "finish"
      })
	  // general close event
	  .on("close", ()=> {
           "close"
      });
}

const Server = net.createServer(serverHandler);

process.title = "I'm Learning English - - Server";

Server
.listen(80, '127.0.9.84', (info = Server.address())=> console.log(`Running Server: ${info.address}:${info.port}\r\n`));
