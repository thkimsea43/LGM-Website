import { useEffect, useState } from "react";

const API_KEY = "AIzaSyBwpGY4D8V2aDmTFDd7lrbfUxzv7SQPTbU";
const CHANNEL_ID = "UCFN3i5-SUCJctC_h5hMiBBw";
const LIVESTREAM_ID = "rg_PvKedx-w";

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
    offsetMinutes: offMin,
  };
}

function nyWallToUtc(y, m, d, hh = 0, mm = 0, ss = 0, ms = 0) {
  const approxUtc = Date.UTC(y, m - 1, d, hh, mm, ss, ms);
  const probe = new Date(approxUtc);
  const { offsetMinutes } = getNYParts(probe);
  return new Date(approxUtc - offsetMinutes * 60_000);
}

function getEffectiveSundayNY(now = new Date()) {
  const { y, m, d, hh, mm, dow } = getNYParts(now);
  const isBeforeCutoffOnSunday =
    dow === 0 && (hh < CUTOFF_HOUR || (hh === CUTOFF_HOUR && mm < CUTOFF_MIN));
  const backDays = isBeforeCutoffOnSunday ? 7 : dow;

  const currentUtcMidnightNY = nyWallToUtc(y, m, d, 0, 0, 0, 0);
  const sundayUtc = new Date(
    currentUtcMidnightNY.getTime() - backDays * 86400_000
  );

  const sp = getNYParts(sundayUtc);
  const startUtc = nyWallToUtc(sp.y, sp.m, sp.d, 0, 0, 0, 0);
  const endUtc = nyWallToUtc(sp.y, sp.m, sp.d, 23, 59, 59, 999);

  return {
    startIso: startUtc.toISOString(),
    endIso: endUtc.toISOString(),
    sundayStartIso: startUtc.toISOString(),
  };
}

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

  // unified livestream fallback (also cached)
  const setLivestreamFallback = () => {
    console.warn("⚠️ No sermon video found — using livestream fallback.");
    const fallback = {
      videoId: LIVESTREAM_ID,
      title: "Watch Our Sunday Livestream",
      publishedAt: getMostRecentSundayISOString(),
      fallbackUrl: "https://www.youtube.com/watch?v=" + LIVESTREAM_ID,
      isFallback: true,
    };
    setSermon(fallback);
    localStorage.setItem(CACHE_KEY_SERMON, JSON.stringify(fallback));
    localStorage.setItem(CACHE_KEY_TIMESTAMP, Date.now().toString());
  };

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

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        const items = Array.isArray(searchData.items) ? searchData.items : [];
        const videoIds = items
          .map((item) => item?.id?.videoId)
          .filter(Boolean)
          .join(",");

        if (!videoIds) {
          setLivestreamFallback();
          return;
        }

        const videoDetailUrl = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet`;
        const videosRes = await fetch(videoDetailUrl);
        const videosData = await videosRes.json();

        const nonLivestreamVideos = (videosData.items || []).filter(
          (video) =>
            video?.snippet?.liveBroadcastContent === "none" &&
            !video?.snippet?.title?.toLowerCase?.().includes("livestream")
        );

        if (nonLivestreamVideos.length === 0) {
          setLivestreamFallback();
          return;
        }

        const uploadedVideo = nonLivestreamVideos[0];
        const sermonData = {
          videoId: uploadedVideo.id,
          title: uploadedVideo.snippet.title,
          publishedAt: getMostRecentSundayISOString(),
          fallbackUrl: "https://www.youtube.com/@LivingGraceMinistry",
          isFallback: false,
        };

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
