(function () {
            (function disclaimerToggle() {
                var btn = document.getElementById('disclaimerToggle');
                var panel = document.getElementById('disclaimerPanel');
                if (!btn || !panel) return;

                function abrirPanel() {
                    panel.hidden = false;
                    requestAnimationFrame(function () {
                        panel.classList.add('is-open');
                    });
                    btn.setAttribute('aria-expanded', 'true');
                }

                function cerrarPanel() {
                    panel.classList.remove('is-open');
                    btn.setAttribute('aria-expanded', 'false');
                    panel.addEventListener('transitionend', function onEnd(e) {
                        if (e.propertyName !== 'max-height') return;
                        panel.hidden = true;
                        panel.removeEventListener('transitionend', onEnd);
                    });
                }

                btn.addEventListener('click', function () {
                    if (btn.getAttribute('aria-expanded') === 'true') {
                        cerrarPanel();
                    } else {
                        abrirPanel();
                    }
                });
            })();

            (function iniciarAnimacionEntrada() {
                var hero = document.getElementById('hero');
                var splash = document.getElementById('entry-splash');
                var ENTRY_MS = 1650;
                var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                if (reduceMotion) {
                    if (splash) splash.classList.add('is-done');
                    document.body.classList.remove('is-entry-active');
                    if (hero) hero.classList.add('is-revealed');
                    return;
                }

                document.body.classList.add('is-entry-active');
                setTimeout(function () {
                    if (splash) splash.classList.add('is-done');
                    document.body.classList.remove('is-entry-active');
                }, ENTRY_MS);

                if (!hero) return;
                setTimeout(function () {
                    hero.classList.add('is-revealed');
                }, ENTRY_MS + 120);
            })();

            /**
             * URL de Implementar → Aplicación web (termina en /exec). NO uses el link de la hoja de Sheets.
             * Ejemplo: https://script.google.com/macros/s/AKfycbxxxxx/exec
             */
            var BAIT_DOWNLOAD_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzMSgOjFqE6aHS10twkHinCVJ_2E_OgsiLm_FXBSIRQxJjIUP41q5zGFLnQQmnmg3UY_g/exec';

            var downloadModal = document.getElementById('download-modal');
            var platformChoiceModal = document.getElementById('platform-choice-modal');
            var downloadModalForm = document.getElementById('downloadModalForm');
            var downloadModalSub = document.getElementById('downloadModalSub');
            var downloadModalError = document.getElementById('downloadModalError');
            var downloadModalEdad = document.getElementById('downloadEdad');
            var downloadModalSubmit = document.getElementById('downloadModalSubmit');
            var pendingDownloadUrl = '';
            var pendingDownloadPlatform = '';

            function etiquetaGenero(val) {
                var map = {
                    femenino: 'Femenino',
                    masculino: 'Masculino',
                    otro: 'Otro',
                    'prefiero-no-decir': 'Prefiero no decir'
                };
                return map[val] || val;
            }

            function etiquetaSistema(platform) {
                if (platform === 'ios') return 'iOS';
                if (platform === 'android') return 'Android';
                return platform || '';
            }

            function guardarLeadEnGoogleSheets(edad, genero, platform) {
                var url = (BAIT_DOWNLOAD_SHEETS_URL || '').trim();
                if (!url) {
                    return Promise.resolve({ ok: false, skipped: true });
                }
                var payload = {
                    fecha: new Date().toISOString(),
                    edad: edad,
                    genero: etiquetaGenero(genero),
                    sistema: etiquetaSistema(platform),
                    tienda: platform === 'ios' ? 'App Store' : 'Google Play',
                    pagina: window.location.href || ''
                };
                return fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                })
                    .then(function (res) { return res.json(); })
                    .catch(function () { return { ok: false }; });
            }

            function syncModalOpenBody() {
                var platformOpen = platformChoiceModal && platformChoiceModal.classList.contains('is-open');
                var downloadOpen = downloadModal && downloadModal.classList.contains('is-open');
                if (!platformOpen && !downloadOpen) {
                    document.body.classList.remove('modal-open');
                }
            }

            function cerrarPlatformChoiceModal() {
                if (!platformChoiceModal) return;
                platformChoiceModal.classList.remove('is-open');
                platformChoiceModal.setAttribute('hidden', '');
                syncModalOpenBody();
            }

            function abrirPlatformChoiceModal() {
                if (!platformChoiceModal) return;
                platformChoiceModal.removeAttribute('hidden');
                platformChoiceModal.classList.add('is-open');
                document.body.classList.add('modal-open');
                var firstBtn = platformChoiceModal.querySelector('.js-platform-choice');
                if (firstBtn) firstBtn.focus();
            }

            function cerrarDownloadModal() {
                if (!downloadModal) return;
                downloadModal.classList.remove('is-open');
                downloadModal.setAttribute('hidden', '');
                pendingDownloadUrl = '';
                pendingDownloadPlatform = '';
                syncModalOpenBody();
            }

            function abrirDownloadModal(url, platform) {
                if (!downloadModal || !downloadModalForm) return;
                pendingDownloadUrl = url || '';
                pendingDownloadPlatform = platform || '';
                if (downloadModalError) {
                    downloadModalError.hidden = true;
                    downloadModalError.textContent = '';
                }
                downloadModalForm.reset();
                if (downloadModalSub) {
                    var sistema = etiquetaSistema(platform);
                    var destino = platform === 'ios' ? 'App Store' : 'Google Play';
                    downloadModalSub.textContent = 'Selecciona tu edad y género para continuar a descargar en ' + sistema + ' (' + destino + ').';
                }
                downloadModal.removeAttribute('hidden');
                downloadModal.classList.add('is-open');
                document.body.classList.add('modal-open');
                if (downloadModalEdad) downloadModalEdad.focus();
            }

            function continuarDescargaTienda() {
                if (!pendingDownloadUrl) {
                    cerrarDownloadModal();
                    return;
                }
                var url = pendingDownloadUrl;
                cerrarDownloadModal();
                window.open(url, '_blank', 'noopener,noreferrer');
            }

            document.addEventListener('keydown', function (e) {
                if (e.key !== 'Escape') return;
                if (platformChoiceModal && platformChoiceModal.classList.contains('is-open')) {
                    cerrarPlatformChoiceModal();
                } else if (downloadModal && downloadModal.classList.contains('is-open')) {
                    cerrarDownloadModal();
                }
            });

            document.querySelectorAll('.js-open-download-choice').forEach(function (btn) {
                btn.addEventListener('click', abrirPlatformChoiceModal);
            });

            if (platformChoiceModal) {
                platformChoiceModal.querySelectorAll('[data-close-platform-choice]').forEach(function (el) {
                    el.addEventListener('click', cerrarPlatformChoiceModal);
                });
            }

            document.querySelectorAll('.js-platform-choice').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var url = btn.getAttribute('data-download-url');
                    var platform = btn.getAttribute('data-download-platform') || '';
                    cerrarPlatformChoiceModal();
                    abrirDownloadModal(url, platform);
                });
            });

            document.querySelectorAll('.js-download-store').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var url = btn.getAttribute('data-download-url');
                    var platform = btn.getAttribute('data-download-platform') || '';
                    abrirDownloadModal(url, platform);
                });
            });

            if (downloadModal) {
                downloadModal.querySelectorAll('[data-close-download-modal]').forEach(function (el) {
                    el.addEventListener('click', cerrarDownloadModal);
                });
            }

            if (downloadModalForm) {
                downloadModalForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    if (downloadModalError) {
                        downloadModalError.hidden = true;
                        downloadModalError.textContent = '';
                    }
                    var edad = downloadModalEdad ? downloadModalEdad.value : '';
                    var generoInput = downloadModalForm.querySelector('input[name="genero"]:checked');
                    var genero = generoInput ? generoInput.value : '';
                    if (!edad || !genero) {
                        if (downloadModalError) {
                            downloadModalError.textContent = 'Selecciona tu edad y tu género para continuar.';
                            downloadModalError.hidden = false;
                        }
                        return;
                    }
                    var labelOriginal = downloadModalSubmit ? downloadModalSubmit.textContent : '';
                    if (downloadModalSubmit) {
                        downloadModalSubmit.disabled = true;
                        downloadModalSubmit.textContent = 'Guardando...';
                    }
                    guardarLeadEnGoogleSheets(edad, genero, pendingDownloadPlatform)
                        .then(function (res) {
                            if (res && res.ok === false && !res.skipped && downloadModalError) {
                                downloadModalError.textContent = 'No se pudo guardar en la hoja, pero puedes continuar a la tienda.';
                                downloadModalError.hidden = false;
                            }
                        })
                        .finally(function () {
                            if (downloadModalSubmit) {
                                downloadModalSubmit.disabled = false;
                                downloadModalSubmit.textContent = labelOriginal;
                            }
                            continuarDescargaTienda();
                        });
                });
            }

        })();

        (function iniciarBannerCookies() {
            var STORAGE_KEY = 'bait_esim_cookie_consent_v1';
            var banner = document.getElementById('cookie-banner');
            if (!banner) return;

            var prefsPanel = document.getElementById('cookiePrefsPanel');
            var analyticsToggle = document.getElementById('cookieAnalytics');
            var acceptAll = document.getElementById('cookieAcceptAll');
            var essentialOnly = document.getElementById('cookieEssentialOnly');
            var togglePrefs = document.getElementById('cookieTogglePrefs');
            var manageLink = document.getElementById('cookieManageLink');

            function readConsent() {
                try {
                    var raw = localStorage.getItem(STORAGE_KEY);
                    return raw ? JSON.parse(raw) : null;
                } catch (err) {
                    return null;
                }
            }

            function saveConsent(analytics) {
                var data = {
                    essential: true,
                    analytics: !!analytics,
                    ts: Date.now()
                };
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                } catch (err) {}
                document.documentElement.setAttribute('data-cookie-analytics', data.analytics ? '1' : '0');
                return data;
            }

            function showBanner() {
                banner.removeAttribute('hidden');
                requestAnimationFrame(function () {
                    banner.classList.add('is-visible');
                    document.body.classList.add('cookie-banner-visible');
                });
            }

            function hideBanner() {
                banner.classList.remove('is-visible');
                document.body.classList.remove('cookie-banner-visible');
                banner.setAttribute('hidden', '');
            }

            function setPrefsOpen(open) {
                if (!prefsPanel || !togglePrefs) return;
                prefsPanel.classList.toggle('is-open', open);
                togglePrefs.setAttribute('aria-expanded', open ? 'true' : 'false');
                togglePrefs.textContent = open ? 'Ocultar opciones' : 'Configurar';
            }

            function commitChoice(analytics) {
                saveConsent(analytics);
                hideBanner();
                setPrefsOpen(false);
            }

            if (acceptAll) {
                acceptAll.addEventListener('click', function () {
                    var useAnalytics = prefsPanel && prefsPanel.classList.contains('is-open') && analyticsToggle
                        ? analyticsToggle.checked
                        : true;
                    commitChoice(useAnalytics);
                });
            }

            if (essentialOnly) {
                essentialOnly.addEventListener('click', function () {
                    if (analyticsToggle) analyticsToggle.checked = false;
                    commitChoice(false);
                });
            }

            if (togglePrefs) {
                togglePrefs.addEventListener('click', function () {
                    var open = !(prefsPanel && prefsPanel.classList.contains('is-open'));
                    setPrefsOpen(open);
                });
            }

            if (manageLink) {
                manageLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    var saved = readConsent();
                    if (analyticsToggle) {
                        analyticsToggle.checked = saved ? !!saved.analytics : false;
                    }
                    showBanner();
                    setPrefsOpen(true);
                });
            }

            var saved = readConsent();
            if (saved) {
                document.documentElement.setAttribute('data-cookie-analytics', saved.analytics ? '1' : '0');
            } else {
                showBanner();
            }
        })();

        (function baitInvaderEasterEgg() {
            var overlay = document.getElementById('bait-invader-overlay');
            var canvas = document.getElementById('baitInvaderCanvas');
            var closeBtn = document.getElementById('baitInvaderClose');
            var scoreEl = document.getElementById('baitInvaderScore');
            if (!overlay || !canvas) return;

            var ctx = canvas.getContext('2d');
            var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var keyBuffer = '';
            var lastTrigger = 0;
            var COOLDOWN_MS = 6000;
            var game = null;
            var rafId = 0;
            var keys = { left: false, right: false, fire: false };

            var INVADER_PATTERN = [
                [0,0,1,0,0,0,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,1,0,0,0,0],
                [0,0,1,1,1,1,1,1,1,1,0,0],
                [0,1,1,0,1,1,1,1,0,1,1,0],
                [1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,1,1,1,1,1,1,1,1,0,1],
                [1,0,1,0,0,0,0,0,0,1,0,1],
                [0,0,0,1,1,0,0,1,1,0,0,0]
            ];

            function canTrigger() {
                return Date.now() - lastTrigger > COOLDOWN_MS;
            }

            function triggerInvaders() {
                if (!canTrigger()) return;
                lastTrigger = Date.now();
                openGame();
            }

            function playBeep(freq, dur) {
                if (reduceMotion) return;
                try {
                    var ac = window.__baitInvaderAudio || (window.__baitInvaderAudio = new (window.AudioContext || window.webkitAudioContext)());
                    var o = ac.createOscillator();
                    var g = ac.createGain();
                    o.connect(g);
                    g.connect(ac.destination);
                    o.frequency.value = freq;
                    o.type = 'square';
                    g.gain.setValueAtTime(0.06, ac.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
                    o.start(ac.currentTime);
                    o.stop(ac.currentTime + dur);
                } catch (e) {}
            }

            function drawInvaderSprite(x, y, scale, color) {
                ctx.fillStyle = color;
                for (var r = 0; r < INVADER_PATTERN.length; r++) {
                    for (var c = 0; c < INVADER_PATTERN[r].length; c++) {
                        if (INVADER_PATTERN[r][c]) {
                            ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
                        }
                    }
                }
            }

            function createGame() {
                var invaders = [];
                var cols = 7;
                var rows = 3;
                for (var row = 0; row < rows; row++) {
                    for (var col = 0; col < cols; col++) {
                        invaders.push({
                            x: 24 + col * 42,
                            y: 36 + row * 34,
                            alive: true,
                            row: row
                        });
                    }
                }
                return {
                    active: true,
                    score: 0,
                    playerX: canvas.width / 2 - 20,
                    playerW: 40,
                    playerH: 10,
                    invaders: invaders,
                    bullets: [],
                    direction: 1,
                    speed: 0.45,
                    stepDown: false,
                    moveTimer: 0,
                    fireCooldown: 0,
                    anim: 0,
                    won: false,
                    lost: false
                };
            }

            function closeGame() {
                game = null;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = 0;
                overlay.setAttribute('hidden', '');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
                keys.left = keys.right = keys.fire = false;
            }

            function openGame() {
                game = createGame();
                overlay.removeAttribute('hidden');
                overlay.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
                updateScore();
                playBeep(440, 0.08);
                if (!rafId) loop();
            }

            function updateScore() {
                if (scoreEl && game) scoreEl.textContent = 'Puntos: ' + game.score;
            }

            function fireBullet() {
                if (!game || game.fireCooldown > 0) return;
                game.bullets.push({ x: game.playerX + game.playerW / 2 - 2, y: canvas.height - 28, vy: -5 });
                game.fireCooldown = 18;
                playBeep(880, 0.05);
            }

            function loop() {
                if (!game || !game.active) {
                    rafId = 0;
                    return;
                }
                update();
                render();
                rafId = requestAnimationFrame(loop);
            }

            function update() {
                var g = game;
                g.anim++;
                if (g.fireCooldown > 0) g.fireCooldown--;

                if (!g.lost && !g.won) {
                    if (keys.left) g.playerX = Math.max(8, g.playerX - 4);
                    if (keys.right) g.playerX = Math.min(canvas.width - g.playerW - 8, g.playerX + 4);
                    if (keys.fire) fireBullet();
                }

                g.moveTimer += g.speed;
                if (g.moveTimer >= 1) {
                    g.moveTimer = 0;
                    var alive = g.invaders.filter(function (i) { return i.alive; });
                    if (alive.length === 0) {
                        g.won = true;
                        playBeep(660, 0.12);
                        return;
                    }
                    var minX = canvas.width;
                    var maxX = 0;
                    var maxY = 0;
                    alive.forEach(function (inv) {
                        minX = Math.min(minX, inv.x);
                        maxX = Math.max(maxX, inv.x + 36);
                        maxY = Math.max(maxY, inv.y + 24);
                    });
                    var hitEdge = (g.direction > 0 && maxX >= canvas.width - 12) || (g.direction < 0 && minX <= 12);
                    if (hitEdge) {
                        g.direction *= -1;
                        alive.forEach(function (inv) {
                            inv.y += 14;
                        });
                        g.speed = Math.min(g.speed + 0.04, 1.2);
                        playBeep(220, 0.04);
                    } else {
                        alive.forEach(function (inv) {
                            inv.x += g.direction * 6;
                        });
                    }
                    if (maxY >= canvas.height - 70) g.lost = true;
                }

                g.bullets = g.bullets.filter(function (b) {
                    b.y += b.vy;
                    if (b.y < 0) return false;
                    var hit = false;
                    g.invaders.forEach(function (inv) {
                        if (!inv.alive || hit) return;
                        if (b.x >= inv.x && b.x <= inv.x + 36 && b.y >= inv.y && b.y <= inv.y + 24) {
                            inv.alive = false;
                            hit = true;
                            g.score += (3 - inv.row) * 10 + 10;
                            updateScore();
                            playBeep(520, 0.06);
                        }
                    });
                    return !hit;
                });
            }

            function render() {
                var g = game;
                var w = canvas.width;
                var h = canvas.height;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);

                for (var i = 0; i < 40; i++) {
                    ctx.fillStyle = (i % 7 === 0) ? 'rgba(255,209,0,0.35)' : 'rgba(255,255,255,0.12)';
                    ctx.fillRect((i * 47 + g.anim) % w, (i * 31) % (h - 60), 2, 2);
                }

                g.invaders.forEach(function (inv, idx) {
                    if (!inv.alive) return;
                    var wobble = (g.anim % 20 < 10) ? 0 : 2;
                    var color = idx % 2 === 0 ? '#FFD100' : '#e80280';
                    drawInvaderSprite(inv.x, inv.y + wobble, 2, color);
                });

                ctx.fillStyle = '#0099DD';
                ctx.fillRect(g.playerX, h - 22, g.playerW, g.playerH);
                ctx.fillStyle = '#fff';
                ctx.fillRect(g.playerX + g.playerW / 2 - 2, h - 26, 4, 6);

                ctx.fillStyle = '#FFD100';
                g.bullets.forEach(function (b) {
                    ctx.fillRect(b.x, b.y, 4, 10);
                });

                if (g.won) {
                    ctx.fillStyle = 'rgba(0,0,0,0.65)';
                    ctx.fillRect(0, 0, w, h);
                    ctx.fillStyle = '#FFD100';
                    ctx.font = 'bold 18px Montserrat, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('¡GANASTE! BAIT', w / 2, h / 2);
                } else if (g.lost) {
                    ctx.fillStyle = 'rgba(0,0,0,0.65)';
                    ctx.fillRect(0, 0, w, h);
                    ctx.fillStyle = '#e80280';
                    ctx.font = 'bold 16px Montserrat, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('¡Te invadieron!', w / 2, h / 2);
                }
            }

            function onKeyDown(e) {
                if (overlay.hasAttribute('hidden')) {
                    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
                    var k = (e.key || '').toLowerCase();
                    if (k.length === 1) {
                        keyBuffer += k;
                        if (keyBuffer.length > 12) keyBuffer = keyBuffer.slice(-12);
                        if (keyBuffer.indexOf('bait') !== -1) {
                            keyBuffer = '';
                            triggerInvaders();
                        }
                    }
                    return;
                }
                if (e.key === 'ArrowLeft') { keys.left = true; e.preventDefault(); }
                if (e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); }
                if (e.key === ' ' || e.key === 'Spacebar') { keys.fire = true; e.preventDefault(); }
                if (e.key === 'Escape') closeGame();
            }

            function onKeyUp(e) {
                if (e.key === 'ArrowLeft') keys.left = false;
                if (e.key === 'ArrowRight') keys.right = false;
                if (e.key === ' ' || e.key === 'Spacebar') keys.fire = false;
            }

            function setupTouchControls() {
                var touchX = null;
                canvas.addEventListener('touchstart', function (e) {
                    e.preventDefault();
                    if (!game) return;
                    touchX = e.touches[0].clientX;
                    var rect = canvas.getBoundingClientRect();
                    var x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
                    if (x > canvas.width * 0.65) fireBullet();
                }, { passive: false });
                canvas.addEventListener('touchmove', function (e) {
                    e.preventDefault();
                    if (!game || touchX == null) return;
                    var dx = e.touches[0].clientX - touchX;
                    touchX = e.touches[0].clientX;
                    game.playerX = Math.max(8, Math.min(canvas.width - game.playerW - 8, game.playerX + dx * (canvas.width / canvas.getBoundingClientRect().width)));
                }, { passive: false });
                canvas.addEventListener('touchend', function () { touchX = null; });
            }

            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            if (closeBtn) closeBtn.addEventListener('click', closeGame);
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeGame();
            });
            setupTouchControls();
        })();
