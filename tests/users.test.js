const request = require("supertest");
const app = require("../src/index");

let server; // Store server instance

beforeAll(() => {
    server = app.listen(4000); // Start the server for tests
});

afterAll((done) => {
    server.close(done); // Close server after tests
});

describe("User Management API (Grading)", () => {
    let userId; // Store created user ID

    //Create a user before running other tests
    beforeAll(async () => {
        const response = await request(server)
            .post("/users")
            .send({ name: "John Doe", email: "john@example.com" })
            .expect(201);
        userId = response.body.id;
    });

    //Test
    it("POST /users should create a new user", async () => {
        const response = await request(server)
            .post("/users")
            .send({ name: "Alice", email: "alice@example.com" })
            .expect(201);

        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe("Alice");
        expect(response.body.email).toBe("alice@example.com");
    });

    //Valid user
    it("GET /users/:id should return user details", async () => {
        const response = await request(server)
            .get(`/users/${userId}`)
            .expect(200);

        expect(response.body).toHaveProperty("id", userId);
        expect(response.body.name).toBe("John Doe");
        expect(response.body.email).toBe("john@example.com");
    });

    //Non-existent user
    it("GET /users/:id should return 404 for non-existent user", async () => {
        await request(server).get("/users/nonexistent").expect(404);
    });

    //Update user
    it("PUT /users/:id should update user details", async () => {
        const response = await request(server)
            .put(`/users/${userId}`)
            .send({ name: "John Updated", email: "john.updated@example.com" })
            .expect(200);

        expect(response.body.name).toBe("John Updated");
        expect(response.body.email).toBe("john.updated@example.com");
    });

    //Non-existent user
    it("PUT /users/:id should return 404 if user does not exist", async () => {
        await request(server)
            .put("/users/nonexistent")
            .send({ name: "Ghost", email: "ghost@example.com" })
            .expect(404);
    });

    //Remove user
    it("DELETE /users/:id should delete the user", async () => {
        await request(server).delete(`/users/${userId}`).expect(204);

        // Ensure user is gone
        await request(server).get(`/users/${userId}`).expect(404);
    });

    //Non-existent user
    it("DELETE /users/:id should return 404 if user does not exist", async () => {
        await request(server).delete("/users/nonexistent").expect(404);
    });
});
