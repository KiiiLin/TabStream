import guitarpro
import json
import os
import sys

def parse_gp_file(filepath):
    """解析 Guitar Pro 文件并生成 JSON 数据"""
    try:
        song = guitarpro.parse(filepath, encoding='utf-8')
    except Exception:
        try:
            song = guitarpro.parse(filepath, encoding='latin-1')
        except Exception as e:
            return {"error": f"无法解析文件: {str(e)}"}

    def safe_value(val):
        """保证 JSON 可序列化"""
        if isinstance(val, (str, int, float, bool)) or val is None:
            return val
        try:
            return str(val)
        except:
            return None

    # 歌曲基本信息
    song_info = {
        "title": getattr(song, "title", "") or "",
        "subtitle": getattr(song, "subtitle", "") or "",
        "artist": getattr(song, "artist", "") or "",
        "album": getattr(song, "album", "") or "",
        "notice": getattr(song, "notice", "") or "",
        "tempo": getattr(song, "tempo", 120),
        "key": safe_value(getattr(song, 'key', None)),
        "version": getattr(song, "versionTuple", None)
    }

    tracks_data = []
    for i, track in enumerate(getattr(song, "tracks", [])):
        if getattr(track, "isPercussionTrack", False) and not getattr(track, "measures", []):
            continue

        track_info = {
            "track_index": i,
            "track_name": getattr(track, "name", f"Track {i+1}") or f"Track {i+1}",
            "instrument": safe_value(getattr(getattr(track, "channel", None), 'instrument', None)),
            "strings": len(getattr(track, "strings", [])) or 6,
            "is_percussion": getattr(track, "isPercussionTrack", False),
            "measures": []
        }

        for m_idx, measure in enumerate(getattr(track, "measures", [])):
            measure_info = {"index": m_idx + 1, "beats": []}
            voices = getattr(measure, "voices", [])
            for voice in voices:
                for b_idx, beat in enumerate(getattr(voice, "beats", [])):
                    beat_notes = []
                    for note in getattr(beat, "notes", []):
                        beat_notes.append({
                            "string": getattr(note, "string", 0),
                            "fret": getattr(note, "value", 0),
                            "velocity": getattr(note, "velocity", 0),
                            "duration": getattr(beat, "duration", type('dur', (), {'time': 480})) .time,
                            "bend": getattr(note, "bend", None),
                            "hammerOn": getattr(note, "hammerOn", False),
                            "pullOff": getattr(note, "pullOff", False),
                            "slide": getattr(note, "slide", None),
                            "muted": getattr(note, "muted", False),
                            "vibrato": getattr(note, "vibrato", None)
                        })

                    measure_info["beats"].append({
                        "index": b_idx + 1,
                        "notes": beat_notes
                    })

            if measure_info["beats"]:
                track_info["measures"].append(measure_info)

        tracks_data.append(track_info)

    result = {
        "song": {
            "info": song_info,
            "data": tracks_data
        }
    }

    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        parsed = parse_gp_file(file_path)
        if "error" in parsed:
            print(json.dumps(parsed))
            sys.exit(1)

        # 保存 JSON 文件到同目录下
        base, _ = os.path.splitext(file_path)
        output_path = base + ".json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, ensure_ascii=False, indent=4)

        # 输出保存路径，前端可以读取
        print(json.dumps({"json_path": output_path}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
