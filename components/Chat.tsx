"use client";import {useEffect,useRef,useState} from 'react';import Image from 'next/image';
type Message={role:'user'|'assistant',content:string};export default function Chat({initialId}:{initialId?:string}){const[id,setId]=useState(initialId||'');const[messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const tail=useRef<HTMLDivElement>(null);
const [inCall,setInCall]=useState(false);
const [voiceInfo,setVoiceInfo]=useState('');
const callActive=useRef(false);
const listening=useRef(false);
const recognizer=useRef<any>(null);
const latestConversation=useRef(initialId||'');
const sending=useRef(false);
function stopListening(){try{recognizer.current?.stop()}catch{}recognizer.current=null;listening.current=false;}
function endCall(){callActive.current=false;setInCall(false);stopListening();if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();setVoiceInfo('');}
function speak(text:string,done?:()=>void){
 if(!('speechSynthesis' in window)){done?.();return;}
 window.speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g,'link disponível na conversa'));
 utterance.lang='pt-BR';utterance.rate=1;utterance.pitch=1.04;
 const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('pt'));
 utterance.voice=voices.find(v=>/maria|luciana|francisca|femin|female/i.test(v.name))||voices[0]||null;
 utterance.onend=()=>done?.();utterance.onerror=()=>done?.();window.speechSynthesis.speak(utterance);
}
function listen(){
 if(!callActive.current||sending.current||listening.current)return;
 const w=window as typeof window & {SpeechRecognition?:any;webkitSpeechRecognition?:any};
 const SpeechRecognition=w.SpeechRecognition||w.webkitSpeechRecognition;
 if(!SpeechRecognition){setVoiceInfo('Reconhecimento de voz indisponível neste navegador. Experimente Chrome ou Edge.');endCall();return;}
 const rec=new SpeechRecognition();recognizer.current=rec;listening.current=true;
 rec.lang='pt-BR';rec.continuous=false;rec.interimResults=false;
 setVoiceInfo('Ouvindo...');
 rec.onresult=(event:any)=>{const words=String(event.results?.[0]?.[0]?.transcript||'').trim();if(!words)return;listening.current=false;recognizer.current=null;try{rec.stop()}catch{}void send(words);};
 rec.onerror=(event:any)=>{listening.current=false;recognizer.current=null;if(event.error==='no-speech'&&callActive.current){setVoiceInfo('Pode falar...');return;}setVoiceInfo('Microfone: '+String(event.error));if(event.error==='not-allowed')endCall();};
 rec.onend=()=>{listening.current=false;if(recognizer.current===rec)recognizer.current=null;};
 try{rec.start()}catch{listening.current=false;setVoiceInfo('Não foi possível iniciar o microfone.');}
}
function toggleCall(){if(callActive.current){endCall();return;}if(typeof window==='undefined')return;callActive.current=true;setInCall(true);setVoiceInfo('Iniciando microfone...');listen();}
useEffect(()=>()=>{callActive.current=false;stopListening();if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();},[]);useEffect(()=>{if(initialId)fetch('/api/conversations/'+initialId).then(r=>r.json()).then(v=>{if(v.messages)setMessages(v.messages)}).catch(()=>{})},[initialId]);useEffect(()=>tail.current?.scrollIntoView({behavior:'smooth'}),[messages]);async function send(spoken?:string){const text=(spoken??input).trim();if(!text||sending.current)return;sending.current=true;setInput('');setError('');const next=[...messages,{role:'user' as const,content:text}];setMessages(next);setBusy(true);try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({conversationId:latestConversation.current||undefined,message:text})});const v=await r.json();if(!r.ok)throw Error(v.error||'Falha ao consultar IA');setId(v.conversationId);latestConversation.current=v.conversationId;setMessages([...next,{role:'assistant',content:v.answer}]);if(callActive.current){setVoiceInfo('ISA respondendo...');speak(v.answer,()=>{if(callActive.current)listen()});}}catch(e){setError(e instanceof Error?e.message:'Erro ao enviar');if(callActive.current){setVoiceInfo('Não foi possível responder. Encerre e tente novamente.');endCall();}}finally{sending.current=false;setBusy(false)}}return <div className="card chat"><div className="messages">{messages.length===0&&<div style={{textAlign:'center',padding:25}}><Image src="/isa.png" alt="ISA" width={145} height={155} style={{objectFit:'contain'}}/><h2>Oi, eu sou a ISA!</h2><p className="muted">Posso ajudar você com NRs, dúvidas de inspeção, AR/APR e DDS. Como posso ajudar hoje?</p>{['Qual NR se aplica ao trabalho em altura?','Monte um DDS sobre percepção de risco','Quais cuidados em manutenção de máquinas?'].map(t=><button key={t} style={{display:'inline-block',margin:4,background:'#e4f3eb',color:'#086a52'}} onClick={()=>setInput(t)}>{t}</button>)}</div>}{messages.map((m,i)=><div key={i} className={'bubble '+(m.role==='user'?'mine':'')}><strong>{m.role==='user'?'Você':'ISA'}</strong><p style={{marginBottom:4}}>{m.content}</p>{m.role==='assistant'&&<><button className="linkbtn" onClick={()=>navigator.clipboard.writeText(m.content)}>Copiar resposta</button> <button className="linkbtn" onClick={()=>speak(m.content)}>Ouvir</button></>}</div>)}{busy&&<div className="bubble">ISA está consultando as informações...</div>}<div ref={tail}/></div>{error&&<p style={{color:'#b42318'}}>{error}</p>}<div className="composer"><button type="button" style={{whiteSpace:'nowrap',background:inCall?'#a63030':'#086a52'}} onClick={toggleCall} aria-label={inCall?'Encerrar chamada com ISA':'Conversar por voz com ISA'}>{inCall?'Encerrar chamada':'📞 Ligar'}</button><textarea rows={2} maxLength={4000} placeholder="Digite sua pergunta para a ISA..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/><button onClick={()=>send()} disabled={busy||!input.trim()}>Enviar</button></div>{voiceInfo&&<p className="muted" role="status" style={{fontSize:12,marginBottom:0}}>{voiceInfo}</p>}<p className="muted" style={{fontSize:11,marginBottom:0}}>IA pode cometer erros. Confira os textos oficiais, a vigência e a situação real em campo.</p></div>}
