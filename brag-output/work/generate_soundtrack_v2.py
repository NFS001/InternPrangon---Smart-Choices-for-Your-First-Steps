import math
import struct
import wave
import random
import os

SAMPLE_RATE = 44100
DURATION = 20.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

music_left = [0.0] * TOTAL_SAMPLES
music_right = [0.0] * TOTAL_SAMPLES
voice_left = [0.0] * TOTAL_SAMPLES
voice_right = [0.0] * TOTAL_SAMPLES

def add_music(idx, l, r):
    if 0 <= idx < TOTAL_SAMPLES:
        music_left[idx] += l
        music_right[idx] += r

def add_voice(idx, l, r):
    if 0 <= idx < TOTAL_SAMPLES:
        voice_left[idx] += l
        voice_right[idx] += r

# ── 1. Rhodes Electric Piano Synthesizer ──
def render_rhodes_chord(start_time, freqs, duration=2.2, gain=0.22):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(duration * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 1.6) * (1.0 - math.exp(-t * 60.0))
        tremolo = 1.0 + 0.12 * math.sin(2.0 * math.pi * 4.5 * t)
        
        chord_val = 0.0
        for f in freqs:
            # Fundamental + soft harmonics
            h1 = math.sin(2.0 * math.pi * f * t)
            h2 = 0.4 * math.sin(2.0 * math.pi * f * 2.0 * t) * math.exp(-t * 3.5)
            h3 = 0.15 * math.sin(2.0 * math.pi * f * 3.0 * t) * math.exp(-t * 5.0)
            chord_val += (h1 + h2 + h3)
            
        chord_val = chord_val * env * tremolo * gain
        # Stereo widening
        add_music(start_idx + i, chord_val * 0.95, chord_val * 1.05)

# ── 2. Warm 808 Sub-Bass ──
def render_808(start_time, freq, duration=1.2, gain=0.45):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(duration * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        pitch_env = freq * (1.0 + 0.6 * math.exp(-t * 35.0))
        amp_env = math.exp(-t * 2.5) * (1.0 - math.exp(-t * 80.0))
        val = math.sin(2.0 * math.pi * pitch_env * t)
        # Soft saturation / tube warmth
        val = math.tanh(val * 1.3) * amp_env * gain
        add_music(start_idx + i, val, val)

# ── 3. Organic Percussion (Kick, Rimshot, Shaker) ──
def render_lofi_kick(start_time, gain=0.55):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.18 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        freq = 95.0 * math.exp(-t * 32.0) + 38.0
        env = math.exp(-t * 22.0)
        val = math.sin(2.0 * math.pi * freq * t) * env * gain
        add_music(start_idx + i, val, val)

def render_rimshot(start_time, gain=0.35):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.12 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        tone = math.sin(2.0 * math.pi * 420.0 * t) * math.exp(-t * 35.0)
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 28.0)
        val = (tone * 0.4 + noise * 0.6) * gain
        add_music(start_idx + i, val * 0.9, val * 1.1)

def render_shaker(start_time, gain=0.15):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.06 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 60.0)
        val = noise * gain
        add_music(start_idx + i, val * 0.8, val * 1.2)

# ── 4. Ambient Chime / Sparkle ──
def render_chime(start_time, freqs=[880.0, 1174.66, 1318.51, 1760.0], gain=0.2):
    for idx, f in enumerate(freqs):
        note_time = start_time + idx * 0.05
        start_idx = int(note_time * SAMPLE_RATE)
        dur_samples = int(0.6 * SAMPLE_RATE)
        for i in range(dur_samples):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 6.0)
            val = math.sin(2.0 * math.pi * f * t) * env * gain
            add_music(start_idx + i, val * (0.3 + idx * 0.2), val * (0.9 - idx * 0.2))

# ── 5. Compose the Modern Beat (96 BPM, 0.625s per beat) ──
BPM = 96.0
BEAT_DUR = 60.0 / BPM
BAR_DUR = BEAT_DUR * 4.0  # 2.5 seconds per bar

# 8 Bars total = 20.0 seconds
chords = [
    [174.61, 220.0, 261.63, 329.63],   # Fmaj7 (F3, A3, C4, E4)
    [196.0, 246.94, 293.66, 349.23],   # G7 (G3, B3, D4, F4)
    [164.81, 196.0, 246.94, 293.66],   # Em7 (E3, G3, B3, D4)
    [220.0, 261.63, 329.63, 392.0],    # Am7 (A3, C4, E4, G4)
    [174.61, 220.0, 261.63, 329.63],   # Fmaj7
    [196.0, 246.94, 293.66, 349.23],   # G7
    [164.81, 196.0, 246.94, 293.66],   # Em7
    [220.0, 261.63, 329.63, 523.25],   # Am9 outro
]

bass_notes = [43.65, 49.0, 41.2, 55.0, 43.65, 49.0, 41.2, 55.0]

for bar in range(8):
    bar_start = bar * BAR_DUR
    chord_freqs = chords[bar]
    bass_f = bass_notes[bar]

    # Warm Rhodes Chord
    render_rhodes_chord(bar_start, chord_freqs, duration=BAR_DUR * 0.95, gain=0.20)
    
    # 808 Sub Bass on Beat 1 and Beat 3
    render_808(bar_start, bass_f, duration=BEAT_DUR * 1.5, gain=0.42)
    render_808(bar_start + BEAT_DUR * 2.5, bass_f, duration=BEAT_DUR * 1.2, gain=0.36)

    # Percussion for Bar
    for b in range(4):
        beat_time = bar_start + b * BEAT_DUR
        
        # Kick on Beat 1 and 3 (with offbeat syncopation)
        if b == 0:
            render_lofi_kick(beat_time, gain=0.5)
        elif b == 2:
            render_lofi_kick(beat_time + BEAT_DUR * 0.5, gain=0.45)
            
        # Rimshot on Beat 2 and 4
        if b in [1, 3]:
            render_rimshot(beat_time, gain=0.38)
            
        # Shakers on 8th and 16th notes
        render_shaker(beat_time + BEAT_DUR * 0.5, gain=0.15)
        if b in [1, 3]:
            render_shaker(beat_time + BEAT_DUR * 0.75, gain=0.10)

# Synchronized SFX
render_chime(7.8)   # Scene 3: Stipend card reveal
render_chime(12.5)  # Scene 4: Contributor tier unlock
render_chime(16.5, freqs=[523.25, 659.25, 783.99, 1046.5], gain=0.25)  # Scene 5: Outro chime

# ── 6. Load & Inject Voiceover Files at Scene Timestamps ──
scene_voice_cues = [
    (0.6, "brag-output/work/voice_scene1.wav"),
    (3.5, "brag-output/work/voice_scene2.wav"),
    (7.5, "brag-output/work/voice_scene3.wav"),
    (11.5, "brag-output/work/voice_scene4.wav"),
    (16.0, "brag-output/work/voice_scene5.wav")
]

voice_activity = [0.0] * TOTAL_SAMPLES

for cue_time, path in scene_voice_cues:
    if os.path.exists(path):
        with wave.open(path, 'rb') as wf:
            params = wf.getparams()
            frames = wf.readframes(params.nframes)
            raw_data = struct.unpack(f"<{params.nframes * params.nchannels}h", frames)
            
            src_rate = params.framerate
            start_sample = int(cue_time * SAMPLE_RATE)
            
            # Resample mono 22050Hz to stereo 44100Hz
            for i in range(params.nframes):
                val = raw_data[i] / 32768.0
                out_idx1 = start_sample + int(i * (SAMPLE_RATE / src_rate))
                out_idx2 = out_idx1 + 1
                
                add_voice(out_idx1, val * 0.95, val * 0.95)
                add_voice(out_idx2, val * 0.95, val * 0.95)
                
                # Mark voice activity for music ducking
                if 0 <= out_idx1 < TOTAL_SAMPLES:
                    voice_activity[out_idx1] = 1.0
                if 0 <= out_idx2 < TOTAL_SAMPLES:
                    voice_activity[out_idx2] = 1.0

# Smooth the voice activity for natural ducking envelope
ducking_envelope = [1.0] * TOTAL_SAMPLES
smooth_window = int(0.15 * SAMPLE_RATE)
active_counter = 0

for i in range(TOTAL_SAMPLES):
    if voice_activity[i] > 0.0:
        active_counter = smooth_window
    elif active_counter > 0:
        active_counter -= 1
        
    if active_counter > 0:
        # Duck music by 55% during voiceover
        ducking_envelope[i] = 0.45
    else:
        ducking_envelope[i] = 1.0

# ── 7. Master Mix & Render ──
master_bytes = bytearray()
music_only_bytes = bytearray()

max_peak = 0.0001
for i in range(TOTAL_SAMPLES):
    # Apply ducking to music
    ducked_l = music_left[i] * ducking_envelope[i]
    ducked_r = music_right[i] * ducking_envelope[i]
    
    total_l = ducked_l + voice_left[i] * 1.15
    total_r = ducked_r + voice_right[i] * 1.15
    
    max_peak = max(max_peak, abs(total_l), abs(total_r))

norm_factor = 0.90 / max_peak

for i in range(TOTAL_SAMPLES):
    t = i / SAMPLE_RATE
    fade = 1.0
    if t > 19.3:
        fade = max(0.0, 1.0 - (t - 19.3) / 0.7)
        
    ducked_l = music_left[i] * ducking_envelope[i]
    ducked_r = music_right[i] * ducking_envelope[i]
    
    # Combined master
    fin_l = max(-1.0, min(1.0, (ducked_l + voice_left[i] * 1.15) * norm_factor * fade))
    fin_r = max(-1.0, min(1.0, (ducked_r + voice_right[i] * 1.15) * norm_factor * fade))
    master_bytes.extend(struct.pack('<hh', int(fin_l * 32767.0), int(fin_r * 32767.0)))
    
    # Music-only track
    mus_l = max(-1.0, min(1.0, music_left[i] * 0.9 * fade))
    mus_r = max(-1.0, min(1.0, music_right[i] * 0.9 * fade))
    music_only_bytes.extend(struct.pack('<hh', int(mus_l * 32767.0), int(mus_r * 32767.0)))

# Save master mix with voiceover
with wave.open("brag-output/work/soundtrack.wav", 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(master_bytes)

# Save clean music-only bed
with wave.open("brag-output/work/music_bed.wav", 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(music_only_bytes)

print("Generated modern soundtrack + AI voiceover mix -> brag-output/work/soundtrack.wav")
print("Generated clean modern music bed -> brag-output/work/music_bed.wav")

