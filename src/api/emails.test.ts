import assert from "node:assert";
import { before, describe, mock, test } from "node:test";

describe("Emails API", () => {
  describe("POST /emails/parse", () => {
    let emailsQueueMockFn: ReturnType<typeof mock.fn>;

    before(() => {
      emailsQueueMockFn = mock.fn();
      mock.module("#infra/bullmq/queues/emails.queue.ts", {
        namedExports: {
          emailsQueue: emailsQueueMockFn,
        },
      });
    });

    test("it should parse the email", async () => {
      const { emailsApi } = await import("./emails.ts");

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

      assert.equal(emailsQueueMockFn.mock.callCount(), 0);
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
