// --- SLIDER FUNCTIONALITY ---
let currentSlide = 0;
const totalSlides = 5;
let slideInterval;

const next = document.querySelector('.next');
const prev = document.querySelector('.prev');

function updateSlider() {
  const items = document.querySelectorAll('.slide-list .item');
  items.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'scale(0.96)';
    item.style.filter = 'blur(2px) brightness(0.65)';
    item.style.zIndex = '0';
  });

  const activeItem = items[currentSlide];
  if (activeItem) {
    activeItem.style.opacity = '1';
    activeItem.style.transform = 'scale(1)';
    activeItem.style.filter = 'none';
    activeItem.style.zIndex = '1';
  }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSlider();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSlider();
}

next?.addEventListener('click', () => {
  nextSlide();
  resetInterval();
});

prev?.addEventListener('click', () => {
  prevSlide();
  resetInterval();
});

function resetInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

// --- VIDEO FUNCTIONALITY ---
const videoCards = document.querySelectorAll(".video-card");
let playingVideo = null;

const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

function toggleVideo(videoNum) {
  const videoCard = videoCards[videoNum - 1];
  const video = videoCard.querySelector("video");

  if (playingVideo === videoNum) {
    video.pause();
    playingVideo = null;
    videoCard.classList.remove("playing");
  } else {
    // Pause all other videos
    videoCards.forEach((card, index) => {
      const v = card.querySelector("video");
      if (v) {
        v.pause();
        v.controls = false;
        card.classList.remove("playing");
      }
    });

    video.controls = true;
    video.play();
    playingVideo = videoNum;
    videoCard.classList.add("playing");
  }
}

videoCards.forEach((card, index) => {
  const video = card.querySelector("video");
  const playBtn = card.querySelector(".play-btn");

  /* DESKTOP */
  if (!isMobile()) {
    card.addEventListener("mouseenter", () => {
      video.controls = true;
      video.play();
      card.classList.add("playing");
    });

    card.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
      video.controls = false;
      card.classList.remove("playing");
    });
  }

  /* MOBILE */
  else {
    playBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideo(index + 1);
    });

    card.addEventListener("click", () => {
      toggleVideo(index + 1);
    });
  }
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  updateSlider();
  slideInterval = setInterval(nextSlide, 5000);
});