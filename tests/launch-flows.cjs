const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
test('concurrent reset requests send one email request',async()=>{
  let resolve,calls=0;
  const c={state:{},getAuthEmail:()=> 'fixture@example.com',mirrorAuthEmail(){},getRedirectTarget:()=> '',
    api:()=>{calls++;return new Promise(r=>resolve=r);},setAuthFeedback(){},humanizeAuthError:s=>s};
  run(code('sendResetPassword','sendMagicLink'),c);
  const pending=c.sendResetPassword();await c.sendResetPassword();
  assert.equal(calls,1);resolve({message:'Requested'});await pending;
  assert.equal(c.state.resetPasswordPending,false);
});
test('old community responses cannot overwrite the selected filter',async()=>{
  const pending=[];
  const c={state:{},renderCommunityFeed(){},renderCommunityLiveModules(){},
    apiFirst:()=>new Promise(r=>pending.push(r))};
  run(code('loadCommunityPosts','renderCommunityDashboard'),c);
  const first=c.loadCommunityPosts();const second=c.loadCommunityPosts();
  pending[1]({posts:[{id:'new'}]});await second;
  pending[0]({posts:[{id:'old'}]});await first;
  assert.equal(c.state.communityPosts[0].id,'new');
  assert.equal(c.state.communityLoading,false);
});
test('community request failure becomes a retryable error',async()=>{
  const c={state:{},renderCommunityFeed(){},renderCommunityLiveModules(){},
    apiFirst:async()=>{throw Error('Offline');}};
  run(code('loadCommunityPosts','renderCommunityDashboard'),c);
  await c.loadCommunityPosts();
  assert.match(c.state.communityFeedError,/try again/);
  assert.equal(c.state.communityLoading,false);
});
function code(name,next){
  const start=html.search(new RegExp('(?:async )?function '+name+'\\('));
  const end=html.search(new RegExp('(?:async )?function '+next+'\\('));
  assert.ok(start>=0&&end>start,name);
  return html.slice(start,end);
}
function run(source,context){vm.createContext(context);vm.runInContext(source,context);return context;}
test('rate-limited recovery requests never claim an email was sent',()=>{
  const c=run(code('humanizeAuthError','initAuth'),{});
  assert.match(c.humanizeAuthError('For security purposes wait 60 seconds','reset'),/wait/);
  assert.doesNotMatch(c.humanizeAuthError('Too many requests','reset'),/has been sent/);
});
test('unfinished and failed media cannot be published',()=>{
  const c=run(code('validateCommunityPayload','publishCommunityPost'),{state:{communityMediaPreparing:true}});
  assert.throws(()=>c.validateCommunityPayload({post_type:'video',species:'Test',media_type:'video',media_url:'blob:fixture'}),/finish preparing/);
  c.state.communityMediaPreparing=false;c.state.communityMediaFailed=true;
  assert.throws(()=>c.validateCommunityPayload({post_type:'discussion',caption:'Test'}),/Retry or remove/);
});
test('changing an image discards late results from the previous file',async()=>{
  const readers=[];
  const c={
    state:{communityMediaSelectionId:0},URL:{revokeObjectURL:()=>{}},
    FileReader:class { constructor(){readers.push(this);} readAsDataURL(){} },
    clearCommunityMedia(){c.state.communityMediaSelectionId++;c.state.communityMediaDataUrl='';},
    renderCommunityPreview(){},setCommunityUploadStatus(){},setCommunityMsg(){},
  };
  run(code('prepareCommunityMedia','handleCommunityMedia'),c);
  const first=c.prepareCommunityMedia({type:'image/jpeg',name:'one.jpg'});
  const second=c.prepareCommunityMedia({type:'image/jpeg',name:'two.jpg'});
  readers[1].result='data:image/jpeg;base64,dHdv';readers[1].onload();
  await second;
  readers[0].result='data:image/jpeg;base64,b25l';readers[0].onload();
  await first;
  assert.equal(c.state.communityMediaDataUrl,'data:image/jpeg;base64,dHdv');
});
test('failed media remains available for an explicit retry',async()=>{
  let reader;
  const c={state:{communityMediaSelectionId:0},clearCommunityMedia(){c.state.communityMediaSelectionId++;},
    FileReader:class{constructor(){reader=this;}readAsDataURL(){}},
    setCommunityUploadStatus(){},setCommunityMsg(){},renderCommunityPreview(){},
  };
  run(code('prepareCommunityMedia','handleCommunityMedia'),c);
  const file={type:'image/jpeg',name:'retry.jpg'};
  const pending=c.prepareCommunityMedia(file);reader.onerror();await pending;
  assert.equal(c.state.communityMediaFailed,true);
  assert.equal(c.state.communityMediaFile,file);
  assert.equal(c.state.communityMediaPreparing,false);
});
test('late inbox responses cannot overwrite another conversation',async()=>{
  let resolve;
  const c={state:{communityMessages:{activeConversationId:'new',messages:[]}},apiFirst:()=>new Promise(r=>resolve=r),renderCommunityMessages(){throw Error('Stale conversation rendered');}};
  run(code('loadCommunityMessages','requestCommunityFriend'),c);
  const pending=c.loadCommunityMessages('old');resolve({messages:[{body:'Old private message'}]});await pending;
  assert.equal(c.state.communityMessages.messages.length,0);
});
test('rapid sends create one request and preserve newly typed text',async()=>{
  let resolve;let calls=0;
  const input={value:'First message'},button={disabled:false};
  const c={state:{communityMessages:{activeConversationId:'one'}},$:id=>id==='communityMessageInput'?input:button,
    requireSignIn:()=>true,apiFirst:()=>{calls++;return new Promise(r=>resolve=r);},
    setCommunityMessagesMsg(){},loadCommunityMessages:async()=>{},loadCommunityConversations:async()=>{},activeCommunityConversation:()=>({id:'one'}),
  };
  run(code('sendCommunityMessage','refreshCommunityInbox'),c);
  const first=c.sendCommunityMessage();await c.sendCommunityMessage();
  assert.equal(calls,1);input.value='Next draft';resolve({success:true});await first;
  assert.equal(input.value,'Next draft');assert.equal(button.disabled,false);
});
test('failed message sends retain the draft',async()=>{
  const input={value:'Keep me'},button={disabled:false};
  const c={state:{communityMessages:{activeConversationId:'one'}},$:id=>id==='communityMessageInput'?input:button,
    requireSignIn:()=>true,apiFirst:async()=>{throw Error('Offline');},setCommunityMessagesMsg(){},activeCommunityConversation:()=>({id:'one'}),
  };
  run(code('sendCommunityMessage','refreshCommunityInbox'),c);
  await c.sendCommunityMessage();assert.equal(input.value,'Keep me');assert.equal(button.disabled,false);
});
test('recovery mode survives a reload without storing recovery links',()=>{
  const pending=[];
  const c={state:{token:'fixture',authEmail:''},localStorage:{getItem:()=>''},sessionStorage:{getItem:()=> 'true'},
    consumeAuthTokensFromUrl(){},mirrorAuthEmail(){},updateAuthUi(){},requestAnimationFrame:fn=>pending.push(fn),
  };
  run(code('initAuth','signIn'),c);c.initAuth();
  assert.equal(c.state.recoveryMode,true);assert.equal(pending.length,1);
});
test('a recovery token cannot inherit another account refresh token',()=>{
  const c={state:{refreshToken:'old-account'},localStorage:{setItem(){},removeItem(){}},mirrorAuthEmail(){}};
  run(code('persistAuth','clearAuth'),c);
  c.persistAuth({access_token:'recovery',refresh_token:null},{is_guest:false});
  assert.equal(c.state.refreshToken,null);
});
