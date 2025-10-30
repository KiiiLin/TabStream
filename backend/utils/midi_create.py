import json
from mido import Message, MidiFile, MidiTrack, MetaMessage, bpm2tempo

def json_to_midi(json_path, output_path=None):
    # 1️⃣ 读取 JSON
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    song_info = data["song"]["info"]
    tracks = data["song"]["data"]

    title = song_info.get("title", "Untitled")
    bpm = int(song_info.get("tempo", 120))
    tempo = bpm2tempo(bpm)

    print(f"🎶 正在转换：{title}  |  BPM: {bpm}")

    # 2️⃣ 创建 MIDI 文件
    mid = MidiFile(ticks_per_beat=480)

    # 添加全局 tempo 轨道
    tempo_track = MidiTrack()
    tempo_track.append(MetaMessage("set_tempo", tempo=tempo))
    tempo_track.append(MetaMessage("track_name", name=title))
    mid.tracks.append(tempo_track)

    # 3️⃣ 遍历每个轨道
    for t_idx, track_data in enumerate(tracks):
        track_name = track_data.get("track_name", f"Track_{t_idx}")
        midi_track = MidiTrack()
        # midi_track.append(MetaMessage("track_name", name=track_name))
        print(f"轨道 {t_idx}: {track_name}")

        time_accum = 0  # 累计时间（tick）
        ticks_per_beat = mid.ticks_per_beat

        for measure in track_data.get("measures", []):
            for beat in measure.get("beats", []):
                duration = beat["notes"][0]["duration"] if beat["notes"] else 480
                duration = int(duration) if isinstance(duration, (int, float)) else 480

                for note in beat["notes"]:
                    string = note["string"]
                    fret = note["fret"]
                    velocity = int(note.get("velocity", 80))

                    # 简单推算音高（标准6弦吉他 EADGBE）
                    string_to_pitch = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}
                    base_pitch = string_to_pitch.get(int(string), 60)
                    pitch = base_pitch + int(fret)

                    # Note ON
                    midi_track.append(Message("note_on", note=pitch, velocity=velocity, time=time_accum))
                    # Note OFF
                    midi_track.append(Message("note_off", note=pitch, velocity=0, time=duration))

                    time_accum = 0  # 之后的音符连续衔接

                # 每拍结束，留一点间隔
                time_accum += 10

        mid.tracks.append(midi_track)

    # 4️⃣ 保存输出
    if not output_path:
        output_path = json_path.replace(".json", ".mid")

    mid.save(output_path)
    print(f"✅ MIDI 文件已保存: {output_path}")


if __name__ == "__main__":
    json_to_midi("test.json")
