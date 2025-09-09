function openVideoPopup(videoId, title) {
    const popup = document.getElementById('videoPopup');
    const iframe = document.getElementById('videoIframe');
    const titleElement = document.getElementById('videoTitle');

    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      titleElement.textContent = title;

      popup.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeVideoPopup() {
        const popup = document.getElementById('videoPopup');
        const iframe = document.getElementById('videoIframe');

        popup.classList.remove('active');
        document.body.style.overflow = '';

        iframe.src = ''
    }

    document.addEventListener('DOMContentLoaded', function() {
        const videoImages = document.querySelectorAll('.disputa, .crise-na-ucrania, .russia-e-ucrania');
      
      videoImages.forEach(img => {
        img.addEventListener('click', function() {
          const videoId = this.getAttribute('data-video-id');
          const title = this.getAttribute('data-title');
          openVideoPopup(videoId, title);
        });
      });

      document.getElementById('closePopup').addEventListener('click', closeVideoPopup);

      document.getElementById('videoPopup').addEventListener('click', function(e) {
        if (e.target === this) {
          closeVideoPopup();
        }
      });


      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeVideoPopup();
        }
      });
    });             