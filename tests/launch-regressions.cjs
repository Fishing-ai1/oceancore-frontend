const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html','utf8');
const current = fs.readFileSync('fishing-ai-frontend/assets/ocean-current.js','utf8');
function extract(source, name, next) {
  return source.slice(source.indexOf('function '+name+'('), source.indexOf('function '+next+'('));
}
test('production and frontend entry points match and inline scripts parse',()=>{
  assert.equal(html, fs.readFileSync('fishing-ai-frontend/index.html','utf8'));
  for(const match of html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1]);
});
test('empty filtered feeds never fall back to unrelated community posts',()=>{
  const context={state:{socialFeed:[],communityPosts:[{id:'unrelated'}],socialFeedMessage:'No posts',socialFeedLoading:false},socialFeedItemToCommunityPost:p=>p};
  vm.createContext(context);
  vm.runInContext(extract(html,'socialFeedPosts','mergeSocialFeedItems'),context);
  assert.equal(context.socialFeedPosts().length,0);
  context.state.socialFeedMessage='';
  context.state.socialFeedLoading=true;
  assert.equal(context.socialFeedPosts().length,0);
  context.state.socialFeedLoading=false;
  context.state.socialFeed=[{id:'selected'}];
  assert.equal(context.socialFeedPosts()[0].id,'selected');
});
test('home renders every post once, including short pages with pagination',()=>{
  const context={state:{socialFeedHasMore:true},renderSocialFeedCard:p=>'['+p.id+']',renderSocialFeedEmpty:()=> 'Loading or empty'};
  vm.createContext(context);
  vm.runInContext(extract(current,'renderMore','renderMobileSocialStart'),context);
  const result=context.renderMore([{id:'one'},{id:'two'},{id:'three'}]);
  for(const id of ['one','two','three']) assert.equal(result.split('['+id+']').length-1,1);
  assert.match(context.renderMore([{id:'one'}]),/loadMoreSocialHomeFeed/);
  assert.equal(context.renderMore([]),'Loading or empty');
});
test('comments resolve inside the visible section',()=>{
  let selected='';
  const root={classList:{contains:()=>true,remove:()=>{}},innerHTML:''};
  const context={CSS:{escape:x=>x},escapeHtml:x=>x,document:{querySelector:s=>{assert.equal(s,'.section.active');return {querySelector:s=>{selected=s;return root;}};}}};
  vm.createContext(context);
  vm.runInContext(extract(html,'renderCommunityCommentsBox','toggleCommunityComments').replace(/async\s*$/,''),context);
  context.renderCommunityCommentsBox('post-1',[]);
  assert.match(selected,/communityComments-post-1/);
  assert.match(root.innerHTML,/No comments yet/);
});

test('feed failures have a retry action rather than an empty-feed message',()=>{
  const context={state:{socialFeedLoading:false,socialFeedMessage:'Could not load the feed. Check your connection and try again.'},escapeHtml:x=>x};
  vm.createContext(context);
  vm.runInContext(extract(html,'renderSocialFeedEmpty','renderSocialFeedCard'),context);
  assert.match(context.renderSocialFeedEmpty(),/Feed unavailable/);
  assert.match(context.renderSocialFeedEmpty(),/onclick="loadSocialHomeFeed\(\)"/);
  context.state.socialFeedLoading=true;
  assert.match(context.renderSocialFeedEmpty(),/community-skeleton/);
});

test('Home feedback is visible and public feed starts before health checks',()=>{
  const elements={communityMsg:{},homeCommunityMsg:{}};
  const line=html.split('\n').find(line=>line.startsWith('function setCommunityMsg('));
  const context={$:id=>elements[id]};
  vm.createContext(context);
  vm.runInContext(line,context);
  context.setCommunityMsg('Post link copied.');
  assert.equal(elements.homeCommunityMsg.textContent,'Post link copied.');
  const init=html.slice(html.indexOf('(async function init(){'));
  assert.ok(init.indexOf('loadSocialHomeFeed(')<init.indexOf('await refreshHealth()'));
});

test('emergency script never treats a planning map point as current GPS',()=>{
  const context={state:{selectedLat:-27.5426,selectedLng:153.0908}};
  vm.createContext(context);
  vm.runInContext(extract(html,'boatAiPosition','boatAiMaydayText'),context);
  assert.equal(context.boatAiPosition().lat,null);
  assert.match(context.boatAiPosition().text,/Not verified/);
});

test('pagination errors stop automatic retry loops',()=>{
  const context={state:{socialFeedHasMore:true,socialFeedMessage:'Network error'},$:()=>({}),window:{IntersectionObserver:class{}},IntersectionObserver:class{constructor(){throw new Error('Must not automatically retry');}}};
  vm.createContext(context);
  vm.runInContext(extract(html,'observeSocialFeedSentinel','renderSocialHome'),context);
  assert.doesNotThrow(()=>context.observeSocialFeedSentinel());
});

test('placeholder titles fall back to a useful media title',()=>{
  const context={isCommunityVideo:p=>p.media_type==='video'};
  vm.createContext(context);
  vm.runInContext(extract(html,'communityPostTitle','videoRecommendationHtml'),context);
  assert.equal(context.communityPostTitle({title:'Unknown',species:'Unknown',media_type:'video'}),'OceanCore fishing video');
  assert.equal(context.communityPostTitle({title:'My trip',media_type:'video'}),'My trip');
});
