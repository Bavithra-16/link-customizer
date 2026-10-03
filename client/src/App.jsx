import { useState } from "react";
import "./App.css";

function App() {
  const [customName, setCustomName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const [urlError, setUrlError] = useState("");
  const [nameError, setNameError] = useState("");

  const [availability, setAvailability] = useState(null);
  const [message, setMessage] = useState("");

  const [createdLink, setCreatedLink] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [checking, setChecking] = useState(false);

  // =========================
  // URL VALIDATION
  // =========================

  const validateUrl = (value) => {
    if (!value.trim()) {
      return "Please enter a website address.";
    }

    let url = value.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      const parsedUrl = new URL(url);

      if (!parsedUrl.hostname.includes(".")) {
        return "Enter a valid website address such as google.com";
      }

      return "";
    } catch {
      return "Enter a valid website address such as google.com";
    }
  };

  // =========================
  // CUSTOM NAME VALIDATION
  // =========================

  const validateCustomName = (value) => {
    if (!value.trim()) {
      return "Please enter a custom name.";
    }

    if (!/^[a-z0-9-]+$/.test(value.trim())) {
      return "Use lowercase letters, numbers, and hyphens only.";
    }

    if (value.startsWith("-") || value.endsWith("-")) {
      return "The custom name cannot start or end with a hyphen.";
    }

    return "";
  };

  // =========================
  // URL CHANGE
  // =========================

  const handleUrlChange = (e) => {
    const value = e.target.value;

    setTargetUrl(value);
    setCreatedLink("");
    setMessage("");

    if (value.trim()) {
      setUrlError(validateUrl(value));
    } else {
      setUrlError("");
    }
  };

  // =========================
  // CUSTOM NAME CHANGE
  // =========================

  const handleNameChange = (e) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-");

    setCustomName(value);
    setAvailability(null);
    setCreatedLink("");
    setMessage("");

    if (value.trim()) {
      setNameError(validateCustomName(value));
    } else {
      setNameError("");
    }
  };

  // =========================
  // ENTER KEY
  // =========================

  const handleUrlKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      document.getElementById("custom-name-input")?.focus();
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      createLink();
    }
  };

  // =========================
  // CREATE LINK
  // =========================

  const createLink = async () => {
    setMessage("");
    setCreatedLink("");
    setCopyMessage("");

    const currentUrlError = validateUrl(targetUrl);
    const currentNameError = validateCustomName(customName);

    setUrlError(currentUrlError);
    setNameError(currentNameError);

    if (currentUrlError || currentNameError) {
      return;
    }

    setChecking(true);
    setAvailability(null);

    try {
      const checkResponse = await fetch(
        `http://localhost:5000/api/links/check/${encodeURIComponent(
          customName.trim()
        )}`
      );

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        setMessage("Unable to check the custom name.");
        setChecking(false);
        return;
      }

      if (!checkData.available) {
        setAvailability(false);

        setNameError(
          "This custom name is not available. Please choose another name."
        );

        setChecking(false);
        return;
      }

      setAvailability(true);

      let finalUrl = targetUrl.trim();

      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
      }

      const response = await fetch(
        "http://localhost:5000/api/links",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customName: customName.trim(),
            targetUrl: finalUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to create the custom link."
        );

        setChecking(false);
        return;
      }

      const newLink = `http://localhost:5000/${customName
        .trim()
        .toLowerCase()}`;

      setCreatedLink(newLink);

      setMessage("Your custom link has been created successfully.");

      setChecking(false);
    } catch (error) {
      console.error(error);

      setMessage("Unable to connect to the server.");

      setChecking(false);
    }
  };

  // =========================
  // COPY LINK
  // =========================

  const copyLink = async () => {
    if (!createdLink) return;

    try {
      await navigator.clipboard.writeText(createdLink);

      setCopyMessage("Link copied to clipboard.");
    } catch {
      setCopyMessage("Unable to copy the link.");
    }
  };

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">

        <div className="logo">

          <div className="logo-mark">
            L
          </div>

          <span>
            Link <span>Customizer</span>
          </span>

        </div>

        <div className="nav-status">
          <span></span>
          Ready to customize
        </div>

      </nav>


      {/* =========================
          HERO
      ========================= */}

      <header className="hero">

        <div className="hero-glow"></div>

        <div className="hero-content">

          <div className="eyebrow">
            <span></span>
            CUSTOM LINKS MADE SIMPLE
            <span></span>
          </div>

          <h1>
            Turn long URLs into{" "}
            <em>memorable links.</em>
          </h1>

          <p>
            Create a clean, personalized link that is easier
            to remember, share, and use.
          </p>


          {/* =========================
              CREATOR
          ========================= */}

          <div className="creator">

            <div className="creator-header">

              <div>
                <span>CREATE YOUR LINK</span>

                <h2>
                  Customize your URL
                </h2>
              </div>

              <div className="live-indicator">
                <span></span>
                LIVE
              </div>

            </div>


            {/* ORIGINAL URL */}

            <div className="input-section">

              <label htmlFor="target-url">
                Original URL
              </label>

              <div
                className={`dark-input ${
                  urlError ? "has-error" : ""
                }`}
              >

                <div className="input-prefix">
                  ↗
                </div>

                <input
                  id="target-url"
                  type="text"
                  placeholder="google.com"
                  value={targetUrl}
                  onChange={handleUrlChange}
                  onKeyDown={handleUrlKeyDown}
                />

              </div>

              {urlError && (
                <p className="error-text">
                  {urlError}
                </p>
              )}

              {!urlError && (
                <p className="error-text">
                  Enter a website address such as google.com or https://google.com
                </p>
              )}

            </div>


            {/* CUSTOM NAME */}

            <div className="input-section">

              <label htmlFor="custom-name-input">
                Choose your custom name
              </label>

              <div
                className={`name-input ${
                  nameError ? "has-error" : ""
                }`}
              >

                <input
                  id="custom-name-input"
                  type="text"
                  placeholder="myshop"
                  value={customName}
                  onChange={handleNameChange}
                  onKeyDown={handleNameKeyDown}
                />

                <span>
                  .yourdomain.com
                </span>

              </div>

              {nameError && (
                <p className="error-text">
                  {nameError}
                </p>
              )}

              {!nameError && (
                <p className="error-text">
                  Use lowercase letters, numbers, and hyphens.
                </p>
              )}

            </div>


            {/* PREVIEW */}

            <div className="preview">

              <div className="preview-label">
                YOUR LINK WILL LOOK LIKE
              </div>

              <div className="preview-url">
                yourdomain.com/
                <strong>
                  {customName || "yourname"}
                </strong>
              </div>

            </div>


            {/* CREATE BUTTON */}

            <button
              className="create-button"
              onClick={createLink}
              disabled={checking}
            >

              {checking
                ? "Checking availability..."
                : "Create Custom Link"}

              {!checking && (
                <span className="arrow">
                  →
                </span>
              )}

            </button>


            {/* UNAVAILABLE */}

            {availability === false && (
              <div className="result-message unavailable">

                <div className="result-symbol">
                  ×
                </div>

                <div>
                  <strong>
                    Custom name unavailable
                  </strong>

                  <p>
                    Please choose another custom name.
                  </p>
                </div>

              </div>
            )}


            {/* SUCCESS */}

            {createdLink && (
              <div className="success-result">

                <div className="success-top">

                  <div className="success-symbol">
                    ✓
                  </div>

                  <div>

                    <span>
                      LINK CREATED
                    </span>

                    <strong>
                      Your custom link is ready.
                    </strong>

                  </div>

                </div>


                <div className="created-link">

                  <a
                    href={createdLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {createdLink}
                  </a>

                  <button onClick={copyLink}>
                    Copy
                  </button>

                </div>

                {copyMessage && (
                  <p className="copy-status">
                    {copyMessage}
                  </p>
                )}

              </div>
            )}


            {message &&
              !createdLink &&
              availability !== false && (
                <p className="error-text">
                  {message}
                </p>
              )}

          </div>


          {/* HERO BOTTOM */}

          <div className="hero-bottom">

            <div></div>

            <span>
              SHORT
            </span>

            <div></div>

            <span>
              MEMORABLE
            </span>

            <div></div>

            <span>
              SHAREABLE
            </span>

            <div></div>

          </div>

        </div>

      </header>


      {/* =========================
          PROCESS
      ========================= */}

      <section className="how-section">

        <div className="section-intro">

          <div>
            <span>
              THE PROCESS
            </span>
          </div>

          <h2>
            Simple by design.
          </h2>

        </div>


        <div className="process-cards">


          {/* CARD 1 */}

          <div className="process-card">

            <h3>
              Paste your URL
            </h3>

            <p>
              Start with any long website address
              you want to make easier to share.
            </p>

          </div>


          {/* CARD 2 */}

          <div className="process-card">

            <h3>
              Choose your name
            </h3>

            <p>
              Pick a short, meaningful name that
              represents your brand or purpose.
            </p>

          </div>


          {/* CARD 3 */}

          <div className="process-card">

            <h3>
              Share your link
            </h3>

            <p>
              Your custom link redirects visitors
              directly to the original destination.
            </p>

          </div>


        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <footer>

        <div className="footer-logo">

          <div className="logo-mark small">
            L
          </div>

          Link Customizer

        </div>

        <p>
          Simple links. Better sharing.
        </p>

      </footer>

    </div>
  );
}

export default App;