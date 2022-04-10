import {Router, Request, Response} from 'express';
import {UsersService} from "../service/users-service";
import {InvalidFriendshipError} from "../errors/invalid-friendship-error";
import {UserNotFoundError} from "../errors/user-not-found-error";

export class UsersController {
    constructor(private usersSerivce: UsersService, route: Router) {
        route.get("/users/:username", this.getUserByName.bind(this));
        route.post("/friendship", this.postFriendship.bind(this));
        route.delete("/friendship", this.deleteFriendship.bind(this));
    }

    async getUserByName(req: Request, res: Response) {
        const username: string = req.params.username;

        if (!username) return res.status(400).end();

        const user = await this.usersSerivce.getUser(username);
        if (!user) return res.status(404).end(); // Not found

        res.status(200).contentType('application/json').end(JSON.stringify(user)); // OK
    }

    async postFriendship(req: Request<{}, {}, {}, { ids: string }>, res: Response) {
        const friendsIds: string = req.query.ids;
        const status = await this.handleFriendshipChange(friendsIds, this.usersSerivce.setFriendship);
        res.status(status).end();
    }

    async deleteFriendship(req: Request<{}, {}, {}, { ids: string }>, res: Response) {
        const friendsIds: string = req.query.ids;
        const status = await this.handleFriendshipChange(friendsIds, this.usersSerivce.removeFriendship);
        res.status(status).end();
    }

    /**
     * Handles the friendship change
     *
     * @param friendsIdsString comma-separated string of users whose friendship will be changed
     * @param friendshipHandler function from {@link UsersService} that will perform the friendship operation
     * @return the appropriate HTTP status code based on the processing result
     * @private
     */
    private async handleFriendshipChange(
        friendsIdsString: string,
        friendshipHandler: (uid1: string, uid2: string) => Promise<void>
    ): Promise<number> {
        if(!friendsIdsString) return 400; // Bad request

        const friendsIds: string[] = friendsIdsString.split(',');

        if (!friendsIds || friendsIds.length != 2) return 400; // Bad request

        try {
            await friendshipHandler.call(this.usersSerivce, ...friendsIds);
            return 204; // OK with no content
        } catch (e) {
            if (e instanceof InvalidFriendshipError) return 422; // Unprocessable entity
            else if (e instanceof UserNotFoundError) return 404; // Not found
            else return 500; // Internal server error
        }
    }
}