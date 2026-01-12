const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("noteFile");
const notesList = document.getElementById("notesList");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return alert("Choose a file");

  const data = new FormData();
  data.append("file", file);

  try {
   const token = localStorage.getItem("token");

const res = await fetch("/notes/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: data
});

    if (!res.ok) throw new Error("Upload failed");

    loadNotes();
    form.reset();
  } catch (err) {
    alert("Upload error");
    console.error(err);
  }
});

async function loadNotes() {
  const res = await fetch("/notes");
  const notes = await res.json();

  notesList.innerHTML = "";
 notes.forEach(n => {
  const isPDF = n.filename.toLowerCase().endsWith(".pdf");

  // 🔥 FORCE PDF INLINE VIEW
  const pdfUrl = n.url;
  notesList.innerHTML += `
  <div class="note-card">
    <p>${n.filename}</p>

    <div class="note-actions">
      ${
        isPDF
          ? `<a href="${pdfUrl}" target="_blank" rel="noopener">Open</a>`
          : `<a href="${n.url}" target="_blank" rel="noopener">Open</a>`
      }

      <button class="delete-btn" onclick="deleteNote('${n._id}')">
        Delete
      </button>
    </div>
  </div>
`;
});
}
async function loadUser() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const user = await res.json();
  document.getElementById("username").innerText = user.name;
}
async function loadUser() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return; // ⬅ prevents HTML crash

  const user = await res.json();
  document.getElementById("username").innerText = user.name;
}
loadUser();
loadNotes();
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html"; 
}
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login.html"; // or "/" if same page
});
async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;

  try {
    const res = await fetch(`/notes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Delete failed");

    loadNotes(); // refresh list
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
}

