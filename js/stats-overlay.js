(function() {
    var overlay = document.getElementById('stats-overlay');
    var overlayContent = document.getElementById('stats-overlay-content');
    var target = document.getElementById('text-box-area');

    if (!overlay || !overlayContent || !target) return;

    var isOpen = false;

    window.setSparkyAnimation = function(isActive) {
        var sparky = document.getElementById('sparky');
        if (sparky) sparky.classList.toggle('active', isActive);
    };

    function positionOverlay() {
        var rect = target.getBoundingClientRect();
        overlayContent.style.left = rect.left + 'px';
        overlayContent.style.top = rect.top + 'px';
        overlayContent.style.width = rect.width + 'px';
        overlayContent.style.height = rect.height + 'px';
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.attributeName === 'aria-hidden' || m.attributeName === 'class') {
                if (overlay.getAttribute('aria-hidden') === 'false') {
                    positionOverlay();
                }
            }
        });
    });

    observer.observe(overlay, { attributes: true });

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
            e.preventDefault();
            isOpen = !isOpen;
            if (isOpen) {
                overlay.classList.remove('hidden');
                overlay.setAttribute('aria-hidden', 'false');
                positionOverlay();
            } else {
                overlay.classList.add('hidden');
                overlay.setAttribute('aria-hidden', 'true');
            }
        }
    });

    window.addEventListener('scroll', function() {
        if (overlay.getAttribute('aria-hidden') === 'false') positionOverlay();
    }, { passive: true });

    window.addEventListener('resize', function() {
        if (overlay.getAttribute('aria-hidden') === 'false') positionOverlay();
    });
})();
