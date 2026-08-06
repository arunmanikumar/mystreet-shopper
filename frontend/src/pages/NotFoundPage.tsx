import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="auth-card auth-card-muted">
      <p className="eyebrow">Not found</p>
      <h2>This route does not exist.</h2>
      <p>Return to the storefront or use the sign in and sign up links above.</p>
      <Link to="/">Go home</Link>
    </section>
  );
}