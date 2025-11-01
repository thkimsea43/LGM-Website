// src/pages/About/MissionVision.jsx
import React from "react";
import AnimatedSection from "../../components/AnimatedSection";
import OurStoryTemplate from "../../templates/OurStoryTemplate";
import "../../LGM.css";

export default function MissionVision() {
  return (
    <main className="our-story-page landing-page">
      <AnimatedSection className="hero ministry-title" delay={100}>
        <h3>Mission Spotlight: Central Asia Missions</h3>
      </AnimatedSection>

      <OurStoryTemplate
        text={
          <p>
            Thank you to everyone for your amazing support! We are continuing
            our support for the UMC churches in Central Asia throughout the
            year. Please send money through our normal channels (see offering
            information), but please let Jason Um <b>(jasonum@gmail.com)</b>{" "}
            know if the money is meant for Central Asia missions, thanks!
          </p>
        }
        image={{ src: "/central_asia.jpg", alt: "Central Asia" }}
      />
    </main>
  );
}
