(function(){
  if(window.__POBOT4){alert('[POBot] Deja activ!');return;}
  window.__POBOT4=true;

  function $$(s){for(const q of s){const e=document.querySelector(q);if(e)return e;}return null;}

  function setVal(el,v){
    if(!el)return false;
    const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
    if(d&&d.set)d.set.call(el,v);else el.value=v;
    ['input','change','keyup','blur'].forEach(ev=>el.dispatchEvent(new Event(ev,{bubbles:true})));
    return true;
  }

  function setAmount(v){
    const el=$$(['input[data-id="amount"]','.binary-options-widget__amount input',
      '.amount-input input','input[min][max][step]','[class*="amount"] input',
      '[class*="Amount"] input','.deal-amount input']);
    if(setVal(el,v)) console.log('[POBot] Suma: $'+v);
  }

  function setExpiry(sec){
    const min=sec/60;
    const targets=[sec+'s',String(sec),min+'m',min+':00',Math.floor(min)+'m',String(Math.floor(min))];
    const all=document.querySelectorAll('*');
    for(const el of all){
      if(!el.textContent||el.children.length>3)continue;
      const t=el.textContent.trim().toLowerCase();
      for(const tgt of targets){
        if(t===String(tgt).toLowerCase()&&el.tagName!=='BODY'&&el.tagName!=='HTML'){
          el.click();console.log('[POBot] Expirare: '+sec+'s');return;
        }
      }
    }
  }

  function clickDir(dir){
    const isCall=dir==='CALL';
    const sel=isCall?[
      'button[data-direction="call"]','button[data-direction="up"]',
      '.btn-call','.call-button','.up-button','.trading__btn--call',
      '.deal-btn--call','.button--up','[class*="call"][class*="btn"]'
    ]:[
      'button[data-direction="put"]','button[data-direction="down"]',
      '.btn-put','.put-button','.down-button','.trading__btn--put',
      '.deal-btn--put','.button--down','[class*="put"][class*="btn"]'
    ];
    const btn=$$(sel);
    if(btn){btn.click();console.log('[POBot] '+dir+' executat!');}
  }

  function execute(sig){
    setAmount(sig.amount);
    setTimeout(()=>setExpiry(sig.expirySec||60),500);
    setTimeout(()=>clickDir(sig.direction),1200);
  }

  // Listen via localStorage polling
  let lastId='';
  setInterval(()=>{
    try{
      const raw=localStorage.getItem('__pb4');
      if(!raw)return;
      const s=JSON.parse(raw);
      if(s.id===lastId||Date.now()-s.ts>5000)return;
      lastId=s.id;
      execute(s);
    }catch(e){}
  },300);

  // Listen via BroadcastChannel
  try{
    new BroadcastChannel('pobot4').onmessage=e=>{
      if(e.data?.type==='SIG')execute(e.data.s);
    };
  }catch(e){}

  alert('[POBot v4] ✅ ACTIV — aștept semnale!');
})();
