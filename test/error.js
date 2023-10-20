import test from "ava";
import nyreFetch, { responseOk } from "../lib/index.js";

const BASE_URL = "https://jsonplaceholder.typicode.com";
const HTTP_STATUS_BASE_URL = "https://httpstat-us.vercel.app";

test("should return response with responseOk helper", async (t) => {
  const response = await nyreFetch.get(`${BASE_URL}/todos/1`).then(responseOk);

  t.is(response.ok, true);
});

test("properly handle 400", async (t) => {
  const responseP = nyreFetch
    .get(`${HTTP_STATUS_BASE_URL}/400`)
    .then(responseOk)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Bad Request");
});

test("properly handle 401", async (t) => {
  const responseP = nyreFetch
    .get(`${HTTP_STATUS_BASE_URL}/401`)
    .then(responseOk)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Unauthorized");
});

test("properly handle 402", async (t) => {
  const responseP = nyreFetch
    .get(`${HTTP_STATUS_BASE_URL}/402`)
    .then(responseOk)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Payment Required");
});

test("properly handle 403", async (t) => {
  const responseP = nyreFetch
    .get(`${HTTP_STATUS_BASE_URL}/403`)
    .then(responseOk)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Forbidden");
});

test("properly handle 404", async (t) => {
  const responseP = nyreFetch
    .get(`${HTTP_STATUS_BASE_URL}/404`)
    .then(responseOk)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Not Found");
});

test("properly handle error 500", async (t) => {
  const response = nyreFetch
    .get(`${HTTP_STATUS_BASE_URL}/500`)
    .then(responseOk)
    .then((r) => r.json());

  const error = await t.throwsAsync(response);
  t.is(error.message, "Internal Server Error");
});
