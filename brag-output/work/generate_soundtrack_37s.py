import math
import struct
import wave
import random
import os

SAMPLE_RATE = 44100
DURATION = 37.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

music_left = [0.0] * TOTAL_SAMPLES
music_right = [0.0] * TOTAL_SAMPLES
voice_left = [0.0] * TOTAL_SAMPLES
voice_right = [0.0] * TOTAL_SAMPLES
sfx_left = [0.0] * TOTAL_SAMPLES
sfx_right = [0.0] * TOTAL_SAMPLES

def add_music(idx, l, r):
    if 0 <= idx < TOTAL_SAMPLES:
        music_left[idx] += l
        music_right[idx] += r

def add_voice(idx, l, r):
    if 0 <= idx < TOTAL_SAMPLES:
        voice_left[idx] += l
        voice_right[idx] += r

def add_sfx(idx, l, r):
    if 0 <= idx < TOTAL_SAMPLES:
        sfx_left[idx] += l
        sfx_right[idx] += r

# ── 1. Rhodes Electric Piano Synthesizer ──
def render_rhodes_chord(start_time, freqs, duration=2.4, gain=0.20):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(duration * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 1.5) * (1.0 - math.exp(-t * 60.0))
        tremolo = 1.0 + 0.12 * math.sin(2.0 * math.pi * 4.5 * t)
        
        chord_val = 0.0
        for f in freqs:
            h1 = math.sin(2.0 * math.pi * f * t)
            h2 = 0.35 * math.sin(2.0 * math.pi * f * 2.0 * t) * math.exp(-t * 3.5)
            h3 = 0.12 * math.sin(2.0 * math.pi * f * 3.0 * t) * math.exp(-t * 5.0)
            chord_val += (h1 + h2 + h3)
            
        chord_val = chord_val * env * tremolo * gain
        add_music(start_idx + i, chord_val * 0.95, chord_val * 1.05)

# ── 2. Warm 808 Sub-Bass ──
def render_808(start_time, freq, duration=1.2, gain=0.42):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(duration * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        pitch_env = freq * (1.0 + 0.5 * math.exp(-t * 35.0))
        amp_env = math.exp(-t * 2.4) * (1.0 - math.exp(-t * 80.0))
        val = math.sin(2.0 * math.pi * pitch_env * t)
        val = math.tanh(val * 1.3) * amp_env * gain
        add_music(start_idx + i, val, val)

# ── 3. Organic Percussion (Kick, Rimshot, Shaker) ──
def render_lofi_kick(start_time, gain=0.52):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.18 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        freq = 95.0 * math.exp(-t * 32.0) + 38.0
        env = math.exp(-t * 22.0)
        val = math.sin(2.0 * math.pi * freq * t) * env * gain
        add_music(start_idx + i, val, val)

def render_rimshot(start_time, gain=0.34):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.12 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        tone = math.sin(2.0 * math.pi * 420.0 * t) * math.exp(-t * 35.0)
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 28.0)
        val = (tone * 0.4 + noise * 0.6) * gain
        add_music(start_idx + i, val * 0.9, val * 1.1)

def render_shaker(start_time, gain=0.14):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.06 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 60.0)
        val = noise * gain
        add_music(start_idx + i, val * 0.8, val * 1.2)

# ── 4. Compose the Modern Beat (96 BPM, 0.625s per beat, 2.5s per bar) ──
BPM = 96.0
BEAT_DUR = 60.0 / BPM
BAR_DUR = BEAT_DUR * 4.0  # 2.5s per bar

TOTAL_BARS = int(math.ceil(DURATION / BAR_DUR)) # ~15 bars for 37.0s

chord_progression = [
    [174.61, 220.0, 261.63, 329.63],   # Fmaj7
    [196.0, 246.94, 293.66, 349.23],   # G7
    [164.81, 196.0, 246.94, 293.66],   # Em7
    [220.0, 261.63, 329.63, 392.0],    # Am7
]
bass_progression = [43.65, 49.0, 41.2, 55.0]

for bar in range(TOTAL_BARS):
    bar_start = bar * BAR_DUR
    if bar_start >= DURATION:
        break
        
    c_idx = bar % len(chord_progression)
    chord_freqs = chord_progression[c_idx]
    bass_f = bass_progression[c_idx]

    # Rhodes Chord
    render_rhodes_chord(bar_start, chord_freqs, duration=BAR_DUR * 0.95, gain=0.19)
    
    # 808 Sub Bass on Beat 1 and 3
    render_808(bar_start, bass_f, duration=BEAT_DUR * 1.5, gain=0.40)
    render_808(bar_start + BEAT_DUR * 2.5, bass_f, duration=BEAT_DUR * 1.2, gain=0.34)

    # Percussion
    for b in range(4):
        beat_time = bar_start + b * BEAT_DUR
        if beat_time >= DURATION:
            break
        if b == 0:
            render_lofi_kick(beat_time, gain=0.48)
        elif b == 2:
            render_lofi_kick(beat_time + BEAT_DUR * 0.5, gain=0.42)
            
        if b in [1, 3]:
            render_rimshot(beat_time, gain=0.35)
            
        render_shaker(beat_time + BEAT_DUR * 0.5, gain=0.14)
        if b in [1, 3]:
            render_shaker(beat_time + BEAT_DUR * 0.75, gain=0.10)

# ── 5. Helper to Mix WAV files ──
def mix_wav_file(path, start_time, target_buffer, gain=1.0):
    if not os.path.exists(path):
        print(f"Warning: {path} not found")
        return
    with wave.open(path, 'rb') as wf:
        params = wf.getparams()
        frames = wf.readframes(params.nframes)
        raw_data = struct.unpack(f"<{params.nframes * params.nchannels}h", frames)
        
        src_rate = params.framerate
        start_sample = int(start_time * SAMPLE_RATE)
        
        for i in range(params.nframes):
            if params.nchannels == 1:
                val = (raw_data[i] / 32768.0) * gain
                l_val, r_val = val, val
            else:
                l_val = (raw_data[i * 2] / 32768.0) * gain
                r_val = (raw_data[i * 2 + 1] / 32768.0) * gain
                
            out_idx = start_sample + int(i * (SAMPLE_RATE / src_rate))
            if 0 <= out_idx < TOTAL_SAMPLES:
                target_buffer[0][out_idx] += l_val
                target_buffer[1][out_idx] += r_val

# ── 6. Inject Voiceover Audio Clips (Calculated Timestamps) ──
voice_buffers = (voice_left, voice_right)
voice_cues = [
    (0.6, "brag-output/work/voice_scene1.wav"),
    (7.8, "brag-output/work/voice_scene2.wav"),
    (16.8, "brag-output/work/voice_scene3.wav"),
    (23.8, "brag-output/work/voice_scene4.wav"),
    (30.8, "brag-output/work/voice_scene5.wav")
]

voice_activity = [0.0] * TOTAL_SAMPLES

for cue_time, path in voice_cues:
    mix_wav_file(path, cue_time, voice_buffers, gain=1.2)
    # Track activity
    if os.path.exists(path):
        with wave.open(path, 'rb') as wf:
            dur = wf.getnframes() / wf.getframerate()
            s_idx = int(cue_time * SAMPLE_RATE)
            e_idx = min(TOTAL_SAMPLES, s_idx + int(dur * SAMPLE_RATE))
            for k in range(s_idx, e_idx):
                voice_activity[k] = 1.0

# ── 7. Inject Dedicated Sound Effects on Visual Cue Timestamps ──
sfx_buffers = (sfx_left, sfx_right)

# 1. Text Crossing out / Slash at 2.4s
mix_wav_file("brag-output/work/sfx_slash.wav", 2.4, sfx_buffers, gain=1.0)

# 2. Expired stamp impact at 3.4s
mix_wav_file("brag-output/work/sfx_stamp.wav", 3.4, sfx_buffers, gain=1.2)

# 3. Search button click at 14.0s
mix_wav_file("brag-output/work/sfx_click.wav", 14.0, sfx_buffers, gain=0.9)

# 4. Cash / Stipend reveal chime at 18.0s
mix_wav_file("brag-output/work/sfx_chime.wav", 18.0, sfx_buffers, gain=0.8)

# 5. Apply in 1-Click button click at 20.0s
mix_wav_file("brag-output/work/sfx_click.wav", 20.0, sfx_buffers, gain=0.95)

# 6. Recruiter Spotlight Level Up fanfare at 27.2s
mix_wav_file("brag-output/work/sfx_levelup.wav", 27.2, sfx_buffers, gain=0.85)

# ── 8. Sidechain Ducking & Normalization ──
ducking_envelope = [1.0] * TOTAL_SAMPLES
smooth_window = int(0.25 * SAMPLE_RATE)
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

master_bytes = bytearray()
music_only_bytes = bytearray()

max_peak = 0.0001
for i in range(TOTAL_SAMPLES):
    ducked_l = music_left[i] * ducking_envelope[i]
    ducked_r = music_right[i] * ducking_envelope[i]
    
    tot_l = ducked_l + voice_left[i] + sfx_left[i]
    tot_r = ducked_r + voice_right[i] + sfx_right[i]
    max_peak = max(max_peak, abs(tot_l), abs(tot_r))

norm_factor = 0.90 / max_peak

for i in range(TOTAL_SAMPLES):
    t = i / SAMPLE_RATE
    fade = 1.0
    if t > 36.2:
        fade = max(0.0, 1.0 - (t - 36.2) / 0.8)
        
    ducked_l = music_left[i] * ducking_envelope[i]
    ducked_r = music_right[i] * ducking_envelope[i]
    
    fin_l = max(-1.0, min(1.0, (ducked_l + voice_left[i] + sfx_left[i]) * norm_factor * fade))
    fin_r = max(-1.0, min(1.0, (ducked_r + voice_right[i] + sfx_right[i]) * norm_factor * fade))
    master_bytes.extend(struct.pack('<hh', int(fin_l * 32767.0), int(fin_r * 32767.0)))
    
    mus_l = max(-1.0, min(1.0, music_left[i] * 0.9 * fade))
    mus_r = max(-1.0, min(1.0, music_right[i] * 0.9 * fade))
    music_only_bytes.extend(struct.pack('<hh', int(mus_l * 32767.0), int(mus_r * 32767.0)))

with wave.open("brag-output/work/soundtrack.wav", 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(master_bytes)

with wave.open("brag-output/work/music_bed.wav", 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(music_only_bytes)

print(f"Generated 37.0s master soundtrack with SFX and voiceover -> brag-output/work/soundtrack.wav")

