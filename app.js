async function loadDatabase() {
  const response = await fetch("workouts.json"); // agora funciona
  const data = await response.json();
  return data;
}

async function generateWorkout() {
  const category = document.getElementById("category").value;
  const level = document.getElementById("level").value;
  const duration = document.getElementById("duration").value;

  const db = await loadDatabase();

  const treino = db[category][level][duration];

  const workoutContent = document.getElementById("workout-content");
  const videoThumbnail = document.getElementById("video-thumbnail");

  let html = "<ul class='workout-list'>";
  treino.exercicios.forEach(ex => {
    html += `<li>${ex}</li>`;
  });
  html += "</ul>";

  workoutContent.innerHTML = html;

  // vídeo
  videoThumbnail.setAttribute("data-video", treino.video);
  videoThumbnail.style.display = "flex";

  function gerarThumbnail(url) {
  if (url.includes("youtube")) {
    const id = url.split("v=")[1];
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
}

}

document.getElementById("cta-button").addEventListener("click", generateWorkout);

document.getElementById("video-thumbnail").addEventListener("click", () => {
  const url = document
    .getElementById("video-thumbnail")
    .getAttribute("data-video");

  window.open(url, "_blank");
});
