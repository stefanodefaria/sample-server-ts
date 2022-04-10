import {ServerStarter} from "./server-starter";

const serverPort = Number(process.env.SERVER_PORT || 8080);
ServerStarter.start(serverPort).then(server => console.log("Server listening on port " + serverPort));