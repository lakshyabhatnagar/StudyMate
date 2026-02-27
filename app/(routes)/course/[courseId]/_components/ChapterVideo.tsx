// ChapterVideo.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  useVideoConfig,
  useCurrentFrame,
} from "remotion";

/* ---------------------------------- Types --------------------------------- */

type Slide = {
  slideId: string;
  html: string;
  audioFileUrl: string;
  revelData?: string[];
  caption?: string; // AssemblyAI returns plain text
};

/* ----------------------- Reveal runtime (iframe side) ------------------------ */

const REVEAL_RUNTIME_SCRIPT = `
<script>
(function () {
  function reset() {
    document.querySelectorAll(".reveal").forEach(el =>
      el.classList.remove("is-on")
    );
  }

  function reveal(id) {
    var el = document.querySelector("[data-reveal='" + id + "']");
    if (el) el.classList.add("is-on");
  }

  window.addEventListener("message", function (e) {
    var msg = e.data;
    if (!msg) return;
    if (msg.type === "RESET") reset();
    if (msg.type === "REVEAL") reveal(msg.id);
  });
})();
</script>
`;

const injectRevealRuntime = (html: string) => {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${REVEAL_RUNTIME_SCRIPT}</body>`);
  }
  return html + REVEAL_RUNTIME_SCRIPT;
};

/* ----------------------- Slide with reveal control -------------------------- */

const SlideIFrameWithReveal = ({
  slide,
  durationInFrames,
}: {
  slide: Slide;
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  // 🔑 AssemblyAI-compatible reveal plan:
  // Evenly distribute reveals over slide duration
  const revealPlan = useMemo(() => {
    const ids = slide.revelData ?? [];
    if (ids.length === 0) return [];

    const durationSeconds = durationInFrames / fps;
    const step = durationSeconds / (ids.length + 1);

    return ids.map((id, i) => ({
      id,
      at: step * (i + 1), // seconds
    }));
  }, [slide.revelData, durationInFrames, fps]);

  // On iframe load: mark ready and reset
  const handleLoad = () => {
    setReady(true);
    iframeRef.current?.contentWindow?.postMessage({ type: "RESET" }, "*");
  };

  // Scrub-safe reveal control
  useEffect(() => {
    if (!ready) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    win.postMessage({ type: "RESET" }, "*");

    for (const step of revealPlan) {
      if (time >= step.at) {
        win.postMessage({ type: "REVEAL", id: step.id }, "*");
      }
    }
  }, [time, ready, revealPlan]);

  return (
    <AbsoluteFill>
      <iframe
        ref={iframeRef}
        srcDoc={injectRevealRuntime(slide.html)}
        onLoad={handleLoad}
        sandbox="allow-scripts allow-same-origin"
        style={{ width: 1280, height: 720, border: "none" }}
      />
      {slide.audioFileUrl && <Audio src={slide.audioFileUrl} />}
    </AbsoluteFill>
  );
};

/* -------------------------- Course Composition ------------------------------- */

type Props = {
  slides: Slide[];
  durationsBySlideId: Record<string, number>;
};

export const CourseComposition = ({ slides, durationsBySlideId }: Props) => {
  const { fps } = useVideoConfig();

  const GAP_SECONDS = 1;
  const GAP_FRAMES = Math.round(GAP_SECONDS * fps);

  const timeline = useMemo(() => {
    if (slides.length === 0) {
      return [];
    }

    // Deduplicate slides by slideId (keep the first occurrence)
    const seen = new Set<string>();
    const uniqueSlides = slides.filter((slide) => {
      if (seen.has(slide.slideId)) return false;
      seen.add(slide.slideId);
      return true;
    });

    let from = 0;

    const result = uniqueSlides.map((slide) => {
      const dur = durationsBySlideId[slide.slideId] ?? Math.ceil(8 * fps); // 8 seconds fallback

      const item = { slide, from, dur };
      from += dur + GAP_FRAMES;
      return item;
    });

    return result;
  }, [slides, durationsBySlideId, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timeline.map(({ slide, from, dur }) => (
        <Sequence key={slide.slideId} from={from} durationInFrames={dur}>
          <SlideIFrameWithReveal
            slide={slide}
            durationInFrames={dur}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
