// Contact form → Firestore `contactMessages` (create-only, validated by
// firestore.rules in the Bloom project). Read submissions in the Firebase
// console. Falls back to opening the visitor's mail app if saving fails.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Web API keys are public identifiers, not secrets; access is enforced by rules.
const app = initializeApp({
  apiKey: "AIzaSyAhehxTtWfMlvVtfc5o4TW08rA23CIbyuw",
  authDomain: "bloom-fbca6.firebaseapp.com",
  projectId: "bloom-fbca6",
  storageBucket: "bloom-fbca6.firebasestorage.app",
  messagingSenderId: "435251790051",
  appId: "1:435251790051:web:fbe708585696e0264f45d6",
});
const db = getFirestore(app);

const EMAIL = "hamany678@asrkw.com";
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

function show(type, html) {
  statusEl.className = "form-status " + type;
  statusEl.innerHTML = html;
}

function mailtoFallback(d) {
  const body = encodeURIComponent(d.message + "\n\n— " + d.name + (d.email ? " (" + d.email + ")" : ""));
  const subject = encodeURIComponent(d.subject || "Message from asrkw.com");
  show("err", `Couldn't send from the site — opening your email app instead. Or write to <a href="mailto:${EMAIL}">${EMAIL}</a>.`);
  location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
}

if (form && statusEl) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // Bots fill the hidden field; pretend success and drop it.
    if (form.website.value) { form.reset(); show("ok", "Thank you — your message has been sent."); return; }

    const d = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };
    if (!d.name) return show("err", "Please enter your name.");
    if (!emailOk(d.email)) return show("err", "Please enter a valid email address.");
    if (d.message.length < 5) return show("err", "Please write a short message.");

    const btn = form.querySelector('button[type="submit"]');
    const label = btn.textContent;
    btn.textContent = "Sending…";
    btn.disabled = true;
    try {
      await addDoc(collection(db, "contactMessages"), {
        name: d.name,
        email: d.email,
        topic: d.subject.slice(0, 150),
        message: d.message,
        page: location.pathname,
        createdAt: serverTimestamp(),
      });
      form.reset();
      show("ok", "Thank you — your message has been sent. We’ll reply by email soon.");
    } catch (err) {
      console.error(err);
      mailtoFallback(d);
    } finally {
      btn.textContent = label;
      btn.disabled = false;
    }
  });
}
