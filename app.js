// --- Gerenciamento do Banco de Dados ---
async function loadDatabase() {
  const response = await fetch("workouts.json");
  const data = await response.json();
  return data;
}

// --- Gerenciamento do Histórico (LocalStorage) ---
const HISTORY_KEY = "dailyfit_user_data";

function getHistory() {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : {
    totalWorkouts: 0,
    totalMinutes: 0,
    streak: 0,
    lastWorkoutDate: null,
    categoryStats: {},
    logs: [] // Lista dos últimos treinos
  };
}

function saveHistory(category, duration) {
  const data = getHistory();
  const today = new Date().toDateString();
  
  // 1. Atualiza totais
  data.totalWorkouts++;
  data.totalMinutes += parseInt(duration);

  // 2. Atualiza Categoria
  if (!data.categoryStats[category]) {
    data.categoryStats[category] = 0;
  }
  data.categoryStats[category]++;

  // 3. Atualiza Streak (Dias Consecutivos)
  if (data.lastWorkoutDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Se o último treino foi ontem, aumenta o streak
    if (data.lastWorkoutDate === yesterday.toDateString()) {
      data.streak++;
    } 
    // Se não foi hoje nem ontem (quebrou a sequência), reseta para 1
    else {
      data.streak = 1;
    }
    
    data.lastWorkoutDate = today;
  }

  // 4. Log detalhado
  data.logs.unshift({
    date: new Date().toLocaleDateString('pt-BR'),
    category: category,
    duration: duration
  });
  
  // Mantém apenas os últimos 10 logs para não encher a memória
  if (data.logs.length > 10) data.logs.pop();

  localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
  
  alert(`Parabéns! Treino de ${duration} min concluído e salvo! 🔥`);
  updateProfileUI(); // Atualiza a tela de perfil
}

// --- Funções de Interface ---

function gerarThumbnail(url) {
  let id = "";
  if (url.includes("v=")) {
    id = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    id = url.split("youtu.be/")[1].split("?")[0];
  }
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return null;
}

async function generateWorkout() {
  const categorySelect = document.getElementById("category");
  const levelSelect = document.getElementById("level");
  const durationSelect = document.getElementById("duration");

  const category = categorySelect.value;
  const level = levelSelect.value;
  const duration = durationSelect.value;

  const db = await loadDatabase();

  if (!db[category] || !db[category][level] || !db[category][level][duration]) {
    alert("Treino não encontrado para esta combinação.");
    return;
  }

  const treino = db[category][level][duration];

  // Exibe a seção de treino
  document.getElementById("workout-section").style.display = "block";
  
  const workoutTitle = document.getElementById("workout-title");
  const workoutContent = document.getElementById("workout-content");
  const videoThumbnail = document.getElementById("video-thumbnail");
  const finishButton = document.getElementById("finish-button");

  // Atualiza Texto
  workoutTitle.innerText = `${category.toUpperCase()} - ${level} (${duration} min)`;

  // Lista de Exercícios
  let html = "<ul class='workout-list'>";
  treino.exercicios.forEach(ex => {
    html += `<li>${ex}</li>`;
  });
  html += "</ul>";
  workoutContent.innerHTML = html;

  // Vídeo
  if (treino.video) {
    const thumbUrl = gerarThumbnail(treino.video);
    if (thumbUrl) {
      videoThumbnail.style.backgroundImage = `url('${thumbUrl}')`;
      videoThumbnail.style.backgroundSize = "cover";
      videoThumbnail.style.backgroundPosition = "center";
    }
    videoThumbnail.setAttribute("data-video", treino.video);
    videoThumbnail.style.display = "flex";
  } else {
    videoThumbnail.style.display = "none";
  }

  // Configura o botão de concluir
  // Removemos event listeners antigos clonando o botão
  const newBtn = finishButton.cloneNode(true);
  finishButton.parentNode.replaceChild(newBtn, finishButton);
  
  newBtn.addEventListener("click", () => {
    saveWorkoutAndReset(category, duration);
  });
}

function saveWorkoutAndReset(category, duration) {
  saveHistory(category, duration);
  // Opcional: Esconder o treino após concluir
  document.getElementById("workout-section").style.display = "none";
  // Rolar para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProfileUI() {
  const data = getHistory();
  
  document.getElementById("stat-streak").innerText = data.streak;
  document.getElementById("stat-workouts").innerText = data.totalWorkouts;
  document.getElementById("stat-minutes").innerText = data.totalMinutes;

  // Calcula categoria favorita
  let favCategory = "-";
  let maxCount = 0;
  for (const [cat, count] of Object.entries(data.categoryStats)) {
    if (count > maxCount) {
      maxCount = count;
      favCategory = cat;
    }
  }
  document.getElementById("stat-favorite").innerText = favCategory.charAt(0).toUpperCase() + favCategory.slice(1);

  // Atualiza lista de histórico
  const list = document.getElementById("history-list");
  if (data.logs.length > 0) {
    list.innerHTML = data.logs.map(log => 
      `<li>Run: <strong>${log.category}</strong> (${log.duration} min) - <small>${log.date}</small></li>`
    ).join('');
  }
}

// --- Navegação (Tabs) ---
function switchTab(tab) {
  const homeView = document.getElementById("view-home");
  const profileView = document.getElementById("view-profile");
  const navHome = document.getElementById("nav-home");
  const navProfile = document.getElementById("nav-profile");

  if (tab === 'home') {
    homeView.style.display = 'block';
    profileView.style.display = 'none';
    navHome.classList.add('active');
    navProfile.classList.remove('active');
  } else {
    homeView.style.display = 'none';
    profileView.style.display = 'block';
    navHome.classList.remove('active');
    navProfile.classList.add('active');
    updateProfileUI(); // Carrega dados ao abrir o perfil
  }
}

// --- Event Listeners Globais ---
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cta-button").addEventListener("click", generateWorkout);
  
  document.getElementById("video-thumbnail").addEventListener("click", function() {
    const url = this.getAttribute("data-video");
    if (url) window.open(url, "_blank");
  });

  document.getElementById("nav-home").addEventListener("click", () => switchTab('home'));
  document.getElementById("nav-profile").addEventListener("click", () => switchTab('profile'));
});