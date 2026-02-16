document.addEventListener('DOMContentLoaded', () => {
    const projectContainer = document.getElementById('project-container');
    const filterChips = document.getElementById('filter-chips');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    let allProjects = [];

    // --- Theme Toggle ---
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.classList.add(savedTheme);

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
    });

    // --- Fetch & Render Projects ---
    async function fetchProjects() {
        try {
            const response = await fetch('data/projects.json');
            allProjects = await response.json();
            renderProjects(allProjects);
            setupFilters(allProjects);
        } catch (error) {
            console.error('Error fetching projects:', error);
            projectContainer.innerHTML = '<p class="error">Failed to load projects. Please try again later.</p>';
        }
    }

    function renderProjects(projects) {
        projectContainer.innerHTML = '';

        projects.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-card fade-in';
            card.style.animationDelay = `${index * 0.1}s`;

            const tagsHtml = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            const linksHtml = project.links.map(link =>
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-btn">${link.label}</a>`
            ).join('');

            card.innerHTML = `
                <div class="project-img">
                    <img src="${project.screenshot}" alt="${project.name}" onerror="this.src='https://via.placeholder.com/400x200?text=${encodeURIComponent(project.name)}'">
                </div>
                <div class="project-content">
                    <div class="project-tags">${tagsHtml}</div>
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    <div class="project-links">${linksHtml}</div>
                </div>
            `;
            projectContainer.appendChild(card);
        });
    }

    // --- Filtering ---
    function setupFilters(projects) {
        const tags = new Set(['all']);
        projects.forEach(p => p.tags.forEach(t => tags.add(t)));

        filterChips.innerHTML = '';
        tags.forEach(tag => {
            const chip = document.createElement('button');
            chip.className = `chip ${tag === 'all' ? 'active' : ''}`;
            chip.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            chip.dataset.filter = tag;

            chip.addEventListener('click', () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const filtered = tag === 'all'
                    ? allProjects
                    : allProjects.filter(p => p.tags.includes(tag));
                renderProjects(filtered);
            });

            filterChips.appendChild(chip);
        });
    }

    // --- Scroll Reveal ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.projects-section').forEach(el => observer.observe(el));

    // Initialize
    fetchProjects();
});
