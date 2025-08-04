document.addEventListener('DOMContentLoaded', () => {

    // --- DADOS MOCADOS (SIMULAÇÃO DE BANCO DE DADOS) ---
    const users = {
        client: {
            name: "Pedro",
            avatar: "https://i.pravatar.cc/150?u=pedro",
            type: 'client'
        },
        provider: {
            name: "João",
            avatar: "https://i.pravatar.cc/150?u=joao",
            type: 'provider',
            profession: "Encanador",
            rate: 55.00,
            rating: 4.8,
            bio: "Encanador profissional com 10 anos de experiência em reparos residenciais e comerciais. Rápido, eficiente e confiável.",
            services: ["Reparos de vazamento", "Instalação de torneiras", "Desentupimento", "Manutenção preventiva"]
        }
    };

    const jobs = [
        { id: 1, title: "Faxineiro para Apartamento", location: "Recife, Boa Viagem", price: 20.00, description: "Preciso de uma limpeza pesada em um apartamento de 2 quartos.", providerName: "Maria Silva", providerAvatar: "https://i.pravatar.cc/150?u=maria", rating: 4.9, profession: "Diarista" },
        { id: 2, title: "Eletricista Urgente", location: "Recife, Casa Forte", price: 80.00, description: "Curto-circuito no quadro de luz. Necessito de atendimento imediato.", providerName: "Carlos Souza", providerAvatar: "https://i.pravatar.cc/150?u=carlos", rating: 4.7, profession: "Eletricista" },
        { id: 3, title: "Montador de Móveis", location: "Olinda, Bairro Novo", price: 45.00, description: "Montagem de um guarda-roupa e uma estante.", providerName: "Ana Pereira", providerAvatar: "https://i.pravatar.cc/150?u=ana", rating: 5.0, profession: "Montador" }
    ];
    
    let currentUser = null;
    let currentView = 'feed'; // feed, jobs, schedule, profile

    // --- ELEMENTOS DO DOM ---
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const loginAsClientBtn = document.getElementById('login-as-client');
    const loginAsProviderBtn = document.getElementById('login-as-provider');

    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    const listTitleEl = document.getElementById('list-title');
    const jobListEl = document.getElementById('job-list');
    const postJobBtn = document.getElementById('post-job-btn');

    const jobDetailModal = document.getElementById('job-detail-modal');
    const createJobModal = document.getElementById('create-job-modal');
    const profileModal = document.getElementById('profile-modal');
    const scheduleModal = document.getElementById('schedule-modal');
    const ratingModal = document.getElementById('rating-modal');
    
    const emergencyBtn = document.getElementById('emergency-btn');

    // --- INICIALIZAÇÃO DO MAPA (LEAFLET.JS) ---
    const map = L.map('map').setView([-8.0578, -34.8829], 13); // Coordenadas de Recife
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- FUNÇÕES PRINCIPAIS ---

    function login(userType) {
        currentUser = users[userType];
        loginScreen.classList.remove('active');
        appScreen.classList.add('active');
        setupUIForUser();
    }
    
    function setupUIForUser() {
        userNameEl.textContent = currentUser.name;
        userAvatarEl.src = currentUser.avatar;

        if (currentUser.type === 'client') {
            listTitleEl.textContent = 'Profissionais Disponíveis';
            postJobBtn.style.display = 'block';
            document.getElementById('nav-jobs-text').textContent = 'Meus Pedidos';
            document.getElementById('nav-schedule').style.display = 'none';
            renderProfessionals();
        } else { // provider
            listTitleEl.textContent = 'Vagas Próximas';
            postJobBtn.style.display = 'none';
            document.getElementById('nav-jobs-text').textContent = 'Meus Serviços';
            document.getElementById('nav-schedule').style.display = 'flex';
            renderJobs();
        }
    }

    function renderJobs() {
        jobListEl.innerHTML = '';
        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <img src="${job.providerAvatar}" alt="${job.providerName}" class="job-card-avatar">
                <div class="job-card-info">
                    <h3>${job.title}</h3>
                    <p>${job.location}</p>
                    <p>⭐ ${job.rating}</p>
                </div>
                <div class="job-card-price">R$${job.price.toFixed(2)}/h</div>
            `;
            card.onclick = () => showJobDetails(job);
            jobListEl.appendChild(card);
            // Adiciona marcador no mapa
            L.marker([-8.0578 + (Math.random() - 0.5) * 0.1, -34.8829 + (Math.random() - 0.5) * 0.1])
             .addTo(map).bindPopup(`<b>${job.title}</b><br>R$${job.price.toFixed(2)}/h`).openPopup();
        });
    }

    function renderProfessionals() {
        jobListEl.innerHTML = '';
        // Simulação de lista de profissionais
        const professionals = [users.provider, ...jobs.map(j => ({...j, name: j.providerName, avatar: j.providerAvatar, rate: j.price}))];
        professionals.forEach(prof => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <img src="${prof.avatar}" alt="${prof.name}" class="job-card-avatar">
                <div class="job-card-info">
                    <h3>${prof.name} - ${prof.profession}</h3>
                    <p>⭐ ${prof.rating || 'Novo'}</p>
                </div>
                <div class="job-card-price">R$${(prof.rate || prof.price).toFixed(2)}/h</div>
            `;
            card.onclick = () => showProviderDetails(prof);
            jobListEl.appendChild(card);
        });
    }

    function showJobDetails(job) {
        const modalBody = jobDetailModal.querySelector('#modal-body');
        modalBody.innerHTML = `
            <h2>${job.title}</h2>
            <p><strong>Local:</strong> ${job.location}</p>
            <div class="job-price">R$${job.price.toFixed(2)} por hora</div>
            <p>${job.description}</p>
            <hr>
            <h4>Oferecido por: ${job.providerName}</h4>
            <p>Avaliação: ⭐ ${job.rating}</p>
            ${currentUser.type === 'provider' ? 
                '<button class="btn-primary" onclick="alert(\'Você aceitou este serviço! O cliente será notificado.\'); closeAllModals(); startService();">Aceitar Serviço</button>' : 
                '<p><i>Aguardando um profissional aceitar.</i></p>'}
        `;
        jobDetailModal.classList.add('active');
    }

    function showProviderDetails(prof) {
        const modalBody = jobDetailModal.querySelector('#modal-body');
        modalBody.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                <img src="${prof.avatar}" style="width: 80px; height: 80px; border-radius: 50%;">
                <div>
                    <h2>${prof.name}</h2>
                    <p><strong>${prof.profession}</strong> | ⭐ ${prof.rating || 'Novo'}</p>
                </div>
            </div>
            <div class="job-price">R$${(prof.rate || prof.price).toFixed(2)} por hora</div>
            <p>${prof.bio || 'Profissional da nossa plataforma.'}</p>
            <div class="job-tags">${(prof.services || []).map(s => `<span>${s}</span>`).join('')}</div>
            <hr>
            ${currentUser.type === 'client' ? 
            `
                <div class="negotiation">
                    <p>Proposta inicial: R$${(prof.rate || prof.price).toFixed(2)}/h. Você pode tentar negociar:</p>
                    <input type="number" placeholder="Sua contraproposta" class="input-field" style="width: auto;"/>
                    <button class="btn-secondary" onclick="alert('Proposta enviada! Aguarde a resposta de ${prof.name}.')">Negociar</button>
                </div>
                <button class="btn-primary" style="margin-top: 15px;" onclick="alert('Serviço solicitado! ${prof.name} foi notificado.'); closeAllModals(); startService();">Contratar Agora</button>
            ` : ''}
        `;
        jobDetailModal.classList.add('active');
    }
    
    function startService() {
        // Simula o início de um serviço, mostrando o botão de emergência
        emergencyBtn.style.display = 'block';
        alert('SERVIÇO INICIADO! Por segurança, o botão de emergência está ativo.');
        // Após um tempo, simula o fim do serviço
        setTimeout(() => {
            emergencyBtn.style.display = 'none';
            alert('Serviço finalizado! Hora de avaliar a experiência.');
            showRatingModal();
        }, 10000); // 10 segundos para demonstração
    }

    function showRatingModal() {
        const title = ratingModal.querySelector('#rating-title');
        const desc = ratingModal.querySelector('#rating-description');
        if (currentUser.type === 'client') {
            title.textContent = "Avaliar João (Prestador)";
            desc.textContent = "Como foi o serviço prestado?";
        } else {
            title.textContent = "Avaliar Pedro (Contratante)";
            desc.textContent = "Como foi a sua experiência com o contratante?";
        }
        ratingModal.classList.add('active');
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    }

    // --- EVENT LISTENERS ---

    loginAsClientBtn.addEventListener('click', () => {
        loginAsClientBtn.classList.add('selected');
        loginAsProviderBtn.classList.remove('selected');
    });

    loginAsProviderBtn.addEventListener('click', () => {
        loginAsProviderBtn.classList.add('selected');
        loginAsClientBtn.classList.remove('selected');
    });
    
    document.querySelector('.login-form .btn-primary').addEventListener('click', () => {
        if (loginAsClientBtn.classList.contains('selected')) {
            login('client');
        } else if (loginAsProviderBtn.classList.contains('selected')) {
            login('provider');
        } else {
            alert('Por favor, selecione um tipo de usuário para entrar.');
        }
    });

    postJobBtn.addEventListener('click', () => createJobModal.classList.add('active'));

    document.getElementById('nav-profile').addEventListener('click', () => {
         const profileBody = profileModal.querySelector('#profile-body');
         profileBody.innerHTML = `
            <img src="${currentUser.avatar}" style="width: 100px; height: 100px; border-radius: 50%; display: block; margin: 0 auto 20px;">
            <h2>${currentUser.name}</h2>
            <p><strong>Tipo de Conta:</strong> ${currentUser.type === 'client' ? 'Contratante' : 'Prestador'}</p>
            ${currentUser.type === 'provider' ? `<p><strong>Profissão:</strong> ${currentUser.profession}</p><p><strong>Valor/h:</strong> R$${currentUser.rate.toFixed(2)}</p>` : ''}
            <button class="btn-primary" style="margin-top: 20px;">Editar Perfil</button>
            <button class="btn-secondary" style="margin-top: 10px; background-color: #6c757d;">Documentos e Verificação</button>
            <button class="btn-secondary" style="margin-top: 10px; background-color: #dc3545;" onclick="window.location.reload()">Sair</button>
         `;
         profileModal.classList.add('active');
    });

    document.getElementById('nav-schedule').addEventListener('click', () => {
        if(currentUser.type === 'provider') {
            scheduleModal.classList.add('active');
        }
    });
    
    emergencyBtn.addEventListener('click', () => {
        alert('ALERTA DE EMERGÊNCIA ATIVADO! Seus contatos de emergência e nossa central foram notificados. Se estiver em perigo, ligue para a polícia.');
    });

    // Fechar modais
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Lógica para o formulário de avaliação
    ratingModal.querySelector('#rating-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Avaliação enviada com sucesso! Obrigado pelo feedback.');
        closeAllModals();
    });
    
    // Lógica para as estrelas da avaliação
    document.querySelectorAll('.star-rating span').forEach(star => {
        star.addEventListener('click', (e) => {
            const parent = e.target.parentElement;
            const stars = Array.from(parent.children);
            const index = stars.indexOf(e.target);
            stars.forEach((s, i) => {
                s.classList.toggle('selected', i <= index);
            });
        });
    });
});