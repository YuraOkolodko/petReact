import { Suspense, use } from "react";

interface User {
  id: number;
  name: string;
  email: string;
}

// Native fetch call returning a cached promise
const usersPromise: Promise<User[]> = fetch(
  "https://jsonplaceholder.typicode.com/users?_limit=3",
).then((res) => res.json());

function UserItems() {
  // React 19 use() unwraps the promise directly inside render
  const users = use(usersPromise);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <strong>{user.name}</strong> ({user.email})
        </li>
      ))}
    </ul>
  );
}

export function UserList() {
  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h3>Users (React 19 use() + native fetch + Suspense)</h3>
      <Suspense fallback={<p>Loading user list...</p>}>
        <UserItems />
      </Suspense>
    </div>
  );
}
