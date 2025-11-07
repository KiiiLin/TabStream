#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 适配 Guitar Pro 7/8 (.gp / .gpx) → VexTab
# 支持 NoteRef、BeatRef、VoiceRef 完整链路

import sys, os, json, zipfile, tempfile, xml.etree.ElementTree as ET, traceback

# ============================================================
# 工具函数
# ============================================================

def ensure_dir_for_file(filepath):
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)

def extract_gpif_from_gp(path):
    if path.lower().endswith(".gpx"):
        return path

    if path.lower().endswith(".gp"):
        tmpdir = tempfile.mkdtemp(prefix="gp_unpack_")
        with zipfile.ZipFile(path, "r") as z:
            z.extractall(tmpdir)
        gpif = os.path.join(tmpdir, "Content", "score.gpif")
        if not os.path.exists(gpif):
            for root, _, files in os.walk(tmpdir):
                for f in files:
                    if f.endswith(".gpif"):
                        return os.path.join(root, f)
            raise FileNotFoundError("score.gpif not found in gp archive")

        return gpif

    raise ValueError("Unsupported file type")

# ============================================================
# 核心解析：GP8 = Track → Stave → Bar → VoiceRef → Voice → BeatRef → Beat → NoteRef
# ============================================================

def parse_gpif_to_vextab(gpif_path, src_path):
    tree = ET.parse(gpif_path)
    root = tree.getroot()

    # --------------------------------------------------------
    # STEP 1. 建立 Note 索引: {note_id : "fret/string"}
    # --------------------------------------------------------
    note_map = {}

    for note_elem in root.findall(".//Note"):
        nid = note_elem.attrib.get("id")
        props = note_elem.find("Properties")
        fret, string = "0", "1"

        if props:
            for p in props.findall("Property"):
                name = p.attrib.get("name")
                if name == "Fret":
                    fret = p.findtext("Fret", "0")
                elif name == "String":
                    string = p.findtext("String", "1")

        note_map[nid] = f"{fret}/{string}"

   # --------------------------------------------------------
    # STEP 2. 解析 Voice → BeatRef → Beat → Notes/NoteRef
    # --------------------------------------------------------

    # 解析 Voice： { voice_id : [beat_ids] }
    voice_map = {}  

    for voice_elem in root.findall(".//Voice"):
        vid = voice_elem.attrib.get("id")
        voice_map[vid] = []

        beats_elem = voice_elem.find("Beats")
        if beats_elem:
            for bref in beats_elem.findall("BeatRef"):
                ref = bref.attrib.get("ref")
                voice_map[vid].append(ref)

    # 解析 Beat： { beat_id : [note_ids] }
    beat_map = {}

    for beat_elem in root.findall(".//Beat"):
        bid = beat_elem.attrib.get("id")
        beat_map[bid] = []

        # ✅ 1. 兼容 <Notes>0 1 2 5</Notes>
        notes_text = beat_elem.findtext("Notes", "").strip()
        if notes_text:
            for nid in notes_text.split():
                beat_map[bid].append(nid)

        # ✅ 2. 兼容 <NoteRef ref="123" />
        for ref in beat_elem.findall(".//NoteRef"):
            nid = ref.attrib.get("ref")
            beat_map[bid].append(nid)

        # ✅ 3. 兼容 <Beat><Note id="xx">（直接嵌套）
        for note in beat_elem.findall("Note"):
            nid = note.attrib.get("id")
            beat_map[bid].append(nid)
    # --------------------------------------------------------
    # STEP 3. Track → Stave → Bar → VoiceRef
    # --------------------------------------------------------

    tracks_parent = root.find("Tracks")
    tracks = tracks_parent.findall("Track") if tracks_parent is not None else root.findall("Track")

    results = []

    for tid, track in enumerate(tracks, start=1):
        track_name = track.findtext("Name", f"Track {tid}")
        vextab_lines = ["tabstave notation=true"]

        # 找到本 Track 所有小节
        staves = track.find("Staves")
        if staves is None:
            continue

        for stave in staves.findall("Staff"):
            # Staff → Bars
            bars = stave.find("Bars")
            if bars is None:
                continue

            for bar in bars.findall("Bar"):
                # Bar → Voices → VoiceRef
                voices = bar.find("Voices")
                if voices is None:
                    continue

                bar_beats = []

                for vref in voices.findall("VoiceRef"):
                    vid = vref.attrib.get("ref")
                    if vid not in voice_map:
                        continue

                    # 取 Voice 里的所有节拍
                    for bid in voice_map[vid]:
                        if bid not in beat_map:
                            bar_beats.append("##")
                            continue

                        note_ids = beat_map[bid]
                        notes = [note_map[nid] for nid in note_ids if nid in note_map]
                        bar_beats.append(" ".join(notes) if notes else "##")

                # 每 4 拍一行 VexTab
                for i in range(0, len(bar_beats), 4):
                    group = " | ".join(bar_beats[i:i+4])
                    vextab_lines.append(f"notes {group}")

        # ----------------------------------------------------
        # 写入文件
        # ----------------------------------------------------
        out_path = f"{src_path}_track_{tid}.vextab"
        ensure_dir_for_file(out_path)

        with open(out_path, "w", encoding="utf-8") as fw:
            fw.write("\n".join(vextab_lines))

        results.append({
            "track_index": tid,
            "track_name": track_name,
            "vextab_path": out_path
        })

    return results


# ============================================================
# 主入口
# ============================================================
def parse_gpx(path):
    gpif_path = extract_gpif_from_gp(path)
    return parse_gpif_to_vextab(gpif_path, path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python gpx_parser.py <file.gp|file.gpx>")
        sys.exit(1)

    path = sys.argv[1]

    try:
        tracks = parse_gpx(path)
        print(json.dumps({"tracks": tracks}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        traceback.print_exc()
        sys.exit(1)
