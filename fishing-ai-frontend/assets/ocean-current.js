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
    return post?.title || post?.species || fallback;
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
    return post?.media_url || post?.photo_url || fallback;
  }

  function actionHandler(post, action){
    const id = String(post?.id || '');
    if(!id) return `showSection('${action === 'join' ? 'community' : 'create'}')`;
    if(action === 'like') return `likeCommunityPost('${safe(id)}')`;
    if(action === 'comment') return `toggleCommunityComments('${safe(id)}')`;
    if(action === 'share') return `shareCommunityPost('${safe(id)}')`;
    if(action === 'save') return `toggleSavedCommunityPost('${safe(id)}')`;
    return "showSection('community')";
  }

  function renderConditions(){
    const current = typeof getDisplayedMarineHour === 'function' ? getDisplayedMarineHour() : null;
    const wind = current?.wind_kts != null && typeof formatMarineMetric === 'function' ? formatMarineMetric(current.wind_kts,'kt') : 'ESE 12 kt';
    const swell = current?.swell_m != null && typeof formatMarineMetric === 'function' ? formatMarineMetric(current.swell_m,'m') : '1.1 m';
    const temp = current?.temp_c != null && typeof formatMarineMetric === 'function' ? formatMarineMetric(current.temp_c,'°C') : '22°C';
    return {wind,swell,temp};
  }

  function renderPrimary(post){
    const author = post?.author_name || post?.user_email || 'Matt Reynolds';
    const area = postArea(post);
    const title = postTitle(post, 'Magic conditions on the Sunshine Coast');
    const copy = postCopy(post, 'Unreal morning on the water. Plenty of action, a few solid mackerel and good company. Not giving spots, but this coastline is alive at the moment.');
    const image = postImage(post, FALLBACK_HERO);
    const likes = Number(post?.likes_count || 128);
    const comments = Number(post?.comments_count || 24);
    const weather = renderConditions();
    return `<article class="oc-current-chapter" data-social-post-id="${safe(post?.id)}">
      <div class="oc-current-hero" style="background-image:url('${safe(image)}')">
        <div class="oc-current-hero-copy">
          <div class="oc-current-kicker">Expedition update</div>
          <h2>${safe(title)}</h2>
          <p>${safe(copy)}</p>
        </div>
        <div class="oc-current-conditions">
          <strong>${icon('map-pin')} ${safe(area)}</strong>
          <span>${icon('sun')} ${safe(weather.temp)}</span>
          <span>${icon('wind')} ${safe(weather.wind)}</span>
          <span>${icon('waves')} ${safe(weather.swell)}</span>
          <span>${icon('cloud-sun')} Great conditions</span>
        </div>
      </div>
      <div class="oc-current-byline">
        <div class="oc-current-avatar">${safe(initials(author))}</div>
        <div><strong>${safe(author)}</strong><span>${safe(postDate(post))} · ${safe(area)}</span><span class="oc-spot-safe-badge">${icon('shield-check')} Spot Safe: exact mark hidden</span></div>
        <div class="oc-current-crew" aria-label="Crew on this adventure"><div class="oc-current-avatar">JC</div><div class="oc-current-avatar">TB</div><div class="oc-current-avatar">SL</div><span>with the crew</span></div>
      </div>
      <div class="oc-current-gallery" aria-label="Expedition gallery">
        <img src="${safe(FALLBACK_COAST)}" alt="Sunshine Coast headland and fishing boat"/>
        <img src="${safe(image)}" alt="${safe(title)}"/>
      </div>
      <div class="oc-current-actions">
        <button class="like" type="button" onclick="${actionHandler(post,'like')}">${icon('heart')} ${likes.toLocaleString()}</button>
        <button type="button" onclick="${actionHandler(post,'comment')}">${icon('message-circle')} ${comments.toLocaleString()}</button>
        <button type="button" onclick="${actionHandler(post,'share')}">${icon('send')} Share</button>
        <button type="button" onclick="${actionHandler(post,'save')}">${icon('bookmark')} Save</button>
        <button class="join" type="button" data-section="community">${icon('users')} Join crew conversation</button>
      </div>
      <div class="crew-comments hidden" id="communityComments-${safe(post?.id)}"></div>
    </article>`;
  }

  function renderCamp(post){
    const author = post?.author_name || post?.user_email || 'Kate Williams';
    const title = postTitle(post, 'Camp life hits different');
    const copy = postCopy(post, 'Set up for the long weekend. Good firewood, unreal sunsets and a few flathead in the esky. This is what it is all about.');
    const image = postImage(post, FALLBACK_CAMP);
    return `<article class="oc-current-chapter">
      <div class="oc-current-camp" style="background-image:url('${safe(image)}')">
        <div class="oc-current-hero-copy"><div class="oc-current-kicker">Camp & explore</div><h3>${safe(title)}</h3><p>${safe(copy)}</p></div>
      </div>
      <div class="oc-current-byline"><div class="oc-current-avatar">${safe(initials(author))}</div><div><strong>${safe(author)}</strong><span>${safe(postDate(post,'5h ago'))} · ${safe(postArea(post,'Bribie Island, QLD'))} · Camping · Boating</span><span class="oc-spot-safe-badge">${icon('shield-check')} Spot Safe area only</span></div></div>
      <div class="oc-current-actions"><button class="like" type="button" onclick="${actionHandler(post,'like')}">${icon('heart')} ${Number(post?.likes_count || 96).toLocaleString()}</button><button type="button" onclick="${actionHandler(post,'comment')}">${icon('message-circle')} ${Number(post?.comments_count || 12).toLocaleString()}</button><button type="button" onclick="${actionHandler(post,'share')}">${icon('send')} Share</button><button type="button" onclick="${actionHandler(post,'save')}">${icon('bookmark')} Save</button><button class="join" type="button" data-section="community">Join conversation ${icon('arrow-right')}</button></div>
    </article>`;
  }

  function renderSignal(author, time, copy, options={}){
    return `<div class="oc-current-signal ${options.alert ? 'alert' : ''}">
      <div class="oc-current-signal-head"><div class="oc-current-avatar">${safe(initials(author))}</div><div><strong>${safe(author)}</strong><span>${safe(time)}</span></div></div>
      <p>${safe(copy)}</p>
      <div class="oc-current-signal-actions"><button type="button" data-section="community">${options.alert ? 'View details' : 'Reply'}</button>${options.alert ? '' : '<button type="button" data-section="community">Like</button>'}</div>
    </div>`;
  }

  function renderSignals(posts){
    const first = posts[0];
    const third = posts[2];
    return `${renderSignal(first?.author_name || 'Jess Carter','45m ago',first ? `That ${postTitle(first,'second bite')} was unreal. Keen for the next run.` : 'Unreal day. That second bite was insane. Keen for the next run.')}
      ${renderSignal('Conditions update','1h ago','ESE 10–15 knots today on the Sunshine Coast. Seas 1–1.5 m. Good window for boating and offshore fishing.')}
      ${renderSignal(third?.author_name || 'Tom Bennett','1h ago',third ? postCopy(third,'Those mackerel are everywhere at the moment.') : 'Those mackerel are everywhere at the moment. Same story up our way.')}
      ${renderSignal('Safety note','2h ago','Small craft warning updated for parts of the coast. Conditions ease through the day.',{alert:true})}`;
  }

  function renderMore(posts){
    const remaining = posts.slice(2);
    if(!remaining.length) return `<div class="oc-current-caught-up"><div>${icon('check-circle-2')}<span><strong>You are caught up</strong><small>Be the first to post today's local report, boat update or camp trip.</small></span></div><button type="button" data-section="create">Create post</button></div>`;
    const feedHtml = remaining.map(renderSocialFeedCard).join('');
    const pagination = state.socialFeedHasMore ? `<div class="oc-feed-sentinel" id="socialHomeFeedSentinel"><button class="oc-feed-load-more" type="button" onclick="loadMoreSocialHomeFeed()">Show more posts</button></div>` : '';
    return `${feedHtml}${pagination}`;
  }

  function renderOceanCurrentHome(){
    const section = document.getElementById('section-home');
    if(!section) return;
    const posts = typeof socialFeedPosts === 'function' ? socialFeedPosts() : [];
    const primary = posts.find(post=>post?.media_url || post?.photo_url) || posts[0] || null;
    const camp = posts.find((post,index)=>index>0 && /camp|trip|boat/i.test(`${post?.post_type || ''} ${post?.category || ''} ${post?.title || ''}`)) || posts[1] || null;
    const weather = renderConditions();
    section.innerHTML = `<div class="oc-current-home">
      <div class="oc-current-toolbar"><div class="oc-current-context">${icon('map-pin')}<span><strong>${safe(postArea(primary))}</strong> · ${safe(weather.temp)} · ${safe(weather.wind)}</span></div><button class="oc-current-primary" type="button" onclick="openCommunityComposer('fishing_report')" aria-label="Share a catch, trip, boat update, video or question">${icon('plus')}<span>Share</span></button></div>
      <div class="oc-current-layout">
        <div class="oc-current-river">${renderPrimary(primary)}${renderCamp(camp)}
          <section class="oc-current-more"><div class="oc-current-section-head"><h3>Stories and reports</h3><div class="oc-current-tabs" aria-label="Feed filters"><button class="${state.socialFeedMode==='home'?'active':''}" type="button" data-home-feed="home">For you</button><button class="${state.socialFeedMode==='following'?'active':''}" type="button" data-home-feed="following">Following</button><button class="${state.socialFeedMode==='local'?'active':''}" type="button" data-home-feed="local">Local</button><button class="${state.socialFeedMode==='latest'?'active':''}" type="button" data-home-feed="latest">Latest</button></div></div><div id="socialHomeFeed">${renderMore(posts)}</div></section>
        </div>
        <aside class="oc-current-signals" aria-label="Live community activity"><div class="oc-current-signals-head"><h3>Live from the Coast</h3><span class="oc-current-live">Live</span></div><div class="oc-current-timeline">${renderSignals(posts)}</div><button class="oc-current-crew-card" type="button" data-section="community">${icon('users')}<span>Find your crew<small>Fishing, boating and camping together</small></span>${icon('chevron-right')}</button></aside>
      </div>
    </div>`;
    bindOceanCurrentControls(section);
    if(typeof bindSectionButtons === 'function') bindSectionButtons(section);
    if(typeof attachCommunityVideoViewListeners === 'function') attachCommunityVideoViewListeners(section);
    if(typeof observeSocialFeedSentinel === 'function') observeSocialFeedSentinel();
    if(window.lucide) window.lucide.createIcons({attrs:{'stroke-width':1.8}});
  }

  function bindOceanCurrentControls(section){
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
    });
    const mobileIcons = {home:'home',explore:'compass',create:'plus',watch:'play',community:'users',profile:'user'};
    document.querySelectorAll('.mobile-tab').forEach(button=>{
      const label = button.querySelector('span');
      const name = mobileIcons[button.dataset.section];
      if(name) button.childNodes.forEach(node=>{ if(node.nodeType===Node.TEXT_NODE) node.textContent=''; });
      if(name && !button.querySelector('[data-lucide]')) button.insertAdjacentHTML('afterbegin',icon(name));
      if(label) button.appendChild(label);
    });
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
