document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS & STATE ---
    const content = document.getElementById('content');
    const loader = document.getElementById('loader');
    let profileData = {};

    // --- INITIALIZATION ---
    const init = async () => {
        initParticles();
        await loadData();
        renderAll();
        // Hide loader and fade in content after data is rendered
        setTimeout(() => {
            loader.classList.add('hidden');
            content.classList.remove('hidden');
            setupAnimations();
        }, 500);
    };

    const loadData = async () => {
        try {
            const files = ['personal.json', 'skills.json', 'projects.json', 'blogs.json', 'social.json'];
            const responses = await Promise.all(files.map(file => fetch(`data/${file}`)));
            const [personal, skills, projects, blogs, social] = await Promise.all(responses.map(res => res.json()));
            profileData = { personal, skills, projects, blogs, social };
        } catch (error) {
            console.error("System critical: Failed to load profile data.", error);
        }
    };

    // --- RENDER FUNCTIONS ---
    const renderAll = () => {
        const { personal, skills, projects, blogs, social } = profileData;
        document.getElementById('header-container').innerHTML = `
            <h1 data-scramble>${personal.name}</h1><p>${personal.bio}</p>`;
        document.getElementById('skills-container').innerHTML = `
            <h2 data-scramble>SKILLS MATRIX</h2>${renderSkills(skills)}`;
        document.getElementById('projects-container').innerHTML = `
            <h2 data-scramble>PROJECT DOSSIERS</h2><div class="projects-grid">${renderProjects(projects)}</div>`;
        document.getElementById('blogs-container').innerHTML = `
            <h2 data-scramble>LOGS & WRITINGS</h2>${renderBlogs(blogs)}`;
        document.getElementById('footer-container').innerHTML = 
            Object.entries(social).map(([p, u]) => `<a href="${u}">${p}</a>`).join(' | ');
    };

    const renderSkills = (skills) => {
        let html = '';
        for (const [category, skillList] of Object.entries(skills)) {
            html += `<h3>${category}</h3><div class="skills-grid">`;
            skillList.forEach(skill => {
                // The 'data-scramble' attribute will make each skill animate in
                html += `<span class="skill-tag" data-scramble>${skill}</span>`; 
            });
            html += `</div>`;
        }
        return html;
    };

    const renderProjects = (projects) => {
        return projects.map(p => `
            <div class="project-card">
                <div class="card-inner">
                    <div class="card-front">
                        <h3>${p.title}</h3>
                        <p>${p.status}</p>
                    </div>
                    <div class="card-back">
                        <p>${p.description}</p>
                        <div class="project-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
                        <a href="${p.link}" target="_blank">View Project -></a>
                    </div>
                </div>
            </div>`).join('');
    };

    const renderBlogs = (blogs) => {
        return blogs.map(b => `<p><a href="${b.link}">${b.title}</a> - <em>${b.summary}</em></p>`).join('');
    };
    
    // --- ANIMATION ENGINE ---
    const setupAnimations = () => {
        const scrambleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scrambleText(entry.target);
                    scrambleObserver.unobserve(entry.target);
                }
            });
        });
        document.querySelectorAll('[data-scramble]').forEach(el => scrambleObserver.observe(el));

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.hud-section, .project-card').forEach(el => sectionObserver.observe(el));

        const skillBarObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    bar.style.width = bar.dataset.proficiency + '%';
                    skillBarObserver.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('.skill-bar').forEach(el => skillBarObserver.observe(el));
    };

    const scrambleText = (element) => {
        const originalText = element.textContent;
        let i = 0;
        const interval = setInterval(() => {
            element.textContent = originalText.substring(0, i + 1) + 
                [...Array(originalText.length - i - 1)].map(() => '█|/\\-=+*#'.charAt(Math.floor(Math.random() * 10))).join('');
            i++;
            if (i >= originalText.length) {
                clearInterval(interval);
                element.textContent = originalText;
            }
        }, 50);
    };
    
    // --- PARTICLE.JS CONFIG ---
    function initParticles() {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#61dafb'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#61dafb',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
    
    init();
});