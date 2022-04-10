import {UsersDao} from "../users-dao";
import {User} from "../../../model/user";

const mockUsersDb: Map<String, User> = new Map<String, User>([
    ["1", {id: "1", username: "user1", friendUserIds: []}],
    ["2", {id: "2", username: "user2", friendUserIds: []}],
    ["3", {id: "3", username: "user3", friendUserIds: ["4"]}],
    ["4", {id: "4", username: "user4", friendUserIds: ["3"]}]
]);

export class MockUsersDao implements UsersDao {

    async getByUsername(username: string): Promise<User | undefined> {
        let userResult : User;
        mockUsersDb.forEach((user) => {
            if (user.username === username) userResult = user;
        });
        return userResult;
    }

    async getAllById(ids: string[]): Promise<User[]> {
        return ids.map(id => mockUsersDb.get(id)).filter(Boolean);
    }

    async upsert(user: User): Promise<void> {
        mockUsersDb.set(user.id, user);
    }
}
