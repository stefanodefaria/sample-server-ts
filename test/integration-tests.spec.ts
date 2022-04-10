import {RestClient} from 'typed-rest-client/RestClient'
import * as portfinder from 'portfinder';
import {User} from "../src/model/user";
import {ServerStarter} from "../src/server-starter";
import {Server} from "http";

describe("testing the sample backend server", () => {

    let restClient: RestClient;
    let server: Server;

    beforeAll(async () => {
        const serverPort = await portfinder.getPortPromise({
            port: 8080,    // minimum port
            stopPort: 9000 // maximum port
        });
        restClient = new RestClient(null, `http://localhost:${serverPort}`);
        server = await ServerStarter.start(serverPort);
    });

    afterAll(async () => {
        await server.close();
    });

    it("is possible to fetch a user by its username", async () => {
        const username1 = "user1";
        const user: User = await getUserSuccess(username1, restClient);
        expect(user.username).toBe(username1);
        expect(user.id).toBe("1");
    });

    describe("should not be possible to create a friendship in invalid scenarios", () => {
        it("should return 404 if one of the users doesn't exist", async () => {
            const response = await restClient.create<void>('/friendship?ids=1,9', null);
            expect(response.statusCode).toBe(404);
        });

        it("should return 400 if friend user IDs are not provided", async () => {
            try {
                // this http client lib throws error when 4xx code is not 404
                await restClient.create<void>('/friendship', null);
                fail("Expected error");
            } catch (e) {
                expect(e.statusCode).toBe(400);
            }
        });

        it("should return 422 if friends are actually the same user", async () => {
            try {
                // this http client lib throws error when 4xx code is not 404
                await restClient.create<void>('/friendship?ids=1,1', null);
                fail("Expected error");
            } catch (e) {
                expect(e.statusCode).toBe(422);
            }
        });
    });

    describe("creation of friendship between two users", () => {

        it("should initially show that users 1 and 2 have no friends", async () => {
            const user1: User = await getUserSuccess('user1', restClient);
            expect(user1.friendUserIds).toHaveLength(0);

            const user2: User = await getUserSuccess('user2', restClient);
            expect(user2.friendUserIds).toHaveLength(0);
        });

        it("should return successful http status code", async () => {
            const response = await restClient.create<void>('/friendship?ids=1,2', null);
            expect(response.statusCode).toBe(204);
        });

        it("should show updated friend IDs in user1", async () => {
            const user1: User = await getUserSuccess('user1', restClient);
            expect(user1.friendUserIds).toHaveLength(1);
            expect(user1.friendUserIds).toContain("2");
        });

        it("should show updated friend IDs in user2", async () => {
            const user2: User = await getUserSuccess('user2', restClient);
            expect(user2.friendUserIds).toHaveLength(1);
            expect(user2.friendUserIds).toContain("1");
        });
    });

    describe("deletion of friendship between two users", () => {
        it("should initially show that users 3 and 4 are friends", async () => {
            const user3: User = await getUserSuccess('user3', restClient);
            expect(user3.friendUserIds).toHaveLength(1);
            expect(user3.friendUserIds).toContain("4");

            const user4: User = await getUserSuccess('user4', restClient);
            expect(user4.friendUserIds).toHaveLength(1);
            expect(user4.friendUserIds).toContain("3");
        });

        it("should return successful http status code", async () => {
            const response = await restClient.del<void>('/friendship?ids=3,4', null);
            expect(response.statusCode).toBe(204);
        });

        it("should show updated friend IDs in user3", async () => {
            const user4: User = await getUserSuccess('user3', restClient);
            expect(user4.friendUserIds).toHaveLength(0);
        });

        it("should show updated friend IDs in user4", async () => {
            const user4: User = await getUserSuccess('user4', restClient);
            expect(user4.friendUserIds).toHaveLength(0);
        });
    });
})

async function getUserSuccess(username: string, restClient: RestClient): Promise<User> {
    const response = await restClient.get<User>(`/users/${username}`);
    expect(response.statusCode).toBe(200);
    expect(response.result).toBeTruthy();
    return response.result;
}