import "./style.css";
import { inject } from "@vercel/analytics";

inject();
/* ========================================
   1. ELEMENTS & ACCESSIBILITY
======================================== */

const envelope = document.querySelector("#envelope");
const openButton = document.querySelector("#openEnvelope");
const closeButton = document.querySelector("#closeEnvelope");
const invitationCard = document.querySelector("#invitationCard");
const envelopeHint = document.querySelector("#envelopeHint");

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

let isOpen = false;

/* ========================================
   2. ENVELOPE OPEN / CLOSE
======================================== */

function setEnvelopeState(open) {
  isOpen = open;

  envelope.dataset.state = open ? "open" : "closed";
  document.body.classList.toggle("invitation-open", open);

  /* Accessible button state */
  openButton.setAttribute("aria-expanded", String(open));

  openButton.setAttribute(
    "aria-label",
    open ? "Wedding invitation opened" : "Open the wedding invitation",
  );

  /* Keep the card out of keyboard navigation until opened */
  invitationCard.inert = !open;

  closeButton.hidden = !open;

  envelopeHint.textContent = open
    ? "Your invitation is open. View the details below."
    : "Tap the seal to open your invitation";
}

function openEnvelope() {
  if (isOpen) return;

  setEnvelopeState(true);

  /*
    Start audio when the user opens the invitation.
    This is also useful when browser autoplay was
    blocked during the initial page load.
  */
  startWeddingAudio();
}

function closeEnvelope() {
  if (!isOpen) return;

  setEnvelopeState(false);

  /*
    Do NOT scroll the page.
    The entry screen itself is fixed to the viewport.
  */
}

if (envelope && openButton && closeButton && invitationCard && envelopeHint) {
  openButton.addEventListener("click", openEnvelope);
  closeButton.addEventListener("click", closeEnvelope);

  /* Start with the invitation closed */
  setEnvelopeState(false);
} else {
  console.error(
    "Envelope initialization failed. Check the envelope element IDs in index.html.",
  );
}

/* ========================================
   3. SCROLL REVEAL
======================================== */

const revealElements = document.querySelectorAll(".reveal");

function showAllRevealElements() {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

if (prefersReducedMotion.matches) {
  showAllRevealElements();
} else if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  showAllRevealElements();
}

/* ========================================
   4. WEDDING COUNTDOWN
======================================== */

/*
  Nikah:
  13 November 2026, 2:00 PM

  Time zone:
  India Standard Time (UTC+05:30)
*/

const WEDDING_DATE = "2026-11-13T14:00:00+05:30";

const countdownDays = document.querySelector("#countdownDays");
const countdownHours = document.querySelector("#countdownHours");
const countdownMinutes = document.querySelector("#countdownMinutes");
const countdownSeconds = document.querySelector("#countdownSeconds");
const countdownMessage = document.querySelector("#countdownMessage");

let countdownTimer;

function updateCountdown() {
  const countdownElements = [
    countdownDays,
    countdownHours,
    countdownMinutes,
    countdownSeconds,
    countdownMessage,
  ];

  if (countdownElements.some((element) => !element)) {
    return;
  }

  const targetTime = new Date(WEDDING_DATE).getTime();

  if (Number.isNaN(targetTime)) {
    countdownMessage.textContent = "Wedding date will be announced soon.";

    return;
  }

  const remaining = targetTime - Date.now();

  if (remaining <= 0) {
    countdownDays.textContent = "00";
    countdownHours.textContent = "00";
    countdownMinutes.textContent = "00";
    countdownSeconds.textContent = "00";

    countdownMessage.textContent =
      "Alhamdulillah! The special day has arrived.";

    if (countdownTimer) {
      window.clearInterval(countdownTimer);
    }

    return;
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1_000) % 60);

  countdownDays.textContent = String(days).padStart(2, "0");
  countdownHours.textContent = String(hours).padStart(2, "0");
  countdownMinutes.textContent = String(minutes).padStart(2, "0");
  countdownSeconds.textContent = String(seconds).padStart(2, "0");

  countdownMessage.textContent =
    "Har guzarta pal humein us din ke kareeb la raha hai.";
}

updateCountdown();

countdownTimer = window.setInterval(updateCountdown, 1000);

/* ========================================
   5. WEDDING AUDIO
======================================== */

const weddingAudio = document.querySelector("#weddingAudio");
const audioToggle = document.querySelector("#audioToggle");
const audioIcon = document.querySelector("#audioIcon");
const audioLabel = document.querySelector("#audioLabel");

let audioAutoplayBlocked = false;

function updateAudioUI(isPlaying) {
  if (!audioToggle || !audioIcon || !audioLabel) {
    return;
  }

  if (isPlaying) {
    audioToggle.setAttribute("aria-pressed", "true");

    audioToggle.setAttribute("aria-label", "Turn wedding audio off");

    audioIcon.textContent = "Ⅱ";
    audioLabel.textContent = "Music on";
  } else {
    audioToggle.setAttribute("aria-pressed", "false");

    audioToggle.setAttribute("aria-label", "Turn wedding audio on");

    audioIcon.textContent = "♫";
    audioLabel.textContent = "Music off";
  }
}

async function startWeddingAudio() {
  if (!weddingAudio) return;

  try {
    weddingAudio.volume = 0.35;

    /*
      Browser autoplay policy:
      try normal audible playback first.
    */
    await weddingAudio.play();

    audioAutoplayBlocked = false;
    updateAudioUI(true);
  } catch (error) {
    /*
      Autoplay may be blocked by the browser.
      This is normal and not a website error.
    */
    audioAutoplayBlocked = true;

    console.info("Wedding audio autoplay was blocked by the browser.");

    /*
      Keep the UI ready to enable music on the
      user's first interaction.
    */
    updateAudioUI(false);
  }
}

if (weddingAudio && audioToggle && audioIcon && audioLabel) {
  weddingAudio.volume = 0.35;
  weddingAudio.preload = "auto";

  /*
    Try to start music immediately when the page loads.
  */
  startWeddingAudio();

  /*
    The wax seal/open interaction is a valid user
    gesture, so try audio again if autoplay failed.
  */
  audioToggle.addEventListener("click", async () => {
    if (weddingAudio.paused) {
      try {
        await weddingAudio.play();

        audioAutoplayBlocked = false;
        updateAudioUI(true);
      } catch (error) {
        console.error("Could not play wedding audio:", error);

        updateAudioUI(false);
      }

      return;
    }

    weddingAudio.pause();
    audioAutoplayBlocked = false;

    updateAudioUI(false);
  });

  weddingAudio.addEventListener("play", () => {
    updateAudioUI(true);
  });

  weddingAudio.addEventListener("pause", () => {
    updateAudioUI(false);
  });

  weddingAudio.addEventListener("ended", () => {
    updateAudioUI(false);
  });

  weddingAudio.addEventListener("error", () => {
    audioLabel.textContent = "Audio unavailable";
    audioToggle.setAttribute("aria-label", "Wedding audio unavailable");
  });

  /*
    If autoplay was blocked, the first interaction
    anywhere on the page can attempt playback.
  */
  const enableAudioAfterInteraction = async () => {
    if (!audioAutoplayBlocked) return;

    try {
      await weddingAudio.play();

      audioAutoplayBlocked = false;
      updateAudioUI(true);
    } catch {
      /*
        Browser can still reject playback.
        The audio button remains available.
      */
    }
  };

  document.addEventListener("pointerdown", enableAudioAfterInteraction, {
    once: true,
    passive: true,
  });
}

/* ========================================
   6. WHATSAPP BLESSING
======================================== */

const whatsappBlessing = document.querySelector("#whatsappBlessing");

if (whatsappBlessing) {
  const phoneNumber = "918757682416";

  const blessingMessage =
    "Assalamu Alaikum! Nushad aur Gulafsha ko Nikah ki dil se " +
    "mubarakbaad. Allah aap dono ki zindagi mein mohabbat, " +
    "sukoon aur barkat ata farmaye. Ameen.";

  const whatsappURL = new URL(`https://wa.me/${phoneNumber}`);

  whatsappURL.searchParams.set("text", blessingMessage);

  whatsappBlessing.href = whatsappURL.toString();
}

/* ========================================
   7. WEDDING EVENT DATA
======================================== */

const weddingEvents = [
  {
    name: "Qurankhani",
    date: "2026-11-09",
    time: "7:00 AM",
  },
  {
    name: "Rasm-e-Haldi & Mehndi",
    date: "2026-11-09",
    time: "7:00 PM",
  },
  {
    name: "Rasm-e-Ratjagga",
    date: "2026-11-10",
    time: "8:00 PM",
  },
  {
    name: "Departure of Wedding Procession",
    date: "2026-11-11",
    time: "7:00 AM",
  },
  {
    name: "Return Wedding Procession",
    date: "2026-11-12",
    time: "8:00 AM",
  },
  {
    name: "Nikah",
    date: "2026-11-13",
    time: "2:00 PM",
  },
  {
    name: "Reception",
    date: "2026-11-13",
    time: "7:00 PM",
  },
  {
    name: "Rukhsati",
    date: "2026-11-13",
    time: "11:30 PM",
  },
  {
    name: "Milad",
    date: "2026-11-16",
    time: "7:00 PM",
  },
];

/* ========================================
   8. EVENT DATE FORMATTER
======================================== */

function formatEventDate(dateString) {
  const date = new Date(`${dateString}T12:00:00+05:30`);

  if (Number.isNaN(date.getTime())) {
    return "Date to be confirmed";
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

/* ========================================
   9. BUILD EVENT TIMELINE
======================================== */

const eventTimeline = document.querySelector(".event-timeline");

if (eventTimeline) {
  eventTimeline.replaceChildren();

  weddingEvents.forEach((event) => {
    const article = document.createElement("article");

    article.className = "timeline-event reveal";

    const dot = document.createElement("span");

    dot.className = "timeline-dot";
    dot.setAttribute("aria-hidden", "true");

    const date = document.createElement("p");

    date.className = "timeline-date";

    date.textContent = `${formatEventDate(event.date)} · ${event.time}`;

    const heading = document.createElement("h3");

    heading.textContent = event.name;

    article.append(dot, date, heading);

    if (event.name === "Nikah") {
      const urdu = document.createElement("p");

      urdu.className = "timeline-urdu";
      urdu.lang = "ur";
      urdu.dir = "rtl";
      urdu.textContent = "نکاح مبارک";

      article.append(urdu);
    }

    eventTimeline.append(article);
  });

  /* ======================================
     Dynamic timeline reveal
  ====================================== */

  const dynamicRevealElements = eventTimeline.querySelectorAll(".reveal");

  if (prefersReducedMotion.matches) {
    dynamicRevealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window) {
    const eventObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      },
    );

    dynamicRevealElements.forEach((element) => {
      eventObserver.observe(element);
    });
  } else {
    dynamicRevealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }
}

/* ========================================
   10. INITIALIZATION
======================================== */

console.info("Nushad & Gulafsha wedding invitation initialized.");
