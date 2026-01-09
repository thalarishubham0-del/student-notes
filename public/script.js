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
    const res = await fetch("/notes/upload", {
      method: "POST",
      body: data
    });

    if (!res.ok) throw new Error("Upload failed");

    loadNotes();
    form.reset();
  } catch (err) {
    alert("Upload error");
  }
});

async function loadNotes() {
  const res = await fetch("/notes");
  const notes = await res.json();

  notesList.innerHTML = "";
  notes.forEach(n => {
    notesList.innerHTML += `
      <div>
        <a href="${n.url}" target="_blank">${n.filename}</a>
      </div>
    `;
  });
}

loadNotes();
