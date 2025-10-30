import guitarpro
import json
import os

def parse_gp_file(filepath):

    with open(filepath, 'rb') as f: 
        try:
            song = guitarpro.parse(filepath, encoding='utf-8')
        except Exception:
            song = guitarpro.parse(filepath, encoding='latin-1')

    def safe_value(val):
        if isinstance(val, (str, int, float, bool)) or val is None:
            return val
        return str(val)
    
    song_info = {
        "title": song.title,
        "subtitle": song.subtitle,
        "artist": song.artist,
        "album": song.album,
        "notice": song.notice,
        "tempo": song.tempo,
        "key": safe_value(song.key),
        "version": song.versionTuple
    }

    tracks_data = []
    for i, track in enumerate(song.tracks):
        track_info = {
            "track_index": i,
            "track_name": track.name,
            "instrument": track.channel.instrument,
            "strings": len(track.strings),
            "is_percussion": track.isPercussionTrack,
            "measures": []
        }

        for m_idx, measure in enumerate(track.measures):
            measure_info = {"index": m_idx + 1, "beats": []}

            for b_idx, beat in enumerate(measure.voices[0].beats):
                beat_notes = []
                for note in beat.notes:
                    beat_notes.append({
                        "string": note.string,
                        "fret": note.value,
                        "velocity": note.velocity,
                        "duration": beat.duration.time
                    })
                if beat_notes:
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
    
    base, _ = os.path.splitext(filepath)
    output_path = base + ".json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)

parse_gp_file("test.gp5")