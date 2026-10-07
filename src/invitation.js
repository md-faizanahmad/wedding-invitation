import "./style.css";
import events from "./data/event-timeline.json";

/* ========================================
   COUNTDOWN
======================================== */

const countdownTarget = new Date("2026-11-13T14:00:00+05:30").getTime();

const countdownDays = document.getElementById("countdownDays");
const countdownHours = document.getElementById("countdownHours");
const countdownMinutes = document.getElementById("countdownMinutes");
const countdownSeconds = document.getElementById("countdownSeconds");
const countdownMessage = document.getElementById("countdownMessage");

function updateCountdown() {
  const now = Date.now();
  const difference = countdownTarget - now;

  if (difference <= 0) {
    if (countdownDays) countdownDays.textContent = "00";
    if (countdownHours) countdownHours.textContent = "00";
    if (countdownMinutes) countdownMinutes.textContent = "00";
    if (countdownSeconds) countdownSeconds.textContent = "00";

    if (countdownMessage) {
      countdownMessage.textContent =
        "The day we have been waiting for has arrived.";
    }

    return;
  }

  const totalSeconds = Math.floor(difference / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (countdownDays) {
    countdownDays.textContent = String(days).padStart(2, "0");
  }

  if (countdownHours) {
    countdownHours.textContent = String(hours).padStart(2, "0");
  }

  if (countdownMinutes) {
    countdownMinutes.textContent = String(minutes).padStart(2, "0");
  }

  if (countdownSeconds) {
    countdownSeconds.textContent = String(seconds).padStart(2, "0");
  }
}

updateCountdown();

const countdownInterval = setInterval(updateCountdown, 1000);

/* ========================================
   WEDDING EVENTS
======================================== */

const eventTimeline = document.getElementById("eventTimeline");

if (eventTimeline && Array.isArray(events)) {
  events.forEach((event) => {
    const article = document.createElement("article");

    article.className = "timeline-event reveal";

    const dot = document.createElement("span");
    dot.className = "timeline-dot";
    dot.setAttribute("aria-hidden", "true");

    const date = document.createElement("p");
    date.className = "timeline-date";
    date.textContent = event.date;

    const title = document.createElement("h3");
    title.textContent = event.title;

    article.append(dot, date, title);

    if (event.urdu) {
      const urdu = document.createElement("p");

      urdu.className = "timeline-urdu";
      urdu.lang = "ur";
      urdu.dir = "rtl";
      urdu.textContent = event.urdu;

      article.appendChild(urdu);
    }

    eventTimeline.appendChild(article);
  });
}

/* ========================================
   SCROLL REVEAL
======================================== */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
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
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

/* ========================================
   BACK TO TOP
======================================== */

const backToTop = document.querySelector(".back-to-top");

if (backToTop) {
  backToTop.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ========================================
   CLEANUP
======================================== */

window.addEventListener("beforeunload", () => {
  clearInterval(countdownInterval);
});
