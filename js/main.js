// Replace these placeholders with your real business contacts.
const CONFIG = {
  whatsapp: "", // e.g. international number without +
  telegram: "", // e.g. username without @
  email: ""     // e.g. hello@example.com
};
const menu = document.querySelector('#menu');
const toggle = document.querySelector('.burger');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});
let selectedChannel = 'whatsapp';
document.querySelectorAll('[data-channel]').forEach(a => a.addEventListener('click', () => {
  selectedChannel = a.dataset.channel;
}));
const form = document.querySelector('#request');
const status = document.querySelector('#status');
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const name = String(fields.get('name')).trim();
  const contact = String(fields.get('contact')).trim();
  if (!name || !contact) {
    status.textContent = 'Укажите имя и способ связи.';
    return;
  }
  const msg = `Здравствуйте! Хочу обсудить разработку сайта.\nИмя: ${name}\nКонтакт: ${contact}\nУслуга: ${fields.get('service')}\nОписание: ${fields.get('message') || 'Не указано'}`;
  let url;
  if (selectedChannel === 'whatsapp' && CONFIG.whatsapp) {
    url = `https://wa.me/${CONFIG.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
  } else if (selectedChannel === 'telegram' && CONFIG.telegram) {
    url = `https://t.me/${CONFIG.telegram.replace(/^@/,'')}`;
    // Telegram web profile cannot prefill messages reliably; copy message first.
    navigator.clipboard?.writeText(msg).catch(() => {});
  } else if (selectedChannel === 'email' && CONFIG.email) {
    url = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Заявка с сайта neKerek')}&body=${encodeURIComponent(msg)}`;
  } else {
    status.textContent = 'Контакты пока не настроены. Текст заявки можно скопировать ниже.';
    const area = document.createElement('textarea');
    area.value = msg;
    area.readOnly = true;
    area.setAttribute('aria-label', 'Текст заявки для копирования');
    area.style.marginTop = '12px';
    const previous = form.querySelector('.fallback-message');
    if (previous) previous.remove();
    area.className = 'fallback-message';
    form.append(area);
    area.select();
    return;
  }
  status.textContent = 'Открываем выбранный способ связи. Отправьте сообщение самостоятельно.';
  if (url.startsWith('mailto:')) location.href = url;
  else window.open(url, '_blank', 'noopener,noreferrer');
});
