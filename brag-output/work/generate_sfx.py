import math
import struct
import wave
import random

SAMPLE_RATE = 44100

def save_wav(filename, samples):
    # Normalize
    max_val = max(0.0001, max(abs(s) for s in samples))
    norm = [s / max_val * 0.95 for s in samples]
    
    raw = bytearray()
    for s in norm:
        val = int(s * 32767.0)
        # stereo
        raw.extend(struct.pack('<hh', val, val))
        
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(raw)
    print(f"Saved {filename}")

# 1. Text crossing out / slash sound
def make_slash():
    dur = 0.35
    total = int(dur * SAMPLE_RATE)
    samples = [0.0] * total
    for i in range(total):
        t = i / SAMPLE_RATE
        # Rising then fast falling pitch sweep with filtered noise
        noise = (random.random() * 2.0 - 1.0)
        freq = 600.0 * math.exp(-t * 12.0) + 150.0
        tone = math.sin(2.0 * math.pi * freq * t)
        env = math.exp(-t * 9.0) * math.sin(math.pi * min(1.0, t * 15.0))
        samples[i] = (noise * 0.7 + tone * 0.3) * env
    return samples

# 2. Expired stamp slam sound
def make_stamp():
    dur = 0.45
    total = int(dur * SAMPLE_RATE)
    samples = [0.0] * total
    for i in range(total):
        t = i / SAMPLE_RATE
        # Initial sharp slap (transient)
        slap = (random.random() * 2.0 - 1.0) * math.exp(-t * 80.0)
        # Heavy low thud impact (65 Hz down to 35 Hz)
        thud_freq = 75.0 * math.exp(-t * 20.0) + 35.0
        thud = math.sin(2.0 * math.pi * thud_freq * t) * math.exp(-t * 8.0)
        # Resonant wooden desk body (180 Hz)
        body = math.sin(2.0 * math.pi * 180.0 * t) * math.exp(-t * 25.0)
        samples[i] = slap * 0.6 + thud * 0.8 + body * 0.4
    return samples

# 3. Button click sound
def make_click():
    dur = 0.08
    total = int(dur * SAMPLE_RATE)
    samples = [0.0] * total
    for i in range(total):
        t = i / SAMPLE_RATE
        # Crisp transient impulse
        click = math.sin(2.0 * math.pi * 1200.0 * t) * math.exp(-t * 180.0)
        pop = math.sin(2.0 * math.pi * 320.0 * t) * math.exp(-t * 90.0)
        samples[i] = click * 0.7 + pop * 0.3
    return samples

# 4. Cash / Stipend chime
def make_chime():
    dur = 0.6
    total = int(dur * SAMPLE_RATE)
    samples = [0.0] * total
    notes = [1046.5, 1318.5, 1567.98, 2093.0] # C6, E6, G6, C7
    for j, f in enumerate(notes):
        offset = int(j * 0.045 * SAMPLE_RATE)
        for i in range(total - offset):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 7.0)
            val = math.sin(2.0 * math.pi * f * t) * env * 0.25
            samples[offset + i] += val
    return samples

# 5. Level up fanfare chime
def make_levelup():
    dur = 0.8
    total = int(dur * SAMPLE_RATE)
    samples = [0.0] * total
    notes = [523.25, 659.25, 783.99, 1046.5, 1318.5] # C5, E5, G5, C6, E6
    for j, f in enumerate(notes):
        offset = int(j * 0.065 * SAMPLE_RATE)
        for i in range(total - offset):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 6.0)
            val = math.sin(2.0 * math.pi * f * t) * env * 0.28
            samples[offset + i] += val
    return samples

if __name__ == "__main__":
    save_wav("brag-output/work/sfx_slash.wav", make_slash())
    save_wav("brag-output/work/sfx_stamp.wav", make_stamp())
    save_wav("brag-output/work/sfx_click.wav", make_click())
    save_wav("brag-output/work/sfx_chime.wav", make_chime())
    save_wav("brag-output/work/sfx_levelup.wav", make_levelup())

