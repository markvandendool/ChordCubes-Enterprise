// transport-bridge.js - COMPLETE REWRITE WITHOUT WEBAUDIOFONT
// NOTE: Tone.js is loaded globally via script tag, not ES module

// CRITICAL: Singleton AudioContext Manager that actually works
class AudioContextManager {
    constructor() {
        this.context = null;
        this.started = false;
        this.startPromise = null;

        // RE-ENABLED: Aggressive warning suppression for production - V1.62 Fix
        this.suppressWarnings();

        // REMOVED: No immediate AudioContext creation - defer to ensureAudioContext with user gesture
        console.log('[AUDIO] AudioContextManager initialized - waiting for user gesture');
    }

    suppressWarnings() {
        // Store original console methods
        const originalWarn = console.warn;
        const originalLog = console.log;

        // Override console.warn to filter AudioContext warnings
        console.warn = function (...args) {
            const message = args[0]?.toString() || '';
            if (message.includes('AudioContext') ||
                message.includes('not allowed to start') ||
                message.includes('user gesture')) {
                return; // Suppress these warnings
            }
            originalWarn.apply(console, args);
        };

        // Also suppress Tone.js startup logs if needed
        console.log = function (...args) {
            const message = args[0]?.toString() || '';
            if (message.includes('Tone.js v') && message.includes('AudioContext')) {
                return; // Suppress
            }
            originalLog.apply(console, args);
        };
    }

    async getContext() {
        if (!this.context) {
            // If Tone isn't available yet, wait a bit and retry
            if (!window.Tone) {
                console.warn('[AUDIO] Tone.js not available, waiting 300ms before retry...');
                await new Promise(resolve => setTimeout(resolve, 300));
                return this.getContext(); // Recursive retry
            }

            // Create context only once - NO FALLBACK AudioContext creation without user gesture
            try {
                this.context = window.Tone.getContext();
                console.log('[AUDIO] Successfully acquired Tone.js context');
            } catch (err) {
                console.error('[AUDIO] Failed to get Tone.js context - deferring to ensureAudioContext with user gesture:', err);
                return null; // Return null instead of creating AudioContext
            }

            // Configure for low latency
            if (this.context && this.context.rawContext) {
                this.context.lookAhead = 0.01;
            }
        }
        return this.context;
    }

    async start() {
        if (this.started && this.context && this.context.state === 'running') {
            console.log('[AUDIO] Audio context already started and running');
            return Promise.resolve(true);
        }

        if (!this.startPromise) {
            this.startPromise = (async () => {
                try {
                    // Simple, reliable initialization
                    if (window.Tone && window.Tone.context) {
                        console.log('[AUDIO] Starting Tone.js context... Current state:', window.Tone.context.state);

                        if (window.Tone.context.state !== 'running') {
                            try {
                                // This must be called during a user gesture (like a button click)
                                await window.Tone.start();
                                console.log('[AUDIO] Tone.start() successful, new state:', window.Tone.context.state);
                            } catch (err) {
                                console.warn('[AUDIO] Tone.start() failed, trying direct resume:', err);
                                try {
                                    await window.Tone.context.resume();
                                    console.log('[AUDIO] Direct context resume successful, new state:', window.Tone.context.state);
                                } catch (resumeErr) {
                                    console.error('[AUDIO] Direct resume also failed:', resumeErr);
                                    // Try one more thing - create a silent oscillator
                                    this.createSilentOscillator();

                                    // Try again after a small delay (sometimes helps on mobile)
                                    await new Promise(resolve => setTimeout(resolve, 100));
                                    try {
                                        await window.Tone.context.resume();
                                        console.log('[AUDIO] Delayed resume after oscillator successful');
                                    } catch (delayedErr) {
                                        console.warn('[AUDIO] Delayed resume also failed:', delayedErr);
                                    }
                                }
                            }
                        }

                        this.context = window.Tone.context;
                        this.started = window.Tone.context.state === 'running';
                        console.log('[AUDIO] Context started successfully, final state:', window.Tone.context.state);
                        return this.started;
                    } else {
                        console.warn('[AUDIO] Tone.js not available, trying fallback');
                    }
                } catch (err) {
                    console.warn('[AUDIO] Standard initialization failed:', err);
                }

                // First fallback: Wait and try again in case Tone.js is loading
                try {
                    console.log('[AUDIO] Waiting 300ms before attempting fallback 1');
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (window.Tone && window.Tone.context) {
                        console.log('[AUDIO] Tone.js now available in fallback 1, trying again');
                        try {
                            await window.Tone.start();
                            this.context = window.Tone.context;
                            this.started = window.Tone.context.state === 'running';
                            console.log('[AUDIO] Fallback 1 successful, state:', window.Tone.context.state);
                            return this.started;
                        } catch (retryErr) {
                            console.warn('[AUDIO] Fallback 1 Tone.start failed:', retryErr);
                        }
                    }
                } catch (fallback1Err) {
                    console.warn('[AUDIO] Fallback 1 failed:', fallback1Err);
                }

                // Second fallback for emergency cases
                try {
                    console.log('[AUDIO] Creating emergency fallback context');
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    await ctx.resume();

                    // Create a silent beep to unlock audio on iOS/Safari
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    gain.gain.value = 0.001;
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(0);
                    osc.stop(ctx.currentTime + 0.001);

                    this.context = ctx;
                    this.started = ctx.state === 'running';
                    console.log('[AUDIO] Emergency fallback successful, state:', ctx.state);
                    return this.started;
                } catch (e) {
                    console.error('[AUDIO] Emergency fallback failed:', e);
                    return false;
                }
            })();
        }

        return this.startPromise;
    }

    // Browser hack to unlock audio context
    createSilentOscillator() {
        try {
            console.log('[AUDIO] Creating silent oscillator as browser hack');
            // Use multiple oscillators at different frequencies for better chance of success
            for (let freq of [220, 440, 880]) {
                const silentContext = new (window.AudioContext || window.webkitAudioContext)();
                const silentOsc = silentContext.createOscillator();
                silentOsc.frequency.value = freq;
                const silentGain = silentContext.createGain();
                silentGain.gain.value = 0.001; // Nearly silent
                silentOsc.connect(silentGain);
                silentGain.connect(silentContext.destination);
                silentOsc.start();
                silentOsc.stop(silentContext.currentTime + 0.001);
            }
            console.log('[AUDIO] Silent oscillator hack completed');

            // Also try to help by playing a silent sound via Tone.js
            if (window.Tone && window.Tone.getDestination) {
                try {
                    const synth = new window.Tone.Synth().toDestination();
                    synth.volume.value = -60; // Super quiet
                    synth.triggerAttackRelease("C4", 0.01);
                    console.log('[AUDIO] Tone.js silent note played');
                } catch (toneErr) {
                    console.warn('[AUDIO] Tone.js silent note failed:', toneErr);
                }
            }
        } catch (err) {
            console.error('[AUDIO] Silent oscillator hack failed:', err);
        }
    }
}

// Global singleton instance
const audioManager = new AudioContextManager();

class ChordCubesTransport {
    constructor() {
        console.log('[TRANSPORT] Pure Tone.js Transport Bridge initialized');

        this.bpm = 120;
        this.drumsOn = false;
        this.metronomOn = false;
        this.currentStyle = 'rock';
        this.isPlaying = false;
        this.initializationComplete = false;

        // Lock bass/melody features
        this.lockBass = false;
        this.lockMelody = false;
        this.currentBass = null;
        this.currentMelody = null;

        // Drum synths storage
        this.drumSynths = {};
        this.patterns = {};

        // NO WebAudioFont references!
        this.webAudioFont = null; // Explicitly null
        this.instrumentsLoaded = false;

        // Initialize with a delay to ensure Tone.js is available
        this.initPromise = null;
        setTimeout(() => {
            this.initPromise = this.initialize();
        }, 500); // Give time for Tone.js to load
    }

    async initialize() {
        console.log('[TRANSPORT] Starting initialization...');

        // Wait for Tone.js to be available
        if (!window.Tone) {
            console.warn('[TRANSPORT] Tone.js not available yet, waiting...');
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, 300));
            return this.initialize(); // Recursive retry
        }

        // Ensure audio context is ready
        try {
            await audioManager.start();
            console.log('[TRANSPORT] Audio context started successfully');
        } catch (err) {
            console.error('[TRANSPORT] Failed to start audio context:', err);
        }

        // Create drum synthesizers
        try {
            await this.createDrumSynths();
            console.log('[TRANSPORT] Drum synths created successfully');
        } catch (err) {
            console.error('[TRANSPORT] Failed to create drum synths:', err);
        }

        // Setup patterns
        try {
            this.setupPatterns();
            console.log('[TRANSPORT] Patterns set up successfully');
        } catch (err) {
            console.error('[TRANSPORT] Failed to set up patterns:', err);
        }

        // Configure Tone.Transport
        try {
            if (window.Tone && window.Tone.Transport) {
                window.Tone.Transport.bpm.value = this.bpm;
                console.log('[TRANSPORT] Transport BPM set to', this.bpm);
            } else {
                console.error('[TRANSPORT] Tone.Transport not available!');
            }
        } catch (err) {
            console.error('[TRANSPORT] Failed to configure transport:', err);
        }

        this.initializationComplete = true;
        console.log('[TRANSPORT] ✅ Initialization complete');
        return true;
    }

    async createDrumSynths() {
        console.log('[TRANSPORT] Creating Tone.js drum synthesizers...');

        if (!window.Tone) {
            console.error('[TRANSPORT] Tone.js not available for creating drum synths!');
            return;
        }

        try {
            // Professional drum kit using Tone.js synthesis
            this.drumSynths = {
                kick: new window.Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 10,
                    oscillator: { type: "triangle" },
                    envelope: {
                        attack: 0.001,
                        decay: 0.4,
                        sustain: 0.01,
                        release: 1.4,
                        attackCurve: "exponential"
                    }
                }).toDestination(),

                snare: new window.Tone.NoiseSynth({
                    noise: { type: "white" },
                    envelope: {
                        attack: 0.001,
                        decay: 0.2,
                        sustain: 0
                    }
                }).toDestination(),

                hihat: new window.Tone.NoiseSynth({
                    noise: { type: "white" },
                    envelope: {
                        attack: 0.001,
                        decay: 0.1,
                        sustain: 0
                    }
                }).toDestination(),

                openHihat: new window.Tone.NoiseSynth({
                    noise: { type: "white" },
                    envelope: {
                        attack: 0.001,
                        decay: 0.3,
                        sustain: 0
                    }
                }).toDestination(),

                crash: new window.Tone.MetalSynth({
                    frequency: 800,
                    envelope: {
                        attack: 0.001,
                        decay: 1.4,
                        release: 0.2
                    },
                    harmonicity: 5.1,
                    modulationIndex: 32,
                    resonance: 4000,
                    octaves: 1.5
                }).toDestination(),

                ride: new window.Tone.MetalSynth({
                    frequency: 500,
                    envelope: {
                        attack: 0.001,
                        decay: 0.8,
                        release: 0.4
                    },
                    harmonicity: 3.5,
                    modulationIndex: 20,
                    resonance: 4000,
                    octaves: 1
                }).toDestination()
            };

            // Set volumes
            this.drumSynths.kick.volume.value = -10;
            this.drumSynths.snare.volume.value = -12;
            this.drumSynths.hihat.volume.value = -20;
            this.drumSynths.openHihat.volume.value = -18;
            this.drumSynths.crash.volume.value = -16;
            this.drumSynths.ride.volume.value = -18;

            this.instrumentsLoaded = true;
            console.log('[TRANSPORT] ✅ Drum synths created');
        } catch (error) {
            console.error('[TRANSPORT] Error creating drum synths:', error);
        }
    }

    setupPatterns() {
        // Professional drum patterns for different styles
        this.patterns = {
            rock: {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            jazz: {
                kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
                ride: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0],
                hihat: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
            },
            electronic: {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                openHihat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
            },
            funk: {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
                snare: [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
                hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                openHihat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]
            },
            latin: {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
                snare: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
                hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                ride: [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1]
            },
            hiphop: {
                kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0],
                openHihat: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0]
            }
        };

        console.log('[TRANSPORT] ✅ Drum patterns configured');
    }

    async initAudioSystem() {
        // Ensure everything is initialized
        await this.initPromise;

        // Start audio context if needed
        const success = await audioManager.start();

        console.log('[TRANSPORT] Audio system ready:', success);
        return success;
    }

    setBPM(newBPM) {
        this.bpm = Math.max(40, Math.min(300, newBPM));
        window.Tone.Transport.bpm.value = this.bpm;
        console.log(`[TRANSPORT] BPM set to ${this.bpm}`);
    }

    setStyle(style) {
        if (this.patterns[style]) {
            this.currentStyle = style;
            console.log(`[TRANSPORT] Style changed to ${style}`);

            // If playing, restart with new pattern
            if (this.isPlaying && this.drumsOn) {
                this.stop();
                this.start();
            }
        }
    }

    async start() {
        console.log('[TRANSPORT] Starting playback...');

        // Ensure audio is initialized
        await this.initAudioSystem();

        // Clear any existing events
        window.Tone.Transport.cancel();

        // Schedule drum pattern
        if (this.drumsOn) {
            this.scheduleDrumPattern();
        }

        // Schedule metronome
        if (this.metronomOn) {
            this.scheduleMetronome();
        }

        // Start transport
        window.Tone.Transport.start();
        this.isPlaying = true;

        console.log('[TRANSPORT] ✅ Playback started');
    }

    stop() {
        console.log('[TRANSPORT] Stopping playback...');

        window.Tone.Transport.stop();
        window.Tone.Transport.cancel();
        this.isPlaying = false;

        console.log('[TRANSPORT] ✅ Playback stopped');
    }

    scheduleDrumPattern() {
        const pattern = this.patterns[this.currentStyle];
        if (!pattern) return;

        // Schedule each drum hit
        Object.keys(pattern).forEach(drum => {
            const drumPattern = pattern[drum];
            const synth = this.drumSynths[drum];

            if (synth && drumPattern) {
                drumPattern.forEach((hit, index) => {
                    if (hit === 1) {
                        window.Tone.Transport.scheduleRepeat((time) => {
                            this.playDrumSound(drum, time);
                        }, "1m", `0:0:${index * 0.25}`);
                    }
                });
            }
        });
    }

    scheduleMetronome() {
        // Simple metronome click
        window.Tone.Transport.scheduleRepeat((time) => {
            const click = new window.Tone.Synth({
                oscillator: { type: "sine" },
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    sustain: 0,
                    release: 0.1
                }
            }).toDestination();

            click.volume.value = -20;
            click.triggerAttackRelease("C5", "32n", time);

            // Clean up
            setTimeout(() => click.dispose(), 200);
        }, "4n");
    }

    playDrumSound(drumType, time) {
        const synth = this.drumSynths[drumType];
        if (!synth) return;

        try {
            if (drumType === 'kick') {
                synth.triggerAttackRelease("C1", "8n", time);
            } else if (drumType === 'snare' || drumType === 'hihat' || drumType === 'openHihat') {
                synth.triggerAttackRelease("16n", time);
            } else if (drumType === 'crash' || drumType === 'ride') {
                synth.triggerAttackRelease("4n", time);
            }
        } catch (error) {
            console.error(`[TRANSPORT] Error playing ${drumType}:`, error);
        }
    }

    toggleDrums() {
        this.drumsOn = !this.drumsOn;
        console.log(`[TRANSPORT] Drums ${this.drumsOn ? 'ON' : 'OFF'}`);

        if (this.isPlaying) {
            this.stop();
            this.start();
        }

        return this.drumsOn;
    }

    toggleMetronome() {
        this.metronomOn = !this.metronomOn;
        console.log(`[TRANSPORT] Metronome ${this.metronomOn ? 'ON' : 'OFF'}`);

        if (this.isPlaying) {
            this.stop();
            this.start();
        }

        return this.metronomOn;
    }

    // Compatibility methods for existing code
    async ensureAudioContext() {
        console.log('[TRANSPORT] ensureAudioContext called - attempting to start audio');
        try {
            // Try multiple methods for maximum compatibility across browsers

            // METHOD 1: First make sure Tone.js is started directly if available
            let toneStarted = false;
            if (window.Tone && window.Tone.context) {
                if (window.Tone.context.state !== 'running') {
                    console.log('[TRANSPORT] Directly starting Tone.js context from ensureAudioContext');
                    try {
                        await window.Tone.start();
                        toneStarted = true;
                        console.log('[TRANSPORT] Successfully started Tone.js via Tone.start()');
                    } catch (toneErr) {
                        console.warn('[TRANSPORT] Tone.start failed, trying direct resume:', toneErr);
                        try {
                            await window.Tone.context.resume();
                            toneStarted = true;
                            console.log('[TRANSPORT] Successfully resumed Tone.js context directly');
                        } catch (resumeErr) {
                            console.warn('[TRANSPORT] Direct resume also failed:', resumeErr);
                        }
                    }
                } else {
                    console.log('[TRANSPORT] Tone.js context already running');
                    toneStarted = true;
                }
            }

            // METHOD 2: Use our audio manager (which has its own fallbacks)
            let managerStarted = false;
            try {
                const success = await audioManager.start();
                console.log('[TRANSPORT] AudioManager.start result:', success);
                managerStarted = success;
            } catch (managerErr) {
                console.warn('[TRANSPORT] AudioManager start failed:', managerErr);
            }

            // METHOD 3: Silent oscillator hack for Safari/iOS
            try {
                console.log('[TRANSPORT] Creating silent oscillator as browser hack');
                const silentContext = new (window.AudioContext || window.webkitAudioContext)();
                const silentOsc = silentContext.createOscillator();
                const silentGain = silentContext.createGain();
                silentGain.gain.value = 0.001; // Nearly silent
                silentOsc.connect(silentGain);
                silentGain.connect(silentContext.destination);
                silentOsc.start();
                silentOsc.stop(silentContext.currentTime + 0.001);
                console.log('[TRANSPORT] Silent oscillator hack completed');
            } catch (oscErr) {
                console.warn('[TRANSPORT] Silent oscillator hack failed:', oscErr);
            }

            // METHOD 4: Initialize audio engine if available
            let engineStarted = false;
            if (window.audioEngine && window.audioEngine.init) {
                try {
                    await window.audioEngine.init();
                    console.log('[TRANSPORT] Successfully initialized audio engine');
                    engineStarted = true;
                } catch (engineErr) {
                    console.warn('[TRANSPORT] Error initializing audio engine:', engineErr);
                }
            }

            // Check Tone.js state one more time as a verification
            let finalToneState = 'unknown';
            if (window.Tone && window.Tone.context) {
                finalToneState = window.Tone.context.state;
                console.log('[TRANSPORT] Final Tone.js context state:', finalToneState);
            }

            // Return success if ANY method worked
            const overallSuccess = toneStarted || managerStarted || engineStarted || (finalToneState === 'running');
            console.log('[TRANSPORT] Overall audio initialization success:', overallSuccess);

            // Add global flag for debug purposes
            window.audioInitialized = overallSuccess;

            return overallSuccess;
        } catch (err) {
            console.error('[TRANSPORT] Error in ensureAudioContext:', err);
            window.audioInitialized = false;
            return false;
        }
    }

    // Get the current state of the audio context
    getContextState() {
        if (window.Tone && window.Tone.context) {
            return window.Tone.context.state;
        }
        return 'unknown';
    }

    // LOCK BASS/MELODY IMPLEMENTATION
    toggleLockBass() {
        this.lockBass = !this.lockBass;
        console.log(`[TRANSPORT] Lock bass ${this.lockBass ? 'enabled' : 'disabled'}`);

        // Don't try to update UI directly - let main.js handle it

        return this.lockBass;
    }

    toggleLockMelody() {
        this.lockMelody = !this.lockMelody;
        console.log(`[TRANSPORT] Lock melody ${this.lockMelody ? 'enabled' : 'disabled'}`);

        // Don't try to update UI directly - let main.js handle it

        return this.lockMelody;
    }

    isLockBassEnabled() {
        return this.lockBass;
    }

    isLockMelodyEnabled() {
        return this.lockMelody;
    }

    getActiveNotes() {
        return [];
    }

    // Simple playChord method for direct playback from main.js
    async playChord(notes, duration = 2) {
        await this.ensureAudioContext();

        if (window.audioEngine && window.audioEngine.playChord) {
            window.audioEngine.playChord(notes, duration, 0.7);
            return;
        }

        // Fallback to simple tone.js synth if no audio engine
        const synth = new window.Tone.PolySynth(window.Tone.Synth).toDestination();
        synth.triggerAttackRelease(notes, duration);
        setTimeout(() => synth.dispose(), duration * 1000 + 500);
    }

    async loadInstrument(instrumentKey) {
        // NO-OP - We don't load WebAudioFont instruments anymore
        console.log(`[TRANSPORT] Skipping WebAudioFont load for ${instrumentKey}`);
        return true;
    }
}

// Create and export singleton instance
const chordCubesTransport = new ChordCubesTransport();

// CRITICAL: Expose globally IMMEDIATELY
window.chordCubesTransport = chordCubesTransport;
console.log('[TRANSPORT] ✅ Global transport exposed at window.chordCubesTransport');

export { chordCubesTransport };