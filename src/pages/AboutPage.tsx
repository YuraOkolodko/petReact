import { FeedbackForm } from "../components/FeedbackForm.tsx";
import { UserList } from "../components/UserList.tsx";

export function AboutPage() {
  return (
    <section>
      <h2>About View</h2>
      <p>Built with React 19, React Router 7, Vite, and TypeScript.</p>

      <FeedbackForm />
      <UserList />
    </section>
  );
}
