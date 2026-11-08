import math
import struct
import wave
import random

SAMPLE_RATE = 44100
DURATION = 20.0
BPM = 124.0
BEAT_DUR = 60.0 / BPM
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

left_channel = [0.0] * TOTAL_SAMPLES
right_channel = [0.0] * TOTAL_SAMPLES

def add_sample(idx, l, r):
    if 0 <= idx < TOTAL_SAMPLES:
        left_channel[idx] += l
        right_channel[idx] += r

# 1. Synthesize 4-on-the-floor Kick
def render_kick(start_time, gain=0.8):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.22 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        freq = 130.0 * math.exp(-t * 28.0) + 42.0
        env = math.exp(-t * 16.0)
        val = math.sin(2.0 * math.pi * freq * t) * env * gain
        add_sample(start_idx + i, val, val)

# 2. Snare on beats 2 and 4
def render_snare(start_time, gain=0.45):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(0.25 * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 18.0)
        body = math.sin(2.0 * math.pi * 180.0 * t) * math.exp(-t * 22.0)
        val = (noise * 0.7 + body * 0.3) * gain
        add_sample(start_idx + i, val * 0.95, val * 1.05)

# 3. Hi-Hats on 8th notes
def render_hihat(start_time, open_hat=False, gain=0.25):
    start_idx = int(start_time * SAMPLE_RATE)
    decay = 12.0 if open_hat else 45.0
    dur_samples = int((0.2 if open_hat else 0.08) * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * decay)
        val = noise * gain
        # Pan slightly left/right alternately
        add_sample(start_idx + i, val * 0.8, val * 1.2)

# 4. Bass note (synth pluck)
def render_bass(start_time, freq, dur=0.22, gain=0.5):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(dur * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 8.0)
        # Sawtooth approx
        val = 0.0
        for h in range(1, 5):
            val += (1.0 / h) * math.sin(2.0 * math.pi * (freq * h) * t)
        val = val * env * gain
        add_sample(start_idx + i, val, val)

# 5. Synth Pluck / Bell Arpeggio
def render_bell(start_time, freq, dur=0.35, pan=0.0, gain=0.25):
    start_idx = int(start_time * SAMPLE_RATE)
    dur_samples = int(dur * SAMPLE_RATE)
    for i in range(dur_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 7.0)
        val = (math.sin(2.0 * math.pi * freq * t) + 0.3 * math.sin(2.0 * math.pi * freq * 2.0 * t)) * env * gain
        l_gain = (1.0 - pan) * 0.5
        r_gain = (1.0 + pan) * 0.5
        add_sample(start_idx + i, val * l_gain, val * r_gain)

# 6. UI Sound Effects
def render_riser(start_time, end_time):
    start_idx = int(start_time * SAMPLE_RATE)
    end_idx = int(end_time * SAMPLE_RATE)
    total = end_idx - start_idx
    for i in range(total):
        progress = i / total
        noise = (random.random() * 2.0 - 1.0)
        freq = 200.0 + 1200.0 * (progress ** 2)
        tone = math.sin(2.0 * math.pi * freq * (i / SAMPLE_RATE))
        val = (noise * 0.4 + tone * 0.6) * (progress ** 2) * 0.4
        add_sample(start_idx + i, val, val)

def render_chime(start_time):
    # Cash-register / sparkle chime (pentatonic triad)
    notes = [1046.5, 1318.5, 1567.98, 2093.0] # C6, E6, G6, C7
    for j, f in enumerate(notes):
        render_bell(start_time + j * 0.06, f, dur=0.6, pan=(j - 1.5) * 0.4, gain=0.35)

def render_level_up(start_time):
    notes = [523.25, 659.25, 783.99, 1046.5] # C5, E5, G5, C6
    for j, f in enumerate(notes):
        render_bell(start_time + j * 0.08, f, dur=0.5, pan=0.0, gain=0.4)

# ----------------- Sequence Generation -----------------

# Intro Riser into Drop (0.0 to 3.0s)
render_riser(0.5, 2.9)
# 4 intro kicks
render_kick(0.0, gain=0.5)
render_kick(0.967, gain=0.6)
render_kick(1.935, gain=0.7)
render_kick(2.419, gain=0.85)

# Beat drops at 3.0s and runs until 18.5s
# Chords: A minor (55Hz), F major (43.65Hz), C major (65.4Hz), G major (49Hz)
root_notes = [110.0, 87.31, 130.81, 98.0] # A2, F2, C3, G2
arp_patterns = [
    [440.0, 523.25, 659.25, 880.0],  # Am
    [349.23, 440.0, 523.25, 698.46], # F
    [523.25, 659.25, 783.99, 1046.5],# C
    [392.0, 493.88, 587.33, 783.99]  # G
]

beat_count = int((18.5 - 3.0) / BEAT_DUR)
for b in range(beat_count):
    cur_time = 3.0 + b * BEAT_DUR
    bar = int(b // 4)
    beat_in_bar = b % 4
    chord_idx = bar % 4
    
    # 4-on-the-floor Kick
    render_kick(cur_time, gain=0.8)
    
    # Snare on 2 and 4
    if beat_in_bar in [1, 3]:
        render_snare(cur_time, gain=0.5)
        
    # Hi-hats on off-beats
    render_hihat(cur_time + BEAT_DUR * 0.5, open_hat=(b % 8 == 7), gain=0.3)
    
    # Bass on 16th groove
    base_f = root_notes[chord_idx]
    render_bass(cur_time, base_f, dur=0.2, gain=0.5)
    render_bass(cur_time + BEAT_DUR * 0.5, base_f * 1.5, dur=0.15, gain=0.35)
    render_bass(cur_time + BEAT_DUR * 0.75, base_f, dur=0.12, gain=0.4)
    
    # Arpeggio bells
    chord_arp = arp_patterns[chord_idx]
    for sub in range(2):
        note = chord_arp[(b * 2 + sub) % len(chord_arp)]
        pan = -0.5 if sub == 0 else 0.5
        render_bell(cur_time + sub * (BEAT_DUR * 0.5), note, dur=0.28, pan=pan, gain=0.25)

# Insert SFX synced to visual cues:
render_chime(8.5)      # Scene 3: "1-Click Apply" & stipend highlight
render_level_up(13.2)  # Scene 4: "Elite Badge & Spotlight"
render_bell(17.5, 1046.5, dur=2.2, gain=0.6) # Scene 5: Outro high chime

# Outro Grand Finale Chord at 17.0s
outro_time = 17.0
for f in [261.63, 329.63, 392.0, 523.25]:
    render_bell(outro_time, f, dur=2.8, gain=0.45)

# Master Normalization and Limiting
max_val = 0.0001
for i in range(TOTAL_SAMPLES):
    max_val = max(max_val, abs(left_channel[i]), abs(right_channel[i]))

norm_factor = 0.92 / max_val
output_bytes = bytearray()

for i in range(TOTAL_SAMPLES):
    # Soft fade out at the very end (19.5s to 20.0s)
    t = i / SAMPLE_RATE
    fade = 1.0
    if t > 19.4:
        fade = max(0.0, 1.0 - (t - 19.4) / 0.6)
        
    l = max(-1.0, min(1.0, left_channel[i] * norm_factor * fade))
    r = max(-1.0, min(1.0, right_channel[i] * norm_factor * fade))
    
    l_int = int(l * 32767.0)
    r_int = int(r * 32767.0)
    
    output_bytes.extend(struct.pack('<hh', l_int, r_int))

out_path = "brag-output/work/soundtrack.wav"
with wave.open(out_path, 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    wf.writeframes(output_bytes)

print(f"Synthesized soundtrack saved to {out_path} ({DURATION}s, 124 BPM)")

