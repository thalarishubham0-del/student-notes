/* ================= TOKEN ================= */
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

/* ================= LOAD NOTES ================= */
async function loadNotes() {
  try {
    const res = await fetch("/notes", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const notes = await res.json();
    const container = document.getElementById("notesList");
    container.innerHTML = "";

    if (!Array.isArray(notes)) return;

    notes.forEach(note => {
      const div = document.createElement("div");
      div.className = "note";

      div.innerHTML = `
        <p>${note.filename}</p>
        <a href="${note.fileUrl}" target="_blank">Open</a>
        <button onclick="deleteNote('${note._id}')">Delete</button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
  }
}

/* ================= DELETE ================= */
async function deleteNote(id) {
  if (!confirm("Delete this file?")) return;

  await fetch(`/notes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadNotes();
}

/* ================= UPLOAD ================= */
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // 🚨 THIS WAS YOUR BIGGEST BUG

  const fileInput = document.getElementById("fileInput");
  if (!fileInput.files.length) {
    alert("Select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const res = await fetch("/notes/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    fileInput.value = "";
    loadNotes();
    alert("Uploaded successfully ✅");

  } catch (err) {
    console.error(err);
    alert("Upload error ❌");
  }
});

/* ================= AUTO LOAD ================= */
document.addEventListener("DOMContentLoaded", loadNotes);
