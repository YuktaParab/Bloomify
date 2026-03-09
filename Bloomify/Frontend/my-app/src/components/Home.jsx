import React, { useState, useEffect } from "react";
import "./Home.css";

export default function Home({ onLogin }) {
  const textList = [
    "Grow Your Digital Presence",
    "Smart Solutions for Nature",
    "Build Your Green Brand",
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(120);
  const [darkMode, setDarkMode] = useState(false);

  // Typing Effect FIXED
  useEffect(() => {
    const currentText = textList[textIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length + 1));
        setSpeed(120);

        if (displayText === currentText) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        setSpeed(70);

        if (displayText === "") {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % textList.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, textList, speed]);

  return (
    <div className={darkMode ? "dark-theme" : "light-theme"}>

      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">🌿 Bloomify</h2>

        <ul className="nav-links">
          <li>Home</li>
          <li>Features</li>
          <li>Services</li>
          <li>About</li>
          <li>Contact</li>
        </ul>

        <div className="nav-actions">
         <button className="btn-outline" onClick={onLogin}>Login</button>

         
          <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-left fade-in">
          <p className="hero-tag">🌿 Bloomify — Green Innovation</p>

          <h1 className="hero-title">
            {displayText}
            <span className="cursor">|</span>
          </h1>

          <p className="hero-desc">
            We help brands grow sustainably with eco-friendly technology,
            AI automation, and modern digital solutions inspired by nature.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-outline">Learn More</button>
          </div>
        </div>

        <div className="hero-right">
          <svg viewBox="0 0 500 650" preserveAspectRatio="none" className="wave-mask">
            <defs>
              <clipPath id="waveClip">
                <path d="
                  M 80 0
                  C 40 80, 160 160, 80 240
                  C 0 320, 140 400, 80 480
                  C 20 560, 140 640, 80 650
                  L 500 650
                  L 500 0
                  Z
                "/>
              </clipPath>
            </defs>

            <image
              href="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=100"
              width="100%"
              height="100%"
              clipPath="url(#waveClip)"
              preserveAspectRatio="xMidYMid slice"
            />
          </svg>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section">
        <h2 className="about-title">About Bloomify</h2>

        <div className="timeline">

          <div className="timeline-item normal">
            <div className="timeline-text">
              Bloomify helps urban gardeners grow healthier plants using smart AI guidance, 
              eco-friendly practices, and nature-inspired innovation.
            </div>
            <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6" className="timeline-img" />
          </div>

          <div className="timeline-item reversed">
            <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" className="timeline-img" />
            <div className="timeline-text">
              Our mission is to simplify plant care for beginners and professionals through
              automation, climate analysis, and sustainable growth techniques.
            </div>
          </div>

          <div className="timeline-item normal">
            <div className="timeline-text">
              With weather tracking, plant diagnosis, and smart reminders,
              Bloomify empowers users to grow greener, smarter, and sustainably.
            </div>
            <img src="https://i.pinimg.com/564x/e2/c9/3d/e2c93da020390f2d53cfbb0988b337b9.jpg" className="timeline-img" />
          </div>

          <div className="timeline-line"></div>
        </div>
      </section>

      {/* LEVEL SECTION */}
      <section className="level-section">
        <h2 className="level-title">Choose Your Growing Level</h2>
        <p className="level-subtitle">
          Start your plant journey and grow at your own pace.
        </p>

        <div className="level-grid">

          <div className="level-card">
            <div className="level-icon">🌱</div>
            <h3>Beginner</h3>
            <ul className="level-list">
              <li>Upload plant photos</li>
              <li>Watering reminders</li>
              <li>Starter kits</li>
            </ul>
            <button className="level-btn primary">Start</button>
          </div>

          <div className="level-card">
            <div className="level-icon">🌿</div>
            <h3>Intermediate</h3>
            <ul className="level-list">
              <li>Soil health tracking</li>
              <li>Growth journal</li>
              <li>Fertilizer guide</li>
            </ul>
            <button className="level-btn primary">Explore</button>
          </div>

          <div className="level-card">
            <div className="level-icon">🌳</div>
            <h3>Advanced</h3>
            <ul className="level-list">
              <li>Hydroponics tutorials</li>
              <li>AI diagnosis</li>
              <li>Rare plants</li>
            </ul>
            <button className="level-btn primary">Launch</button>
          </div>

        </div>
      </section>

      {/* DEMO */}
      <section className="demo-section">
        <div className="demo-header">
          <span className="demo-pill">⚡ Interactive Demo</span>
          <h2>See Bloomify in Action</h2>
        </div>

        <div className="demo-card">
          <div className="demo-image">
            <img src="https://images.unsplash.com/photo-1523413651479-597eb2da0ad6" />
            <div className="play-btn">▶</div>
          </div>

          <div className="demo-content">
            <h3>Smart Space Analysis</h3>
            <p>Upload photos to get AI-powered plant recommendations.</p>
            <button className="btn-primary">Try Demo</button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <h2 className="testimonials-header-title">Loved by Gardeners</h2>

        <div className="testimonials-grid">

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">
              Bloomify transformed my balcony into a mini garden!
            </p>
            <div className="testimonial-user">
              <img src="https://i.pravatar.cc/100?img=12" />
              <div>
                <h4>Sarah Mitchell</h4>
                <span>New York</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">
              I can finally keep plants alive thanks to Bloomify!
            </p>
            <div className="testimonial-user">
              <img src="https://i.pravatar.cc/100?img=5" />
              <div>
                <h4>Marcus Lee</h4>
                <span>San Francisco</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">
              Perfect seasonal guidance and reminders.
            </p>
            <div className="testimonial-user">
              <img src="https://i.pravatar.cc/100?img=32" />
              <div>
                <h4>Priya Sharma</h4>
                <span>Mumbai</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FREE TRIAL */}
      <section className="trial-section">
        <div className="trial-card">
          <h2>Start Free Trial</h2>
          <p>Access full Bloomify features free</p>

          <div className="trial-input">
            <input type="email" placeholder="Enter your email" />
            <button className="email-btn">✉</button>
          </div>

          <button className="trial-btn">Start Trial →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-bottom">
          © 2026 Bloomify — All Rights Reserved
        </div>
      </footer>

    </div>
  );
}


