'use strict';
(function(){
  const state={peer:null,room:'',host:false,connections:new Map(),selfId:'',name:'Commander'};
  const $=id=>document.getElementById(id);
  function uiStatus(t){const e=$('mpStatus');if(e)e.textContent=t}
  function log(t){const e=$('mpChat');if(!e)return;e.textContent+=(e.textContent?'\n':'')+t;e.scrollTop=e.scrollHeight}
  function name(){return (($('mpName')?.value||'Commander').trim().slice(0,18))||'Commander'}
  function code(){return (($('mpRoom')?.value||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'')).slice(0,6)}
  function players(list){const e=$('mpPlayers');if(!e)return;e.innerHTML=list.length?list.map(p=>'<div class="playerRow"><span><i class="onlineDot"></i>'+escapeHtml(p.name)+'</span><span class="muted">'+(p.host?'HOST':'ONLINE')+'</span></div>').join(''):'<div class="muted">No players connected.</div>'}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function roomCode(){return Math.random().toString(36).slice(2,8).toUpperCase()}
  function wire(c,isHost){
    c.on('open',()=>{
      state.connections.set(c.peer,c);
      uiStatus('Connected. Room '+state.room);
      if(isHost){
        broadcast({type:'roster',players:roster()});
      }else{
        c.send({type:'hello',name:state.name});
      }
      renderRoster();
    });
    c.on('data',m=>onMessage(c,m));
    c.on('close',()=>{state.connections.delete(c.peer);renderRoster();if(state.host)broadcast({type:'roster',players:roster()});});
    c.on('error',e=>{log('Connection error: '+(e?.message||'unknown'));state.connections.delete(c.peer);renderRoster()});
  }
  function roster(){const a=[{id:state.selfId,name:state.name,host:state.host}];state.connections.forEach((c,id)=>a.push({id,name:c.__name||'Commander',host:false}));return a}
  function renderRoster(){players(roster())}
  function broadcast(m,except){state.connections.forEach((c,id)=>{if(id!==except&&c.open)try{c.send(m)}catch(e){}})}
  function onMessage(c,m){if(!m||typeof m!=='object')return;
    if(m.type==='hello'&&state.host){c.__name=(m.name||'Commander').slice(0,18);c.send({type:'welcome',name:state.name,room:state.room,players:roster(),game:typeof state==='undefined'?null:null});broadcast({type:'roster',players:roster()});renderRoster();return}
    if(m.type==='welcome'){uiStatus('Connected to '+(m.name||'host')+' • Room '+state.room);if(Array.isArray(m.players))players(m.players);return}
    if(m.type==='roster'){if(Array.isArray(m.players))players(m.players);return}
    if(m.type==='chat'){log(m.name+': '+m.text);return}
  }
  function create(){if(!window.Peer)return uiStatus('Multiplayer library failed to load. Refresh the page.');if(state.peer)return;
    state.name=name();state.room=roomCode();state.host=true;state.selfId='ss-'+state.room;
    uiStatus('Creating room '+state.room+'…');
    try{state.peer=new Peer(state.selfId);state.peer.on('open',id=>{state.selfId=id;uiStatus('ROOM '+state.room+' CREATED. Send this code to your friend.');$('mpCopy').disabled=false;$('mpLeave').disabled=false;renderRoster();});state.peer.on('connection',c=>wire(c,true));state.peer.on('error',e=>{uiStatus('Room error: '+(e?.type||e?.message||'unknown'));});}
    catch(e){uiStatus('Could not create room. Try again.');state.peer=null}
  }
  function join(){if(!window.Peer)return uiStatus('Multiplayer library failed to load. Refresh the page.');if(state.peer)return;
    const r=code();if(r.length!==6)return uiStatus('Enter a 6-character room code.');state.name=name();state.room=r;state.host=false;uiStatus('Joining room '+r+'…');
    try{state.peer=new Peer();state.peer.on('open',id=>{state.selfId=id;const c=state.peer.connect('ss-'+r,{reliable:true});wire(c,false);state.connections.set('ss-'+r,c);});state.peer.on('error',e=>{uiStatus('Join failed: '+(e?.type||e?.message||'check the room code'));});}
    catch(e){uiStatus('Could not join room. Try again.');state.peer=null}
  }
  function leave(){state.connections.forEach(c=>{try{c.close()}catch(e){}});state.connections.clear();if(state.peer){try{state.peer.destroy()}catch(e){}}state.peer=null;state.room='';state.host=false;state.selfId='';$('mpCopy').disabled=true;$('mpLeave').disabled=true;uiStatus('Offline. Create or join a room.');renderRoster()}
  function sendChat(){const i=$('mpChatInput'),t=(i?.value||'').trim();if(!t)return;if(!state.peer)return uiStatus('Join a room first.');const m={type:'chat',name:state.name,text:t.slice(0,120)};log('You: '+m.text);broadcast(m);i.value=''}
  async function copy(){if(!state.room)return;try{await navigator.clipboard.writeText(state.room);uiStatus('Room code '+state.room+' copied.')}catch(e){uiStatus('Room code: '+state.room)}}
  function init(){
    $('mpHost')?.addEventListener('click',create);$('mpJoin')?.addEventListener('click',join);$('mpLeave')?.addEventListener('click',leave);$('mpCopy')?.addEventListener('click',copy);$('mpSend')?.addEventListener('click',sendChat);$('mpChatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sendChat()});
    players([]);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
