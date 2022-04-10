import * as express from 'express';
import {UsersDao} from "./persistence/dao/users-dao";
import {MockUsersDao} from "./persistence/dao/mock/mock-users-dao";
import {UsersService} from "./service/users-service";
import {UsersController} from "./controller/users-controller";
import {Server} from "http";

// This class performs the instantiation and dependency injection of every object used to run this server
export class ServerStarter {
    public static async start(serverPort: number = 8080) {

        const dao: UsersDao = new MockUsersDao();
        const service = new UsersService(dao);
        const route = express.Router()
        new UsersController(service, route);

        const app = express();
        app.use(route);

        return new Promise<Server>(resolve => {
            const server = app.listen(serverPort, () => resolve(server));
        })
    }
}
