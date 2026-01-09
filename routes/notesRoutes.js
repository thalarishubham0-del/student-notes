/* ======================================================
   GLOBAL HELPERS
====================================================== */

const API_BASE = "https://student-notes-zukx.onrender.com";

/* ======================================================
   AUTH HELPERS
====================================================== */

function getToken() {
  return localStorage.getItem("token");
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    alert("Please login first");
    window.location.href = "/login.html";
    return null;
  }
  return token;
}

/* ======================================================
   LOAD NOTES (SAFE)
====================================================== */

async function loadNotes() {
  const notesList = document.getElementById("notesList");
  if (!notesList) return; // 🚫 page doesn't have notes

  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch notes");

    const data = await res.json();
    const notes = Array.isArray(data) ? data : data.notes;

    notesList.innerHTML = "";

    if (!Array.isArray(notes) || notes.length === 0) {
      notesList.innerHTML = "<p>No notes uploaded yet</p>";
      return;
    }

    notes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note-card";

      div.innerHTML = `
        <p>${note.originalName}</p>
        <a href="${note.fileUrl}" target="_blank">Open</a>
      `;

      notesList.appendChild(div);
    });
  } catch (err) {
    console.error("Load notes error:", err);
  }
}

/* ======================================================
   UPLOAD HANDLER (100% SAFE)
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("noteFile");

  // 🚫 Not dashboard page
  if (!uploadForm || !fileInput) {
    console.log("ℹ️ Upload form not found on this page");
    return;
  }

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🚀 Upload clicked");

    const file = fileInput.files[0];
    if (!file) {
      alert("Please choose a file");
      return;
    }

    const token = requireAuth();
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/notes/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      alert("✅ Upload successful");
      fileInput.value = "";
      loadNotes();
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Upload failed");
    }
  });
});

/* ======================================================
   AUTO LOAD NOTES (SAFE)
====================================================== */

document.addEventListener("DOMContentLoaded", loadNotes);
