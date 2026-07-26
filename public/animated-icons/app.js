const icons=window.TEJUM_ICONS||[];
const grid=document.querySelector('#grid'),search=document.querySelector('#search'),chips=document.querySelector('#chips'),empty=document.querySelector('#empty');
const categories=[...new Set(icons.map(i=>i.category))].sort();
let active='all';
function svgData(svg){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
function render(){grid.innerHTML=icons.map(icon=>`<article class="card" data-category="${icon.category}" data-name="${icon.title.toLowerCase()}"><div class="stage">${icon.svg}</div><div class="card-copy"><div><h3>${icon.title}</h3><p>${icon.category} · ${icon.motion}</p></div><a class="download" href="${svgData(icon.svg)}" download="${icon.file}" aria-label="Download ${icon.title} SVG">Download SVG</a></div></article>`).join('');apply()}
chips.innerHTML=['all',...categories].map((c,i)=>`<button class="chip${i===0?' active':''}" data-filter="${c}">${c==='all'?'All':c}</button>`).join('');
function apply(){const q=search.value.trim().toLowerCase();let shown=0;document.querySelectorAll('.card').forEach(card=>{const okCat=active==='all'||card.dataset.category===active;const okQ=!q||card.dataset.name.includes(q)||card.dataset.category.toLowerCase().includes(q);const show=okCat&&okQ;card.hidden=!show;if(show)shown++});empty.style.display=shown?'none':'block'}
search.addEventListener('input',apply);chips.addEventListener('click',e=>{const chip=e.target.closest('.chip');if(!chip)return;document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));chip.classList.add('active');active=chip.dataset.filter;apply()});render();
