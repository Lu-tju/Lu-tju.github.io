/* 原生 JS，无依赖。内容集中在 content.js；布局在 index.html / styles.css。 */
(() => {
  'use strict';
  const site = window.SITE_CONTENT;
  if (!site?.zh) return;
  const $ = (id) => document.getElementById(id);
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* 隐私模式仍可正常使用 */ } };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let language = read('homepage-language') === 'en' && site.settings.englishReady && site.en ? 'en' : 'zh';
  let paused = read('homepage-motion-paused') === 'true' || reducedMotion.matches;
  const labels = {
    zh: { skipLink:'跳到正文',navLabel:'主导航',profileLabel:'个人信息',interestsLabel:'研究方向',metaDescription:'卢俊杰（Junjie Lu），天津大学博士研究生。研究空中机器人、端到端运动规划、自主导航、具身智能与视觉语言导航（VLN）。',navAbout:'关于',navPapers:'论文',navProjects:'项目',navEducation:'教育',navAwards:'奖励',sidebarNote:'探索机器人自主行动的可能',hello:'你好，我是卢俊杰。',welcome:'欢迎来到我的学术主页。',papersHeading:'学术论文',projectsHeading:'科研项目',educationHeading:'教育经历',honorsHeading:'荣誉奖励',servicesHeading:'学术活动',footer:'由 GitHub Pages 托管 · 持续探索，保持好奇',backTop:'返回顶部 ↑',selectedHeading:'代表工作',otherHeading:'其他论文',pause:'Ⅱ 暂停动图',play:'▷ 播放动图',animation:'研究演示循环短片',ieee:'IEEE 个人主页',old:'旧版主页',empty:'暂无符合条件的论文。' },
    en: { skipLink:'Skip to content',navLabel:'Main navigation',profileLabel:'Profile',interestsLabel:'Research interests',metaDescription:'Junjie Lu, Ph.D. student at Tianjin University. Research in aerial robotics, end-to-end motion planning, autonomous navigation, embodied intelligence, and vision-and-language navigation (VLN).',navAbout:'About',navPapers:'Publications',navProjects:'Projects',navEducation:'Education',navAwards:'Awards',sidebarNote:'Exploring robot autonomy',hello:'Hi, I’m Junjie Lu.',welcome:'Welcome to my academic homepage.',papersHeading:'Publications',projectsHeading:'Research Projects',educationHeading:'Education',honorsHeading:'Honors & Awards',servicesHeading:'Academic Activities',footer:'Hosted on GitHub Pages · Stay curious',backTop:'Back to top ↑',selectedHeading:'Selected Publications',otherHeading:'Other Publications',pause:'Ⅱ Pause demos',play:'▷ Play demos',animation:'Research demo loop',ieee:'IEEE Profile',old:'Previous homepage',empty:'No publications match this filter.' }
  };
  const t = (key) => labels[language][key];
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function link(text, href, className) {
    const a = el('a', className, text); a.href = href;
    if (/^https?:/.test(href) || /\.mp4(?:[?#]|$)/i.test(href)) { a.target='_blank'; a.rel='noopener noreferrer'; }
    return a;
  }
  function links(items) {
    const nav=el('div','paper-links');
    for (const [label,url] of Object.entries(items || {})) {
      if (!url || !['Paper', 'Video', 'Code'].includes(label)) continue;
      const a=link(label,url);a.append(el('span','external-arrow','↗'));nav.append(a);
    }
    return nav;
  }
  function authorList(text) {
    const p=el('p','authors');
    const authors=text.split(',').map(name=>name.trim()).filter(Boolean);
    let displayed=authors;
    if(authors.length>5){
      // 保留前三位、本人和末位作者，并维持原始署名顺序。
      const keep=new Set([0,1,2,authors.length-1]);
      const self=authors.findIndex(name=>/Junjie Lu|J\. Lu/.test(name));
      if(self>=0)keep.add(self);
      for(let i=3;keep.size<5 && i<authors.length;i++)keep.add(i);
      displayed=authors.filter((_,i)=>keep.has(i));
      p.title=text;
    }
    const visibleText=displayed.join(', ')+(authors.length>5?', et al.':'');
    for (const part of visibleText.split(/(Junjie Lu|J\. Lu)/g)) {
      p.append(/^(Junjie Lu|J\. Lu)$/.test(part) ? el('strong','',part) : document.createTextNode(part));
    }
    return p;
  }
  function media(item) {
    // media 可以是短名，也可以是 {type:'image'|'video', src, poster, controls, caption}。
    const spec=typeof item.media==='string' ? {type:'video',src:`assets/media/${item.media}.mp4`,poster:`assets/media/${item.media}.webp`} : item.media;
    if (!spec) { const box=el('div','media media-empty');box.setAttribute('aria-hidden','true');box.append(el('span','','RESEARCH'));return box; }
    const box=el('div','media');
    let asset;
    if (spec.type==='image') {
      asset=el('img');asset.src=spec.src;asset.alt=item.title;asset.loading='lazy';asset.width=480;asset.height=300;
    } else {
      asset=el('video');asset.dataset.src=spec.src;asset.poster=spec.poster || '';asset.muted=true;asset.defaultMuted=true;asset.loop=!spec.controls;asset.playsInline=true;asset.preload='none';asset.controls=Boolean(spec.controls);
      asset.setAttribute('aria-label',`${item.title} · ${t('animation')}`);
      asset.addEventListener('error',()=>{if(spec.poster){const img=el('img');img.src=spec.poster;img.alt=item.title;asset.replaceWith(img);}});
    }
    const href=item.selected ? item.links?.Video || item.links?.Paper || item.links?.Code : null;
    if(href && !spec.controls){const a=link('',href);a.setAttribute('aria-label',`${item.title} · ${item.links?.Video ? 'Video' : item.links?.Paper ? 'Paper' : 'Code'}`);a.append(asset);box.append(a);}else box.append(asset);
    return box;
  }
  function researchItem(item, project=false) {
    const article=el('article',`research-item${project?' project':''}`);article.id=`work-${item.id}`;
    // 没有配套素材的报告用纯文字，避免重复使用其他论文的演示。
    if(item.media)article.append(media(item));
    else article.style.gridTemplateColumns='1fr';
    const body=el('div','research-body');const h=el('h3');const href=!project && item.selected ? item.links?.Paper || item.links?.Code : null;
    h.append(href?link(item.title,href):document.createTextNode(item.title));body.append(h);
    if(item.authors)body.append(authorList(item.authors));
    body.append(el('p','venue',project?item.subtitle:item.venue));
    if(item.authorNote)body.append(el('p','author-note',item.authorNote));
    if(project && item.description)body.append(el('p','description',item.description));if(!project && item.selected)body.append(links(item.links));article.append(body);return article;
  }
  const visibility = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for(const entry of entries){
      const v=entry.target;
      if(entry.isIntersecting){
        if(!v.src && v.dataset.src){v.src=v.dataset.src;v.load();}
        if(!paused && !document.hidden && !v.controls)v.play().catch(()=>{});
      } else if(!v.controls)v.pause();
    }
  },{rootMargin:'80px 0px',threshold:.1}) : null;
  function watchMedia(){
    visibility?.disconnect();
    document.querySelectorAll('.media video').forEach(v=>{
      if(visibility) visibility.observe(v);
      else {v.src=v.dataset.src;if(!paused&&!v.controls)v.play().catch(()=>{});}
    });
  }
  function updateMotion(){
    $('motion-toggle').textContent=t(paused?'play':'pause');
    $('motion-toggle').setAttribute('aria-pressed',String(paused));
    if(paused)document.querySelectorAll('.media video:not([controls])').forEach(v=>v.pause());
    else watchMedia();
  }
  function renderPapers(){
    const papers=site[language].papers;
    const selected=papers.filter(p=>p.selected);
    const other=papers.filter(p=>!p.selected).sort((a,b)=>b.year-a.year);
    $('papers').replaceChildren(...selected.map(p=>researchItem(p)));
    $('other-papers').replaceChildren(...other.map(p=>researchItem(p)));
    $('selected-paper-count').textContent=String(selected.length);
    $('other-paper-count').textContent=String(other.length);
    watchMedia();
  }
  function render(){
    const data=site[language],p=data.profile;
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    document.title=language==='zh'?`${p.name} · ${p.latinName} | 学术主页`:`${p.latinName} | Academic Homepage`;
    document.querySelector('meta[name="description"]').content=t('metaDescription');
    document.querySelector('meta[property="og:title"]').content=document.title;
    document.querySelector('meta[property="og:description"]').content=t('metaDescription');
    document.querySelectorAll('[data-i18n-aria]').forEach(node=>node.setAttribute('aria-label',t(node.dataset.i18nAria)));
    document.querySelectorAll('[data-i18n]').forEach(node=>node.textContent=t(node.dataset.i18n));
    $('language-toggle').textContent=language==='zh'?'EN ⇄':'中文 ⇄';
    $('language-toggle').setAttribute('aria-label',language==='zh'?'切换至英文':'Switch to Chinese');
    for(const [id,value] of Object.entries({'profile-name':p.name,'latin-name':language==='zh'?p.latinName:site.zh.profile.name,'profile-role':p.role,'profile-school':p.school,'profile-department':p.department,'profile-location':p.location}))$(id).textContent=value;
    $('avatar').src=p.avatar;$('avatar').alt=p.name;
    $('profile-links').replaceChildren(link('↗ GitHub',p.github),...(p.bilibili?[link('↗ '+(language==='zh'?'哔哩哔哩':'Bilibili'),p.bilibili)]:[]),link('✉ '+p.email,`mailto:${p.email}`));
    $('intro-copy').replaceChildren(...data.intro.map(text=>el('p','',text)));
    $('interests').replaceChildren(...data.interests.map(text=>el('span','interest',text)));
    $('project-list').replaceChildren(...data.projects.map(p=>researchItem(p,true)));
    $('education-list').replaceChildren(...data.education.map(item=>{
      const row=el('div','education-item'),body=el('div'),h=el('h3','',item.school);h.append(el('span','',item.degree));body.append(h);if(item.detail)body.append(el('p','',item.detail));row.append(body,el('time','',item.period));return row;
    }));
    for(const [key,id] of [['honors','honors-list'],['services','services-list']]){
      $(id).replaceChildren(...(data[key] || []).map(item=>{
        const row=el('li','experience-item'),body=el('div');const title=el('p','experience-title');title.append(item.bold ? el('strong','',item.title) : document.createTextNode(item.title));body.append(title);if(item.detail)body.append(el('p','experience-detail',item.detail));row.append(body);if(item.year)row.append(el('time','',item.year));return row;
      }));
    }
    $('copyright').textContent=`© ${site.settings.updated.slice(0,4)} ${p.latinName}`;
    renderPapers();updateMotion();
  }
  $('motion-toggle').addEventListener('click',()=>{paused=!paused;save('homepage-motion-paused',String(paused));updateMotion();});
  $('language-toggle').addEventListener('click',()=>{
    language=language==='zh'?'en':'zh';save('homepage-language',language);render();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause());else watchMedia();});
  reducedMotion.addEventListener('change',e=>{if(e.matches){paused=true;updateMotion();}});
  if('IntersectionObserver' in window){
    const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('current',a.hash===`#${entry.target.id==='honors'?'services':entry.target.id}`));},{rootMargin:'-10% 0px -65% 0px'});
    document.querySelectorAll('main section').forEach(s=>sectionObserver.observe(s));
  }
  render();
})();
