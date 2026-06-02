// Team data
const equipo = [
  {
    nombre: "Maira Alejandra Pinilla",
    rol: "Full Stack & Scrum Master",
    descripcion: "Apasionada por crear experiencias digitales únicas combinando diseño y tecnología.",
    foto: window.BASE_URL ? window.BASE_URL + "assets/img/PerfilAle.png" : "../../assets/img/PerfilAle.png",
    linkedin: "https://www.linkedin.com/in/maira-alejandra-pinilla-pinilla-ingenieria-de-sistemas-desarrolladora/",
    github: "https://github.com/Malejandrapin",
    portfolio: "https://malejandrapin.github.io/Alejandra-Pinilla-Portafolio/"
  },
  {
    nombre: "Andrés Díaz Figueroa",
    rol: "Java Full Stack & Cloud Developer",
    descripcion: "Apasionado por la tecnología, el desarrollo de software y la arquitectura cloud.",
    foto: window.BASE_URL ? window.BASE_URL + "assets/img/fotoAndres-removebg-preview.png" : "../../assets/img/fotoAndres-removebg-preview.png",
    linkedin: "https://www.linkedin.com/in/andres-diaz-figueroa-tecnology-innovation-developer-cloud/",
    github: "https://github.com/andresdiazf",
    portfolio: "https://myportfolio-andres-diaz-figueroa.vercel.app/"
  },
  {
    nombre: "Didier Cuan Najas",
    rol: "Full Stack Developer",
    descripcion: "Analista y desarrollador apasionado por tecnología backend y frontend.",
    foto: window.BASE_URL ? window.BASE_URL + "assets/img/fotoDidier .png" : "../../assets/img/fotoDidier .png",
    linkedin: "https://www.linkedin.com/in/didier-alexis-cuan-najas-developer-full-stack/",
    github: "https://github.com/didierNajas",
    portfolio: "https://didiernajas.github.io/Basic-portafolio/"
  },
  {
    nombre: "Zully Tamayo Martinez",
    rol: "Ingeniera Informática y Desarrolladora",
    descripcion: "Apasionada por construir soluciones eficientes y lógica de backend robusta.",
    foto: window.BASE_URL ? window.BASE_URL + "assets/img/fotoZully.png" : "../../assets/img/fotoZully.png",
    linkedin: "https://www.linkedin.com/in/zully-tamayo-martinez-softwaredeveloper",
    github: "https://github.com/zullytamayom",
    portfolio: "https://phenomenal-eclair-9360d4.netlify.app/"
  }
];

// Render team cards
function renderTeam() {
  const teamGrid = document.getElementById('team-grid');
  
  if (!teamGrid) return;

  equipo.forEach(persona => {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    
    teamCard.innerHTML = `
      <div class="team-avatar">
        <img src="${persona.foto}" alt="${persona.nombre}">
      </div>
      <div class="team-info">
        <h3 class="team-name">${persona.nombre}</h3>
        <p class="team-role">${persona.rol}</p>
        <p class="team-description">${persona.descripcion}</p>
        <div class="team-social">
          <a href="${persona.linkedin}" target="_blank" class="social-link" title="LinkedIn">
            <i class="fa-brands fa-linkedin"></i>
          </a>
          <a href="${persona.github}" target="_blank" class="social-link" title="GitHub">
            <i class="fa-brands fa-github"></i>
          </a>
          <a href="${persona.portfolio}" target="_blank" class="social-link" title="Portafolio">
            <i class="fa-solid fa-briefcase"></i>
          </a>
        </div>
      </div>
    `;
    
    teamGrid.appendChild(teamCard);
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderTeam();
});
