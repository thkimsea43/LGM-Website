import React from "react";
import useLatestSermon from "../hooks/useLatestSermon";
import AnimatedSection from "./AnimatedSection";
import YoutubeChannel from "./YoutubeChannel";
import "./LatestSermon.css";

export default function LatestSermon() {
  const { sermon, error } = useLatestSermon();

  if (error) return <p>Error loading sermon.</p>;

  const hasVideo = sermon?.videoId;

  return (
    <AnimatedSection>
      <div className="latest-sermon">
        {hasVideo && (
          <div className="latest-sermon-header">
            <h2 className="latest-label">LATEST SERMON</h2>
            <h2 className="sermon-title">{sermon.title}</h2>
            {sermon.publishedAt && (
              <p className="sermon-date">
                {new Date(sermon.publishedAt).toLocaleDateString("en-US", {
                  timeZone: "America/New_York", // Adjust as needed
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        )}

        <div className="sermon-video-wrapper">
          {hasVideo ? (
            <>
              <iframe
                src={`https://www.youtube.com/embed/${sermon.videoId}`}
                title={sermon.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="fallback-link-wrapper">
                <a
                  className="button-link"
                  href="https://www.youtube.com/@LivingGraceMinistry"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View all sermons on YouTube
                </a>
              </div>
            </>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/live_stream?channel=UCFN3i5-SUCJctC_h5hMiBBw&autoplay=1`}
              title="Livestream"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
