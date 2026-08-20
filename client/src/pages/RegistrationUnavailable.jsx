import { Link } from "react-router-dom";
import "./styles/RegistrationUnavailable.css";

export default function RegistrationUnavailable() {
  const contactEmail = "ssand139@my.centennialcollege.ca";

  const subject = encodeURIComponent("StudyZone Registration Request");
  const body = encodeURIComponent(
    "Hello GitHappens,\n\nI would like to request access to StudyZone."
  );

  return (
    <main className="registration-unavailable">
      <section className="registration-card">
        <span className="registration-badge">
          Registration Update
        </span>

        <h1>Registrations are temporarily closed</h1>

        <p>
          StudyZone is currently operating through invite-only access.
          Please contact GitHappens to request an account.
        </p>

        <div className="registration-actions">
          <a
            className="contact-button"
            href={`mailto:${contactEmail}?subject=${subject}&body=${body}`}
          >
            Contact GitHappens
          </a>

          <Link className="login-link" to="/login">
            Back to Login
          </Link>
        </div>
      </section>
    </main>
  );
}