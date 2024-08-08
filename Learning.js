import fs from 'node:fs';
import net from 'node:net';
import anully from 'anully';
import condition from './forServer/condition.js';
import { setTimeout as delay } from 'node:timers/promises';

class TransferManager {
	static activeTransfer = true;
	constructor (writable) {
		this.writable = writable;
		this.byteLengthInserted = 0;
	}
	writeTo (actualBuffer) {
		if (this.writable) {
			try {
				this.byteLengthInserted += actualBuffer.byteLength;
				this.writable.write(actualBuffer);
			}
			catch (error) {
				console.log("Error (0x003): " + error.message);
			}
		}
		else {}
		return true;
	}
	finishWrite () {
		if (this.writable) {
			try {
				this.writable.end();
			}
			catch (error) {
				console.log("Error (0x005): " + error.message);
			}
		}
		else {}
		return true;
	}
}

async function isSource (name, dir) {
	let files = await fs.promises.readdir(dir);
	return files.indexOf(name) !== -1;
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
		reference: name.replaceAll(" ", "-")
	}
}

async function dispatchSocket (obR, socketActual, transfering) {
	switch (obR.method.toLowerCase()) {
		case 'get' :
			if(obR.path == "/" && obR.headers.accept.indexOf("text/html") !== -1)
				await new Promise(async (resolve, reject)=> {
					if (!(await isAdyacent("./interface.html"))) {
						socketActual.write(
							"HTTP/1.1 504 Falied\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);
						socketActual.write("there are internal errors..");
						return resolve();
					}
					const interfaceStream = fs.createReadStream("./interface.html");
					const stat = await fs.promises.stat(interfaceStream.path);

					let isRun = false;
					const callEnd = ()=> !isRun? resolve(isRun = true) : null;
					socketActual.write(
						"HTTP/1.1 200 Ready\r\n" +
						"content-type: text/html; charset=utf-8\r\n" +
						`content-length: ${stat.size}\r\n` +
						"connection: keep-alive\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);

					interfaceStream
					.on("data", chunk=> socketActual.write(chunk))
					.on("end", callEnd)
					.on("close", callEnd);
				});

			else if (obR.path == "/" && obR.headers.accept.indexOf("application/json") == 0)
				await new Promise(async (resolve, reject)=> {
					if (!(await isAdyacent("./interactivity/sections.json"))) {
						socketActual.write(
							"HTTP/1.1 419 there are no\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);
						socketActual.write("There are no sections.. Create a new section (+)");
						return resolve();
					}
					const sectionStream = fs.createReadStream("./interactivity/sections.json");
					const stat = await fs.promises.stat(sectionStream.path);
					
					let isRun = false;
					const callEnd = ()=> !isRun? resolve(isRun = true) : null;
					socketActual.write(
						"HTTP/1.1 200 ok\r\n" +
						"content-type: application/json\r\n" +
						`content-length: ${stat.size}\r\n` +
						"connection: keep-alive\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);
					sectionStream
					.on("data", chunk=> socketActual.write(chunk))
					.on("end", callEnd)
					.on("close", callEnd);
				});

			else if (await isSource(obR.path.replace("/", ""), "./css"))
				await new Promise(async (resolve, reject)=> {
					const fileCssStream = fs.createReadStream(`./css${obR.path}`);
					const stat = await fs.promises.stat(fileCssStream.path);

					let isRun = false;
					const callEnd = ()=> !isRun? resolve(isRun = true) : null;
					
					socketActual.write(
						"HTTP/1.1 200 Ready\r\n" +
						"content-type: text/css\r\n" +
						`content-length: ${stat.size}\r\n` +
						"connection: keep-alive\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);

					fileCssStream
					.on("data", chunk=> socketActual.write(chunk))
					.on("end", callEnd)
					.on("close", callEnd);
				});

			else if (await isSource(obR.path.replace("/", ""), "./js"))
				await new Promise(async (resolve, reject)=> {
					const fileJsStream = fs.createReadStream(`./js${obR.path}`);
					const stat = await fs.promises.stat(fileJsStream.path);

					let isRun = false;
					const callEnd = ()=> !isRun? resolve(isRun = true) : null;
					socketActual.write(
						"HTTP/1.1 200 Ok\r\n" +
						"content-type: application/javascript\r\n" +
						`content-length: ${stat.size}\r\n` +
						"connection: keep-alive\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);

					fileJsStream
					.on("data", chunk=> socketActual.write(chunk))
					.on("error", error=> {
						socketActual.write(
							"HTTP/1.1 504 Falied\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);
						socketActual.write("there are internal errors..");
						callEnd();
					})
					.on("end", callEnd)
					.on("close", callEnd);
				});

			else if (obR.path == "/learn.png") 
				await new Promise(async (resolve, reject)=> {
					if (!(await isAdyacent("./learn.ico"))) {
						socketActual.write(
							"HTTP/1.1 504 Falied\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);
						socketActual.write("there are internal errors..");
						return resolve();
					}
					const iconStream = fs.createReadStream("./learn.ico");
					const stat = await fs.promises.stat(iconStream.path);
					let isRun = false;
					const callEnd = ()=> !isRun? resolve(isRun = true) : null;
						socketActual.write(
							"HTTP/1.1 200 Ready icon\r\n" +
							"content-type: image/x-icon\r\n" +
							`content-length: ${stat.size}\r\n` +
							"connection: keep-alive\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						);

					iconStream
					.on("data", chunk=> socketActual.write(chunk))
					.on("end", callEnd)
					.on("close", callEnd);
				});

			else {
				let forSend = `<h1 style="color: red; text-align:center">Not found direction: ${obR.path}</h1>`;

				socketActual.write(
					"HTTP/1.1 404 Not Found\r\n" +
					"content-type: text/html; charset=utf-8\r\n" +
					`content-length: ${forSend.length}\r\n` +
					"connection: close\r\n" +
					"Server: NElniorS\r\n" +
					`Date: ${new Date()}\r\n` +
					"\r\n"
				);
				socketActual.write(forSend);
			}
		break;

		case 'post' :
			if (obR.path == "/create/section" && obR.headers['content-type'] == "text/txt") {
				if ( condition.test(String.fromCharCode(...obR.body)) ) {
					try {
						let dir = "./interactivity";

						if (await isAdyacent(dir)) {
							if (await isAdyacent(`${dir}/sections.json`)) {
								// I'm set new section
								let sectionsReadableStream = fs.createReadStream(`${dir}/sections.json`);
								const stat = await fs.promises.stat(sectionsReadableStream.path);

								let value = String.fromCharCode(...obR.body),
									isEqualToBeforeName = false;

								let beFromHere = fs.createWriteStream("./fromHere.json");
								beFromHere.write("[\r\n");
								let stringForObject = "";

								let isOpen = false;
								let isClose = false;
								await new Promise ((resolve, reject)=> {
									let isRun = false;
									const callEnd = ()=> !isRun? resolve(isRun = true) : null;

									sectionsReadableStream.on("data", chunk=> {
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
												if (forEvaluate.name == value) {
													isEqualToBeforeName = true;
													sectionsReadableStream.destroy();
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
									.on("error", reject)
									.on("end", ()=> {
										if (isEqualToBeforeName) return beFromHere.end();
										
										beFromHere.write( JSON.stringify(getSection(value)) + "\r\n" );
										beFromHere.write("]");
										beFromHere.end();

									})
									.on("close", ()=> {
										if (isEqualToBeforeName) {
											let message = "This name already exists, please write another one.";
											socketActual.write(
												"HTTP/1.1 241 there are this\r\n" +
												"content-type: text/txt\r\n" +
												`content-length: ${message.length}\r\n` +
												"connection: close\r\n" +
												"Server: NElniorS\r\n" +
												`Date: ${new Date()}\r\n` +
												"\r\n"
											);
											socketActual.write(message);
											callEnd();
										}
										else {
											beFromHere = fs.createReadStream(beFromHere.path);
											let sectionsWritableStream = fs.createWriteStream(sectionsReadableStream.path);

											sectionsWritableStream
											.on("close", callEnd)
											.on("error", reject);

											beFromHere.pipe(sectionsWritableStream);

											socketActual.write(
												"HTTP/1.1 206 Created\r\n" +
												"content-type: text/txt\r\n" +
												"connection: close\r\n" +
												"Server: NElniorS\r\n" +
												`Date: ${new Date()}\r\n` +
												"\r\n"
											);
											socketActual.write("created!");
										}
									});
								});
							}
							else {
								// I'm create the file
								let sectionsStream = fs.createWriteStream(`${dir}/sections.json`);

								await new Promise ((resolve, reject)=> {
									sectionsStream.on("close", ()=> {
										socketActual.write(
											"HTTP/1.1 206 Created\r\n" +
											"content-type: text/txt\r\n" +
											"connection: close\r\n" +
											"Server: NElniorS\r\n" +
											`Date: ${new Date()}\r\n` +
											"\r\n"
										);
										socketActual.write("created!");
										resolve();
									});

									sectionsStream.write("[\r\n");

									sectionsStream.write(JSON.stringify(getSection(String.fromCharCode(...obR.body))) + "\r\n");

									sectionsStream.write("]");

									sectionsStream.end();
								});
							}
						}
						else {
							// I'm creating directory..
							await fs.promises.mkdir(dir);
							// I'm create the file
							let sectionsStream = fs.createWriteStream(`${dir}/sections.json`);

							await new Promise ((resolve, reject)=> {
								sectionsStream.on("close", ()=> {
									socketActual.write(
										"HTTP/1.1 206 Created\r\n" +
										"content-type: text/txt\r\n" +
										"connection: close\r\n" +
										"Server: NElniorS\r\n" +
										`Date: ${new Date()}\r\n` +
										"\r\n"
									);
									socketActual.write("created!");
									resolve();
								});

								sectionsStream.write("[\r\n");

								sectionsStream.write(JSON.stringify(getSection(String.fromCharCode(...obR.body))) + "\r\n");

								sectionsStream.write("]");

								sectionsStream.end();
							});
						}
					}
					catch (error) {
						socketActual.write(
							"HTTP/1.1 211 Expected\r\n" +
							"content-type: text/txt\r\n" +
							"connection: close\r\n" +
							"Server: NElniorS\r\n" +
							`Date: ${new Date()}\r\n` +
							"\r\n"
						);
						socketActual.write("Falied to create section!");
					}
				}
				else {
					socketActual.write(
						"HTTP/1.1 230 invalid name\r\n" +
						"content-type: text/txt\r\n" +
						"connection: keep-alive\r\n" +
						"Server: NElniorS\r\n" +
						`Date: ${new Date()}\r\n` +
						"\r\n"
					);
					socketActual.write(`the name "${String.fromCharCode(...obR.body)}" is not acceptable, numbers and symbols is not acceptable; write again.`);
				}
			}
			else if (obR.path == "/setFile" && transfering instanceof TransferManager) 
				await new Promise((resolve, reject)=> {
					let [ doYouHaveDisposition ] = Object.keys(obR.headers).filter(el=> /content\-disposition/i.test(el));
					let nameOfFile = obR.headers[doYouHaveDisposition]? obR.headers[doYouHaveDisposition] : `file${Date.now()}.byn`;

					transfering.writable
					.on("error", reject)
					.on("close", ()=> {
						fs.promises.rename("./interactivity/download.byn", `./interactivity/${nameOfFile}`)
						.then(()=> {
							let message = "inserted!";
							socketActual.write(
								"HTTP/1.1 222 inserted\r\n" +
								"content-type: text/txt\r\n" +
								`content-length: ${message.length}\r\n` +
								"connection: close\r\n" +
								"Server: NElniorS\r\n" +
								`Date: ${Date.now()}\r\n` +
								"\r\n"
							);
							socketActual.write(message);
							socketActual.end();
							resolve();
						})
						.catch(reject);
					});

					transfering.writable.write( Buffer.from(obR.body) );
				});
			else {
				socketActual.write(
					"HTTP/1.1 400 Bad Request\r\n" +
					"content-type: text/html; charset=utf-8\r\n" +
					"connection: close\r\n" +
					"Server: NElniorS\r\n" +
					`Date: ${new Date()}\r\n` +
					"\r\n"
				);
				socketActual.write(`<h1 style="color: red; text-align:center">Bad Request, the request is not valid.</h1>`);
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
						"Date: " + new Date() + "\r\n" +
						"\r\n"
					);
					socketActual.write("They are the same as this one");
				}
				else if(!condition.test(after)) {
					socketActual.write(
						"HTTP/1.1 230 invalid name\r\n" +
						"content-type: text/txt\r\n" +
						"connection: keep-alive\r\n" +
						"Server: NElniorS\r\n" +
						`Date: ${new Date()}\r\n` +
						"\r\n"
					);
					socketActual.write(`the name "${after}" is not acceptable, numbers and symbols is not acceptable; write again.`);
				}
				else await new Promise ((resolve, reject)=> {
					// I'm rename section
					let sectionsReadableStream = fs.createReadStream(`${dir}/sections.json`);
					let isRenowned = false;

					let beFromHere = fs.createWriteStream("./fromHere.json");
					beFromHere.write("[\r\n");
					let stringForObject = "";

					let isOpen = false;
					let isClose = false;
					let isRun = false;
									
					const callEnd = ()=> !isRun? resolve(isRun = true) : null;

					sectionsReadableStream.on("data", chunk=> {
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
									sectionsReadableStream.destroy();
									break;
								}
								else if (forEvaluate.name == before) {
									isRenowned = true;
									forEvaluate.name = after;
									forEvaluate.reference = after.replaceAll(" ", "-");
								}

								beFromHere.write(JSON.stringify(forEvaluate));
								// reset values
								isOpen = false;
								isClose = false;
								stringForObject = "";
							}
						}
					})
					.on("error", reject)
					.on("end", ()=> {
						if (!isRenowned) return beFromHere.end();
						beFromHere.write("\r\n]");
						beFromHere.end();
					})
					.on("close", ()=> {
							if (!isRenowned) {
								socketActual.write(
									"HTTP/1.1 231 No previous\r\n" +
									"content-type: text/txt\r\n" +
									"connection: close\r\n" +
									"Server: NElniorS\r\n" +
									`Date: ${new Date()}\r\n` +
									"\r\n"
								);
								socketActual.write("No previous name for name change or already exists in the collection.");
								callEnd();
							}
							else {
								beFromHere = fs.createReadStream(beFromHere.path);
								let sectionsWritableStream = fs.createWriteStream(sectionsReadableStream.path);

								sectionsWritableStream
								.on("close", callEnd)
								.on("error", reject);

								beFromHere.pipe(sectionsWritableStream);

										socketActual.write(
											"HTTP/1.1 210 changed\r\n" +
											"content-type: text/txt\r\n" +
											"connection: close\r\n" +
											"Server: NElniorS\r\n" +
											`Date: ${new Date()}\r\n` +
											"\r\n"
										);
										socketActual.write("changed successfully!");
									}
								});
				});
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
		
		case 'delete' :
			let reference = obR.path.replace("/", "");
			let dir = "./interactivity";

			await new Promise ((resolve, reject)=> {
					// I'm deleting section
					let sectionsReadableStream = fs.createReadStream(`${dir}/sections.json`);
					let isRemoved = false;
					let sure = true;

					let beFromHere = fs.createWriteStream("./fromHere.json");
					beFromHere.write("[\r\n");

					let twoSections = [];
					let isExec = false;

					let stringForObject = "";

					let isOpen = false;
					let isClose = false;
					let isRun = false;
									
					const callEnd = ()=> !isRun? resolve(isRun = true) : null;

					sectionsReadableStream.on("data", chunk=> {
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
										isRemoved = true;
										beFromHere.write((isExec? ",\r\n":"") + JSON.stringify(second));
										isExec = true;
									}
									else if (second.reference == reference) {
										isRemoved = true;
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
					.on("error", reject)
					.on("end", ()=> {
						let [ missing ] = twoSections;

						if (missing !== undefined) 
							missing.reference == reference? isRemoved = true : beFromHere.write(",\r\n" + JSON.stringify(missing));
						else {}

						if (!isRemoved) return beFromHere.end();
						

						beFromHere.write("\r\n]");
						beFromHere.end();
					})
					.on("close", ()=> {
						if (!isRemoved) {
							socketActual.write(
								"HTTP/1.1 214 falied deletion\r\n" +
								"content-type: text/txt\r\n" +
								"connection: close\r\n" +
								"Server: NElniorS\r\n" +
								`Date: ${new Date()}\r\n` +
								"\r\n"
							);
							socketActual.write("Falied deletion!");
							callEnd();
						}
						else {
							beFromHere = fs.createReadStream(beFromHere.path);
							let sectionsWritableStream = fs.createWriteStream(sectionsReadableStream.path);

							sectionsWritableStream
							.on("close", callEnd)
							.on("error", reject);

							beFromHere.pipe(sectionsWritableStream);

							socketActual.write(
								"HTTP/1.1 202 deleted\r\n" +
								"content-type: text/txt\r\n" +
								"connection: close\r\n" +
								"Server: NElniorS\r\n" +
								`Date: ${new Date()}\r\n` +
								"\r\n"
							);
							socketActual.write(reference.replaceAll("-", " "));
						}
					});
				});
		break; 

		default :
			socketActual.write(
				"HTTP/1.1 409 there are no method\r\n" +
				"content-type: text/txt\r\n" +
				"connection: keep-alive\r\n" +
				"Sever: NElniorS\r\n" +
				"Date: " + new Date() + "\r\n" +
				"\r\n"
			);
			socketActual.write("There are no method");
		break;
	}
	return socketActual;
}

async function handlerSockets (socket) {
	// start
	return await new Promise((resolve, reject)=> {
			let isRun = false;
			const callEnd = ()=> !isRun? resolve(isRun = true) : null;

			let obRequest = null;
			let transferManager = null;
			let readed = false;
			let lengthTotal = 0;
			let inserted = 0;

			socket
			// readable event
			.on("data", async data => {
				let IamEnd = await new Promise (async (resolve, reject)=> {
					try {
						if (obRequest == null) {
							obRequest = anully( data );
							inserted = (data.length - obRequest.headerLength);
						}
						else {
							if (transferManager !== null) {
								inserted += data.byteLength;
								transferManager.writeTo(data);
							}
						}
						if (obRequest) {
							let [ doYouHaveBody ] = Object.keys(obRequest.headers).filter(el=> /content\-length/i.test(el));

							if (doYouHaveBody || lengthTotal !== 0) {
								lengthTotal = Number(obRequest.headers[doYouHaveBody]);
								// for finish primitive
								if (inserted == lengthTotal && !readed) {
									let target = await dispatchSocket(obRequest, socket, transferManager);
									target.end();
									readed = true;
									resolve(true);
								}
								// For processing big data
								else if (!readed) {
									readed = true;

									if (TransferManager.activeTransfer) {
										TransferManager.activeTransfer = false;

										transferManager = new TransferManager( fs.createWriteStream("./interactivity/download.byn") );
										let target = await dispatchSocket(obRequest, socket, transferManager);

										TransferManager.activeTransfer = true;
										// finished
										target.end();
										resolve(true);
									}
									else {
										socket.destroy();
										resolve(true);
									}
								}
								// for finish more
								else if (inserted == lengthTotal) 
									transferManager.finishWrite();
								else resolve(false);
							}
							else // So there are no body
								dispatchSocket(obRequest, socket)
								.then(target=> {
									target.end();
									resolve(true);
								})
								.catch(error => {
									// debug error:
									console.log("Error(0x001): ", error.message);
									// finished
									socket.end();
									resolve(true);
								});
						}
						else {
							let message = "<h1 style=\"padding: 10px; text-align:center;" +
							"color: red; background-color: black; color: white; font: bold 2m serif\">" +
							"Error (444): invalid request, try again later</h1>";
							socket.write(
								"HTTP/1.1 444 invalid request\r\n" +
								"content-type: text/html; charset=utf-8\r\n" +
								`content-length: ${message.length}\r\n` +
								"connection: keep-alive\r\n" +
								"server: NElniorS\r\n" +
								"\r\n"
							);
							socket.write(message);
							socket.end();
							resolve(true);
						}
					} catch (error) {
						console.log("Error (0x004): ", error);
						resolve(true);
					}
				});
				if (IamEnd)
					callEnd();
			})
			// general error event
			.on("error", error=> console.log("Error(0x000): ", error))
			// readable event
			.on("end", ()=> {
				if (readed) {}
				else // destroy the socket 
					socket.destroy();
			})
			// writable event
			.on("finish",()=> null)
			// general close event
			.on("close", ()=> {
				if (!readed)
					callEnd();
			});
	});
	// end
}

async function serverHandler (socket) {
	// for everythin:
	await handlerSockets(socket);
}

const Server = net.createServer(serverHandler);

process.title = "I'm Learning English - - Server";

Server
.listen(80, '127.0.9.84', (info = Server.address())=> console.log(`Running Server: ${info.address}:${info.port}\r\n`));