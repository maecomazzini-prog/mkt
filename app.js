
const menuBtn=document.querySelector('[data-menu]');
const sidebar=document.querySelector('.sidebar');
if(menuBtn){menuBtn.addEventListener('click',()=>sidebar.classList.toggle('open'))}
document.querySelectorAll('.nav a').forEach(a=>{
  if(a.getAttribute('href').split('/').pop()===location.pathname.split('/').pop() || (location.pathname.endsWith('/') && a.getAttribute('href')==='index.html')) a.classList.add('active');
  a.addEventListener('click',()=>sidebar.classList.remove('open'));
});
