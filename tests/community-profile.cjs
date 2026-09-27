const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html','utf8');
function context(extra = {}) {
  const c = {document:{addEventListener(){}},state:{authUser:{id:'me'}},...extra};
  vm.createContext(c);
  vm.runInContext(html.slice(html.indexOf('function communityAuthorButton('),html.indexOf('function renderSocialFeedCard(')),c);
  return c;
}
test('own author button opens own profile without a public API request', async () => {
  let opened;
  const c = context({showSection: value=>opened=value});
  await c.openMemberProfile('me');
  assert.equal(opened,'profile');
});
test('member profile loads the selected member and ignores late responses', async () => {
  const body = {}, dialog = {open:true};
  const pending = [];
  const c = context({$:id=>id==='memberProfileBody'?body:dialog, escapeHtml:s=>s,
    api:url=>new Promise(resolve=>pending.push({url,resolve}))});
  const first = c.openMemberProfile('one'); const second = c.openMemberProfile('two');
  assert.equal(pending[1].url,'/api/community/profile/two');
  pending[1].resolve({profile:{name:'Second'}}); await second;
  pending[0].resolve({profile:{name:'First'}}); await first;
  assert.match(body.innerHTML,/Second/); assert.doesNotMatch(body.innerHTML,/First/);
});
test('feed and community names and avatars use accessible profile buttons', () => {
  assert.equal((html.match(/communityAuthorButton\(post, true\)/g)||[]).length,2);
  assert.ok(html.includes('data-member-profile='));
  assert.equal(html,fs.readFileSync('fishing-ai-frontend/index.html','utf8'));
});
