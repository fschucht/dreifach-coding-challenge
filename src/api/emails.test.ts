import assert from "node:assert";
import { describe, test } from "node:test";
import { emailsApi } from "./emails.ts";

describe("Emails API", () => {
  describe("POST /emails/parse", () => {
    test("it should parse the email", async () => {
      const response = await emailsApi.request("/emails/parse", {
        method: "POST",
        body: JSON.stringify({
          from: "email@email.com",
          subject: "Subject",
          body: "Body",
        }),
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      });

      assert.strictEqual(response.status, 201);
      assert.deepEqual(await response.json(), {
        data: {
          company: {},
          contactPerson: {
            email: "email@email.com",
          },
          requests: [],
        },
      });
    });
  });
});
