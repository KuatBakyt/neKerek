// Business contacts. Telegram can be enabled by adding a username.
const CONFIG = {
  whatsapp: "77476202879", // International format without +
  telegram: "", // e.g. username without @
  email: "kuatbakyt@gmail.com"
};
const menu = document.querySelector('#menu');
const toggle = document.querySelector('.burger');
function closeMenu(returnFocus = false) {
  const wasOpen = menu.classList.contains('open');
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Открыть меню');
  if (returnFocus && wasOpen) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu(true);
});
document.addEventListener('click', e => {
  if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
});
matchMedia('(min-width: 701px)').addEventListener('change', () => closeMenu());
const form = document.querySelector('#request');
const status = document.querySelector('#status');
const channel = form.elements.channel;
function updateChannel() {
  document.querySelectorAll('[data-channel]').forEach(a => {
    a.setAttribute('aria-current', String(a.dataset.channel === channel.value));
  });
  document.querySelector('#delivery-note').textContent = CONFIG[channel.value]
    ? 'Проверьте заявку и отправьте сообщение в открывшемся приложении.'
    : 'Этот канал пока не настроен. Можно подготовить и скопировать текст заявки; он не будет отправлен.';
}
channel.addEventListener('change', updateChannel);
document.querySelectorAll('[data-channel]').forEach(a => a.addEventListener('click', () => {
  channel.value = a.dataset.channel;
  updateChannel();
}));
document.querySelectorAll('[data-service]').forEach(a => a.addEventListener('click', () => {
  form.elements.service.value = a.dataset.service;
}));
updateChannel();
async function copyMessage(message, area) {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(message);
    status.textContent = 'Текст заявки скопирован. Заявка ещё не отправлена.';
  } catch {
    area.focus();
    area.select();
    status.textContent = 'Выделили текст заявки. Скопируйте его вручную.';
  }
}
function showMessage(message) {
  form.querySelector('.request-preview')?.remove();
  const container = document.createElement('div');
  container.className = 'request-preview';
  const area = document.createElement('textarea');
  area.className = 'fallback-message';
  area.value = message;
  area.readOnly = true;
  area.setAttribute('aria-label', 'Текст заявки для копирования');
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'outline copy-request';
  copy.textContent = 'Скопировать заявку';
  copy.addEventListener('click', () => copyMessage(message, area));
  container.append(area, copy);
  form.append(container);
  return area;
}
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
  const selectedChannel = channel.value;
  const area = showMessage(msg);
  let url;
  if (selectedChannel === 'whatsapp' && CONFIG.whatsapp) {
    url = `https://wa.me/${CONFIG.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
  } else if (selectedChannel === 'telegram' && CONFIG.telegram) {
    url = `https://t.me/${CONFIG.telegram.replace(/^@/,'')}`;
    // Telegram web profile cannot prefill messages reliably; copy message first.
    copyMessage(msg, area);
  } else if (selectedChannel === 'email' && CONFIG.email) {
    url = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Заявка с сайта neKerek')}&body=${encodeURIComponent(msg)}`;
  } else {
    status.textContent = 'Контакты пока не настроены. Текст заявки можно скопировать ниже.';
    return;
  }
  status.textContent = 'Открываем выбранный способ связи. Отправьте сообщение самостоятельно.';
  if (url.startsWith('mailto:')) location.href = url;
  else window.open(url, '_blank', 'noopener,noreferrer');
});
