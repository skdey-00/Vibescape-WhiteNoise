# Virtual Audio Setup Guide

## Why You Need This

Browser-based system audio capture can only "hear" audio that's actually being played. If you mute YouTube/Spotify, there's no audio to capture.

**Virtual Audio Cable** solves this by routing audio internally, so Lofi Flow can capture it without playing to speakers.

## Windows Setup (VB-Audio Cable)

### 1. Install VB-Audio Cable
- Download: https://vb-audio.com/Cable/
- Install "VB-Cable" (free, donationware)
- Restart your computer

### 2. Configure Audio Output Per Application
For each app you want to spatialize (YouTube, Spotify, etc.):

**Option A - In the app:**
- Spotify: Settings → Audio Output → "Cable Input"
- YouTube/Chrome: No per-app setting, use Option B

**Option B - Windows Volume Mixer (Works for all apps):**
1. Click speaker icon in taskbar → Open Volume Mixer
2. Find your app (Chrome, Spotify, etc.)
3. Set that app's output to "Cable Input (VB-Audio Cable)"

### 3. Configure Lofi Flow
- When capturing audio in Lofi Flow, you'll now capture from VB-Cable
- The audio routes internally without playing to speakers

### 4. Monitor the Spatial Audio
To hear the spatialized output:
- Your default speakers will play what Lofi Flow outputs
- OR use headphones to avoid any audio leakage

## Alternative: VB-Audio Voicemeeter (More Control)

For better control, use Voicemeeter (free):
1. Download: https://vb-audio.com/Voicemeeter/
2. Install and restart
3. Set your apps to output to "Voicemeeter Input"
4. In Voicemeeter:
   - Set A1 (Hardware Out) to your speakers - this is Lofi Flow's output
   - Set A2 (Virtual Out) to muted - this prevents direct audio
5. In Lofi Flow, capture from "Voicemeeter Output"

## macOS Setup: Loopback or BlackHole

### Option 1: BlackHole (Free, Open Source)
1. Install: `brew install blackhole-2ch` or download from GitHub
2. Open Audio MIDI Setup (Applications → Utilities → Audio MIDI Setup)
3. Create Multi-Output Device:
   - Include "Built-in Output" AND "BlackHole 2ch"
4. Set your system output to this Multi-Output Device
5. In Lofi Flow, capture from "BlackHole 2ch"

### Option 2: Loopback (Paid, $99)
1. Download: https://rogueamoeba.com/loopback/
2. Create a new virtual device
3. Add your apps as audio sources
4. Set output to pass through to Lofi Flow only

## Quick Test

After setup, test it:
1. Open YouTube/Spotify
2. Start audio playing
3. Capture in Lofi Flow
4. **Mute the YouTube/Spotify player**
5. You should STILL hear spatialized audio (proving it's working via virtual cable)

## Troubleshooting

**No audio at all:**
- Check that the app is actually outputting to the virtual cable
- Check Windows Sound Settings → Recording → "Cable Output" is enabled

**Still hearing duplicate audio:**
- Make sure the app's output is ONLY going to virtual cable, not also to speakers
- Check Volume Mixer to verify the app isn't also playing to default output

**Audio quality is poor:**
- Increase virtual cable buffer size in VB-Audio Control Panel
- Close other audio applications

## Notes

- This setup is one-time only - after configuration, it works automatically
- Virtual audio has near-zero latency (1-2ms)
- Quality is identical to direct audio output
