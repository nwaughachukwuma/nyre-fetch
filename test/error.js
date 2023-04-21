import test from "ava";
import nyreFetch, { handleInternalError } from "../lib/index.js";

const BASE_URL = "https://jsonplaceholder.typicode.com";

test("should return response with handleInternalError helper", async (t) => {
  const response = await nyreFetch
    .get(`${BASE_URL}/todos/1`)
    .then(handleInternalError);

  t.is(response.ok, true);
});

test("properly handle 400", async (t) => {
  const responseP = nyreFetch
    .get("http://httpstat.us/random/400")
    .then(handleInternalError)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Bad Request");
});

test("properly handle 401", async (t) => {
  const responseP = nyreFetch
    .get("http://httpstat.us/random/401")
    .then(handleInternalError)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Unauthorized");
});

test("properly handle 402", async (t) => {
  const responseP = nyreFetch
    .get("http://httpstat.us/random/402")
    .then(handleInternalError)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Payment Required");
});

test("properly handle 403", async (t) => {
  const responseP = nyreFetch
    .get("http://httpstat.us/random/403")
    .then(handleInternalError)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Forbidden");
});

test("properly handle 404", async (t) => {
  const responseP = nyreFetch
    .get("http://httpstat.us/random/404")
    .then(handleInternalError)
    .then((r) => r.json());

  const error = await t.throwsAsync(responseP, { instanceOf: Error });
  t.is(error.message, "Not Found");
});

test("properly handle error 500", async (t) => {
  const response = nyreFetch
    .get("http://httpstat.us/random/500")
    .then(handleInternalError)
    .then((r) => r.json());

  const error = await t.throwsAsync(response);
  t.is(error.message, "Internal Server Error");
});
