import fs from 'node:fs';
import net from 'node:net';
import anully from 'anully';
import condition from './forServer/condition.js';
import { setTimeout as delay } from 'node:timers/promises';

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

async function dispatchSocket (obR, socketActual) {
	switch (obR.method.toLowerCase()) {
		case 'get' :
			if(obR.path == "/" && obR.headers.accept.indexOf("text/html") !== -1) {
				const interfaceStream = fs.createReadStream("./interface.html");
				await new Promise((resolve, reject)=> {
					let isRun = false;

					const callEnd = ()=> !isRun? resolve(isRun = true) : null;

					interfaceStream
					.on("open", ()=> socketActual.write(
							"HTTP/1.1 200 Ready\r\n" +
							"content-type: text/html; charset=utf-8\r\n" +
							"connection: keep-alive\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						))
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
			}
			else if (obR.path == "/" && obR.headers.accept.indexOf("application/json") == 0) {

				const sectionStream = fs.createReadStream("./interactivity/sections.json");

				await new Promise((resolve, reject)=> {
					let isRun = false;

					const callEnd = ()=> !isRun? resolve(isRun = true) : null;

					sectionStream
					.on("open", ()=> socketActual.write(
							"HTTP/1.1 200 ok\r\n" +
							"content-type: application/json\r\n" +
							"connection: keep-alive\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						))
					.on("data", chunk=> socketActual.write(chunk))
					.on("error", error=> {
						socketActual.write(
						"HTTP/1.1 419 there are no\r\n" +
						"content-type: text/txt\r\n" +
						"connection: close\r\n" +
						"server: NElniorS\r\n" +
						"\r\n"
					);
					socketActual.write("There are no sections.. Create a new section (+)");
						callEnd();
					})
					.on("end", callEnd)
					.on("close", callEnd);
				});
			}
			else if (await isSource(obR.path.replace("/", ""), "./css")) {
				const fileCssStream = fs.createReadStream(`./css${obR.path}`);
				await new Promise((resolve, reject)=> {
					let isRun = false;

					const callEnd = ()=> !isRun? resolve(isRun = true) : null;

					fileCssStream
					.on("open", ()=> socketActual.write(
							"HTTP/1.1 200 Ready\r\n" +
							"content-type: text/css\r\n" +
							"connection: keep-alive\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						))
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
			}
			else if (await isSource(obR.path.replace("/", ""), "./js")) {
				const fileJsStream = fs.createReadStream(`./js${obR.path}`);
				await new Promise((resolve, reject)=> {
					let isRun = false;

					const callEnd = ()=> !isRun? resolve(isRun = true) : null;

					fileJsStream
					.on("open", ()=> socketActual.write(
							"HTTP/1.1 200 Ok\r\n" +
							"content-type: application/javascript\r\n" +
							"connection: keep-alive\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						))
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
			}
			else if (obR.path == "/learn.png") {
				const iconStream = fs.createReadStream("./learn.ico");
				await new Promise((resolve, reject)=> {
					let isRun = false;

					const callEnd = ()=> !isRun? resolve(isRun = true) : null;

					iconStream
					.on("open", ()=> socketActual.write(
							"HTTP/1.1 200 Ready icon\r\n" +
							"content-type: image/x-icon\r\n" +
							"connection: keep-alive\r\n" +
							"server: NElniorS\r\n" +
							"\r\n"
						))
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
			}
			else {

				socketActual.write(
					"HTTP/1.1 404 Not Found\r\n" +
					"content-type: text/html; charset=utf-8\r\n" +
					"connection: close\r\n" +
					"Server: NElniorS\r\n" +
					`Date: ${new Date()}\r\n` +
					"\r\n"
				);
				socketActual.write(`<h1 style="color: red; text-align:center">Not found direction: ${obR.path}</h1>`);
			}
		break;

		case 'post' :
			if (obR.path == "/create/section" && obR.headers['content-type'] == "text/txt") {
				if ( condition.test(obR.body.trim()) ) {
					try {
						let dir = "./interactivity";

						if (await isAdyacent(dir)) {
							if (await isAdyacent(`${dir}/sections.json`)) {
								// I'm set new section
								let sectionsReadableStream = fs.createReadStream(`${dir}/sections.json`);
								let value = obR.body.trim(),
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
											socketActual.write(
												"HTTP/1.1 241 there are this\r\n" +
												"content-type: text/txt\r\n" +
												"connection: close\r\n" +
												"Server: NElniorS\r\n" +
												`Date: ${new Date()}\r\n` +
												"\r\n"
											);
											socketActual.write("This name already exists, please write another one.");
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

									sectionsStream.write(JSON.stringify(getSection(obR.body.trim())) + "\r\n");

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
								sectionsStream.on("finish", ()=> {
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

								sectionsStream.write(JSON.stringify(getSection(obR.body.trim())) + "\r\n");

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
					socketActual.write(`the name "${obR.body.trim()}" is not acceptable, numbers and symbols is not acceptable; write again.`);
				}
			}
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
				let { after, before } = JSON.parse(obR.body);
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
					let isRenoved = false;

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
									isRenoved = false;
									sectionsReadableStream.destroy();
									break;
								}
								else if (forEvaluate.name == before) {
									isRenoved = true;
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
						if (!isRenoved) return beFromHere.end();
						beFromHere.write("\r\n]");
						beFromHere.end();
					})
					.on("close", ()=> {
							if (!isRenoved) {
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

function serverHandler (socket) {
	socket
	.on("data", chunk=> {
		const obRequest = anully( chunk.toString("utf-8") );

		dispatchSocket(obRequest, socket)
		.then(target=> {
			target.end();
		})
		.catch(error => {
			// debug error:
			console.log("Error(0x001): ", error.message);
			// finished
			socket.end();
		});		
	})
	.on("error", (error)=> console.log("Error(0x000)", error))
	.on("end", ()=> console.log("I'm end"))
	.on("finish", ()=> console.log("I have finished!"))
	.on("close", ()=> console.log("I'm closed\r\n"));
}

const Server = net.createServer(serverHandler);

process.title = "I'm Learning English - - Server";

Server
.listen(80, '127.0.9.84', (info = Server.address())=> console.log(`Running Server: ${info.address}:${info.port}\r\n`));