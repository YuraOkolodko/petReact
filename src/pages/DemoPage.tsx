import { useActionState, useState } from "react";

import styles from "./DemoPage.module.scss";

// 1. Simulating an asynchronous database/API action (React 19 Action)
async function updateUsernameAction(
  prevState: string | null,
  formData: FormData,
) {
  const newName = formData.get("username") as string;

  if (!prevState) {
    console.info("Initial call");
  }

  // Fake API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!newName.trim()) {
    throw new Error("Username cannot be empty.");
  }

  return `Successfully updated to: ${newName}`;
}

// 2. Simulating a promise for React 19's native `use()` hook
// const themePromise = new Promise<{ primary: string }>((resolve) =>
//   setTimeout(() => resolve({ primary: "#646cff" }), 500),
// );

export function DemoPage() {
  const [count, setCount] = useState<number>(0);

  // 3. React 19 Server/Client Actions hook (Replaces manual isLoading/error state boilerplate)
  // useActionState handles pending states and errors automatically during form submissions.
  const [message, formAction, isPending] = useActionState(
    updateUsernameAction,
    null,
  );

  // 4. React 19 `use()` API
  // You can now read promises directly during render without useEffect.
  // Note: This requires a <Suspense> boundary further up (e.g., in main.tsx),
  // but it demonstrates React 19's new capability.
  // const theme = use(themePromise);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>React 19 App</h1>

      <main className={styles.container}>
        <h1>Hello React 19 from Scratch!</h1>
        <p>Styles are locally scoped with SCSS Modules.</p>
      </main>

      {/* --- Section 1: Classic State --- */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Counter (Classic State)</h2>
        <button
          type="button"
          onClick={(): void => setCount((prev) => prev + 1)}
        >
          count is {count}
        </button>
      </section>

      {/* --- Section 2: React 19 Forms & Actions --- */}
      <section
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>React 19 Form Action</h2>

        {/* Pass the formAction directly to the HTML form element */}
        <form
          action={formAction}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxWidth: "300px",
          }}
        >
          <label htmlFor="username">Update Profile Name:</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter new name"
            disabled={isPending}
          />
          <button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Submit"}
          </button>
        </form>

        {/* Display feedback from the action */}
        {message && (
          <p style={{ color: "green", marginTop: "0.5rem" }}>{message}</p>
        )}
      </section>
    </div>
  );
}
