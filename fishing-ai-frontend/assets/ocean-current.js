(function(){
  'use strict';

  const ASSET_ROOT = './assets/ocean-current';
  const FALLBACK_HERO = `${ASSET_ROOT}/sunshine-coast-mackerel.png`;
  const FALLBACK_CAMP = `${ASSET_ROOT}/coastal-camp-sunset.png`;
  const FALLBACK_COAST = `${ASSET_ROOT}/sunshine-coast-expedition.png`;

  function safe(value, fallback=''){
    return typeof escapeHtml === 'function' ? escapeHtml(value || fallback) : String(value || fallback);
  }

  function icon(name){
    return `<i data-lucide="${name}" aria-hidden="true"></i>`;
  }

  function initials(value){
    if(typeof socialInitials === 'function') return socialInitials(value);
    return String(value || 'OC').split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase();
  }

  function postTitle(post, fallback){
    return communityPostTitle(post, fallback);
  }

  function postCopy(post, fallback){
    return post?.caption || post?.notes || fallback;
  }

  function postArea(post, fallback='Sunshine Coast, QLD'){
    return post?.general_area || fallback;
  }

  function postDate(post, fallback='2h ago'){
    return post?.created_at && typeof formatFriendlyDate === 'function' ? formatFriendlyDate(post.created_at) : fallback;
  }

  function postImage(post, fallback){
    const url = post?.media_url || post?.photo_url || '';
    const mediaType = String(post?.media_type || '').toLowerCase();
    const mediaMime = String(post?.media_mime || '').toLowerCase();
    if(mediaType === 'video' || mediaMime.startsWith('video/') || /\.(mp4|mov|webm)(?:$|\?)/i.test(url)) return fallback;
    return url || fallback;
  }


  function renderSignals(posts){
    return posts.slice(0,3).map(post=>`<div class="oc-current-signal"><strong>${safe(post.author_name, 'OceanCore member')}</strong><p>${safe(postTitle(post,'Community update'))}</p><small>${safe(postDate(post,''))}</small></div>`).join('') || '<p>No community updates yet.</p>';
  }

  function renderMore(posts){
    const remaining = posts;
    if(!remaining.length) return renderSocialFeedEmpty();
    const feedHtml = remaining.map(renderSocialFeedCard).join('');
    const pagination = state.socialFeedHasMore ? `<div class="oc-feed-sentinel" id="socialHomeFeedSentinel">${state.socialFeedMessage ? '<p role="status">Could not load more posts. Please try again.</p>' : ''}<button class="oc-feed-load-more" type="button" onclick="loadMoreSocialHomeFeed()" ${state.socialFeedLoadingMore ? 'disabled' : ''}>${state.socialFeedLoadingMore ? 'Loading posts...' : 'Show more posts'}</button></div>` : '';
    return `${feedHtml}${pagination}`;
  }

  function renderMobileSocialStart(posts){
    const storyPosts = posts.filter(post=>postImage(post,'')).slice(0,4);
    const stories = [
      `<button class="oc-story oc-story-create" type="button" data-quick-create="catch"><span class="oc-story-ring"><span>${icon('plus')}</span></span><strong>Your story</strong></button>`,
      ...storyPosts.map((post,index)=>{
        const author = post?.author_name || post?.user_email || `Angler ${index+1}`;
        return `<button class="oc-story" type="button" data-section="community"><span class="oc-story-ring"><img src="${safe(postImage(post,''))}" alt=""/></span><strong>${safe(String(author).split(' ')[0])}</strong></button>`;
      }),
      `<button class="oc-story" type="button" data-section="community"><span class="oc-story-ring"><img src="${safe(FALLBACK_COAST)}" alt=""/></span><strong>Local crew</strong></button>`
    ].join('');
    return `<div class="oc-mobile-social-start">
      <div class="oc-mobile-search" role="search">
        ${icon('search')}<input id="ocMobileSearch" type="search" inputmode="search" autocomplete="off" placeholder="Search anglers, catches, species or places" aria-label="Search OceanCore"/><button id="ocMobileSearchButton" type="button" aria-label="Search">${icon('arrow-right')}</button>
      </div>
      <section class="oc-home-composer" aria-label="Create a post">
        <div class="oc-composer-prompt"><span class="oc-current-avatar">OC</span><button type="button" data-quick-create="discussion">Share a catch, report, video or question…</button></div>
        <div class="oc-composer-actions">
          <button type="button" data-quick-create="catch">${icon('camera')}<span>Photo</span></button>
          <button type="button" data-quick-create="video">${icon('video')}<span>Video</span></button>
          <button type="button" data-quick-create="fishing_report">${icon('map-pin')}<span>Report</span></button>
          <button type="button" data-quick-create="boat">${icon('ship-wheel')}<span>Boat</span></button>
        </div>
      </section>
      <section class="oc-stories" aria-label="Fishing stories"><div class="oc-story-row">${stories}</div></section>
    </div>`;
  }

  function renderOceanCurrentHome(){
    const section = document.getElementById('section-home');
    if(!section) return;
    const posts = typeof socialFeedPosts === 'function' ? socialFeedPosts() : [];
    section.innerHTML = `<div class="oc-current-home">
      ${renderMobileSocialStart(posts)}
      <p id="homeCommunityMsg" role="status" aria-live="polite"></p>
      <div class="oc-current-toolbar"><button class="btn" type="button" data-section="map">${icon('map-pin')} Map &amp; Conditions</button><button class="oc-current-primary" type="button" data-quick-create="fishing_report" aria-label="Share a fishing report">${icon('plus')}<span>Share report</span></button></div>
      <div class="oc-current-layout">
        <div class="oc-current-river">
          <section class="oc-current-more"><div class="oc-current-section-head"><h3>Stories and reports</h3><div class="oc-current-tabs" aria-label="Feed filters"><button class="${state.socialFeedMode==='home'?'active':''}" type="button" data-home-feed="home">For you</button><button class="${state.socialFeedMode==='following'?'active':''}" type="button" data-home-feed="following">Following</button><button class="${state.socialFeedMode==='local'?'active':''}" type="button" data-home-feed="local">Local</button><button class="${state.socialFeedMode==='latest'?'active':''}" type="button" data-home-feed="latest">Latest</button></div></div><div id="socialHomeFeed">${renderMore(posts)}</div></section>
        </div>
        <aside class="oc-current-signals" aria-label="Community updates"><div class="oc-current-signals-head"><h3>Community updates</h3></div><div class="oc-current-timeline">${renderSignals(posts)}</div><button class="oc-current-crew-card" type="button" data-section="community">${icon('users')}<span>Find your crew<small>Fishing, boating and camping together</small></span>${icon('chevron-right')}</button></aside>
      </div>
    </div>`;
    section.classList.add('oc-current-mounted');
    section.removeAttribute('aria-busy');
    bindOceanCurrentControls(section);
    if(typeof bindSectionButtons === 'function') bindSectionButtons(section);
    if(typeof attachCommunityVideoViewListeners === 'function') attachCommunityVideoViewListeners(section);
    if(typeof observeSocialFeedSentinel === 'function') observeSocialFeedSentinel();
    if(window.lucide) window.lucide.createIcons({attrs:{'stroke-width':1.8}});
  }

  function bindOceanCurrentControls(section){
    const search = section.querySelector('#ocMobileSearch');
    const runSearch = ()=>{
      const globalSearch = document.getElementById('globalSearch');
      if(globalSearch) globalSearch.value = String(search?.value || '').trim();
      document.getElementById('btnGlobalSearch')?.click();
    };
    section.querySelector('#ocMobileSearchButton')?.addEventListener('click',runSearch);
    search?.addEventListener('keydown',event=>{ if(event.key === 'Enter'){ event.preventDefault(); runSearch(); } });
    section.querySelectorAll('[data-quick-create]').forEach(button=>button.addEventListener('click',()=>{
      if(typeof openCommunityComposer === 'function') openCommunityComposer(button.dataset.quickCreate || 'discussion');
    }));
    section.querySelectorAll('[data-home-feed]').forEach(button=>button.addEventListener('click',()=>{
      const feed = button.dataset.homeFeed || 'home';
      if(typeof loadSocialHomeFeed === 'function') loadSocialHomeFeed(feed);
    }));
  }

  function decorateChrome(){
    document.body.classList.add('oc-current-ready');
    const main = document.querySelector('.layout main');
    document.querySelectorAll('.shell > .section').forEach(section=>main?.appendChild(section));
    document.querySelectorAll('.brand .logo').forEach(logo=>{ logo.innerHTML = '<img src="./assets/icons/icon-192.png" alt="OceanCore"/>'; });
    const brandTitle = document.querySelector('.brand h1');
    const brandTagline = document.querySelector('.brand .subtle');
    if(brandTitle) brandTitle.textContent = 'OceanCore';
    if(brandTagline) brandTagline.textContent = 'People. Places. A wilder life.';
    const navIcons = {home:'home',explore:'compass',watch:'play-square',create:'plus-square',community:'users',messages:'message-square',profile:'user'};
    document.querySelectorAll('.nav>.nav-btn').forEach(button=>{
      const name = navIcons[button.dataset.section];
      if(name && !button.querySelector('[data-lucide]')) button.insertAdjacentHTML('afterbegin',icon(name));
    });
    document.querySelectorAll('.nav-group').forEach((group,index)=>{
      const summary = group.querySelector('summary');
      if(!summary || group.classList.contains('nav-developer')) return;
      summary.innerHTML = `${icon(index === 0 ? 'box' : 'menu')}<span>${index === 0 ? 'Tools' : 'More'}</span>`;
      group.addEventListener('toggle',()=>{
        if(!group.open) return;
        document.querySelectorAll('.nav-group[open]').forEach(other=>{
          if(other !== group && !other.classList.contains('nav-developer')) other.open = false;
        });
      });
    });
    const mobileIcons = {home:'home',explore:'compass',create:'plus',watch:'play',community:'users',profile:'user'};
    document.querySelectorAll('.mobile-tab').forEach(button=>{
      const label = button.querySelector('span');
      const name = button.hasAttribute('data-mobile-tools') ? 'wrench' : mobileIcons[button.dataset.section];
      if(name) button.childNodes.forEach(node=>{ if(node.nodeType===Node.TEXT_NODE) node.textContent=''; });
      if(name && !button.querySelector('[data-lucide]')) button.insertAdjacentHTML('afterbegin',icon(name));
      if(label) button.appendChild(label);
    });
    document.querySelectorAll('#mobileToolsMenu [data-tool-icon]').forEach(button=>{
      if(!button.querySelector('[data-lucide]')) button.insertAdjacentHTML('afterbegin',icon(button.dataset.toolIcon));
    });
    const closeMobileTools = document.getElementById('btnCloseMobileTools');
    if(closeMobileTools && !closeMobileTools.querySelector('[data-lucide]')){
      closeMobileTools.textContent = '';
      closeMobileTools.insertAdjacentHTML('afterbegin',icon('x'));
    }
    if(window.lucide) window.lucide.createIcons({attrs:{'stroke-width':1.8}});
  }

  function enableLocalPreview(){
    const params = new URLSearchParams(location.search);
    if(!['localhost','127.0.0.1'].includes(location.hostname) || params.get('preview') !== 'social') return;
    const unlock = ()=>{
      document.body.classList.add('oc-current-preview');
      document.body.classList.remove('auth-loading','auth-locked');
      const gate = document.getElementById('authGate');
      if(gate){ gate.hidden = true; gate.setAttribute('aria-hidden','true'); }
    };
    unlock();
  }

  function start(){
    decorateChrome();
    enableLocalPreview();
    renderSocialHome = renderOceanCurrentHome;
    window.renderOceanCurrentHome = renderOceanCurrentHome;
    renderOceanCurrentHome();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
