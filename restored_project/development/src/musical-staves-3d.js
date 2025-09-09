/**
 * Musical Staves 2D - Hyper-legible 2D notation overlay for ChordCubes
 * Occupies top 1/4th of screen, only shows during playback when explicitly enabled
 */

class MusicalStaves2D {
    constructor() {
        this.isVisible = false;
        this.stavesContainer = null;
        this.canvas = null;
        this.isUserEnabled = false; // Only show if user clicked "Show Staves"
        this.isPlaybackActive = false; // Only show during playback
        this.currentProgression = [];

        this.createStavesOverlay();
        console.log('[MUSICAL STAVES 2D] 🎼 Hyper-legible 2D system initialized');
    }

    /**
     * Create 2D overlay that occupies top 1/4th of screen
     */
    createStavesOverlay() {
        // Remove existing container
        const existing = document.getElementById('staves-2d-overlay');
        if (existing) existing.remove();

        // Create overlay container - TOP 1/4TH OF SCREEN
        this.stavesContainer = document.createElement('div');
        this.stavesContainer.id = 'staves-2d-overlay';
        this.stavesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 25vh;
            background: rgba(255, 255, 255, 0.98);
            border-bottom: 3px solid #009688;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 999;
            display: none;
            overflow: hidden;
        `;

        // Create high-resolution canvas for crisp notation
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth * 2; // High DPI
        this.canvas.height = (window.innerHeight * 0.25) * 2; // High DPI
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 12px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000;
        `;
        closeBtn.onclick = () => this.userDisable();

        this.stavesContainer.appendChild(this.canvas);
        this.stavesContainer.appendChild(closeBtn);
        document.body.appendChild(this.stavesContainer);

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isVisible) {
                this.updateCanvasSize();
                this.renderCurrentProgression();
            }
        });

        console.log('[MUSICAL STAVES 2D] ✅ Top 1/4th overlay created');
    }

    /**
     * Update canvas size for window changes
     */
    updateCanvasSize() {
        this.canvas.width = window.innerWidth * 2;
        this.canvas.height = (window.innerHeight * 0.25) * 2;
    }

    /**
     * User clicked "Show Staves" button
     */
    userEnable() {
        this.isUserEnabled = true;
        this.updateVisibility();
        console.log('[MUSICAL STAVES 2D] 🎼 User enabled staves');
    }

    /**
     * User clicked "Hide Staves" or close button
     */
    userDisable() {
        this.isUserEnabled = false;
        this.updateVisibility();
        console.log('[MUSICAL STAVES 2D] 🎼 User disabled staves');
    }

    /**
     * Set playback state
     */
    setPlaybackActive(active) {
        this.isPlaybackActive = active;
        this.updateVisibility();
        console.log(`[MUSICAL STAVES 2D] 🎼 Playback ${active ? 'started' : 'stopped'}`);
    }

    /**
     * Update visibility based on user preference AND playback state
     * Only show if BOTH user enabled AND playback is active
     */
    updateVisibility() {
        const shouldShow = this.isUserEnabled && this.isPlaybackActive;

        if (shouldShow !== this.isVisible) {
            this.isVisible = shouldShow;
            this.stavesContainer.style.display = shouldShow ? 'block' : 'none';

            if (shouldShow) {
                this.updateCanvasSize();
                this.renderCurrentProgression();
            }

            console.log(`[MUSICAL STAVES 2D] ${shouldShow ? 'Showing' : 'Hiding'} staves (user: ${this.isUserEnabled}, playback: ${this.isPlaybackActive})`);
        }
    }

    /**
     * Create staves (compatibility with old API)
     */
    createStaves() {
        this.userEnable();
    }

    /**
     * Set visible (compatibility with old API)
     */
    setVisible(visible) {
        if (visible) {
            this.userEnable();
        } else {
            this.userDisable();
        }
    }

    /**
     * Display chord progression
     */
    displayChordProgression(progression) {
        this.currentProgression = progression || [];
        if (this.isVisible) {
            this.renderCurrentProgression();
        }
    }

    /**
     * Draw measures (compatibility)
     */
    drawMeasures(count) {
        console.log(`[MUSICAL STAVES 2D] Drawing ${count} measures`);
        if (this.isVisible) {
            this.renderCurrentProgression();
        }
    }

    /**
     * Render hyper-legible notation
     */
    renderCurrentProgression() {
        if (!this.canvas) return;

        const ctx = this.canvas.getContext('2d');
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // High-DPI scaling
        ctx.scale(2, 2);
        const scaledWidth = width / 2;
        const scaledHeight = height / 2;

        try {
            const VF = window.VF || (window.Vex ? window.Vex.Flow : null);
            if (!VF) {
                this.renderFallbackNotation(ctx, scaledWidth, scaledHeight);
                return;
            }

            // Create VexFlow renderer
            const renderer = new VF.Renderer(this.canvas, VF.Renderer.Backends.CANVAS);
            const context = renderer.getContext();
            context.setFont('Arial', 14);
            context.scale(2, 2); // High DPI

            // Calculate staff dimensions for top 1/4th screen
            const staffWidth = scaledWidth - 40;
            const trebleY = 30;
            const bassY = scaledHeight - 80;

            // Create treble and bass staves
            const trebleStave = new VF.Stave(20, trebleY, staffWidth);
            trebleStave.addClef('treble').addTimeSignature('4/4');
            trebleStave.setContext(context).draw();

            const bassStave = new VF.Stave(20, bassY, staffWidth);
            bassStave.addClef('bass').addTimeSignature('4/4');
            bassStave.setContext(context).draw();

            // Render progression
            if (this.currentProgression.length > 0) {
                this.renderProgressionNotes(context, trebleStave, bassStave, scaledWidth);
            } else {
                // Show "Playing..." message
                context.fillStyle = '#009688';
                context.font = 'bold 16px Arial';
                context.textAlign = 'center';
                context.fillText('🎵 Playing Progression...', scaledWidth / 2, scaledHeight / 2);
            }

            console.log('[MUSICAL STAVES 2D] ✅ Rendered hyper-legible notation');

        } catch (error) {
            console.error('[MUSICAL STAVES 2D] ❌ VexFlow error:', error);
            this.renderFallbackNotation(ctx, scaledWidth, scaledHeight);
        }
    }

    /**
     * Render progression notes with proper musical notation
     */
    renderProgressionNotes(context, trebleStave, bassStave, width) {
        const progression = this.currentProgression;

        try {
            const VF = window.VF || (window.Vex ? window.Vex.Flow : null);
            if (!VF) {
                this.renderFallbackProgression(context, trebleStave, bassStave, width);
                return;
            }

            // Simplified VexFlow rendering - draw individual notes directly
            const chordSpacing = Math.min(100, (width - 100) / Math.max(progression.length, 1));

            progression.forEach((chord, i) => {
                const roman = chord.roman || chord;
                const chordTones = this.getChordNotes(roman);
                const x = 60 + (i * chordSpacing);

                try {
                    // Draw treble clef notes (chord tones)
                    chordTones.treble.forEach((pitch, noteIndex) => {
                        const trebleNote = new VF.StaveNote({
                            clef: 'treble',
                            keys: [pitch],
                            duration: 'w'
                        });
                        trebleNote.setContext(context);
                        trebleNote.setStave(trebleStave);

                        // Position note horizontally
                        const noteX = x + (noteIndex * 12) - (chordTones.treble.length * 6);
                        trebleNote.setXShift(noteX);
                        trebleNote.draw();
                    });

                    // Draw bass clef note
                    const bassNote = new VF.StaveNote({
                        clef: 'bass',
                        keys: [chordTones.bass],
                        duration: 'w'
                    });
                    bassNote.setContext(context);
                    bassNote.setStave(bassStave);
                    bassNote.setXShift(x);
                    bassNote.draw();

                } catch (noteError) {
                    console.warn(`[STAVES 2D] Error drawing chord ${i} (${roman}):`, noteError);
                }

                // Add roman numeral above treble stave
                context.fillStyle = '#333';
                context.font = 'bold 12px Arial';
                context.textAlign = 'center';
                context.fillText(roman, x, trebleStave.getYForLine(0) - 30);
            });

        } catch (error) {
            console.warn('[STAVES 2D] VexFlow rendering error:', error);
            this.renderFallbackProgression(context, trebleStave, bassStave, width);
        }
    }

    /**
     * Get chord notes for a given roman numeral
     */
    getChordNotes(roman) {
        // Chord note mapping with proper voicing for piano staves
        const chordMap = {
            'I': { treble: ['c/5', 'e/5', 'g/5'], bass: 'c/3' },
            'ii': { treble: ['d/5', 'f/5', 'a/5'], bass: 'd/3' },
            'iii': { treble: ['e/5', 'g/5', 'b/5'], bass: 'e/3' },
            'IV': { treble: ['f/5', 'a/5', 'c/6'], bass: 'f/3' },
            'V': { treble: ['g/5', 'b/5', 'd/6'], bass: 'g/3' },
            'vi': { treble: ['a/5', 'c/6', 'e/6'], bass: 'a/3' },
            'vii': { treble: ['b/5', 'd/6', 'f/6'], bass: 'b/3' },
            'bVII': { treble: ['bb/5', 'd/6', 'f/6'], bass: 'bb/3' },
            'bVI': { treble: ['ab/5', 'c/6', 'eb/6'], bass: 'ab/3' },
            'bIII': { treble: ['eb/5', 'g/5', 'bb/5'], bass: 'eb/3' },
            'V7': { treble: ['g/5', 'b/5', 'd/6', 'f/6'], bass: 'g/3' },
            'I7': { treble: ['c/5', 'e/5', 'g/5', 'bb/5'], bass: 'c/3' }
        };

        // Default to I chord if not found
        return chordMap[roman] || chordMap['I'];
    }

    /**
     * Fallback rendering when VexFlow fails
     */
    renderFallbackProgression(context, trebleStave, bassStave, width) {
        const progression = this.currentProgression;
        const chordSpacing = Math.min(120, (width - 60) / Math.max(progression.length, 4));

        context.fillStyle = '#333';
        context.font = 'bold 14px Arial';
        context.textAlign = 'center';

        progression.forEach((chord, i) => {
            const x = 60 + (i * chordSpacing);
            const roman = chord.roman || chord;

            // Roman numeral above staves
            context.fillText(roman, x, trebleStave.getYForLine(0) - 25);

            // Simple note head representations
            context.fillStyle = '#000';
            context.beginPath();
            context.arc(x - 8, trebleStave.getYForLine(2), 5, 0, 2 * Math.PI);
            context.fill();

            context.beginPath();
            context.arc(x + 8, trebleStave.getYForLine(1), 5, 0, 2 * Math.PI);
            context.fill();

            context.beginPath();
            context.arc(x, bassStave.getYForLine(3), 5, 0, 2 * Math.PI);
            context.fill();

            context.fillStyle = '#333';
        });
    }

    /**
     * Fallback notation without VexFlow
     */
    renderFallbackNotation(ctx, width, height) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, width, height);

        // Draw manual staff lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;

        // Treble staff
        const trebleY = 40;
        for (let i = 0; i < 5; i++) {
            const y = trebleY + (i * 8);
            ctx.beginPath();
            ctx.moveTo(20, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();
        }

        // Bass staff
        const bassY = height - 80;
        for (let i = 0; i < 5; i++) {
            const y = bassY + (i * 8);
            ctx.beginPath();
            ctx.moveTo(20, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();
        }

        // Add labels
        ctx.fillStyle = '#666';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🎼 Musical Staves (VexFlow not available)', 30, 20);

        if (this.currentProgression.length > 0) {
            ctx.textAlign = 'center';
            ctx.fillText(`Playing: ${this.currentProgression.map(c => c.roman || c).join(' - ')}`, width / 2, height / 2);
        } else {
            ctx.textAlign = 'center';
            ctx.fillText('🎵 Waiting for progression...', width / 2, height / 2);
        }
    }

    /**
     * Billboard update (compatibility - not needed for 2D)
     */
    updateBillboard() {
        // No-op for 2D system
    }

    /**
     * Clear staves (compatibility)
     */
    clearStaves() {
        this.currentProgression = [];
        if (this.isVisible) {
            this.renderCurrentProgression();
        }
    }
}

// Export for global use - maintain MusicalStaves3D name for compatibility
if (typeof window !== 'undefined') {
    window.MusicalStaves3D = MusicalStaves2D;
    window.MusicalStaves2D = MusicalStaves2D;
}
