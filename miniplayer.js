var MP={
    init(){
        gid('mini-container').innerHTML=`
        <div id="mini-player" class="hidden fixed left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[160]" style="bottom:82px;transition:transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);will-change:transform;transform:translate3d(0,150px,0);">
            <div id="mini-player-inner" onclick="FullPlayer.open()" class="rounded-2xl px-3.5 py-2.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden bg-white/[0.12] backdrop-blur-2xl border border-white/20 shadow-2xl group">
                
                <!-- Overlay for Next Song Transition (AutoNext last 10s) -->
                <div id="mini-next-overlay" class="absolute inset-0 pointer-events-none opacity-0 z-20 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#121318]/95 border border-white/30 backdrop-blur-2xl overflow-hidden">
                    <div class="relative w-11 h-11 shrink-0 flex items-center justify-center">
                        <div class="w-[34px] h-[34px] rounded-full overflow-hidden border border-white/20">
                            <img id="mini-cover-next" src="" class="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div id="mini-title-next" class="font-bold text-xs sm:text-sm text-white truncate"></div>
                        <div id="mini-artist-next" class="text-white/70 text-[11px] truncate mt-0.5"></div>
                    </div>
                    <span id="mini-next-badge" class="text-[9px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/20 shrink-0 mr-12">NEXT</span>
                </div>
                
                <!-- Beat Visualizer Ambient Background (Khusus Beat) -->
                <div id="mini-beats-bg" class="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-500 overflow-hidden rounded-full z-0 hidden">
                    <div id="mini-beats-bg-gradient" class="absolute inset-0 transition-all duration-700"></div>
                </div>

                <!-- Thumbnail Bulat Berputar + Circular Progress Bar (Lingkaran Hitam) -->
                <div class="relative w-11 h-11 shrink-0 flex items-center justify-center z-10" onclick="FullPlayer.open(); if(typeof event !== 'undefined') event.stopPropagation();">
                    <svg class="w-11 h-11 -rotate-90 pointer-events-none absolute inset-0 z-10" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2.5"></circle>
                        <circle id="mini-circle-progress" cx="24" cy="24" r="21" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="131.95" stroke-dashoffset="131.95" stroke-linecap="round" class="transition-all duration-150"></circle>
                    </svg>
                    <div class="w-[34px] h-[34px] rounded-full overflow-hidden  z-0 border border-white/10">
                        <img id="mini-cover" src="" class="w-full h-full object-cover rounded-full" />
                    </div>
                </div>

                <!-- Meta Info Judul & Artis (Lingkaran Putih Area) -->
                <div class="flex-1 min-w-0 z-10">
                    <div id="mini-title" class="font-bold text-xs sm:text-sm text-white truncate drop-shadow-sm">Pilih lagu</div>
                    <div id="mini-artist" class="text-[#a0a5b0] text-[11px] truncate mt-0.5"></div>
                </div>

                <!-- Controls: Play/Pause and Heart -->
                <div class="flex items-center gap-1.5 z-10 shrink-0">
                    <button onclick="TP(); if(typeof event !== 'undefined') event.stopPropagation();" class="text-white active:scale-90 p-0.5 cursor-pointer" title="Putar/Jeda">
                        <div id="mini-play-btn" class="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/10 border border-white/20 hover:bg-white/20">
                            <i data-lucide="play" class="w-4 h-4 fill-current ml-0.5"></i>
                        </div>
                    </button>
                    <button id="mini-like-btn" onclick="toggleCurrentLike(); if(typeof event !== 'undefined') event.stopPropagation();" class="text-[#a0a5b0] hover:text-rose-400 active:scale-90 p-1.5 cursor-pointer" title="Sukai Lagu">
                        <i data-lucide="heart" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    },
    show(){
        if (!S || !S.ct || (!S.ct.id && !S.ct.videoId && !S.ct.title)) {
            return;
        }
        var mp=gid('mini-player');
        if(!mp) return;
        mp.classList.remove('hidden');
        void mp.offsetHeight;
        mp.style.transform='translate3d(0,0,0)';
        if (typeof S !== 'undefined' && S.ct) {
            MP.updateBeats(S.ct);
        }
    },
    hide(){
        var mp=gid('mini-player');
        if(!mp) return;
        mp.style.transform='translate3d(0,150px,0)';
        setTimeout(function(){mp.classList.add('hidden');},300);
    },
    getTrackColors(track) {
        if (!track) return ['#ff2a5f', '#7c3aed', '#2563eb', '#059669', '#d97706'];
        var str = (track.videoId || '') + (track.title || '') + (track.artist || '');
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        hash = Math.abs(hash);
        var baseHue = hash % 360;
        return [
            'hsl(' + baseHue + ', 88%, 50%)',
            'hsl(' + ((baseHue + 55) % 360) + ', 92%, 55%)',
            'hsl(' + ((baseHue + 140) % 360) + ', 82%, 46%)',
            'hsl(' + ((baseHue + 215) % 360) + ', 86%, 49%)',
            'hsl(' + ((baseHue + 295) % 360) + ', 84%, 48%)'
        ];
    },
    applyColors(colors) {
        if (!colors || !colors.length) return;
        var primary = colors[0];
        var secondary = colors[1] || primary;
        var tertiary = colors[2] || primary;
        var inner = gid("mini-player-inner");
        if (inner) inner.style.background = "linear-gradient(to right, " + "color-mix(in srgb, " + tertiary + " 30%, #12131b), #12131b 80%)";
        if (typeof S !== 'undefined') S.currentAccentColor = primary;

        var circleProgress = gid('mini-circle-progress');
        if (circleProgress) circleProgress.style.stroke = primary;

        var playBtn = gid('mini-play-btn');
        if (playBtn) {
            playBtn.style.borderColor = "color-mix(in srgb, " + primary + " 40%, transparent)";
        }

        var beatBars = document.querySelectorAll('.mini-beat-bar');
        beatBars.forEach(function(bar, idx) {
            bar.style.backgroundColor = (idx % 2 === 0) ? primary : secondary;
        });

        var beatsGradient = gid('mini-beats-bg-gradient');
        if (beatsGradient) {
            beatsGradient.style.background = 'linear-gradient(to right, color-mix(in srgb, ' + primary + ' 25%, transparent), color-mix(in srgb, ' + secondary + ' 15%, transparent), transparent)';
        }

        if (typeof FullPlayer !== 'undefined' && FullPlayer.applyColors) {
            FullPlayer.applyColors(colors);
        }
    },
    extractFromImage(img) {
        try {
            var canvas = document.createElement('canvas');
            var size = 32;
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, size, size);
            var imgData = ctx.getImageData(0, 0, size, size).data;

            var regions = [
                { x0: 0, x1: 16, y0: 0, y1: 16 },   // Top-Left region
                { x0: 16, x1: 32, y0: 0, y1: 16 },  // Top-Right region
                { x0: 8, x1: 24, y0: 8, y1: 24 },   // Center region
                { x0: 0, x1: 16, y0: 16, y1: 32 },  // Bottom-Left region
                { x0: 16, x1: 32, y0: 16, y1: 32 }  // Bottom-Right region
            ];

            function rgbToHsl(r, g, b) {
                r /= 255; g /= 255; b /= 255;
                var max = Math.max(r, g, b), min = Math.min(r, g, b);
                var h, s, l = (max + min) / 2;
                if (max === min) {
                    h = s = 0;
                } else {
                    var d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
                    else if (max === g) h = (b - r) / d + 2;
                    else h = (r - g) / d + 4;
                    h /= 6;
                }
                return [h * 360, s * 100, l * 100];
            }

            function hslToRgb(h, s, l) {
                h /= 360; s /= 100; l /= 100;
                var r, g, b;
                if (s === 0) {
                    r = g = b = l;
                } else {
                    var hue2rgb = function(p, q, t) {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1/6) return p + (q - p) * 6 * t;
                        if (t < 1/2) return q;
                        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    };
                    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    var p = 2 * l - q;
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                }
                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            }

            // Only invent extra vividness where the source pixels actually carry
            // real color signal. On near-gray input, forcing a saturation floor
            // amplifies hue noise into a random, unrelated-looking color — so we
            // keep low-chroma regions close to their true (muted/neutral) tone.
            function formatColor(r, g, b, chroma) {
                var hsl = rgbToHsl(r, g, b);
                var h = hsl[0], s = hsl[1], l = hsl[2];
                var hasRealColor = chroma > 18;
                if (hasRealColor) {
                    s = Math.max(s, 45);
                    s = Math.min(s, 88);
                } else {
                    s = Math.min(s, 18);
                }
                l = Math.max(l, 28);
                l = Math.min(l, 60);
                var rgb = hslToRgb(h, s, l);
                return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
            }

            function getRegionColor(reg) {
                var pixels = [];
                for (var y = reg.y0; y < reg.y1; y++) {
                    for (var x = reg.x0; x < reg.x1; x++) {
                        var idx = (y * size + x) * 4;
                        var r = imgData[idx], g = imgData[idx+1], b = imgData[idx+2];
                        var maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
                        pixels.push([r, g, b, maxC - minC]);
                    }
                }
                if (!pixels.length) return null;

                // Average the most colorful pixels in the region (weighted by how
                // saturated each one is) instead of trusting a single max pixel,
                // which is too easily thrown off by one noisy/outlier pixel.
                pixels.sort(function(a, b) { return b[3] - a[3]; });
                var top = pixels.slice(0, Math.max(3, Math.round(pixels.length * 0.15)));
                var wr = 0, wg = 0, wb = 0, wSum = 0, chromaSum = 0;
                top.forEach(function(p) {
                    var w = p[3] + 1;
                    wr += p[0] * w; wg += p[1] * w; wb += p[2] * w; wSum += w;
                    chromaSum += p[3];
                });
                var domR = Math.round(wr / wSum), domG = Math.round(wg / wSum), domB = Math.round(wb / wSum);
                var avgChroma = chromaSum / top.length;
                return formatColor(domR, domG, domB, avgChroma);
            }

            var colors = regions.map(getRegionColor).filter(Boolean);
            if (colors.length >= 2) {
                while (colors.length < 5) {
                    colors.push(colors[colors.length % colors.length]);
                }
                return colors;
            }
        } catch(e) {}
        return null;
    },
    updateBeats(track) {
        if (!track) return;
        // Apply fast hash-based fallback immediately so the UI never waits/lags
        var fallback = MP.getTrackColors(track);
        MP.applyColors(fallback);

        if (!track.cover) return;

        MP._colorCache = MP._colorCache || {};
        if (MP._colorCache[track.cover]) {
            MP.applyColors(MP._colorCache[track.cover]);
            return;
        }

        // Upgrade to real colors extracted from the actual cover artwork.
        // Routed through our own proxy-image endpoint (same-origin) so the
        // canvas isn't blocked by cross-origin/CORS restrictions from the
        // original YouTube CDN, which is what silently broke extraction before.
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            var extracted = MP.extractFromImage(img);
            if (extracted) {
                MP._colorCache[track.cover] = extracted;
                // Only apply if this is still the track currently playing (avoid race on fast skips)
                if (typeof S === 'undefined' || !S.ct || S.ct.cover === track.cover) {
                    MP.applyColors(extracted);
                }
            }
        };
        img.onerror = function() {}; // silently keep the hash fallback if the image can't be read
        img.src = '/api/proxy-image?url=' + encodeURIComponent(track.cover);
    }
};