// src/pages/About/SundayService.jsx
import React from "react";
import AnimatedSection from "../../components/AnimatedSection";
import OurStoryTemplate from "../../templates/OurStoryTemplate";
import "../../LGM.css";

export default function SundayService() {
  return (
    <main className="our-story-page landing-page">
      <AnimatedSection className="hero ministry-title" delay={100}>
        <h3>About the Service</h3>
      </AnimatedSection>

      <OurStoryTemplate
        text={
          <>
            <p>
              Our service starts at 1:30pm every Sunday. Please join us for
              snacks and fellowship at 12:45pm.
            </p>
            <p>1536 Franklin St, Ann Arbor, MI 48103</p>
            <p>
              We share a building with{" "}
              <a
                href="https://maps.app.goo.gl/uaGb2FYHz77yMhG57"
                target="_blank"
                rel="noopener noreferrer"
              >
                Korean United Methodist Church of Ann Arbor
              </a>
              .
            </p>
          </>
        }
        image={{ src: "/sanc.jpg", alt: "Sanctuary at Living Grace Ministry" }}
      />

      <OurStoryTemplate
        reverse
        text={
          <>
            <p>
              We are just a short bus ride from downtown Ann Arbor and the
              University of Michigan campus. If you have any questions, please contact 
              our ride coordinator. 
            </p>
            <h2>Contact: Matt Nho - mnho@umich.edu</h2>
          </>
        }
        image={{ src: "/rides.jpg", alt: "Sanctuary at Living Grace Ministry" }}
      />
    </main>
  );
}
