import {User} from "../../model/user";

export interface UsersDao {
    upsert(user: User): Promise<void>;

    getAllById(ids: string[]): Promise<User[]>;

    getByUsername(username: string): Promise<User | undefined>;
}