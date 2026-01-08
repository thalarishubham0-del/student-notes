const API_BASE = "https://student-notes-zukx.onrender.com";

/* ================= UPLOAD PDF ================= */
async function uploadPDF() {
  const fileInput = document.getElementById("pdfInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please choose a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file); // 🔴 MUST BE "file"

  try {
    const res = await fetch(`${API_BASE}/notes/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    alert("File uploaded successfully");
    fileInput.value = "";
    loadNotes();
  } catch (err) {
    alert("Server error during upload");
    console.error(err);
  }
}

/* ================= LOAD NOTES ================= */
async function loadNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const notes = await res.json();
    const notesList = document.getElementById("notesList");
    notesList.innerHTML = "";

    notes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note-card";

      div.innerHTML = `
        <p>${note.originalName}</p>
        <a href="${note.fileUrl}" target="_blank">Open</a>
        <button onclick="deleteNote('${note._id}')">Delete</button>
      `;

      notesList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

/* ================= DELETE NOTE ================= */
async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;

  await fetch(`${API_BASE}/notes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  loadNotes();
}

/* ================= AUTO LOAD ================= */
document.addEventListener("DOMContentLoaded", loadNotes);
