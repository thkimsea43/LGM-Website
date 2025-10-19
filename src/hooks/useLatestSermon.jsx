import { useEffect, useState } from "react";

const API_KEY = "AIzaSyBwpGY4D8V2aDmTFDd7lrbfUxzv7SQPTbU";
const CHANNEL_ID = "UCFN3i5-SUCJctC_h5hMiBBw";
const CACHE_KEY_SERMON = "latestSermonData";
const CACHE_KEY_TIMESTAMP = "latestSermonTimestamp";
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

// ---- Time helpers (America/New_York, Sunday rolls at 13:30) ----
const TZ = "America/New_York";
const CUTOFF_HOUR = 13; // 1 PM
const CUTOFF_MIN = 30; // :30

function getNYParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
    timeZoneName: "shortOffset",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );
  const wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  // Parse offset like "GMT-4" or "GMT+05:30"
  const m = (parts.timeZoneName || "").match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  const offMin = m
    ? parseInt(m[1], 10) * 60 + (m[2] ? parseInt(m[2], 10) : 0)
    : 0;

  return {
    y: +parts.year,
    m: +parts.month,
    d: +parts.day,
    hh: +parts.hour,
    mm: +parts.minute,
    ss: +parts.second,
    dow: wdMap[parts.weekday] ?? 0,
    offsetMinutes: offMin, // NY offset vs UTC at this instant
  };
}

// Convert a NY "wall clock" datetime to a real UTC Date
function nyWallToUtc(y, m, d, hh = 0, mm = 0, ss = 0, ms = 0) {
  // Create a UTC date with same numbers...
  const approxUtc = Date.UTC(y, m - 1, d, hh, mm, ss, ms);
  // ...then shift by the NY offset at that moment
  const probe = new Date(approxUtc);
  const { offsetMinutes } = getNYParts(probe);
  return new Date(approxUtc - offsetMinutes * 60_000);
}

// Determine the “effective Sunday” (rolls at 13:30 NY time)
function getEffectiveSundayNY(now = new Date()) {
  const { y, m, d, hh, mm, dow } = getNYParts(now);

  // Is it Sunday but before the 1:30 PM cutoff?
  const isBeforeCutoffOnSunday =
    dow === 0 && (hh < CUTOFF_HOUR || (hh === CUTOFF_HOUR && mm < CUTOFF_MIN));

  // How many days to step back to reach the effective Sunday
  const backDays = isBeforeCutoffOnSunday ? 7 : dow;

  // Compute the NY date for that Sunday
  const currentUtcMidnightNY = nyWallToUtc(y, m, d, 0, 0, 0, 0);
  const sundayUtc = new Date(
    currentUtcMidnightNY.getTime() - backDays * 86400_000
  );

  // Convert back to NY parts to get the actual Y/M/D of that Sunday
  const sp = getNYParts(sundayUtc);
  const startUtc = nyWallToUtc(sp.y, sp.m, sp.d, 0, 0, 0, 0);
  const endUtc = nyWallToUtc(sp.y, sp.m, sp.d, 23, 59, 59, 999);

  return {
    startIso: startUtc.toISOString(),
    endIso: endUtc.toISOString(),
    sundayStartIso: startUtc.toISOString(), // convenience for your "publishedAt"
  };
}

// Old API wrappers rewritten to use the effective Sunday window:
function getLastSundayTimeRange() {
  const { startIso, endIso } = getEffectiveSundayNY();
  return { publishedAfter: startIso, publishedBefore: endIso };
}

function getMostRecentSundayISOString() {
  const { sundayStartIso } = getEffectiveSundayNY();
  return sundayStartIso;
}

const useLatestSermon = () => {
  const [sermon, setSermon] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestSermon = async () => {
      const cachedSermon = localStorage.getItem(CACHE_KEY_SERMON);
      const cachedTime = localStorage.getItem(CACHE_KEY_TIMESTAMP);
      const isFresh =
        cachedSermon &&
        cachedTime &&
        Date.now() - parseInt(cachedTime) < CACHE_DURATION_MS;

      if (isFresh) {
        const parsed = JSON.parse(cachedSermon);
        const normalized = {
          ...parsed,
          publishedAt: getMostRecentSundayISOString(),
        };
        console.log("⚡ Using cached sermon (normalized):", normalized);
        setSermon(normalized);
        return;
      }

      console.log("🚀 Fetching latest sermon from YouTube...");
      try {
        const { publishedAfter, publishedBefore } = getLastSundayTimeRange();

        const searchUrl =
          `https://www.googleapis.com/youtube/v3/search?` +
          `key=${API_KEY}` +
          `&channelId=${CHANNEL_ID}` +
          `&part=snippet` +
          `&order=date` +
          `&maxResults=5` +
          `&type=video` +
          `&publishedAfter=${publishedAfter}` +
          `&publishedBefore=${publishedBefore}`;

        console.log("🔍 YouTube Search URL:", searchUrl);

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        console.log("📦 YouTube Search Response:", searchData);

        const videoIds = searchData.items
          .map((item) => item.id.videoId)
          .filter(Boolean)
          .join(",");

        console.log("🎯 Extracted video IDs:", videoIds);

        if (!videoIds) {
          console.warn(
            "⚠️ No videos found for last Sunday. Falling back to channel."
          );
          setSermon({
            videoId: null,
            title: "Visit our YouTube Channel",
            publishedAt: null,
            fallbackUrl: "https://www.youtube.com/@LivingGraceMinistry",
          });
          return;
        }
        const videoDetailUrl =
          `https://www.googleapis.com/youtube/v3/videos?` +
          `key=${API_KEY}&id=${videoIds}&part=snippet`;

        console.log("📥 YouTube Video Details URL:", videoDetailUrl);

        const videosRes = await fetch(videoDetailUrl);
        const videosData = await videosRes.json();

        console.log("📦 Video Details Response:", videosData);

        const nonLivestreamVideos = videosData.items.filter(
          (video) =>
            video.snippet.liveBroadcastContent === "none" &&
            !video.snippet.title.toLowerCase().includes("livestream")
        );

        if (nonLivestreamVideos.length === 0) {
          console.warn(
            "⚠️ No suitable sermon videos found. Falling back to channel."
          );
          setSermon({
            videoId: null,
            title: "Visit our YouTube Channel",
            publishedAt: null,
            fallbackUrl: "https://www.youtube.com/@LivingGraceMinistry",
          });
          return;
        }

        const uploadedVideo = nonLivestreamVideos[0];

        const sermonData = {
          videoId: uploadedVideo.id,
          title: uploadedVideo.snippet.title,
          publishedAt: getMostRecentSundayISOString(),
          fallbackUrl: "https://www.youtube.com/@LivingGraceMinistry",
        };

        console.log("✅ Final Sermon Object:", sermonData);

        setSermon(sermonData);
        localStorage.setItem(CACHE_KEY_SERMON, JSON.stringify(sermonData));
        localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
      } catch (err) {
        console.error("❌ YouTube fetch failed:", err);
        setError("Failed to fetch sermon");
      }
    };

    fetchLatestSermon();
  }, []);

  return { sermon, error };
};

export default useLatestSermon;
