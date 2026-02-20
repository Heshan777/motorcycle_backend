const slider = document.querySelector('.slider');

if (slider) {
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevButton = slider.querySelector('.prev');
  const nextButton = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.dots');
  const rawInterval = Number(slider.dataset.interval);
  const intervalMs = Number.isFinite(rawInterval) && rawInterval >= 1800 ? rawInterval : 4000;

  let currentIndex = 0;
  let timer = null;

  const renderDots = () => {
    dotsWrap.innerHTML = '';

    slides.forEach((_, index) => {
      const button = document.createElement('button');
      button.className = 'dot';
      button.type = 'button';
      button.setAttribute('aria-label', `Go to slide ${index + 1}`);
      button.addEventListener('click', () => {
        goTo(index);
      });

      dotsWrap.appendChild(button);
    });
  };

  const updateUI = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === currentIndex);
    });

    Array.from(dotsWrap.children).forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentIndex);
    });
  };

  const restartAuto = () => {
    if (timer) {
      window.clearInterval(timer);
    }

    timer = window.setInterval(() => {
      goTo((currentIndex + 1) % slides.length, false);
    }, intervalMs);
  };

  const goTo = (index, shouldRestart = true) => {
    currentIndex = (index + slides.length) % slides.length;
    updateUI();

    if (shouldRestart) {
      restartAuto();
    }
  };

  prevButton.addEventListener('click', () => {
    goTo(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    goTo(currentIndex + 1);
  });

  slider.addEventListener('mouseenter', () => {
    if (timer) {
      window.clearInterval(timer);
    }
  });

  slider.addEventListener('mouseleave', () => {
    restartAuto();
  });

  slider.addEventListener('focusin', () => {
    if (timer) {
      window.clearInterval(timer);
    }
  });

  slider.addEventListener('focusout', () => {
    restartAuto();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      goTo(currentIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      goTo(currentIndex + 1);
    }
  });

  renderDots();
  updateUI();
  restartAuto();
}