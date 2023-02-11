import test from "ava";
import { Client } from "../lib/index.js";

const client = new Client("https://jsonplaceholder.typicode.com");

test("should use client to make a GET request", async (t) => {
  const response = await client.get("/todos");
  t.is(response.ok, true);
});

test("should use client to make a POST request", async (t) => {
  const response = await client.post("/todos", {
    userId: 1,
    id: 1,
    title: "lorem ipsum",
    completed: false,
  });

  t.is(response.ok, true);
});

test("should use client to make a PUT request", async (t) => {
  const response = await client.put("/todos/1", {
    completed: true,
  });

  t.is(response.ok, true);
});

test("should use client to make a DELETE request", async (t) => {
  const response = await client.delete("/todos/1");
  t.is(response.ok, true);
});

test("should use client to make a HEAD request", async (t) => {
  const response = await client.head("/todos/1");
  t.is(response.ok, true);
});
