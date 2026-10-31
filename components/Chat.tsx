"use client";import {useEffect,useRef,useState} from 'react';import Image from 'next/image';
type SpeechResult = { results: ArrayLike<ArrayLike<{transcript:string}>> };
type SpeechRecognizer = { lang:string; continuous:boolean; interimResults:boolean; onresult:((event:SpeechResult)=>void)|null; onerror:(()=>void)|null; onend:(()=>void)|null; start:()=>void; stop:()=>void };
type SpeechWindow = Window & { SpeechRecognition?:new()=>SpeechRecognizer; webkitSpeechRecognition?:new()=>SpeechRecognizer };
type Message={role:'user'|'assistant',content:string};export default function Chat({initialId}:{initialId?:string}){const[id,setId]=useState(initialId||'');const[messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const tail=useRef<HTMLDivElement>(null);
const [inCall,setInCall]=useState(false),[listening,setListening]=useState(false),[voiceEnabled,setVoiceEnabled]=useState(false);
const [voiceError,setVoiceError]=useState('');
const recognizer=useRef<SpeechRecognizer|null>(null), callRef=useRef(false), busyRef=useRef(false);
const synthRef=useRef(false);
useEffect(()=>{setVoiceEnabled(typeof window!=='undefined' && !!((window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition));return()=>{callRef.current=false;recognizer.current?.stop();window.speechSynthesis?.cancel()}},[]);
function speak(text:string,after?:()=>void){
 if(!('speechSynthesis' in window)){after?.();return;}
 window.speechSynthesis.cancel(); synthRef.current=true;
 const speech=new SpeechSynthesisUtterance(text.replace(/https?:\\/\\/\\S+/g,'link disponível na conversa').replace(/[\u{1F300}-\u{1FAFF}]/gu,''));
 speech.lang='pt-BR';speech.rate=1.03;speech.pitch=1.12;
 const voices=window.speechSynthesis.getVoices();const pt=voices.filter(v=>v.lang.toLowerCase().startsWith('pt-br'));
 speech.voice=pt.find(v=>/female|maria|francisca|luciana|google português/i.test(v.name))||pt[0]||null;
 speech.onend=()=>{synthRef.current=false;after?.()};speech.onerror=()=>{synthRef.current=false;after?.()};
 window.speechSynthesis.speak(speech);
}
function listen(){
 if(!callRef.current||busyRef.current||synthRef.current)return;
 const API=(window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition;
 if(!API){setVoiceError('Este navegador não oferece reconhecimento de voz. Experimente o Chrome no computador.');return;}
 try{
  const instance=new API();recognizer.current=instance;instance.lang='pt-BR';instance.continuous=false;instance.interimResults=false;
  instance.onresult=(event)=>{const spoken=Array.from(event.results).map(x=>x[0]?.transcript||'').join(' ').trim();if(spoken){setListening(false);void send(spoken)}};
  instance.onerror=()=>{setListening(false);setVoiceError('Não consegui ouvir. Confira a permissão do microfone.');};
  instance.onend=()=>{setListening(false)};
  instance.start();setListening(true);setVoiceError('');
 }catch{setListening(false);setVoiceError('Não foi possível iniciar o microfone.');}
}
function toggleCall(){
 if(callRef.current){callRef.current=false;setInCall(false);recognizer.current?.stop();window.speechSynthesis?.cancel();synthRef.current=false;setListening(false);return;}
 callRef.current=true;setInCall(true);setVoiceError('');listen();
}
useEffect(()=>{if(initialId)fetch('/api/conversations/'+initialId).then(r=>r.json()).then(v=>{if(v.messages)setMessages(v.messages)}).catch(()=>{})},[initialId]);useEffect(()=>tail.current?.scrollIntoView({behavior:'smooth'}),[messages]);async function send(voiceText?:string){const text=(voiceText??input).trim();if(!text||busyRef.current)return;busyRef.current=true;setInput('');setError('');const next=[...messages,{role:'user' as const,content:text}];setMessages(next);setBusy(true);try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:id||undefined,message:text})});const v=await r.json();if(!r.ok)throw Error(v.error||'Falha ao consultar IA');setId(v.conversationId);setMessages([...next,{role:'assistant',content:v.answer}]);if(callRef.current){speak(v.answer,()=>{busyRef.current=false;if(callRef.current)listen()})}}catch(e){setError(e instanceof Error?e.message:'Erro ao enviar')}finally{setBusy(false);busyRef.current=false}}return <div className="card chat"><div className="messages">{messages.length===0&&<div style={{textAlign:'center',padding:25}}><Image src="/isa.png" alt="ISA" width={145} height={155} style={{objectFit:'contain'}}/><h2>Oi, eu sou a ISA!</h2><p className="muted">Posso ajudar você com NRs, dúvidas de inspeção, AR/APR e DDS. Como posso ajudar hoje?</p>{['Qual NR se aplica ao trabalho em altura?','Monte um DDS sobre percepção de risco','Quais cuidados em manutenção de máquinas?'].map(t=><button key={t} style={{display:'inline-block',margin:4,background:'#e4f3eb',color:'#086a52'}} onClick={()=>setInput(t)}>{t}</button>)}</div>}{messages.map((m,i)=><div key={i} className={'bubble '+(m.role==='user'?'mine':'')}><strong>{m.role==='user'?'Você':'ISA'}</strong><p style={{marginBottom:4}}>{m.content}</p>{m.role==='assistant'&&<><button className="linkbtn" onClick={()=>navigator.clipboard.writeText(m.content)}>Copiar resposta</button> <button className="linkbtn" onClick={()=>speak(m.content)}>🔊 Ouvir resposta</button></>}</div>)}{busy&&<div className="bubble">ISA está consultando as informações...</div>}<div ref={tail}/></div>{error&&<p style={{color:'#b42318'}}>{error}</p>}<div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',margin:'10px 0'}}><button type="button" onClick={toggleCall} style={{background:inCall?'#ba3b45':'#087f63',color:'white'}}>{inCall?'☎ Encerrar chamada':'☎ Ligar para ISA'}</button><span className="muted" style={{fontSize:12}}>{inCall?(listening?'🎙 Ouvindo você...':busy?'ISA está respondendo...':'Chamada ativa — clique em ouvir novamente se necessário'):'Converse com a ISA usando o microfone do navegador'}</span>{inCall&&!listening&&!busy&&<button type="button" onClick={listen}>🎙 Ouvir novamente</button>}</div>{voiceError&&<p style={{color:'#b42318',fontSize:12}}>{voiceError}</p>}{!voiceEnabled&&<p className="muted" style={{fontSize:12}}>O recurso de voz pode depender do Chrome ou de outro navegador compatível.</p>}<div className="composer"><textarea rows={2} maxLength={4000} placeholder="Digite sua pergunta para a ISA..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/><button onClick={()=>void send()} disabled={busy||!input.trim()}>Enviar</button></div><p className="muted" style={{fontSize:11,marginBottom:0}}>IA pode cometer erros. Confira os textos oficiais, a vigência e a situação real em campo.</p></div>}
