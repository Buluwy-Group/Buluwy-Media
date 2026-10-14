/* ===== CONFIGURAÇÃO (editar aqui) ===== */
const CONFIG = {
  brand: "Buluwy Media",
  // Formato internacional, só dígitos, sem + nem espaços. Ex.: "258XXXXXXXXX"
  // Enquanto estiver vazio, o WhatsApp fica desactivado e o visitante é encaminhado para o e-mail/Instagram.
  whatsappNumber: "", // PLACEHOLDER: número comercial por confirmar
  email: "buluwy.su@gmail.com",
  instagram: "https://www.instagram.com/buluwy_official/"
};
/* ====================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const hasWa = () => /^\d{8,15}$/.test(CONFIG.whatsappNumber);
const waUrl = (text) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

/* Ano automático */
$("#year").textContent = new Date().getFullYear();

/* Menu mobile */
const burger = $("#burger"), menu = $("#menu");
const setMenu = (open) => {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
};
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* Header adaptativo + botão topo */
const header = $("#header"), topBtn = $("#top");
const onScroll = () => {
  header.classList.toggle("solid", scrollY > 40);
  topBtn.classList.toggle("show", scrollY > 600);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();
topBtn.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* Animações de entrada */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("in"));
}

/* Filtros do portfólio */
$$(".chip").forEach((chip) => chip.addEventListener("click", () => {
  $$(".chip").forEach((c) => c.classList.remove("on"));
  chip.classList.add("on");
  const f = chip.dataset.f;
  $$(".work").forEach((w) => { w.hidden = f !== "all" && w.dataset.c !== f; });
}));

/* Ligações de WhatsApp */
const note = $("#note");
const greeting = `Olá, ${CONFIG.brand}! Gostaria de falar sobre um projecto.`;
[$("#ctaWa"), $("#waLink"), $("#waFloat")].forEach((a) => {
  if (hasWa()) { a.href = waUrl(greeting); }
  else {
    a.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Contacto através do website")}`;
    a.removeAttribute("target");
    a.title = "WhatsApp ainda não configurado. A abrir e-mail.";
  }
});

/* Serviço pré-seleccionado a partir dos cartões */
$$(".cta[data-service]").forEach((a) => a.addEventListener("click", () => {
  $("select[name=servico]").value = a.dataset.service;
}));

/* Formulário: validação + mensagem para WhatsApp */
const form = $("#form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  $$("[required]", form).forEach((f) => {
    const err = f.parentElement.querySelector(".err");
    const empty = !f.value.trim();
    f.classList.toggle("invalid", empty);
    if (err) err.textContent = empty ? "Campo obrigatório." : "";
    if (empty) ok = false;
  });
  const c = form.contacto;
  if (c.value.trim()) {
    const valid = /^\S+@\S+\.\S+$/.test(c.value.trim()) || /^[+\d][\d\s-]{6,}$/.test(c.value.trim());
    c.classList.toggle("invalid", !valid);
    c.nextElementSibling.textContent = valid ? "" : "Indica um e-mail ou telefone válido.";
    if (!valid) ok = false;
  }
  if (!ok) { note.textContent = "Verifica os campos assinalados."; return; }

  const d = new FormData(form);
  const msg = [
    `Olá, ${CONFIG.brand}!`,
    `Nome: ${d.get("nome")}`,
    d.get("empresa") ? `Empresa/Marca: ${d.get("empresa")}` : "",
    `Contacto: ${d.get("contacto")}`,
    `Serviço: ${d.get("servico")}`,
    `Projecto: ${d.get("descricao")}`
  ].filter(Boolean).join("\n");

  if (hasWa()) {
    note.textContent = "A abrir o WhatsApp…";
    open(waUrl(msg), "_blank", "noopener");
  } else {
    note.innerHTML = `O WhatsApp comercial ainda não está disponível. Por favor, contacta-nos por <a href="mailto:${CONFIG.email}?subject=${encodeURIComponent("Pedido de orçamento")}&body=${encodeURIComponent(msg)}" style="text-decoration:underline">e-mail</a> ou pelo <a href="${CONFIG.instagram}" target="_blank" rel="noopener" style="text-decoration:underline">Instagram</a>.`;
  }
});
