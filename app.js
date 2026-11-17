const KEY = "hayato-prototype-v1";
const initial = {messages:[], memories:[], tasks:[]};
let state = load();
function load(){try{return {...initial,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...initial}}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dateLabel(){return new Date().toLocaleString("ja-JP")}
function addMessage(role,text){state.messages.push({role,text,at:dateLabel()});save();renderMessages()}
function renderMessages(){
 const el=document.querySelector("#messages");
 const intro='<article class="message hayato"><div class="avatar">H</div><div class="bubble"><strong>ハヤト</strong><p>こんにちは！このデモでは会話内容を端末内に保存できます。AI接続後は、ここが本物のAI応答に切り替わります。</p></div></article>';
 el.innerHTML=intro+state.messages.map(m=>`<article class="message ${m.role}">${m.role==="hayato"?'<div class="avatar">H</div>':''}<div class="bubble"><strong>${m.role==="user"?"あなた":"ハヤト"}</strong><p>${esc(m.text)}</p></div></article>`).join("");
 el.scrollTop=el.scrollHeight;
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id==="panel-"+b.dataset.tab));
}));
document.querySelector("#chat-form").addEventListener("submit",e=>{
 e.preventDefault();const input=document.querySelector("#chat-input");const text=input.value.trim();if(!text)return;
 addMessage("user",text);input.value="";
 addMessage("hayato","メッセージを受け取りました。現在は画面・保存機能を確認するためのデモモードです。AIの回答機能を有効にするには、安全なサーバー側のAI接続設定が必要です。覚えておきたい内容なら「記憶」タブに保存できます。");
});
function renderMemories(){
 const el=document.querySelector("#memory-list");
 el.innerHTML=state.memories.length?state.memories.map((m,i)=>`<article class="item"><small>${esc(m.at)}</small><p>${esc(m.text)}</p>${m.source?`<a href="${esc(m.source)}" target="_blank" rel="noopener noreferrer">出典を開く ↗</a>`:""}<div class="item-actions"><button class="tiny" data-delete-memory="${i}">削除</button></div></article>`).join(""):'<p class="hint">まだ記憶はありません。知識やメモを保存してみましょう。</p>';
 el.querySelectorAll("[data-delete-memory]").forEach(b=>b.addEventListener("click",()=>{state.memories.splice(Number(b.dataset.deleteMemory),1);save();renderMemories()}));
}
document.querySelector("#memory-form").addEventListener("submit",e=>{
 e.preventDefault();const text=document.querySelector("#memory-text").value.trim();const source=document.querySelector("#memory-source").value.trim();if(!text)return;
 state.memories.unshift({text,source,at:dateLabel()});save();e.target.reset();renderMemories();
});
function renderTasks(){
 const el=document.querySelector("#task-list");
 el.innerHTML=state.tasks.length?state.tasks.map((t,i)=>`<article class="item"><p>${esc(t.text)}</p><small>${esc(t.at)} · ${t.done?"完了":"進行前"}</small><div class="item-actions"><button class="tiny" data-toggle-task="${i}">${t.done?"未完了に戻す":"完了にする"}</button><button class="tiny" data-delete-task="${i}">削除</button></div></article>`).join(""):'<p class="hint">タスクはまだありません。</p>';
 el.querySelectorAll("[data-toggle-task]").forEach(b=>b.addEventListener("click",()=>{state.tasks[Number(b.dataset.toggleTask)].done=!state.tasks[Number(b.dataset.toggleTask)].done;save();renderTasks()}));
 el.querySelectorAll("[data-delete-task]").forEach(b=>b.addEventListener("click",()=>{state.tasks.splice(Number(b.dataset.deleteTask),1);save();renderTasks()}));
}
document.querySelector("#task-form").addEventListener("submit",e=>{
 e.preventDefault();const input=document.querySelector("#task-text");const text=input.value.trim();if(!text)return;
 state.tasks.unshift({text,done:false,at:dateLabel()});save();input.value="";renderTasks();
});
document.querySelector("#make-report").addEventListener("click",()=>{
 const done=state.tasks.filter(t=>t.done).length,open=state.tasks.length-done;
 const lines=["ハヤトの週間レポート（端末内データから作成）","作成日時："+dateLabel(),"","【記憶に保存した項目】 "+state.memories.length+"件","【タスク】 全"+state.tasks.length+"件（完了 "+done+"件／未完了 "+open+"件）","","【保存した知識】",...(state.memories.slice(0,8).map((m,i)=>`${i+1}. ${m.text}${m.source?" ["+m.source+"]":""}`)), "", "【次のアクション】",...(state.tasks.filter(t=>!t.done).slice(0,5).map((t,i)=>`${i+1}. ${t.text}`))];
 document.querySelector("#report-output").textContent=lines.join("\n");
});
renderMessages();renderMemories();renderTasks();
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("./sw.js").catch(()=>{});
