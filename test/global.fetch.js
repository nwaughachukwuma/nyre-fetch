import test from "ava";

const BASE_URL = "https://jsonplaceholder.typicode.com";

test("should make a GET request", async (t) => {
  const response = await fetch(`${BASE_URL}/todos`);
  t.is(response.ok, true);
});

test("should make a POST request", async (t) => {
  const response = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    body: JSON.stringify({
      userId: 1,
      id: 1,
      title: "lorem ipsum",
      completed: false,
    }),
  });

  t.is(response.ok, true);
});

test("should make a PUT request", async (t) => {
  const response = await fetch(`${BASE_URL}/todos/1`, {
    method: "PUT",
    body: JSON.stringify({
      completed: true,
    }),
  });

  t.is(response.ok, true);
});

test("should make a DELETE request", async (t) => {
  const response = await fetch(`${BASE_URL}/todos/1`, {
    method: "DELETE",
  });
  t.is(response.ok, true);
});

test("should make a HEAD request", async (t) => {
  const response = await fetch(`${BASE_URL}/todos/1`, {
    method: "HEAD",
  });
  t.is(response.ok, true);
});
