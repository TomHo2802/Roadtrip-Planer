
(function(){
  function build(msg,o){
    return new Promise(function(res){
      var prev=document.activeElement;
      var bg=document.createElement('div');bg.className='rt-dlg-bg';
      var d=document.createElement('div');d.className='rt-dlg';d.setAttribute('role',o.cancel?'alertdialog':'dialog');d.setAttribute('aria-modal','true');
      var p=document.createElement('p');p.textContent=String(msg==null?'':msg);d.appendChild(p);
      var bar=document.createElement('div');bar.className='rt-dlg-btns';
      function done(v){document.removeEventListener('keydown',key,true);bg.remove();try{prev&&prev.focus&&prev.focus();}catch(e){}res(v);}
      var c=null;
      if(o.cancel){c=document.createElement('button');c.type='button';c.setAttribute('data-readonly-allow','');c.textContent=o.cancel;c.onclick=function(){done(false);};bar.appendChild(c);}
      var ok=document.createElement('button');ok.type='button';ok.setAttribute('data-readonly-allow','');ok.textContent=o.ok;ok.className=o.bad?'rt-dlg-bad':'rt-dlg-ok';ok.onclick=function(){done(true);};bar.appendChild(ok);
      d.appendChild(bar);bg.appendChild(d);
      function key(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done(false);}else if(e.key==='Tab'){var f=[].slice.call(d.querySelectorAll('button'));var i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();}}
      document.addEventListener('keydown',key,true);
      bg.addEventListener('mousedown',function(e){if(e.target===bg&&o.cancel)done(false);});
      document.body.appendChild(bg);(o.cancel&&o.bad?c:ok).focus();
    });
  }
  /* Rueckfrage: Promise<boolean> */
  window.rtAsk=function(msg,opt){
    var m=String(msg==null?'':msg),o=opt||{};
    var bad=o.bad!=null?o.bad:/löschen|verwerfen|entfernen|überschreib|zurückgesetzt/i.test(m);
    var ok=o.ok||(/löschen/i.test(m)&&!/wiederherstellen/i.test(m)?'Löschen':/verwerfen/i.test(m)?'Verwerfen':'Fortfahren');
    return build(m,{ok:ok,cancel:o.cancel||'Abbrechen',bad:bad});
  };
  /* Hinweis ohne Warten (Ersatz fuer alert) */
  window.rtNotice=function(msg){return build(msg,{ok:'OK',cancel:null,bad:false});};
  /* Hinweisleiste bei neuer App-Version */
  window.rtShowUpdateBar=function(){
    if(document.getElementById('rt-upd'))return;
    var b=document.createElement('div');b.id='rt-upd';b.className='rt-upd';b.setAttribute('role','status');
    var t=document.createElement('span');t.textContent='Neue Version bereit.';
    var bt=document.createElement('button');bt.type='button';bt.setAttribute('data-readonly-allow','');bt.textContent='Jetzt laden';bt.onclick=function(){location.reload();};
    b.appendChild(t);b.appendChild(bt);document.body.appendChild(b);
  };
})();
