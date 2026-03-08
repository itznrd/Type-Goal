(function() {
    var openBtn = document.getElementById('test-settings');
    var overlay = document.getElementById('test-settings-overlay');
    var popup = document.getElementById('test-settings-popup');

    if (!openBtn || !overlay || !popup) return;

    window.sessionConfig = { mode: 'time', value: 60 };

    openBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        overlay.classList.remove('hidden');
        overlay.setAttribute('aria-hidden', 'false');
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
        }
    });

    popup.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
        }
    });

    var timeModeBtn = document.getElementById('tm-time');
    if (timeModeBtn) {
        timeModeBtn.style.opacity = '1';
    }

    var valueButtons = {
        v15: document.getElementById('value1'),
        v30: document.getElementById('value2'),
        v60: document.getElementById('value3')
    };

    Object.keys(valueButtons).forEach(function(key) {
        var btn = valueButtons[key];
        if (btn) {
            btn.addEventListener('click', function() {
                var val = parseInt(btn.textContent);
                if (!isNaN(val)) {
                    window.sessionConfig.value = val;
                    Object.keys(valueButtons).forEach(function(k) {
                        valueButtons[k].style.opacity = '0.5';
                    });
                    btn.style.opacity = '1';
                    overlay.classList.add('hidden');
                    overlay.setAttribute('aria-hidden', 'true');
                }
            });
        }
    });

    if (valueButtons.v60) valueButtons.v60.style.opacity = '1';
})();
