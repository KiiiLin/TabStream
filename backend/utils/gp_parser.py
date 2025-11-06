# gp_parser.py
import guitarpro
import sys
import os
import traceback
import json
import re

# ---------------------------------------------------------
# 工具：确保所有 notes 行分离（防止 VexTab parser 报 INVALID）
# ---------------------------------------------------------
def fix_vextab_lines(text):
    """
    自动修复 VexTab 多行格式，确保每个 notes 行独立，
    防止由于字符串拼接导致的 'notes' 粘连。
    """
    # 在所有 notes 前强制换行（除非已在行首）
    text = re.sub(r'(?<!\n)(notes\s*:?)', r'\n\1', text)

    # 去除重复空行
    out_lines = []
    for line in text.splitlines():
        if line.strip():
            out_lines.append(line.strip())

    return "\n".join(out_lines)


# ---------------------------------------------------------
# Ticks → VexTab 时值映射
# ---------------------------------------------------------
def ticks_to_dur(ticks):
    mapping = {
        1920: "w",   # whole
        960:  "h",   # half
        480:  "q",   # quarter
        240:  "8",   # eighth
        120:  "16",
        60:   "32",
    }

    if ticks in mapping:
        return mapping[ticks]

    keys = sorted(mapping.keys())
    for k in reversed(keys):
        if ticks >= k:
            return mapping[k]

    return "q"


# ---------------------------------------------------------
# 安全属性访问
# ---------------------------------------------------------
def safe(obj, name, default=None):
    return getattr(obj, name, default)


# ---------------------------------------------------------
# 单个音符格式化为 fret/string(mods)
# ---------------------------------------------------------
def format_note(note):
    fret = safe(note, "value", 0)
    string = safe(note, "string", 1)
    mods = []

    # 按 VexTab 官方规则标记 hammer-on, pull-off, slide, bend 等修饰符
    if safe(note, "hammer", None) or safe(note, "hammerOn", None):
        mods.append("h")
    if safe(note, "pullOff", None):
        mods.append("p")
    if safe(note, "slide", None):
        mods.append("s")
    if safe(note, "bend", None):
        mods.append("b")
    if safe(note, "muted", False):
        mods.append("x")
    if safe(note, "vibrato", None):
        mods.append("v")

    base = f"{fret}/{string}"
    # 官方 VexTab 要求修饰符与音符间不能有空格
    return base + ("(" + "".join(mods) + ")" if mods else "")


# ---------------------------------------------------------
# 解析单轨 → VexTab 文本
# ---------------------------------------------------------
def parse_track(track, tempo):
    """将一条 guitarpro Track 转为紧凑版 VexTab 格式"""

    name = safe(track, "name", "Track")
    measures = safe(track, "measures", [])
    all_measures = []

    # 逐小节解析
    for measure in measures:
        beats = []
        for voice in safe(measure, "voices", []):
            beats.extend(voice.beats)

        if not beats:
            all_measures.append("##")
            continue

        parts = []
        for beat in beats:
            beat_notes = safe(beat, "notes", [])
            if not beat_notes:
                parts.append("##")  # ✅ 改为 VexTab 可识别休止符
            elif len(beat_notes) == 1:
                parts.append(format_note(beat_notes[0]))
            else:
                # ✅ 和弦格式 (5/2.7/3.9/4)
                chord = "(" + ".".join(
                    f"{safe(n, 'value', 0)}/{safe(n, 'string', 1)}"
                    for n in beat_notes
                ) + ")"
                parts.append(chord)

        all_measures.append(" ".join(parts))

    # 每4小节分组输出
    lines = []
    for i in range(0, len(all_measures), 4):
        group = all_measures[i:i+4]
        stave_text = " | ".join(group)
        lines.append("tabstave notation=true")
        lines.append("notes " + stave_text)

    return "\n".join(lines) + "\n"




# ---------------------------------------------------------
# 主函数：解析整个 .gp5 → 多轨 .vextab 文件
# ---------------------------------------------------------
def parse_gp(path):
    try:
        try:
            song = guitarpro.parse(path, "utf-8")
        except:
            song = guitarpro.parse(path, "latin-1")
    except Exception as e:
        return False, str(e)

    tempo = safe(song, "tempo", 120)
    result_tracks = []

    for t_idx, track in enumerate(song.tracks):
        if safe(track, "isPercussionTrack", False):
            continue
        if not track.measures:
            continue

        raw_text = parse_track(track, tempo)
        cleaned = fix_vextab_lines(raw_text)

        out_path = f"{path}_track_{t_idx+1}.vextab"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(cleaned + "\n")

        result_tracks.append({
            "track_index": t_idx + 1,
            "track_name": safe(track, "name", f"Track {t_idx+1}"),
            "vextab_path": out_path
        })

    return True, result_tracks


# ---------------------------------------------------------
# CLI
# ---------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python gp_parser.py <file.gp5>")
        sys.exit(1)

    path = sys.argv[1]

    try:
        ok, result = parse_gp(path)
        if not ok:
            print(json.dumps({"error": result}, ensure_ascii=False))
            sys.exit(1)

        print(json.dumps({"tracks": result}, ensure_ascii=False))
        sys.stdout.flush()

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        traceback.print_exc()
        sys.exit(1)
