import fs from 'node:fs';
import net from 'node:net';
import anully from 'anully';
import { setTimeout as delay } from 'node:timers/promises';

async function isSource (name, dir) {
	let files = await fs.promises.readdir(dir);
	return files.indexOf(name) !== -1;
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
		.catch(error => console.log("Error(0x001)", error));		
	})
	.on("error", (error)=> console.log("Error(0x000)", error))
	.on("end", ()=> console.log("I'm end"))
	.on("finish", ()=> console.log("I have finished!"))
	.on("close", ()=> console.log("I'm closed\r\n"));
}

const Server = net.createServer(serverHandler);

Server
.listen(80, '127.0.9.84', (info = Server.address())=> console.log(`Running Server: ${info.address}:${info.port}\r\n`));