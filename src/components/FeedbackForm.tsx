import { useActionState } from "react";

async function submitFeedback(
  _previousState: string | null,
  formData: FormData,
): Promise<string> {
  const comment = formData.get("comment") as string;
  // Simulate network request delay
  await new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
  return "Feedback saved: " + comment;
}

export function FeedbackForm() {
  const [message, formAction, isPending] = useActionState(submitFeedback, null);

  return (
    <form action={formAction} style={{ marginTop: "1rem" }}>
      <label
        htmlFor="comment"
        style={{ display: "block", marginBottom: "0.5rem" }}
      >
        Leave a comment:
      </label>
      <input
        id="comment"
        name="comment"
        type="text"
        required
        placeholder="Type your thoughts..."
        disabled={isPending}
        style={{ padding: "0.4rem", marginRight: "0.5rem" }}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Submit"}
      </button>
      {message && (
        <p style={{ color: "green", marginTop: "0.5rem" }}>{message}</p>
      )}
    </form>
  );
}
