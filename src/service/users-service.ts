import {User} from "../model/user";
import {UsersDao} from "../persistence/dao/users-dao";
import {InvalidFriendshipError} from "../errors/invalid-friendship-error";
import {UserNotFoundError} from "../errors/user-not-found-error";

export class UsersService {

    public constructor(private usersDao: UsersDao) {
    }

    public async getUser(username: string): Promise<User | undefined> {
        return this.usersDao.getByUsername(username);
    }

    public async setFriendship(userIdOne: string, userIdTwo: string) {
        if (userIdOne === userIdTwo)
            throw new InvalidFriendshipError(`Both users of friendship have the same ID: ${userIdTwo} `);

        const {userOne, userTwo} = await this.safeGetUsers(userIdOne, userIdTwo);
        if (!userOne.friendUserIds.includes(userIdTwo)) userOne.friendUserIds.push(userIdTwo);
        if (!userTwo.friendUserIds.includes(userIdOne)) userTwo.friendUserIds.push(userIdOne);

        await Promise.allSettled([
            this.usersDao.upsert(userOne),
            this.usersDao.upsert(userTwo)
        ]);
    }

    public async removeFriendship(userIdOne: string, userIdTwo: string) {
        const {userOne, userTwo} = await this.safeGetUsers(userIdOne, userIdTwo);
        userOne.friendUserIds = userOne.friendUserIds.filter(id => id != userIdTwo);
        userTwo.friendUserIds = userTwo.friendUserIds.filter(id => id != userIdOne);

        await Promise.allSettled([
            this.usersDao.upsert(userOne),
            this.usersDao.upsert(userTwo)
        ]);
    }

    private async safeGetUsers(userIdOne: string, userIdTwo: string): Promise<{ userOne: User, userTwo: User }> {
        const friendUsers = await this.usersDao.getAllById([userIdOne, userIdTwo]);
        const userOne = friendUsers.find(u => u.id === userIdOne);
        const userTwo = friendUsers.find(u => u.id === userIdTwo);

        if (!userOne) throw new UserNotFoundError(`User id=${userIdOne} does not exist`);
        if (!userTwo) throw new UserNotFoundError(`User id=${userIdTwo} does not exist`);

        return {userOne, userTwo};
    }
}