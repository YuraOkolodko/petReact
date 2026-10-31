import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage.tsx";
import { DemoPage } from "./pages/DemoPage.tsx";
import { HomePage } from "./pages/HomePage";

export function App() {
  return (
    <BrowserRouter>
      <div>
        <header>
          <h1>React 19 Application</h1>
          <nav style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/demo">Demo</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="*" element={<p>Page Not Found (404)</p>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
