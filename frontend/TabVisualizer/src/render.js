// render.js
import Vex from 'vexflow';
const VF = Vex;

// 弦对应 MIDI
const STRING_BASE_MIDI = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function midiToVexKey(midi){
    const noteIndex = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi/12)-1;
    const name = NOTE_NAMES[noteIndex].toLowerCase();
    return `${name}/${octave}`;
}

function stringFretToKey(string,fret){
    const base = STRING_BASE_MIDI[string];
    if(base===undefined||typeof fret!=='number') return 'c/4';
    const midi = base + Math.round(fret);
    return midiToVexKey(midi);
}

function durationToSymbol(ticks){
    if(ticks<=240) return '8';
    if(ticks<=480) return 'q';
    if(ticks<=720) return 'h';
    if(ticks<=960) return 'w';
    return 'w';
}
function restSymbol(sym){ return `${sym}r`; }

function getTotalMeasuresCount(jsonData){
    const track = jsonData?.song?.data?.[0];
    if(!track) return 0;
    return (track.measures || []).length;
}

// 主渲染函数，接收 JSON 数据参数
export function renderGuitarTab(jsonData){
    if(!jsonData) return;

    const container = document.getElementById('tabContainer');
    if(!container) return;
    container.innerHTML='';

    const songInfo = jsonData.song?.info || {};
    const tempo = songInfo.tempo || 120;
    const track = jsonData.song?.data?.[0];
    if(!track) return;

    const timeSig = track?.time || {numBeats:4,beatValue:4};
    const numBeats = timeSig.numBeats;
    const beatValue = timeSig.beatValue;
    const ticksPerQuarter = 480;
    const maxMeasureTicks = numBeats * ticksPerQuarter * (4/beatValue);

    const canvasWidth=1000,staveWidth=220,staveHeight=100;
    const measuresPerLine=Math.floor((canvasWidth-20)/(staveWidth+10));
    const totalMeasures = getTotalMeasuresCount(jsonData);
    const lines=Math.max(1,Math.ceil(totalMeasures/measuresPerLine));
    const canvasHeight = lines*(staveHeight+60)+60;

    const renderer = new VF.Renderer(container,VF.Renderer.Backends.SVG);
    renderer.resize(canvasWidth,canvasHeight);
    const context = renderer.getContext();

    const measures = track?.measures||[];
    let x=10,y=40,measureIndex=0;

    for(let m=0;m<measures.length;m++){
        const measure = measures[m];
        if(!measure.beats) continue;

        // 过滤重复 beat index
        const beats = measure.beats.filter((b,i,self)=>i===0||b.index!==self[i-1].index);

        const stave = new VF.Stave(x,y,staveWidth);
        const tabStave = new VF.TabStave(x,y+50,staveWidth);

        if(measureIndex%measuresPerLine===0){
            stave.addClef('treble').addTimeSignature(`${numBeats}/${beatValue}`);
            tabStave.addClef('tab');
            context.save();
            context.setFont("Arial",14,"").setFillStyle("#000");
            context.fillText(`♩ = ${tempo}`,x+5,y-20);
            context.restore();
        }

        stave.setContext(context).draw();
        tabStave.setContext(context).draw();

        const staveNotes=[],tabNotes=[];
        let usedTicks = 0;

        for(const beat of beats){
            const beatNotes = beat.notes || [];
            let durTicks = beatNotes[0]?.duration || ticksPerQuarter*(4/beatValue);
            if(usedTicks + durTicks > maxMeasureTicks) durTicks = maxMeasureTicks - usedTicks;
            const durSym = durationToSymbol(durTicks);

            if(!beatNotes.length){
                staveNotes.push(new VF.StaveNote({keys:['b/4'],duration:restSymbol(durSym)}));
                tabNotes.push(new VF.TabNote({positions:[],duration:restSymbol(durSym)}));
            } else {
                const staveKeys=[],tabPositions=[];
                for(const n of beatNotes){
                    staveKeys.push(stringFretToKey(n.string,n.fret));
                    tabPositions.push({str:n.string,fret:n.fret});
                }
                const staveNote = new VF.StaveNote({keys:staveKeys,duration:durSym});
                const tabNote = new VF.TabNote({positions:tabPositions,duration:durSym});
                staveNotes.push(staveNote);
                tabNotes.push(tabNote);
            }

            usedTicks += durTicks;
            if(usedTicks >= maxMeasureTicks) break; // 防止超过小节总 ticks
        }

        const voice = new VF.Voice({numBeats,beatValue,resolution:480});
        voice.addTickables(staveNotes);
        const tabVoice = new VF.Voice({numBeats,beatValue,resolution:480});
        tabVoice.addTickables(tabNotes);

        try{
            new VF.Formatter().joinVoices([voice]).joinVoices([tabVoice]).format([voice],staveWidth-20);
            voice.draw(context,stave);
            tabVoice.draw(context,tabStave);
        }catch(err){
            console.error('Formatter error at measure',measureIndex,err);
        }

        measureIndex++;
        x+=staveWidth+10;
        if(measureIndex%measuresPerLine===0){x=10;y+=staveHeight+60;}
    }

    const infoP=document.createElement('p');
    infoP.style.textAlign='center';
    const title = songInfo.title || 'Untitled';
    const trackName = track.track_name || 'Guitar Track';
    infoP.textContent=`🎵 ${title} — ${trackName}`;
    container.appendChild(infoP);
}
