// Wait for the DOM to fully load before running the script
document.addEventListener("DOMContentLoaded", function () {
  const heroSlider = {
    currentSlide: 0, // Index of the current slide
    slides: document.querySelectorAll(".hero-section"), // All slide elements
    prevBtn: document.querySelector(".hero-nav-btn.prev"), // "Previous" navigation button
    nextBtn: document.querySelector(".hero-nav-btn.next"), // "Next" navigation button
    totalSlides: document.querySelectorAll(".hero-section").length, // Total number of slides
    isAnimating: false, // Flag to prevent rapid slide changes
    autoplayInterval: null, // Holds the autoplay interval ID

    // Initialize the slider functionality
    init: function () {
      // Handle click on "Previous" button
      this.prevBtn.addEventListener("click", () => {
        if (!this.isAnimating) this.changeSlide("prev");
      });

      // Handle click on "Next" button
      this.nextBtn.addEventListener("click", () => {
        if (!this.isAnimating) this.changeSlide("next");
      });

      // Handle keyboard arrow keys for navigation
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          if (!this.isAnimating) this.changeSlide("prev");
        } else if (e.key === "ArrowRight") {
          if (!this.isAnimating) this.changeSlide("next");
        }
      });

      // Enable swipe support for mobile/touch devices
      this.setupSwipeSupport();

      // Set initial active, prev, and next slide classes
      this.updateSlides();

      // Start automatic slide transitions
      this.startAutoplay();
    },

    // Set up swipe gesture support
    setupSwipeSupport: function () {
      const slider = document.querySelector(".hero-slider");
      let touchStartX = 0;
      let touchEndX = 0;

      // Track where the touch starts
      slider.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      // Track where the touch ends and handle the swipe
      slider.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          this.handleSwipe();
        },
        { passive: true }
      );

      // Handle swipe direction and change slide accordingly
      this.handleSwipe = () => {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
          if (!this.isAnimating) this.changeSlide("next");
        }
        if (touchEndX > touchStartX + swipeThreshold) {
          if (!this.isAnimating) this.changeSlide("prev");
        }
      };
    },

    // Change the current slide in a given direction ("next" or "prev")
    changeSlide: function (direction) {
      this.isAnimating = true;

      // Remove the "active" class from the current slide
      this.slides[this.currentSlide].classList.remove("active");

      // Calculate the new currentSlide index
      if (direction === "next") {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
      } else {
        this.currentSlide =
          (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
      }

      // Update slide classes and animation states
      this.updateSlideClasses(direction);

      // Reset the animation flag after the transition ends
      setTimeout(() => {
        this.isAnimating = false;
      }, 800);

      // Restart the autoplay timer
      this.resetAutoplay();
    },

    // Go directly to a specific slide
    goToSlide: function (index) {
      if (index === this.currentSlide || this.isAnimating) return;

      this.isAnimating = true;
      const direction = index > this.currentSlide ? "next" : "prev";

      this.slides[this.currentSlide].classList.remove("active");
      this.currentSlide = index;
      this.updateSlideClasses(direction);

      setTimeout(() => {
        this.isAnimating = false;
      }, 800);

      this.resetAutoplay();
    },

    // Update the classes of the current, previous, and next slides
    updateSlideClasses: function (direction) {
      this.slides.forEach((slide) => {
        slide.classList.remove("active", "prev", "next");
      });

      this.slides[this.currentSlide].classList.add("active");

      const prevIndex =
        (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
      this.slides[prevIndex].classList.add("prev");

      const nextIndex = (this.currentSlide + 1) % this.totalSlides;
      this.slides[nextIndex].classList.add("next");

      const slider = document.querySelector(".hero-slider");

      // Add transition direction class to the slider for animation
      slider.classList.remove("sliding-prev", "sliding-next");
      slider.classList.add(`sliding-${direction}`);

      // Remove the animation class after transition ends
      setTimeout(() => {
        slider.classList.remove("sliding-prev", "sliding-next");
      }, 800);
    },

    // Set initial slide classes
    updateSlides: function () {
      this.slides.forEach((slide, index) => {
        slide.classList.remove("active", "prev", "next");

        if (index === this.currentSlide) {
          slide.classList.add("active");
        } else if (
          index ===
          (this.currentSlide - 1 + this.totalSlides) % this.totalSlides
        ) {
          slide.classList.add("prev");
        } else if (index === (this.currentSlide + 1) % this.totalSlides) {
          slide.classList.add("next");
        }
      });
    },

    // Start autoplay with a delay between slide transitions
    startAutoplay: function (interval = 6000) {
      this.stopAutoplay(); // Clear any existing autoplay
      this.autoplayInterval = setInterval(() => {
        if (!this.isAnimating) {
          this.changeSlide("next");
        }
      }, interval);
    },

    // Stop the autoplay
    stopAutoplay: function () {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
      }
    },

    // Reset autoplay (stop and restart)
    resetAutoplay: function () {
      this.stopAutoplay();
      this.startAutoplay();
    },
  };

  // Initialize the slider
  heroSlider.init();

  // Pause autoplay when mouse is over the slider
  const slider = document.querySelector(".hero-slider");
  slider.addEventListener("mouseenter", () => heroSlider.stopAutoplay());

  // Resume autoplay when mouse leaves the slider
  slider.addEventListener("mouseleave", () => heroSlider.startAutoplay());

  // Pause autoplay when tab is not visible, resume when visible again
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      heroSlider.stopAutoplay();
    } else {
      heroSlider.startAutoplay();
    }
  });

  // Preload slide background images for smoother transitions
  function preloadSlideImages() {
    const slideBackgrounds = [
      "/images/ChatGPT Image Apr 9, 2025, 10_42_32 PM.png",
      "/images/ChatGPT Image Apr 9, 2025, 11_26_37 PM.png",
      "/images/hero-slide-3.jpg",
    ];

    slideBackgrounds.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  preloadSlideImages();
});

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.querySelector(".menu-btn"); // The menu button element
  const primaryMenu = document.querySelector(".primary-menu"); // The menu that will be shown/hidden
  const body = document.body; // Reference to the body element

  // Function to toggle the menu visibility and icon
  function toggleMenu() {
    primaryMenu.classList.toggle("active"); // Show/hide the menu
    body.classList.toggle("menu-open"); // Optional: toggle body class for styling

    const icon = menuBtn.querySelector("i"); // Get the icon inside the button
    icon.classList.toggle("fa-bars"); // Toggle the hamburger icon
    icon.classList.toggle("fa-times"); // Toggle the close icon
  }

  // Attach click event to the menu button
  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
  }

  // Close the menu if ESC key is pressed and the menu is open
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && primaryMenu.classList.contains("active")) {
      toggleMenu();
    }
  });
});

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
  // Select all buttons that have the [data-nav-link] attribute
  const buttons = document.querySelectorAll("[data-nav-link]");

  // Map button IDs to their corresponding page section IDs
  const pages = {
    "Woman-Collection": "Woman",
    "Gym-Collection": "Gym",
    "Winter-Collection": "Winter",
    "Traditional-Collection": "Traditional",
  };

  // Add click event to each navigation button
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetPage = pages[this.id]; // Get the matching page ID from the map

      // Hide all pages by removing the "active" class
      document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active");
      });

      // Show the selected page by adding the "active" class
      document.getElementById(targetPage).classList.add("active");
    });
  });

  // Automatically click the Woman Collection button to show it as the default
  document.getElementById("Woman-Collection").click();
});



// Wait until the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  const faqItems = document.querySelectorAll(".faq-item"); // All FAQ items

  // Function to close all FAQ items
  function closeAllItems() {
    faqItems.forEach((item) => {
      const answer = item.querySelector(".faq-answer");
      const toggle = item.querySelector(".faq-toggle");

      item.classList.remove("active");      // Remove active state
      answer.style.maxHeight = "0px";       // Hide the answer
      toggle.textContent = "+";             // Reset toggle symbol
    });
  }

  // Loop through each FAQ item to initialize them
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question"); // The clickable question
    const answer = item.querySelector(".faq-answer");     // The hidden answer
    const toggle = item.querySelector(".faq-toggle");     // + / − icon

    // Initially hide the answer section
    answer.style.maxHeight = "0px";

    // Add click event to the question
    question.addEventListener("click", function () {
      const isActive = item.classList.contains("active"); // Check if it's already open

      // First, close all items
      closeAllItems();

      // If the clicked one wasn't open, open it
      if (!isActive) {
        item.classList.add("active"); // Add active class
        answer.style.maxHeight = answer.scrollHeight + "px"; // Expand to show full answer
        toggle.textContent = "−"; // Change symbol to minus
      }
    });
  });

  // Open the first FAQ item by default
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    const firstAnswer = firstItem.querySelector(".faq-answer");
    const firstToggle = firstItem.querySelector(".faq-toggle");

    firstItem.classList.add("active");
    firstAnswer.style.maxHeight = firstAnswer.scrollHeight + "px";
    firstToggle.textContent = "−";
  }

  // Adjust answer height on window resize (to handle layout changes)
  window.addEventListener("resize", function () {
    faqItems.forEach((item) => {
      if (item.classList.contains("active")) {
        const answer = item.querySelector(".faq-answer");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
});
س