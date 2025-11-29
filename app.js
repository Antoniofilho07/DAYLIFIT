async function loadDatabase() {
  const response = await fetch("workouts.json");
  const data = await response.json();
  return data;
}

function gerarThumbnail(url) {
  let id = "";
  // Suporta links completos (youtube.com) e curtos (youtu.be)
  if (url.includes("v=")) {
    id = url.split("v=")[1].split("&")[0]; // Pega o ID mesmo se houver outros parâmetros
  } else if (url.includes("youtu.be/")) {
    id = url.split("youtu.be/")[1].split("?")[0];
  }
  
  if (id) {
    // 'hqdefault' é uma qualidade boa para thumbnails padrão
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}

async function generateWorkout() {
  const category = document.getElementById("category").value;
  const level = document.getElementById("level").value;
  const duration = document.getElementById("duration").value;

  const db = await loadDatabase();
  
  // Verifica se o treino existe no banco de dados
  if (!db[category] || !db[category][level] || !db[category][level][duration]) {
    alert("Treino não encontrado para esta combinação. Tente outra!");
    return;
  }

  const treino = db[category][level][duration];

  const workoutContent = document.getElementById("workout-content");
  const videoThumbnail = document.getElementById("video-thumbnail");
  const workoutTitle = document.getElementById("workout-title");

  // Atualiza título e lista
  workoutTitle.innerText = `Treino de ${category} (${duration} min)`;
  
  let html = "<ul class='workout-list'>";
  treino.exercicios.forEach(ex => {
    html += `<li>${ex}</li>`;
  });
  html += "</ul>";
  workoutContent.innerHTML = html;

  // Lógica da Thumbnail (Capa Bonitinha)
  if (treino.video) {
    const thumbUrl = gerarThumbnail(treino.video);
    
    if (thumbUrl) {
      videoThumbnail.style.backgroundImage = `url('${thumbUrl}')`;
      videoThumbnail.style.backgroundSize = "cover"; // Cobre toda a área
      videoThumbnail.style.backgroundPosition = "center"; // Centraliza a imagem
    }
    
    // Guarda o link para abrir ao clicar
    videoThumbnail.setAttribute("data-video", treino.video);
    videoThumbnail.style.display = "flex"; // Mostra a div do vídeo
  } else {
    videoThumbnail.style.display = "none";
  }
}

// Event Listeners
document.getElementById("cta-button").addEventListener("click", generateWorkout);

document.getElementById("video-thumbnail").addEventListener("click", () => {
  const url = document.getElementById("video-thumbnail").getAttribute("data-video");
  if (url) window.open(url, "_blank");
});