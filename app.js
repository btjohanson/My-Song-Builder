(() => {
  "use strict";

  const PC_NAMES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const ENHARMONIC_DISPLAY = {
    1:"C#", 3:"Eb", 6:"F#", 8:"Ab", 10:"Bb"
  };
  const NOTE_RE = /^([A-Ga-g])([#b]?)(-?\d+)?$/;

  const tuningPresets = [
    { id:"guitar-standard-6", label:"Guitar Standard — E A D G B E", strings:6, notes:["E2","A2","D3","G3","B3","E4"] },
    { id:"guitar-drop-d-6", label:"Drop D — D A D G B E", strings:6, notes:["D2","A2","D3","G3","B3","E4"] },
    { id:"guitar-d-standard-6", label:"D Standard — D G C F A D", strings:6, notes:["D2","G2","C3","F3","A3","D4"] },
    { id:"guitar-eb-standard-6", label:"Eb Standard — Eb Ab Db Gb Bb Eb", strings:6, notes:["D#2","G#2","C#3","F#3","A#3","D#4"] },
    { id:"guitar-open-g-6", label:"Open G — D G D G B D", strings:6, notes:["D2","G2","D3","G3","B3","D4"] },
    { id:"bass-standard-4", label:"Bass Standard — E A D G", strings:4, notes:["E1","A1","D2","G2"] },
    { id:"bass-drop-d-4", label:"Bass Drop D — D A D G", strings:4, notes:["D1","A1","D2","G2"] },
    { id:"bass-standard-5", label:"5-string Bass — B E A D G", strings:5, notes:["B0","E1","A1","D2","G2"] },
    { id:"bass-standard-6", label:"6-string Bass — B E A D G C", strings:6, notes:["B0","E1","A1","D2","G2","C3"] },
    { id:"guitar-standard-7", label:"7-string Guitar — B E A D G B E", strings:7, notes:["B1","E2","A2","D3","G3","B3","E4"] },
    { id:"guitar-standard-8", label:"8-string Guitar — F# B E A D G B E", strings:8, notes:["F#1","B1","E2","A2","D3","G3","B3","E4"] },
    { id:"custom", label:"Custom", strings:null, notes:null }
  ];

  const starterLibrary = [
    // Standard guitar
    ["guitar-standard-6","X 3 2 0 1 0","C"],
    ["guitar-standard-6","3 2 0 0 0 3","G"],
    ["guitar-standard-6","0 2 2 1 0 0","E"],
    ["guitar-standard-6","0 0 2 2 2 0","A"],
    ["guitar-standard-6","X X 0 2 3 2","D"],
    ["guitar-standard-6","0 2 2 0 0 0","Em"],
    ["guitar-standard-6","X 0 2 2 1 0","Am"],
    ["guitar-standard-6","X X 0 2 3 1","Dm"],
    ["guitar-standard-6","1 3 3 2 1 1","F"],
    ["guitar-standard-6","3 5 5 X X X","G5"],
    ["guitar-standard-6","X 3 5 5 X X","C5"],
    ["guitar-standard-6","0 2 2 X X X","E5"],
    ["guitar-standard-6","X X 0 2 3 0","Dadd9"],
    ["guitar-standard-6","X 3 2 0 0 0","Cmaj7"],
    // 4-string bass common roots / fifths
    ["bass-standard-4","0 X X X","E"],
    ["bass-standard-4","3 X X X","G"],
    ["bass-standard-4","X 3 X X","C"],
    ["bass-standard-4","X 5 X X","D"],
    ["bass-standard-4","0 2 X X","E5"],
    ["bass-standard-4","3 5 X X","G5"],
    ["bass-standard-4","X 3 5 X","C5"]
  ];

  const chordTemplates = [
    {name:"", intervals:[0,4,7]},
    {name:"m", intervals:[0,3,7]},
    {name:"5", intervals:[0,7]},
    {name:"dim", intervals:[0,3,6]},
    {name:"aug", intervals:[0,4,8]},
    {name:"sus2", intervals:[0,2,7]},
    {name:"sus4", intervals:[0,5,7]},
    {name:"6", intervals:[0,4,7,9]},
    {name:"m6", intervals:[0,3,7,9]},
    {name:"7", intervals:[0,4,7,10]},
    {name:"maj7", intervals:[0,4,7,11]},
    {name:"m7", intervals:[0,3,7,10]},
    {name:"mMaj7", intervals:[0,3,7,11]},
    {name:"dim7", intervals:[0,3,6,9]},
    {name:"m7b5", intervals:[0,3,6,10]},
    {name:"add9", intervals:[0,2,4,7]},
    {name:"madd9", intervals:[0,2,3,7]},
    {name:"9", intervals:[0,2,4,7,10]},
    {name:"maj9", intervals:[0,2,4,7,11]},
    {name:"m9", intervals:[0,2,3,7,10]},
    {name:"11", intervals:[0,2,4,5,7,10]},
    {name:"13", intervals:[0,2,4,7,9,10]}
  ];

  const majorScale = [0,2,4,5,7,9,11];
  const naturalMinorScale = [0,2,3,5,7,8,10];
  const majorTriads = ["","m","m","","","m","dim"];
  const minorTriads = ["m","dim","","m","m","",""];

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const state = {
    songTitle:"Untitled Song",
    instrumentType:"guitar",
    stringCount:6,
    tuningPreset:"guitar-standard-6",
    tuning:["E2","A2","D3","G3","B3","E4"],
    sectionLabelStyle:"name",
    sections:[],
    arrangement:[],
    practiceDisplayMode:"both"
  };

  let dragPayload = null;

  function uid(prefix="id"){ return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`; }

  function noteToMidi(note){
    const m = String(note).trim().match(NOTE_RE);
    if(!m) return null;
    const letter = m[1].toUpperCase();
    const accidental = m[2] || "";
    const octave = m[3] === undefined ? 3 : Number(m[3]);
    const base = {C:0,D:2,E:4,F:5,G:7,A:9,B:11}[letter];
    let pc = base + (accidental === "#" ? 1 : accidental === "b" ? -1 : 0);
    pc = (pc + 12) % 12;
    return (octave + 1) * 12 + pc;
  }

  function midiToName(midi, includeOctave=false){
    if(midi === null || midi === undefined) return "?";
    const pc = ((midi % 12)+12)%12;
    const name = ENHARMONIC_DISPLAY[pc] || PC_NAMES_SHARP[pc];
    if(!includeOctave) return name;
    return `${name}${Math.floor(midi/12)-1}`;
  }

  function normalizeFret(v){
    v = String(v ?? "X").trim().toUpperCase();
    if(v === "") return "X";
    if(v === "X") return "X";
    const n = Number(v);
    if(Number.isInteger(n) && n >= 0 && n <= 36) return String(n);
    return "X";
  }

  function soundingNotes(frets){
    const out = [];
    frets.forEach((f,i)=>{
      if(f === "X") return;
      const base = noteToMidi(state.tuning[i]);
      if(base === null) return;
      out.push({ midi:base + Number(f), stringIndex:i, fret:Number(f) });
    });
    return out;
  }

  function uniquePCs(notes){ return [...new Set(notes.map(n => ((n.midi%12)+12)%12))]; }

  function intervalSetForRoot(pcs, root){
    return [...new Set(pcs.map(pc => (pc-root+12)%12))].sort((a,b)=>a-b);
  }

  function arraysEqual(a,b){
    return a.length === b.length && a.every((v,i)=>v===b[i]);
  }

  function libraryKey(){
    return `${state.stringCount}|${state.tuning.join(",")}`;
  }

  function getLibrary(){
    try{return JSON.parse(localStorage.getItem("csb-chord-library") || "{}")}catch{return {}}
  }

  function setLibrary(lib){ localStorage.setItem("csb-chord-library", JSON.stringify(lib)); }

  function seedLibrary(){
    const lib = getLibrary();
    starterLibrary.forEach(([presetId, shape, name])=>{
      const preset = tuningPresets.find(p=>p.id===presetId);
      if(!preset || !preset.notes) return;
      const key = `${preset.strings}|${preset.notes.join(",")}`;
      lib[key] ||= {};
      lib[key][shape] ||= name;
    });
    setLibrary(lib);
  }

  function rememberShape(frets, name){
    if(!name || frets.every(f=>f==="X")) return;
    const lib = getLibrary();
    const key = libraryKey();
    lib[key] ||= {};
    lib[key][frets.join(" ")] = name;
    setLibrary(lib);
  }

  function lookupShape(frets){
    const lib = getLibrary();
    return lib[libraryKey()]?.[frets.join(" ")] || null;
  }

  function identifyChord(frets){
    const learned = lookupShape(frets);
    const notes = soundingNotes(frets);
    if(notes.length === 0) return {name:"—", notes:[], pcs:[]};
    const pcs = uniquePCs(notes);
    if(learned) return {name:learned, notes, pcs, learned:true};

    const bassPc = ((notes[0].midi%12)+12)%12;
    const candidates = [];

    pcs.forEach(root=>{
      const ints = intervalSetForRoot(pcs, root);
      chordTemplates.forEach((tpl, idx)=>{
        const exact = arraysEqual(ints, tpl.intervals);
        if(exact){
          let score = 100 - idx*.02;
          if(root === bassPc) score += 4;
          candidates.push({root, tpl, score, exact:true});
          return;
        }
        const required = tpl.intervals;
        const intersection = required.filter(i=>ints.includes(i)).length;
        const extras = ints.filter(i=>!required.includes(i)).length;
        const missing = required.filter(i=>!ints.includes(i)).length;
        if(intersection >= Math.max(2, required.length-1)){
          let score = intersection*12 - extras*7 - missing*9;
          if(root === bassPc) score += 2;
          candidates.push({root, tpl, score, exact:false});
        }
      });
    });

    candidates.sort((a,b)=>b.score-a.score);
    let name;
    if(candidates.length){
      const c = candidates[0];
      name = `${midiToName(c.root)}${c.tpl.name}`;
      if(c.root !== bassPc && pcs.includes(c.root)) name += `/${midiToName(bassPc)}`;
    } else if(pcs.length === 1){
      name = midiToName(pcs[0]);
    } else {
      name = pcs.map(midiToName).join("/");
    }
    rememberShape(frets, name);
    return {name, notes, pcs};
  }

  function sectionDisplay(sec){
    if(state.sectionLabelStyle === "section") return `Section ${sec.letter}`;
    return sec.name?.trim() ? `${sec.letter} — ${sec.name.trim()}` : sec.letter;
  }

  function nextSectionLetter(i){
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if(i < alphabet.length) return alphabet[i];
    return `A${i-alphabet.length+1}`;
  }

  function makeChord(){
    return {id:uid("ch"), frets:Array(state.stringCount).fill("X"), note:""};
  }

  function makeSection(){
    return {
      id:uid("sec"),
      letter:nextSectionLetter(state.sections.length),
      name:"",
      note:"",
      chords:[makeChord()]
    };
  }

  function syncTopControls(){
    $("#songTitle").value = state.songTitle;
    $("#instrumentType").value = state.instrumentType;
    $("#stringCount").value = String(state.stringCount);
    $("#sectionLabelStyle").value = state.sectionLabelStyle;
    $("#practiceDisplayMode").value = state.practiceDisplayMode;
  }

  function populateTuningPresets(){
    const select = $("#tuningPreset");
    select.innerHTML = "";
    const fits = tuningPresets.filter(p => p.id==="custom" || p.strings===state.stringCount);
    fits.forEach(p=>{
      const opt=document.createElement("option");
      opt.value=p.id; opt.textContent=p.label;
      select.appendChild(opt);
    });
    if(fits.some(p=>p.id===state.tuningPreset)) select.value=state.tuningPreset;
    else select.value="custom";
  }

  function renderTuningEditors(){
    const wrap=$("#tuningEditors");
    wrap.innerHTML="";
    state.tuning.forEach((n,i)=>{
      const label=document.createElement("label");
      label.className="tuning-note";
      label.innerHTML=`S${i+1}<input data-tuning-index="${i}" value="${n}" aria-label="String ${i+1} tuning">`;
      wrap.appendChild(label);
    });
    $$("[data-tuning-index]").forEach(inp=>{
      inp.addEventListener("change", e=>{
        const i=Number(e.target.dataset.tuningIndex);
        if(noteToMidi(e.target.value)===null){
          e.target.value=state.tuning[i];
          return;
        }
        state.tuning[i]=e.target.value.trim();
        state.tuningPreset="custom";
        $("#tuningPreset").value="custom";
        renderAllComputed();
      });
    });
  }

  function renderSections(){
    const container=$("#sectionsContainer");
    container.innerHTML="";
    state.sections.forEach((sec,secIndex)=>{
      const node=$("#sectionTemplate").content.firstElementChild.cloneNode(true);
      node.dataset.sectionId=sec.id;
      node.querySelector(".section-letter").textContent=sectionDisplay(sec);
      const nameInput=node.querySelector(".section-name-input");
      nameInput.value=sec.name;
      nameInput.addEventListener("input",e=>{
        sec.name=e.target.value;
        node.querySelector(".section-letter").textContent=sectionDisplay(sec);
        renderArrangement();
        renderOutputs();
      });
      const noteInput=node.querySelector(".section-note-input");
      noteInput.value=sec.note;
      noteInput.addEventListener("input",e=>{sec.note=e.target.value;renderOutputs();});
      node.querySelector(".add-chord-btn").addEventListener("click",()=>{sec.chords.push(makeChord());renderSections();renderOutputs();});
      node.querySelector(".delete-section-btn").addEventListener("click",()=>{
        if(!confirm(`Delete ${sectionDisplay(sec)} and remove it from the arrangement?`)) return;
        state.sections=state.sections.filter(s=>s.id!==sec.id);
        state.arrangement=state.arrangement.filter(a=>a.sectionId!==sec.id);
        reletterSections();
        renderAll();
      });

      const list=node.querySelector(".chords-list");
      sec.chords.forEach((ch,chIndex)=> list.appendChild(renderChord(sec,ch,chIndex)));
      container.appendChild(node);

      node.addEventListener("dragstart", e=>{
        if(e.target.closest("input,button")) { e.preventDefault(); return; }
        dragPayload={type:"section",sectionId:sec.id};
        node.classList.add("dragging");
        e.dataTransfer.effectAllowed=$("#copyMode").checked ? "copy" : "move";
      });
      node.addEventListener("dragend",()=>node.classList.remove("dragging"));
    });
  }

  function renderChord(sec,ch,chIndex){
    const row=$("#chordTemplate").content.firstElementChild.cloneNode(true);
    row.dataset.chordId=ch.id;
    row.querySelector(".chord-index").textContent=chIndex+1;
    const fretWrap=row.querySelector(".fret-inputs");
    fretWrap.style.gridTemplateColumns=`repeat(${state.stringCount}, minmax(36px,1fr))`;

    ch.frets.forEach((f,i)=>{
      const inp=document.createElement("input");
      inp.className="fret-input";
      inp.inputMode="text";
      inp.maxLength=2;
      inp.value=f;
      inp.title=`String ${i+1}: ${state.tuning[i]}`;
      inp.addEventListener("focus",()=>inp.select());
      inp.addEventListener("change",()=>{
        inp.value=normalizeFret(inp.value);
        ch.frets[i]=inp.value;
        updateChordDetection(row,ch);
        renderOutputs();
        renderLibrarySummary();
      });
      inp.addEventListener("keydown", e=>{
        if(e.key==="Enter"){
          e.preventDefault();
          const inputs=[...fretWrap.querySelectorAll("input")];
          const next=inputs[i+1];
          if(next) next.focus(); else row.querySelector(".chord-note-input").focus();
        }
      });
      fretWrap.appendChild(inp);
    });

    const noteInput=row.querySelector(".chord-note-input");
    noteInput.value=ch.note;
    noteInput.addEventListener("input",e=>{ch.note=e.target.value;renderOutputs();});

    row.querySelector(".duplicate-chord-btn").addEventListener("click",()=>{
      const idx=sec.chords.findIndex(c=>c.id===ch.id);
      sec.chords.splice(idx+1,0,{...structuredClone(ch),id:uid("ch")});
      renderSections();renderOutputs();
    });
    row.querySelector(".delete-chord-btn").addEventListener("click",()=>{
      sec.chords=sec.chords.filter(c=>c.id!==ch.id);
      if(sec.chords.length===0) sec.chords.push(makeChord());
      renderSections();renderOutputs();
    });

    updateChordDetection(row,ch);
    return row;
  }

  function updateChordDetection(row,ch){
    const result=identifyChord(ch.frets);
    row.querySelector(".detected-name").textContent=result.name;
    row.querySelector(".detected-notes").textContent=result.notes.map(n=>midiToName(n.midi,true)).join("  ");
  }

  function reletterSections(){
    state.sections.forEach((s,i)=>s.letter=nextSectionLetter(i));
  }

  function renderArrangement(){
    const list=$("#arrangementList");
    list.innerHTML="";
    $("#emptyArrangementHint").style.display=state.arrangement.length ? "none" : "block";

    state.arrangement.forEach((item,index)=>{
      const sec=state.sections.find(s=>s.id===item.sectionId);
      if(!sec) return;
      const row=document.createElement("div");
      row.className="arrangement-item";
      row.draggable=true;
      row.dataset.arrangementId=item.id;
      row.innerHTML=`
        <span class="arrangement-handle">⋮⋮</span>
        <div class="arrangement-title">${escapeHtml(sectionDisplay(sec))}</div>
        <label class="repeat-wrap small">Repeats
          <select class="repeat-select">${[1,2,3,4,5,6,8,10,12,16].map(n=>`<option ${n===item.repeats?"selected":""}>${n}</option>`).join("")}</select>
        </label>
        <input class="arrangement-note" type="text" placeholder="Arrangement note" value="${escapeAttr(item.note||"")}">
        <button class="remove-arrangement secondary danger" title="Remove">×</button>
      `;
      row.querySelector(".repeat-select").addEventListener("change",e=>{item.repeats=Number(e.target.value);renderOutputs();});
      row.querySelector(".arrangement-note").addEventListener("input",e=>{item.note=e.target.value;renderOutputs();});
      row.querySelector(".remove-arrangement").addEventListener("click",()=>{state.arrangement=state.arrangement.filter(a=>a.id!==item.id);renderArrangement();renderOutputs();});
      row.addEventListener("dragstart",e=>{
        if(e.target.closest("input,select,button")) {e.preventDefault();return;}
        dragPayload={type:"arrangement",arrangementId:item.id};
        row.classList.add("dragging");
        e.dataTransfer.effectAllowed=$("#copyMode").checked ? "copy" : "move";
      });
      row.addEventListener("dragend",()=>row.classList.remove("dragging"));
      row.addEventListener("dragover",e=>{
        e.preventDefault();
        const dragging=document.querySelector(".arrangement-item.dragging");
        if(!dragging || dragging===row) return;
        const rect=row.getBoundingClientRect();
        const before=e.clientY < rect.top + rect.height/2;
        list.insertBefore(dragging,before?row:row.nextSibling);
      });
      list.appendChild(row);
    });
  }

  function arrangementIndexFromDOM(arrangementId){
    const ids=[...$("#arrangementList").children].map(el=>el.dataset.arrangementId);
    return ids.indexOf(arrangementId);
  }

  function commitArrangementReorder(){
    const ids=[...$("#arrangementList").children].map(el=>el.dataset.arrangementId);
    const map=new Map(state.arrangement.map(a=>[a.id,a]));
    state.arrangement=ids.map(id=>map.get(id)).filter(Boolean);
  }

  function addSectionToArrangement(sectionId, atIndex=null){
    const newItem={id:uid("arr"),sectionId,repeats:1,note:""};
    if(atIndex===null || atIndex<0 || atIndex>state.arrangement.length) state.arrangement.push(newItem);
    else state.arrangement.splice(atIndex,0,newItem);
  }

  function wireDropZone(){
    const zone=$("#arrangementDropZone");
    zone.addEventListener("dragover",e=>{e.preventDefault();zone.classList.add("drag-over");});
    zone.addEventListener("dragleave",e=>{ if(!zone.contains(e.relatedTarget)) zone.classList.remove("drag-over"); });
    zone.addEventListener("drop",e=>{
      e.preventDefault(); zone.classList.remove("drag-over");
      if(!dragPayload) return;
      const copy=$("#copyMode").checked;
      if(dragPayload.type==="section"){
        addSectionToArrangement(dragPayload.sectionId);
      } else if(dragPayload.type==="arrangement"){
        commitArrangementReorder();
        if(copy){
          const src=state.arrangement.find(a=>a.id===dragPayload.arrangementId);
          if(src){
            const idx=state.arrangement.findIndex(a=>a.id===src.id);
            state.arrangement.splice(idx+1,0,{...structuredClone(src),id:uid("arr")});
          }
        }
      }
      dragPayload=null;
      renderArrangement();renderOutputs();
    });
  }

  function chordNameFor(ch){ return identifyChord(ch.frets).name; }

  function renderPractice(){
    const out=$("#practiceOutput");
    const title=state.songTitle.trim()||"Untitled Song";
    let html=`<div class="practice-title">${escapeHtml(title)}</div>
      <div class="practice-meta">${escapeHtml(state.tuning.map(n=>n.replace(/\d+/g,"")).join("  "))} · ${state.stringCount}-string</div>`;

    if(!state.arrangement.length){
      html+=`<div class="muted">Add sections to the Song Organizer to build the practice output.</div>`;
      out.innerHTML=html; return;
    }
    state.arrangement.forEach(item=>{
      const sec=state.sections.find(s=>s.id===item.sectionId);
      if(!sec) return;
      html+=`<div class="practice-section"><h3>${escapeHtml(sectionDisplay(sec))}${item.repeats>1?` ×${item.repeats}`:""}</h3>`;
      if(sec.note) html+=`<div class="practice-note">${escapeHtml(sec.note)}</div>`;
      if(item.note) html+=`<div class="practice-note">${escapeHtml(item.note)}</div>`;
      sec.chords.forEach(ch=>{
        const name=chordNameFor(ch), shape=ch.frets.join("  ");
        html+=`<div class="practice-line">
          ${state.practiceDisplayMode==="both"?`<strong>${escapeHtml(name)}</strong>`:"<span></span>"}
          <span>${escapeHtml(shape)}</span>
          <span class="practice-note">${escapeHtml(ch.note||"")}</span>
        </div>`;
      });
      html+=`</div>`;
    });
    out.innerHTML=html;
  }

  function keyCandidates(){
    const chordEvents=[];
    state.arrangement.forEach(item=>{
      const sec=state.sections.find(s=>s.id===item.sectionId);
      if(!sec) return;
      for(let r=0;r<item.repeats;r++){
        sec.chords.forEach(ch=>{
          const result=identifyChord(ch.frets);
          if(result.pcs.length) chordEvents.push({pcs:result.pcs,name:result.name});
        });
      }
    });
    if(!chordEvents.length) return [];

    const totalPCWeight=Array(12).fill(0);
    chordEvents.forEach((ev,idx)=>{
      ev.pcs.forEach(pc=>totalPCWeight[pc]+=1/ev.pcs.length);
      const root=parseChordRoot(ev.name);
      if(root!==null) totalPCWeight[root]+=1.35;
      if(idx===0 && root!==null) totalPCWeight[root]+=0.8;
      if(idx===chordEvents.length-1 && root!==null) totalPCWeight[root]+=1.1;
    });

    const all=[];
    for(let tonic=0;tonic<12;tonic++){
      [["major",majorScale,majorTriads],["minor",naturalMinorScale,minorTriads]].forEach(([mode,scale,triads])=>{
        let score=0, outside=0, chordFit=0;
        totalPCWeight.forEach((w,pc)=>{
          const rel=(pc-tonic+12)%12;
          if(scale.includes(rel)) score += w*2.5;
          else {score -= w*3.2; outside += w;}
          if(rel===0) score += w*.7;
        });
        chordEvents.forEach(ev=>{
          const root=parseChordRoot(ev.name);
          if(root===null) return;
          const rel=(root-tonic+12)%12;
          const degree=scale.indexOf(rel);
          if(degree>=0){
            score += 1.2;
            const qual=parseChordQuality(ev.name);
            if(qualityCompatible(qual,triads[degree])) {score += 1.35; chordFit++;}
          } else score -= 1.1;
        });
        all.push({tonic,mode,score,outside,chordFit});
      });
    }
    all.sort((a,b)=>b.score-a.score);
    const best=all[0], second=all[1];
    const gap=Math.max(0,best.score-second.score);
    const evidence=chordEvents.length;
    let confidence=Math.round(52 + gap*5 + Math.min(20,evidence*1.5) - Math.min(20,best.outside*2));
    confidence=Math.max(35,Math.min(96,confidence));
    return all.slice(0,3).map((c,i)=>({...c,confidence:i===0?confidence:Math.max(20,confidence-Math.round((best.score-c.score)*6)-10)}));
  }

  function parseChordRoot(name){
    const m=String(name).match(/^([A-G])([#b]?)/);
    if(!m) return null;
    const map={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    let pc=map[m[1]]+(m[2]==="#"?1:m[2]==="b"?-1:0);
    return (pc+12)%12;
  }

  function parseChordQuality(name){
    const core=String(name).split("/")[0];
    if(/dim/.test(core)) return "dim";
    if(/m(?!aj)/.test(core)) return "m";
    return "";
  }

  function qualityCompatible(actual,expected){
    if(expected==="dim") return actual==="dim";
    if(expected==="m") return actual==="m";
    return actual==="";
  }

  function keyName(c){
    return `${midiToName(c.tonic)} ${c.mode==="major"?"major":"minor"}`;
  }

  function renderTheory(){
    const out=$("#theoryOutput");
    const keys=keyCandidates();
    let html=`<div class="practice-title">${escapeHtml(state.songTitle.trim()||"Untitled Song")}</div>
      <div class="practice-meta">Tuning: ${escapeHtml(state.tuning.map(n=>n.replace(/\d+/g,"")).join("  "))}</div>`;
    if(!keys.length){
      out.innerHTML=html+`<div class="muted">Add played chords to the arrangement to estimate the key.</div>`;
      return;
    }
    html+=`<div class="theory-key-card"><strong>Most likely key:</strong> ${escapeHtml(keyName(keys[0]))}
      <br><strong>Confidence:</strong> ${keys[0].confidence}%
      <br><span class="small">Alternatives: ${keys.slice(1).map(k=>`${escapeHtml(keyName(k))} (${k.confidence}%)`).join(" · ")}</span>
      <div class="small muted" style="margin-top:.35rem">Key detection is evidence-weighted, not absolute; relative major/minor, modal harmony, borrowed chords, and modulations can remain ambiguous.</div>
    </div>`;
    const seen=new Set();
    state.sections.forEach(sec=>{
      if(!state.arrangement.some(a=>a.sectionId===sec.id) || seen.has(sec.id)) return;
      seen.add(sec.id);
      const names=sec.chords.map(ch=>chordNameFor(ch));
      html+=`<div class="theory-section"><h3>${escapeHtml(sectionDisplay(sec))}</h3>
        ${sec.note?`<div class="practice-note">${escapeHtml(sec.note)}</div>`:""}
        <div class="theory-progression">${names.map(escapeHtml).join(" — ")}</div></div>`;
    });
    out.innerHTML=html;
  }

  function renderOutputs(){ renderPractice(); renderTheory(); }

  function renderLibrarySummary(){
    const lib=getLibrary();
    const currentCount=Object.keys(lib[libraryKey()]||{}).length;
    const total=Object.values(lib).reduce((sum,obj)=>sum+Object.keys(obj||{}).length,0);
    $("#librarySummary").innerHTML=`
      <span class="library-pill">${currentCount} shapes for current tuning</span>
      <span class="library-pill">${total} total saved shapes</span>
      <span class="library-pill">Auto-learns entered voicings</span>`;
  }

  function renderAllComputed(){
    renderSections();renderArrangement();renderOutputs();renderLibrarySummary();
  }

  function renderAll(){
    syncTopControls();
    populateTuningPresets();
    renderTuningEditors();
    renderAllComputed();
  }

  function resizeStringCount(newCount){
    const old=state.stringCount;
    state.stringCount=newCount;
    const preset=tuningPresets.find(p=>p.strings===newCount && (
      (state.instrumentType==="bass" && p.id.startsWith("bass-standard")) ||
      (state.instrumentType!=="bass" && p.id.startsWith("guitar-standard"))
    ));
    if(preset){ state.tuningPreset=preset.id; state.tuning=[...preset.notes]; }
    else{
      const next=[...state.tuning];
      while(next.length<newCount) next.push(next[next.length-1]||"E3");
      state.tuning=next.slice(0,newCount);
      state.tuningPreset="custom";
    }
    state.sections.forEach(sec=>sec.chords.forEach(ch=>{
      while(ch.frets.length<newCount) ch.frets.push("X");
      ch.frets=ch.frets.slice(0,newCount);
    }));
    renderAll();
  }

  function collectTopState(){
    state.songTitle=$("#songTitle").value;
    state.instrumentType=$("#instrumentType").value;
    state.sectionLabelStyle=$("#sectionLabelStyle").value;
    state.practiceDisplayMode=$("#practiceDisplayMode").value;
  }

  function saveSong(){
    collectTopState();
    const songs=getSavedSongs();
    const key=state._savedId || uid("song");
    state._savedId=key;
    songs[key]={...structuredClone(state),savedAt:new Date().toISOString()};
    localStorage.setItem("csb-songs",JSON.stringify(songs));
    flashButton($("#saveSongBtn"),"Saved");
  }

  function getSavedSongs(){
    try{return JSON.parse(localStorage.getItem("csb-songs")||"{}")}catch{return {}}
  }

  function showLoadDialog(){
    const songs=getSavedSongs();
    const wrap=$("#savedSongsList");
    wrap.innerHTML="";
    const entries=Object.entries(songs).sort((a,b)=>(b[1].savedAt||"").localeCompare(a[1].savedAt||""));
    if(!entries.length) wrap.innerHTML=`<p class="muted">No saved songs yet.</p>`;
    entries.forEach(([id,s])=>{
      const row=document.createElement("div");
      row.className="saved-song";
      row.innerHTML=`<div><strong>${escapeHtml(s.songTitle||"Untitled Song")}</strong><div class="muted small">${new Date(s.savedAt).toLocaleString()}</div></div>
        <button class="load-one">Load</button><button class="delete-one secondary danger">Delete</button>`;
      row.querySelector(".load-one").addEventListener("click",()=>{
        Object.keys(state).forEach(k=>delete state[k]);
        Object.assign(state,structuredClone(s),{_savedId:id});
        $("#loadDialog").close();
        renderAll();
      });
      row.querySelector(".delete-one").addEventListener("click",()=>{
        delete songs[id]; localStorage.setItem("csb-songs",JSON.stringify(songs)); showLoadDialog();
      });
      wrap.appendChild(row);
    });
    $("#loadDialog").showModal();
  }

  function newSong(){
    if(!confirm("Start a new song? Unsaved changes will be lost.")) return;
    Object.assign(state,{
      songTitle:"Untitled Song",instrumentType:"guitar",stringCount:6,
      tuningPreset:"guitar-standard-6",tuning:["E2","A2","D3","G3","B3","E4"],
      sectionLabelStyle:"name",sections:[],arrangement:[],practiceDisplayMode:"both"
    });
    delete state._savedId;
    state.sections.push(makeSection());
    renderAll();
  }

  function flashButton(btn,text){
    const old=btn.textContent; btn.textContent=text; btn.disabled=true;
    setTimeout(()=>{btn.textContent=old;btn.disabled=false},800);
  }

  function escapeHtml(s){
    return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function escapeAttr(s){ return escapeHtml(s); }

  function exportPracticePNG(){
    if(!state.arrangement.length){ alert("Add at least one section to the organizer first."); return; }
    const scale=2;
    const width=1080, margin=68, lineH=40, headingH=56;
    const lines=[];
    lines.push({type:"title",text:state.songTitle.trim()||"Untitled Song"});
    lines.push({type:"meta",text:`${state.tuning.map(n=>n.replace(/\d+/g,"")).join("  ")} · ${state.stringCount}-string`});
    lines.push({type:"gap"});
    state.arrangement.forEach(item=>{
      const sec=state.sections.find(s=>s.id===item.sectionId); if(!sec) return;
      lines.push({type:"section",text:`${sectionDisplay(sec)}${item.repeats>1?` ×${item.repeats}`:""}`});
      if(sec.note) lines.push({type:"note",text:sec.note});
      if(item.note) lines.push({type:"note",text:item.note});
      sec.chords.forEach(ch=>{
        const shape=ch.frets.join("  ");
        const name=chordNameFor(ch);
        lines.push({type:"chord",name:state.practiceDisplayMode==="both"?name:"",shape,note:ch.note||""});
      });
      lines.push({type:"gap"});
    });
    let height=margin*2+lines.reduce((sum,l)=>sum+(l.type==="title"?68:l.type==="gap"?24:l.type==="section"?headingH:lineH),0);
    height=Math.max(800,height);
    const canvas=document.createElement("canvas");
    canvas.width=width*scale; canvas.height=height*scale;
    const ctx=canvas.getContext("2d"); ctx.scale(scale,scale);
    ctx.fillStyle="#f5f3ec";ctx.fillRect(0,0,width,height);
    ctx.fillStyle="#111";
    let y=margin;
    lines.forEach(l=>{
      if(l.type==="title"){ctx.font="900 38px system-ui";ctx.fillText(l.text,margin,y+36);y+=68;return;}
      if(l.type==="meta"){ctx.font="500 20px system-ui";ctx.fillStyle="#555";ctx.fillText(l.text,margin,y+24);ctx.fillStyle="#111";y+=lineH;return;}
      if(l.type==="gap"){y+=24;return;}
      if(l.type==="section"){ctx.font="800 26px system-ui";ctx.fillText(l.text,margin,y+30);y+=headingH;return;}
      if(l.type==="note"){ctx.font="italic 18px system-ui";ctx.fillStyle="#666";ctx.fillText(l.text,margin,y+22);ctx.fillStyle="#111";y+=lineH;return;}
      if(l.type==="chord"){
        ctx.font="800 22px ui-monospace,monospace";
        if(l.name) ctx.fillText(l.name,margin,y+25);
        ctx.font="500 22px ui-monospace,monospace";
        ctx.fillText(l.shape,margin+(l.name?170:0),y+25);
        if(l.note){ctx.font="italic 17px system-ui";ctx.fillStyle="#666";ctx.textAlign="right";ctx.fillText(l.note,width-margin,y+25);ctx.textAlign="left";ctx.fillStyle="#111";}
        ctx.strokeStyle="#dedad0";ctx.beginPath();ctx.moveTo(margin,y+lineH-2);ctx.lineTo(width-margin,y+lineH-2);ctx.stroke();
        y+=lineH;
      }
    });
    const a=document.createElement("a");
    a.download=`${(state.songTitle.trim()||"song").replace(/[^\w\-]+/g,"_")}_practice.png`;
    a.href=canvas.toDataURL("image/png");
    a.click();
  }

  function wireControls(){
    $("#songTitle").addEventListener("input",e=>{state.songTitle=e.target.value;renderOutputs();});
    $("#instrumentType").addEventListener("change",e=>{
      state.instrumentType=e.target.value;
      if(e.target.value==="bass" && ![4,5,6].includes(state.stringCount)) resizeStringCount(4);
    });
    $("#stringCount").addEventListener("change",e=>resizeStringCount(Number(e.target.value)));
    $("#tuningPreset").addEventListener("change",e=>{
      state.tuningPreset=e.target.value;
      const p=tuningPresets.find(x=>x.id===e.target.value);
      if(p?.notes){state.tuning=[...p.notes];renderAll();}
    });
    $("#sectionLabelStyle").addEventListener("change",e=>{state.sectionLabelStyle=e.target.value;renderSections();renderArrangement();renderOutputs();});
    $("#practiceDisplayMode").addEventListener("change",e=>{state.practiceDisplayMode=e.target.value;renderPractice();});
    $("#addSectionBtn").addEventListener("click",()=>{state.sections.push(makeSection());renderSections();});
    $("#saveSongBtn").addEventListener("click",saveSong);
    $("#loadSongBtn").addEventListener("click",showLoadDialog);
    $("#newSongBtn").addEventListener("click",newSong);
    $("#exportPracticeBtn").addEventListener("click",exportPracticePNG);
    $("#clearLibraryBtn").addEventListener("click",()=>{
      if(!confirm("Clear learned chord shapes? Starter shapes will be restored.")) return;
      localStorage.removeItem("csb-chord-library"); seedLibrary(); renderAllComputed();
    });
    $$(".tab").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".tab").forEach(b=>b.classList.toggle("active",b===btn));
      $$(".tab-panel").forEach(p=>p.classList.remove("active"));
      $(`#${btn.dataset.tab}Tab`).classList.add("active");
    }));
  }

  seedLibrary();
  wireControls();
  wireDropZone();
  state.sections.push(makeSection());
  renderAll();

  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
  }
})();
