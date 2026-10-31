'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
type Msg={role:'user'|'assistant';content:string};
type Recognition={lang:string;continuous:boolean;interimResults:boolean;onresult:((e:any)=>void)|null;onerror:((e:any)=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void};
const hello='Oiê! Eu sou a ISA, da Previna-se. Pode conversar comigo por mensagem ou apertar o telefone para a gente bater um papo por voz! 💜';
export default function Home(){
 const [messages,setMessages]=useState<Msg[]>([{role:'assistant',content:hello}]);
 const [input,setInput]=useState('');const [busy,setBusy]=useState(false);const [calling,setCalling]=useState(false);
 const [listening,setListening]=useState(false);const [speaking,setSpeaking]=useState(false);const [status,setStatus]=useState('Pronta para conversar');
 const [loginOpen,setLoginOpen]=useState(false);const [password,setPassword]=useState('');const [admin,setAdmin]=useState(false);
 const [voiceOn,setVoiceOn]=useState(true);const [supported,setSupported]=useState(true);
 const recognitionRef=useRef<Recognition|null>(null);const callingRef=useRef(false);const busyRef=useRef(false);const mountedRef=useRef(true);const messagesRef=useRef<Msg[]>(messages);
 const atBottom=useRef<HTMLDivElement|null>(null);
 useEffect(()=>{messagesRef.current=messages;atBottom.current?.scrollIntoView({behavior:'smooth'});},[messages]);
 useEffect(()=>{setSupported(!!((window as any).SpeechRecognition||(window as any).webkitSpeechRecognition));return ()=>{mountedRef.current=false;recognitionRef.current?.stop();window.speechSynthesis?.cancel();};},[]);
 const stopListening=useCallback(()=>{const r=recognitionRef.current;recognitionRef.current=null;if(r){r.onend=null;r.onresult=null;r.onerror=null;try{r.stop();}catch{}}setListening(false);},[]);
 const say=useCallback((text:string,onDone?:()=>void)=>{
  if(!voiceOn || !('speechSynthesis' in window)){onDone?.();return;}
  window.speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(text.replace(/[*#_`]/g,'').slice(0,3000));
  utter.lang='pt-BR';utter.rate=1.05;utter.pitch=1.07;
  const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('pt'));
  utter.voice=voices.find(v=>/female|maria|francisca|luciana|helena/i.test(v.name))||voices[0]||null;
  utter.onstart=()=>{setSpeaking(true);setStatus('ISA falando...');};
  const done=()=>{setSpeaking(false);if(mountedRef.current){setStatus('Pronta para conversar');onDone?.();}};
  utter.onend=done;utter.onerror=done;window.speechSynthesis.speak(utter);
 },[voiceOn]);
 const ask=useCallback(async(text:string,autoSpeak:boolean)=>{
  const question=text.trim();if(!question||busyRef.current)return;
  busyRef.current=true;setBusy(true);setStatus('ISA está pensando...');setInput('');
  const updated=[...messagesRef.current,{role:'user' as const,content:question}];messagesRef.current=updated;setMessages(updated);
  try{const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:updated})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Erro desconhecido');
   const updatedReply=[...updated,{role:'assistant' as const,content:data.reply}];messagesRef.current=updatedReply;setMessages(updatedReply);
   if(autoSpeak){say(data.reply,()=>{if(callingRef.current)startListeningRef.current?.();});}else setStatus('Pronta para conversar');
  }catch(e){const err=e instanceof Error?e.message:'Falha na conexão';const reply=`Ops! ${err}`;const updatedReply=[...updated,{role:'assistant' as const,content:reply}];messagesRef.current=updatedReply;setMessages(updatedReply);setStatus('Não foi possível responder');}
  finally{busyRef.current=false;setBusy(false);}
 },[say]);
 const askRef=useRef(ask);askRef.current=ask;
 const startListeningRef=useRef<(()=>void)|null>(null);
 const startListening=useCallback(()=>{
  if(!callingRef.current||busyRef.current)return;
  const Constructor=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!Constructor){setStatus('Este navegador não suporta reconhecimento de voz. Use o chat.');return;}
  stopListening();const recognition:Recognition=new Constructor();recognitionRef.current=recognition;recognition.lang='pt-BR';recognition.continuous=false;recognition.interimResults=false;
  recognition.onresult=(ev:any)=>{const text=Array.from(ev.results).map((x:any)=>x[0]?.transcript||'').join(' ').trim();stopListening();if(text)askRef.current(text,true);else if(callingRef.current)startListeningRef.current?.();};
  recognition.onerror=(ev:any)=>{setListening(false);if(ev.error==='not-allowed'||ev.error==='service-not-allowed'){callingRef.current=false;setCalling(false);setStatus('Permita o microfone nas configurações do navegador.');}else setStatus('Não ouvi direito. Aperte o microfone para repetir.');};
  recognition.onend=()=>setListening(false);
  try{recognition.start();setListening(true);setStatus('Estou ouvindo você...');}catch{setStatus('Não consegui abrir o microfone.');}
 },[stopListening]);startListeningRef.current=startListening;
 const endCall=()=>{callingRef.current=false;setCalling(false);stopListening();window.speechSynthesis?.cancel();setSpeaking(false);setStatus('Chamada encerrada');};
 const beginCall=()=>{if(!supported){setStatus('Seu navegador não oferece reconhecimento de voz. Use o chat por texto.');return;}callingRef.current=true;setCalling(true);say('Oiê! Que bom te ouvir! Aqui é a ISA. Me conta, em que eu posso te ajudar?',startListening);};
 const login=async()=>{try{const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const d=await r.json();if(!r.ok)throw new Error(d.error);setAdmin(true);setLoginOpen(false);setPassword('');setStatus('Modo Luiz ativado 💜');}catch(e){setStatus(e instanceof Error?e.message:'Erro no acesso');}};
 const logout=async()=>{await fetch('/api/logout',{method:'POST'});setAdmin(false);setStatus('Modo visitante ativado');};
 return <div className="app"><header><div className="brand"><div className="logo">✦</div><div><strong>PREVINA-SE</strong><small>TECNOLOGIA QUE CUIDA</small></div></div><div className="right"><span className="dot"/>ISA online <button className="link" onClick={()=>admin?logout():setLoginOpen(true)}>{admin?'Sair do modo Luiz':'Sou o Luiz'}</button></div></header>
 <main><section className="hero"><div className="avatar">I<span>✦</span></div><div><div className="tag">SUA ASSISTENTE INTELIGENTE</div><h1>Olá, eu sou a <em>ISA.</em></h1><p>Uma ajudinha inteligente, uma boa conversa e umas risadinhas de vez em quando. 💜</p></div></section>
 <section className="panel"><div className="panelHead"><div><b>Converse com a ISA</b><small>{status}</small></div><div className="panelActions"><label title="Ativar ou desativar fala"><input type="checkbox" checked={voiceOn} onChange={e=>setVoiceOn(e.target.checked)}/> Voz</label><button className="startCall" onClick={calling?endCall:beginCall}>{calling?'■ Encerrar ligação':'☎ Ligar para ISA'}</button></div></div>
 {calling&&<div className="call"><div className={'callorb '+(listening?'listening':speaking?'speaking':'')}>✦</div><strong>{listening?'Pode falar, estou ouvindo':speaking?'ISA está falando':busy?'ISA pensando...':'Chamada com ISA'}</strong><span>Ligação de voz pelo navegador • sem número telefônico</span><div className="callBtns"><button onClick={()=>{window.speechSynthesis.cancel();startListening();}} disabled={busy}>🎙 Falar novamente</button><button className="hang" onClick={endCall}>Encerrar</button></div></div>}
 <div className="chat" aria-live="polite">{messages.map((m,i)=><div key={i} className={'bubble '+m.role}><span>{m.role==='assistant'?'ISA':'Você'}</span><p>{m.content}</p>{m.role==='assistant'&&<button className="hear" onClick={()=>say(m.content)} aria-label="Ouvir resposta">🔊 Ouvir</button>}</div>)}{busy&&<div className="typing">ISA está escrevendo <span>•••</span></div>}<div ref={atBottom}/></div>
 <form className="composer" onSubmit={e=>{e.preventDefault();ask(input,false)}}><input aria-label="Sua mensagem" placeholder="Pergunte qualquer coisa para a ISA..." value={input} onChange={e=>setInput(e.target.value)} disabled={busy}/><button type="submit" disabled={busy||!input.trim()}>Enviar ➜</button></form></section><footer>ISA • Criada por Luiz Salgueiro • Previna-se © 2026</footer></main>
 {loginOpen&&<div className="overlay" onClick={()=>setLoginOpen(false)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>Modo Luiz 💜</h2><p>Apenas o administrador autenticado recebe o jeitinho especial da ISA.</p><form onSubmit={e=>{e.preventDefault();login()}}><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha de administrador" autoFocus/><button>Entrar</button></form><button className="link" onClick={()=>setLoginOpen(false)}>Cancelar</button></div></div>}</div>;
}
