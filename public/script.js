const API_BASE = ""; // same origin (Render / localhost)

// ============================
// AUTH TOKEN
// ============================
const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "/login.html";
}

// ============================
// UPLOAD NOTE
// ============================
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("noteFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a PDF file");
    return;
  }

  const formData = new FormData();
  formData.append("note", file);

  try {
    const res = await fetch(`${API_BASE}/notes/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    alert("Note uploaded successfully ✅");
    fileInput.value = "";
    loadNotes();

  } catch (err) {
    console.error(err);
    alert("Server error while uploading");
  }
});

// ============================
// LOAD NOTES
// ============================
async function loadNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const notes = await res.json();

    const list = document.getElementById("notesList");
    list.innerHTML = "";

    if (notes.length === 0) {
      list.innerHTML = "<p>No notes uploaded yet</p>";
      return;
    }

    notes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note-item";

      div.innerHTML = `
        <p><strong>${note.originalName}</strong></p>
        <a href="${note.fileUrl}" target="_blank">Open PDF</a>
      `;

      list.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load notes");
  }
}

// ============================
// LOAD NOTES ON PAGE LOAD
// ============================
loadNotes();
