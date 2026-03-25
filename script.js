// --- Custom Cursor ---
gsap.set(".cursor-dot", { xPercent: -50, yPercent: -50 });
gsap.set(".cursor-reticle", { xPercent: -50, yPercent: -50 });

let xToDot = gsap.quickTo(".cursor-dot", "x", { duration: 0.1, ease: "power3" });
let yToDot = gsap.quickTo(".cursor-dot", "y", { duration: 0.1, ease: "power3" });

let xToReticle = gsap.quickTo(".cursor-reticle", "x", { duration: 0.3, ease: "power3" });
let yToReticle = gsap.quickTo(".cursor-reticle", "y", { duration: 0.3, ease: "power3" });

window.addEventListener("mousemove", e => {
    xToDot(e.clientX);
    yToDot(e.clientY);
    xToReticle(e.clientX);
    yToReticle(e.clientY);
});

// --- Boot Sequence Option (can be skipped with any key) ---
const bootTimeline = gsap.timeline({
    onComplete: () => {
        gsap.to("#boot-sequence", { opacity: 0, duration: 0.5, display: "none" });
        initMainAnimations();
    }
});

const skipBoot = () => {
    bootTimeline.progress(1);
};
window.addEventListener("keypress", skipBoot);

bootTimeline.to(".boot-scanline", { y: "100vh", duration: 1, ease: "linear" })
    .to("#boot-text", {
        duration: 1.5,
        text: "INITIALIZING SYSTEM...",
        ease: "none",
        onUpdate: function () {
            let p = Math.floor(this.progress() * 100);
            document.getElementById("boot-text").innerHTML = "INITIALIZING SYSTEM... " + p + "%";
        }
    })
    .to("#boot-status", { opacity: 1, duration: 0.2, yoyo: true, repeat: 3 })
    .to(".boot-scanline", { opacity: 0, duration: 0.2 }, "+=0.5");


// --- Nav Interactions ---
const navbar = document.getElementById("navbar");
const navHeight = navbar.offsetHeight;

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
});

const hamburger = document.querySelector(".hamburger");
const mobileNav = document.querySelector(".mobile-nav-overlay");
const mobileLinksItems = document.querySelectorAll(".mobile-links a");

hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("active");
});

mobileLinksItems.forEach(link => {
    link.addEventListener("click", () => {
        mobileNav.classList.remove("active");
    });
});

// Scroll spy logic
const sections = document.querySelectorAll("section[id]");
window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - navHeight * 1.5) {
            current = section.getAttribute("id");
        }
    });

    document.querySelectorAll(".nav-links a").forEach(li => {
        li.classList.remove("active");
        if (li.getAttribute("href").includes(current)) {
            li.classList.add("active");
        }
    });
});

// Smooth scroll for nav links targeting sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        let targetHref = this.getAttribute('href');
        if (targetHref.length > 1) {
            e.preventDefault();
            gsap.to(window, { duration: 1, scrollTo: targetHref });
        }
    });
});

// --- Three.js Background Particles ---
function initThreeBG() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020008, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 1000 : 3000;

    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const color1 = new THREE.Color('#00fff0');
    const color2 = new THREE.Color('#7b00ff');

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Spread particles across a wide volume
        posArray[i] = (Math.random() - 0.5) * 1000;
        posArray[i + 1] = (Math.random() - 0.5) * 1000;
        posArray[i + 2] = (Math.random() - 0.5) * 500;

        const mixedColor = color1.clone().lerp(color2, Math.random());
        colorsArray[i] = mixedColor.r;
        colorsArray[i + 1] = mixedColor.g;
        colorsArray[i + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Wireframe Icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(150, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
        color: 0x00fff0,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
        blending: THREE.AdditiveBlending
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    scene.add(icoMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Slow rotation
        particlesMesh.rotation.y = elapsedTime * 0.05;
        icoMesh.rotation.y = elapsedTime * 0.1;
        icoMesh.rotation.x = elapsedTime * 0.1;

        // Mouse Parallax
        camera.position.x += (mouseX * 50 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 50 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// --- Three.js Floating Crystal (Desktop Only) ---
function initCrystalPlugin() {
    const container = document.getElementById('sidebar-crystal');
    const canvas = document.getElementById('crystal-canvas');
    if (!container || !canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Crystal Geometry
    const geometry = new THREE.OctahedronGeometry(1.5, 0);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x00fff0,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 1.0, // glass-like
        transparent: true,
        opacity: 1
    });

    const crystal = new THREE.Mesh(geometry, material);
    scene.add(crystal);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x7b00ff, 0.5);
    scene.add(ambientLight);

    const rectLight = new THREE.RectAreaLight(0xff00a0, 5, 2, 5);
    rectLight.position.set(2, 0, 2);
    rectLight.lookAt(0, 0, 0);
    scene.add(rectLight);

    const rectLight2 = new THREE.RectAreaLight(0x00fff0, 5, 2, 5);
    rectLight2.position.set(-2, 0, 2);
    rectLight2.lookAt(0, 0, 0);
    scene.add(rectLight2);

    let baseSpeed = 0.005;
    let targetSpeed = 0.005;
    let isHovered = false;

    container.addEventListener('mouseenter', () => { isHovered = true; targetSpeed = 0.05; });
    container.addEventListener('mouseleave', () => { isHovered = false; targetSpeed = 0.005; });

    // GSAP Scroll Parallax for Crystal
    gsap.to(crystal.position, {
        y: -1.5,
        scrollTrigger: {
            trigger: "#app",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        baseSpeed += (targetSpeed - baseSpeed) * 0.1;
        crystal.rotation.y += baseSpeed;
        crystal.rotation.x += baseSpeed * 0.5;

        // Breathing pulse on hover simulation via light intensity
        if (isHovered) {
            rectLight.intensity = 5 + Math.sin(Date.now() * 0.01) * 3;
            rectLight2.intensity = 5 + Math.cos(Date.now() * 0.01) * 3;
        } else {
            rectLight.intensity = 5;
            rectLight2.intensity = 5;
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}


// --- Main Animations Setup ---
function initMainAnimations() {
    // Typewriter Effect
    const texts = [
        "I build interfaces that feel alive.",
        "I train models that think.",
        "React. Python. Three.js. Obsession.",
        "Data Science meets Front-End Wizardry.",
        "CGPA 8.74 — but grades don't ship products."
    ];
    let count = 0;
    let index = 0;
    let currentText = '';
    let letter = '';
    let isDeleting = false;
    let typeSpeed = 50;

    (function type() {
        if (count === texts.length) {
            count = 0;
        }
        currentText = texts[count];

        if (isDeleting) {
            letter = currentText.slice(0, --index);
            typeSpeed = 30;
        } else {
            letter = currentText.slice(0, ++index);
            typeSpeed = 80;
        }

        const typewriterEl = document.getElementById('hero-typewriter');
        if (typewriterEl) typewriterEl.textContent = letter;

        if (!isDeleting && letter.length === currentText.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end of sentence
        } else if (isDeleting && letter.length === 0) {
            isDeleting = false;
            count++;
            typeSpeed = 500; // Pause before new sentence
        }

        setTimeout(type, typeSpeed);
    }());

    // Scroll GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Divider Line Drawing
    gsap.to(".divider-svg line", {
        scrollTrigger: {
            trigger: ".about-grid",
            start: "top 80%",
            end: "top 40%",
            scrub: true
        },
        strokeDashoffset: 0
    });

    // Skills Float Stagger
    gsap.from(".chip", {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: ".skills-grid",
            start: "top 85%"
        }
    });

    // Stat Counters
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        let isFloat = counter.classList.contains('float-value');
        let target = parseFloat(counter.getAttribute('data-target'));
        gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            scrollTrigger: {
                trigger: ".stats-container",
                start: "top 90%"
            },
            snap: { innerHTML: isFloat ? 0.01 : 1 },
            onUpdate: function () {
                if (isFloat) {
                    counter.innerHTML = Number(this.targets()[0].innerHTML).toFixed(2);
                }
            }
        });
    });

    // Projects Bento Stagger removed to ensure highlighted CSS correctly applies and avoids opacity locking

    // Training Terminal List Stagger
    gsap.to(".terminal-list li", {
        opacity: 1,
        x: 0,
        stagger: 0.2,
        duration: 0.5,
        scrollTrigger: {
            trigger: ".training-card",
            start: "top 80%"
        }
    });

    // Education Timeline Slides
    gsap.utils.toArray(".timeline-node").forEach(node => {
        let isLeft = node.classList.contains("left");
        gsap.from(node.querySelector(".timeline-card"), {
            x: isLeft ? -50 : 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: node,
                start: "top 85%"
            }
        });
    });

    // Contact form submit loading state
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const btn = document.querySelector(".btn-submit");
            const loader = document.querySelector(".loader-line");
            const text = document.querySelector(".btn-text");

            text.textContent = "TRANSMITTING...";
            gsap.to(loader, { width: "100%", duration: 1.5, ease: "power2.inOut" });

            emailjs.sendForm('service_0x7gjkm', 'template_6m08szk', this, 'jPUmGLdKeRquGqrDX')
                .then(function () {
                    text.textContent = "TRANSMISSION SENT.";
                    text.style.color = "#0f0";
                    setTimeout(() => {
                        text.textContent = "SEND TRANSMISSION";
                        text.style.color = "var(--neon-cyan)";
                        gsap.set(loader, { width: "0%" });
                        contactForm.reset();
                    }, 3000);
                }, function (error) {
                    console.log('FAILED...', error);
                    text.textContent = "TRANSMISSION FAILED.";
                    text.style.color = "#ff00a0";
                    setTimeout(() => {
                        text.textContent = "SEND TRANSMISSION";
                        text.style.color = "var(--neon-cyan)";
                        gsap.set(loader, { width: "0%" });
                    }, 3000);
                });
        });
    }
}

// Initial Calls based on Boot sequence
// Boot sequence takes care of calling initMainAnimations() when complete
initThreeBG();
initCrystalPlugin();
