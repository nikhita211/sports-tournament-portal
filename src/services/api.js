
const BASE_URL = "http://localhost:3000";

const endpoints = {
  tournaments: "/tournaments",
  teams: "/teams",
  players: "/players",
  matches: "/matches"
};

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  if (response.status === 204) return null;

  return response.json();
}

function jsonOptions(method, data) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
}

export function getAll(entity) {
  return request(BASE_URL + endpoints[entity]);
}

export function getById(entity, id) {
  return request(`${BASE_URL}${endpoints[entity]}/${id}`);
}

export function createRecord(entity, data) {
  return request(
    BASE_URL + endpoints[entity],
    jsonOptions("POST", data)
  );
}

export function updateRecord(entity, id, data) {
  return request(
    `${BASE_URL}${endpoints[entity]}/${id}`,
    jsonOptions("PUT", data)
  );
}

export function deleteRecord(entity, id) {
  return request(
    `${BASE_URL}${endpoints[entity]}/${id}`,
    { method: "DELETE" }
  );
}
