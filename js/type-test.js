(function() {
    var root = document.querySelector('.tt-component-root');
    var baseText = " the house and a take in is you move that it he was for on are with as I his they be at one have this from or had by word but what some we can out other were all there when up use your how said an each she which do their if will about many then them these her would make like him into time has look more write go see number no way could people my than first water been called who oil its now find long down day did get come made may part over new sound take only little work know year live me back give most very after thing our just name good sentence man think say help low line before turn cause much mean move right boy old too same tell does set want air well also play small end put home read hand port large spell add even land must big high such follow act why ask men change went light kind off need house picture try us again animal point mother world near self earth father head stand page should country found answer school grow study still learn plant cover food sun state keep eye never last let city tree cross farm hard start might story saw far sea draw left late run while press close night real life few stop open seem next white children begin got walk example ease paper often always music those both mark book letter smile group run important until side feet car mile night walk white sea began grow took river carry once hear stop without second later miss idea enough eat face watch really almost above girl sometimes mountain cut young talk soon list song being leave family body color stand question fish area dog horse birds problem complete room knew since ever piece told usually friends easy heard order red door sure become top ship across today during short better best however hours black products happened whole measure remember early waves reached listen wind rock space covered fast several hold himself toward step morning passed vowel true hundred against pattern numeral table north slowly money map farm pulled draw voice seen cold";

    var cachedWords = null;

    function shuffleWords() {
        if (!cachedWords) {
            cachedWords = baseText.trim().split(/\s+/);
        }
        var w = [...cachedWords];
        for (var i = w.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            [w[i], w[j]] = [w[j], w[i]];
        }
        return ' ' + w.join(' ');
    }

    var container = root.querySelector('.tt-container');
    var textBox = root.querySelector('.tt-textBox');
    var viewport = root.querySelector('.tt-lineViewport');
    var caret = root.querySelector('.tt-caret');
    var input = root.querySelector('.tt-hiddenInput');

    var TEXT = shuffleWords();
    var chars = [],
        typedState = [],
        charIndex = 0,
        firstVisibleLine = 0,
        lineHeight = 0,
        lastWidth = null,
        textStartIndex = 0,
        tallestCharHeight = 0,
        WORD_SPACING = 0;
    var lastInputVal = '';
    var charWidthCache = {};
    var fontsReady = false;
    var textReady = false;
    var pendingInput = null;
    var isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    function getWordSpacingPx(el) {
        var ws = getComputedStyle(el).wordSpacing;
        return ws === 'normal' ? 0 : parseFloat(ws) || 0;
    }

    function computeTallestCharHeight() {
        var max = 0;
        for (var c of chars) {
            var h = c.getBoundingClientRect().height;
            if (h > max) max = h;
        }
        tallestCharHeight = max || lineHeight;
    }

    function forceLayoutCommit() {
        void textBox.offsetHeight;
        var w = textBox.style.width;
        textBox.style.width = '99.9%';
        void textBox.offsetHeight;
        textBox.style.width = w;
    }

    function measureAllChars() {
        var charsToMeasure = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:\'"-()[]{} /\\@#$%^&*+=~_`|<>';
        var measure = document.createElement('span');
        measure.className = 'char';
        measure.style.visibility = 'hidden';
        measure.style.position = 'absolute';
        measure.style.whiteSpace = 'pre';
        measure.style.left = '-9999px';
        measure.style.top = '0';
        textBox.appendChild(measure);

        var computedStyle = getComputedStyle(textBox);
        measure.style.fontFamily = computedStyle.fontFamily;
        measure.style.fontSize = computedStyle.fontSize;

        for (var i = 0; i < charsToMeasure.length; i++) {
            var c = charsToMeasure[i];
            measure.textContent = c;
            charWidthCache[c] = measure.getBoundingClientRect().width;
        }

        measure.textContent = 'A B';
        var spaceWithWordSpacing = measure.getBoundingClientRect().width;
        var widthA = charWidthCache['A'] || charWidthCache['a'] || 10;
        var widthB = charWidthCache['B'] || charWidthCache['b'] || 10;
        charWidthCache[' '] = spaceWithWordSpacing - widthA - widthB;

        var testWord = 'MmMmMmMmMm';
        measure.textContent = testWord;
        var measuredWordWidth = measure.getBoundingClientRect().width;

        var calculatedWordWidth = 0;
        for (var j = 0; j < testWord.length; j++) {
            calculatedWordWidth += (charWidthCache[testWord[j]] || charWidthCache['M'] || 10);
        }

        var calibrationFactor = 1;
        if (calculatedWordWidth > 0) {
            calibrationFactor = measuredWordWidth / calculatedWordWidth;
        }

        for (var k in charWidthCache) {
            charWidthCache[k] *= calibrationFactor;
        }

        measure.remove();
        fontsReady = true;
    }

    var blurTimeout = null;

    function setFocused(focused) {
        if (blurTimeout) {
            clearTimeout(blurTimeout);
            blurTimeout = null;
        }
        container.classList.toggle('unfocused', !focused);
    }

    setFocused(true);
    input.focus();

    container.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isMobile && document.activeElement === input) {
            input.blur();
            setTimeout(function() {
                input.focus({ preventScroll: true });
                setFocused(true);
            }, 10);
        } else {
            input.focus();
            setFocused(true);
        }
    });

    container.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isMobile && document.activeElement === input) {
            input.blur();
            setTimeout(function() {
                input.focus({ preventScroll: true });
                setFocused(true);
            }, 10);
        } else {
            input.focus({ preventScroll: true });
            setFocused(true);
        }
    }, { passive: false });

    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            input.blur();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (container.classList.contains('unfocused')) {
            input.focus();
            setFocused(true);
        }
    });

    input.addEventListener('focus', function() {
        setFocused(true);
    });

    input.addEventListener('blur', function() {
        blurTimeout = setTimeout(function() {
            setFocused(false);
        }, 300);
    });

    var MAX_VISIBLE_LINES = 3;
    var middleLine = MAX_VISIBLE_LINES / 2 + 0.5;

    function getFirstVisibleWordIndex() {
        for (var i = 0; i < chars.length; i++) {
            if (+chars[i].dataset.line !== firstVisibleLine) continue;
            var isSpace = chars[i].textContent === ' ';
            var prevIsSpace = i === 0 || chars[i - 1].textContent === ' ';
            if (!isSpace && prevIsSpace) return i;
        }
        return 0;
    }

    function wrapText(force) {
        if (!fontsReady || Object.keys(charWidthCache).length === 0) return;

        var width = textBox.getBoundingClientRect().width;

        if (width === 0) {
            setTimeout(function() {
                wrapText(true);
            }, 50);
            return;
        }
        WORD_SPACING = getWordSpacingPx(textBox);
        if (!force && width === lastWidth) return;
        lastWidth = width;

        var anchorCharIndex = getFirstVisibleWordIndex();
        if (textStartIndex + anchorCharIndex > 0 && TEXT[textStartIndex + anchorCharIndex - 1] === ' ') anchorCharIndex--;

        textStartIndex += anchorCharIndex;
        charIndex = Math.max(0, charIndex - anchorCharIndex);
        typedState = typedState.slice(anchorCharIndex);

        var visibleText = TEXT.slice(textStartIndex);
        viewport.innerHTML = '';
        chars = [];
        firstVisibleLine = 0;

        var line = document.createElement('div');
        line.className = 'line';
        viewport.appendChild(line);

        var lineWidth = 0;
        var lineIndex = 0;
        var words = visibleText.match(/ ?[^ ]+/g) || [];

        for (var wi = 0; wi < words.length; wi++) {
            var word = words[wi];
            var wordWidth = 0;

            for (var ci = 0; ci < word.length; ci++) {
                var c = word[ci];
                var cachedWidth = charWidthCache[c];
                if (cachedWidth === undefined) {
                    cachedWidth = charWidthCache[' '] || 10;
                }
                wordWidth += cachedWidth;
            }

            if (lineWidth + wordWidth > width && lineWidth > 0) {
                line = document.createElement('div');
                line.className = 'line';
                viewport.appendChild(line);
                lineIndex++;
                lineWidth = 0;
            }

            for (var ci = 0; ci < word.length; ci++) {
                var c = word[ci];
                var span = document.createElement('span');
                span.className = 'char';
                span.textContent = c;
                span.dataset.line = lineIndex;
                line.appendChild(span);
                chars.push(span);

                var w = charWidthCache[c];
                if (w === undefined) {
                    w = charWidthCache[' '] || 10;
                }
                lineWidth += w;
            }
        }

        if (viewport.firstChild) {
            lineHeight = viewport.firstChild.getBoundingClientRect().height;
            textBox.style.height = lineHeight * MAX_VISIBLE_LINES + 'px';
            caret.style.height = lineHeight + 'px';
        }

        computeTallestCharHeight();
        renderTypedState();
        placeCaret();
        applyScroll();
        textReady = true;
        if (pendingInput !== null) {
            var savedValue = pendingInput;
            var savedLastInputVal = lastInputVal;
            pendingInput = null;
            lastInputVal = savedValue;
            input.value = savedValue;
            var delta = savedValue.length - savedLastInputVal.length;
            if (delta > 0) {
                for (var d = 0; d < delta; d++) {
                    if (charIndex + 1 >= chars.length) break;
                    var typedChar = savedValue[savedLastInputVal.length + d];
                    var i = charIndex + 1;
                    typedState[i] = typedChar === chars[i].textContent;
                    charIndex++;
                    renderTypedState(i);
                }
                placeCaret();
                autoScroll();
            }
            onTypedStateChanged();
        }
    }

    function renderTypedState(changedIndex) {
        if (changedIndex >= 0 && changedIndex < chars.length) {
            var c = chars[changedIndex];
            c.classList.remove('correct', 'wrong', 'space-error');
            if (typedState[changedIndex] === true) c.classList.add('correct');
            if (typedState[changedIndex] === false) {
                c.classList.add('wrong');
                if (c.textContent === ' ') c.classList.add('space-error');
            }
        } else {
            chars.forEach(function(c, i) {
                c.classList.remove('correct', 'wrong', 'space-error');
                if (typedState[i] === true) c.classList.add('correct');
                if (typedState[i] === false) {
                    c.classList.add('wrong');
                    if (c.textContent === ' ') c.classList.add('space-error');
                }
            });
        }
    }

    function placeCaret() {
        if (charIndex < 0 || charIndex >= chars.length) return;
        var charRect = chars[charIndex].getBoundingClientRect();
        var boxRect = textBox.getBoundingClientRect();
        caret.style.left = (charRect.right - boxRect.left) + 'px';
        caret.style.top = (charRect.top - boxRect.top) + 'px';
        caret.style.height = tallestCharHeight + 'px';
    }

    function applyScroll() {
        viewport.style.transform = 'translateY(' + (-firstVisibleLine * lineHeight) + 'px)';
    }

    function firstVisibleCharIndex() {
        for (var i = 0; i < chars.length; i++) {
            if (+chars[i].dataset.line === firstVisibleLine) return i;
        }
        return 0;
    }

    function autoScroll() {
        if (charIndex < 0 || charIndex >= chars.length) return;
        var caretLine = +chars[charIndex].dataset.line;
        var targetFirstVisibleLine = caretLine - Math.floor(middleLine - 1);
        if (targetFirstVisibleLine > firstVisibleLine) {
            firstVisibleLine = targetFirstVisibleLine;
            applyScroll();
            requestAnimationFrame(function() {
                placeCaret();
            });
        }
    }

    input.addEventListener('input', function(e) {
        if (wpm.ended) return;
        if (!textReady) {
            pendingInput = e.target.value;
            return;
        }
        var current = input.value;
        var delta = current.length - lastInputVal.length;

        if (delta > 0) {
            for (var d = 0; d < delta; d++) {
                if (charIndex + 1 >= chars.length) break;
                var typedChar = current[lastInputVal.length + d];
                var i = charIndex + 1;
                typedState[i] = typedChar === chars[i].textContent;
                charIndex++;
                renderTypedState(i);
            }
            placeCaret();
            autoScroll();
        } else if (delta < 0) {
            var backspaceCount = Math.abs(delta);
            for (var b = 0; b < backspaceCount; b++) {
                if (charIndex <= firstVisibleCharIndex()) break;
                var oldIdx = charIndex;
                typedState[charIndex] = null;
                charIndex--;
                renderTypedState(oldIdx);
                renderTypedState(charIndex);
            }
            placeCaret();
        }

        if (input.value.length > 50) {
            input.value = input.value.slice(-20);
        }
        lastInputVal = input.value;
        onTypedStateChanged();
    });

    input.addEventListener('keydown', function(e) {
        if (wpm.ended) return;
        if (e.key !== 'Backspace') return;
        e.preventDefault();
        if (charIndex <= firstVisibleCharIndex()) return;
        var oldIndex = charIndex;
        typedState[charIndex] = null;
        charIndex--;
        renderTypedState(oldIndex);
        renderTypedState(charIndex);
        placeCaret();
        if (input.value.length > 0) input.value = input.value.slice(0, -1);
        lastInputVal = input.value;
        onTypedStateChanged();
    });

    input.addEventListener('paste', function(e) {
        e.preventDefault();
    });

    var resizeTimeout = null;
    window.addEventListener('resize', function() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            wrapText(true);
            placeCaret();
        }, 150);
    });

    var wpm = {
        running: false,
        startTs: 0,
        duration: 60000,
        tickInterval: null,
        endTimeout: null,
        mode: 'TIMED',
        ended: false
    };

    function computeNetCorrectChars() {
        var correctWordChars = 0,
            correctSpaces = 0;
        var i = 0;
        while (i < chars.length) {
            if (chars[i].textContent === ' ') {
                i++;
                continue;
            }
            var start = i,
                hasWrong = false,
                hasAnyCorrect = false;
            while (i + 1 < chars.length && chars[i + 1].textContent !== ' ') i++;
            var end = i;
            for (var k = start; k <= end; k++) {
                if (typedState[k] === false) {
                    hasWrong = true;
                    break;
                }
                if (typedState[k] === true) hasAnyCorrect = true;
            }
            if (!hasWrong && hasAnyCorrect) {
                for (var k = start; k <= end; k++)
                    if (typedState[k] === true) correctWordChars++;
            }
            i++;
        }
        for (i = 0; i < chars.length; i++) {
            if (chars[i].textContent === ' ' && typedState[i] === true) correctSpaces++;
        }
        return {
            correctWordChars: correctWordChars,
            correctSpaces: correctSpaces,
            net: correctWordChars + correctSpaces
        };
    }

    function computeWpm(netCorrectChars, elapsedSeconds) {
        var eps = 0.001;
        if (elapsedSeconds < eps) elapsedSeconds = eps;
        return (netCorrectChars / 5) / (elapsedSeconds / 60);
    }

    function startWpmSession() {
        if (wpm.running) return;
        wpm.duration = (window.sessionConfig ? window.sessionConfig.value : 60) * 1000;
        var countdownEl = document.getElementById('countdown-timer');
        if (countdownEl) {
            countdownEl.classList.remove('hidden');
            countdownEl.textContent = Math.ceil(wpm.duration / 1000);
        }
        wpm.running = true;
        wpm.startTs = Date.now();
        _logLive();
        wpm.tickInterval = setInterval(_logLive, 1000);
        if (wpm.mode === 'TIMED') wpm.endTimeout = setTimeout(function() {
            endWpmSession(true);
        }, wpm.duration);
    }

    function _logLive() {
        var elapsedMs = Date.now() - wpm.startTs;
        var elapsedSec = wpm.mode === 'TIMED' ? Math.min(elapsedMs / 1000, wpm.duration / 1000) : elapsedMs / 1000;
        var remainingSec = wpm.mode === 'TIMED' ? Math.max(0, wpm.duration / 1000 - elapsedSec) : 0;
        var counts = computeNetCorrectChars();
        var liveWpm = computeWpm(counts.net, Math.max(1e-3, elapsedSec));
        var countdownEl = document.getElementById('countdown-timer');
        if (countdownEl && wpm.mode === 'TIMED') {
            countdownEl.textContent = Math.ceil(remainingSec);
        }
    }

    function endWpmSession(endedByTimeout) {
        if (!wpm.running) return;
        clearInterval(wpm.tickInterval);
        clearTimeout(wpm.endTimeout);
        wpm.running = false;
        wpm.ended = true;
        var countdownEl = document.getElementById('countdown-timer');
        if (countdownEl) {
            countdownEl.classList.add('hidden');
        }
        var elapsedSec = wpm.mode === 'TIMED' ? Math.min((Date.now() - wpm.startTs) / 1000, wpm.duration / 1000) : (Date.now() - wpm.startTs) / 1000;
        var counts = computeNetCorrectChars();
        var finalWpm = computeWpm(counts.net, Math.max(1e-3, elapsedSec));

        var totalTyped = 0,
            correctChars = 0;
        for (var i = 0; i < typedState.length; i++) {
            if (typedState[i] === true || typedState[i] === false) {
                totalTyped++;
                if (typedState[i] === true) correctChars++;
            }
        }
        var accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

        var wpmEl = document.getElementById('stats-wpm');
        if (wpmEl) {
            wpmEl.textContent = Math.round(finalWpm);
        }
        var accuracyEl = document.getElementById('stats-accuracy');
        if (accuracyEl) {
            accuracyEl.textContent = accuracy;
        }
        var rawEl = document.getElementById('stats-raw');
        if (rawEl) {
            rawEl.textContent = Math.round(computeWpm(correctChars + (totalTyped - correctChars), Math.max(1e-3, elapsedSec)));
        }
        var charEl = document.getElementById('stats-char');
        if (charEl) {
            charEl.textContent = totalTyped;
        }
        var timeEl = document.getElementById('stats-time');
        if (timeEl) {
            timeEl.textContent = Math.round(elapsedSec);
        }

        var statsOverlay = document.getElementById('stats-overlay');
        if (statsOverlay) {
            statsOverlay.classList.remove('hidden');
            statsOverlay.setAttribute('aria-hidden', 'false');
            if (typeof setSparkyAnimation === 'function') setSparkyAnimation(true);
        }
    }

    function resetWpmSession() {
        if (wpm.running) {
            clearInterval(wpm.tickInterval);
            clearTimeout(wpm.endTimeout);
        }
        wpm.running = false;
        wpm.startTs = 0;
        wpm.tickInterval = null;
        wpm.endTimeout = null;
        wpm.ended = false;
        var countdownEl = document.getElementById('countdown-timer');
        if (countdownEl) {
            countdownEl.classList.add('hidden');
        }
        var statsOverlay = document.getElementById('stats-overlay');
        if (statsOverlay) {
            statsOverlay.classList.add('hidden');
            statsOverlay.setAttribute('aria-hidden', 'true');
            if (typeof setSparkyAnimation === 'function') setSparkyAnimation(false);
        }
    }

    var typedStateUpdatePending = false;

    function onTypedStateChanged() {
        if (typedStateUpdatePending) return;
        typedStateUpdatePending = true;
        requestAnimationFrame(function() {
            typedStateUpdatePending = false;
            var anyTyped = typedState.some(function(v) {
                return v === true || v === false;
            });
            if (anyTyped && !wpm.running && !wpm.ended) startWpmSession();
        });
    }

    var retryBtn = document.getElementById('retry');
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            typedState = [];
            charIndex = 0;
            textStartIndex = 0;
            firstVisibleLine = 0;
            lastInputVal = '';
            input.value = '';
            chars = [];
            wpm.ended = false;
            if (wpm.running) {
                clearInterval(wpm.tickInterval);
                clearTimeout(wpm.endTimeout);
            }
            wpm.running = false;
            wpm.startTs = 0;
            var statsOverlay = document.getElementById('stats-overlay');
            if (statsOverlay) {
                statsOverlay.classList.add('hidden');
                statsOverlay.setAttribute('aria-hidden', 'true');
                if (typeof setSparkyAnimation === 'function') setSparkyAnimation(false);
            }
            var countdownEl = document.getElementById('countdown-timer');
            if (countdownEl) {
                countdownEl.classList.add('hidden');
            }
            viewport.innerHTML = '';
            viewport.style.transition = 'opacity 0.05s ease-out';
            viewport.style.opacity = '0';
            setTimeout(function() {
                TEXT = shuffleWords();
                wrapText(true);
                renderTypedState();
                placeCaret();
                viewport.style.transition = 'opacity 0.05s ease-in';
                viewport.style.opacity = '1';
            }, 80);
        });
    }

    function init() {
        document.fonts.load('30px "Roboto Mono"').then(function() {
            forceLayoutCommit();
            measureAllChars();
            requestAnimationFrame(function() {
                wrapText(true);
                placeCaret();
            });
        }).catch(function() {
            forceLayoutCommit();
            measureAllChars();
            requestAnimationFrame(function() {
                wrapText(true);
                placeCaret();
            });
        });
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() {
            setTimeout(init, 100);
        }).catch(function() {
            setTimeout(init, 300);
        });
    } else {
        setTimeout(init, 300);
    }
})();
