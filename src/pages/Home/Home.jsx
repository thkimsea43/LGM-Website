// src/pages/Home.jsx
import React from "react";
import AnimatedSection from "../../components/AnimatedSection";
import { Link } from "react-router-dom";

import "./Home.css";

export default function Home() {
  return (
    <main className="landing-page">
      {/* Section with background image via inline style only */}
      <div
        className="section-with-background"
        style={{ backgroundImage: "url('/lgm_easter.jpg')" }}
      >
        <AnimatedSection className="content-block" delay={400} as="div">
          <h1>Living Grace Ministry</h1>
          <p>
            <strong>
              Making a community of Jesus’s disciples who love like Jesus
              through God’s grace
            </strong>
          </p>
        </AnimatedSection>

        <AnimatedSection
          className="content-block only-button"
          delay={400}
          as="div"
        >
          <Link to="/about/our_story" className="button-link">
            <button>Learn More</button>
          </Link>
        </AnimatedSection>
      </div>
    </main>
  );
}
