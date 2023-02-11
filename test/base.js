import test from "ava";
import nyreFetch from "../lib/index.js";

const BASE_URL = "https://jsonplaceholder.typicode.com";

test("should make a GET request", async (t) => {
  const response = await nyreFetch.get(`${BASE_URL}/todos`);
  t.is(response.ok, true);
});

test("should make a POST request", async (t) => {
  const response = await nyreFetch.post(`${BASE_URL}/todos`, {
    userId: 1,
    id: 1,
    title: "lorem ipsum",
    completed: false,
  });

  t.is(response.ok, true);
});

test("should make a PUT request", async (t) => {
  const response = await nyreFetch.put(`${BASE_URL}/todos/1`, {
    completed: true,
  });

  t.is(response.ok, true);
});

test("should make a DELETE request", async (t) => {
  const response = await nyreFetch.delete(`${BASE_URL}/todos/1`);
  t.is(response.ok, true);
});

test("should make a HEAD request", async (t) => {
  const response = await nyreFetch.head(`${BASE_URL}/todos/1`);
  t.is(response.ok, true);
});
