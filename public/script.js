document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // GLOBAL STATE
  // =========================
  let allNotes = [];
  let userId = null;
  let userName = "";
  let userEmail = "";

  // =========================
  // TOKEN HANDLING
  // =========================
  function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id;
      userName = payload.name || "Student";
      userEmail = payload.email || "";
    } catch (err) {
      console.error("Invalid token");
    }
  }

  // =========================
  // SET USER INFO
  // =========================
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");

  if (userNameEl) userNameEl.textContent = userName;
  if (userEmailEl) userEmailEl.textContent = userEmail;

  // =========================
  // UI ACTIONS
  // =========================
  window.toggleDarkMode = function () {
    document.body.classList.toggle("dark");
  };

  window.toggleSidebar = function () {
    document.getElementById("sidebar").classList.toggle("collapsed");
  };

  window.logout = function () {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  };

  // =========================
  // LOAD NOTES
  // =========================
  async function loadNotes() {
    try {
      const res = await fetch("/notes/all");
      allNotes = await res.json();

      document.getElementById("totalNotes").textContent = allNotes.length;
      document.getElementById("myNotes").textContent =
        allNotes.filter(n => {
          const ownerId = n.userId && (n.userId._id || n.userId);
          return ownerId === userId;
        }).length;

      renderNotes();
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  }

  // =========================
  // RENDER NOTES
  // =========================
  function renderNotes() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const sort = document.getElementById("sortSelect").value;
    const notesList = document.getElementById("notesList");

    let notes = allNotes.filter(note =>
      note.originalName.toLowerCase().includes(search)
    );

    if (sort === "name") {
      notes.sort((a, b) => a.originalName.localeCompare(b.originalName));
    } else {
      notes.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }

    notesList.innerHTML = "";

    notes.forEach(note => {
      const card = document.createElement("div");
      card.className = "note-card";

      card.innerHTML = `
        <a href="/uploads/${note.filename}" target="_blank">
          ${note.originalName}
        </a>
        <small>
          Uploaded by: ${
            note.userId && note.userId.name
              ? note.userId.name
              : "Student"
          }
        </small>
      `;

      const ownerId = note.userId && (note.userId._id || note.userId);

      // ✅ DELETE ONLY FOR OWNER
      if (getToken() && ownerId === userId) {
        const delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteNote(note._id);
        card.appendChild(delBtn);
      }

      notesList.appendChild(card);
    });
  }

  // =========================
  // UPLOAD NOTE (WORKING)
  // =========================
  window.uploadNote = async function () {
    const token = getToken();

    if (!token) {
      alert("Please login again");
      window.location.href = "/login.html";
      return;
    }

    const fileInput = document.getElementById("fileInput");
    if (!fileInput || fileInput.files.length === 0) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("note", fileInput.files[0]);

    try {
      const res = await fetch("/notes/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Upload failed");
        return;
      }

      fileInput.value = "";
      loadNotes();

    } catch (err) {
      console.error("Upload error:", err);
      alert("Server error during upload");
    }
  };

  // =========================
  // DELETE NOTE (WORKING)
  // =========================
  async function deleteNote(id) {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      loadNotes();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  // =========================
  // EVENTS
  // =========================
  document.getElementById("searchInput").addEventListener("input", renderNotes);
  document.getElementById("sortSelect").addEventListener("change", renderNotes);

  // =========================
  // INIT
  // =========================
  loadNotes();
});
