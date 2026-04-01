const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const dropdownToggle = document.querySelector(".dropdown-toggle");
const dropdownMenu = document.querySelector(".dropdown-menu");

function closeProductsDropdown() {
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.setAttribute("aria-expanded", "false");
    dropdownMenu.classList.remove("open");
  }
}

if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const expanded = dropdownToggle.getAttribute("aria-expanded") === "true";
    dropdownToggle.setAttribute("aria-expanded", String(!expanded));
    dropdownMenu.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (!target.closest(".nav-dropdown")) {
      closeProductsDropdown();
    }
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      closeProductsDropdown();
    });
  });
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const canvas = document.getElementById("hero3d");
const heroSection = document.querySelector(".hero");

if (canvas && heroSection) {
  import("https://unpkg.com/three@0.162.0/build/three.module.js").then((THREE) => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance"
    });
    const maxPixelRatio = isMobile ? 1.2 : 1.4;
    const scrollPixelRatio = isMobile ? 1 : 1.05;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

    function getHeroRenderSize() {
      const rect = heroSection.getBoundingClientRect();
      return {
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height))
      };
    }

    const initialSize = getHeroRenderSize();
    renderer.setSize(initialSize.width, initialSize.height, false);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, initialSize.width / initialSize.height, 0.1, 100);
    camera.position.set(0, 0.4, 6);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x87a7ff, 1.1);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x2dd4bf, 0.9, 40);
    fillLight.position.set(-4, -1, 2);
    scene.add(fillLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeGeo = new THREE.SphereGeometry(1.45, isMobile ? 30 : 48, isMobile ? 30 : 48);
    const globeMat = new THREE.MeshPhysicalMaterial({
      color: 0x163a7a,
      roughness: 0.4,
      metalness: 0.15,
      transmission: 0.28,
      thickness: 0.7,
      clearcoat: 0.8,
      clearcoatRoughness: 0.35,
      emissive: 0x0a1c43,
      emissiveIntensity: 0.35
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    const ringGeo = new THREE.TorusGeometry(2.25, 0.02, isMobile ? 10 : 14, isMobile ? 110 : 160);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x7ab6ff,
      transparent: true,
      opacity: 0.65
    });

    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ring.rotation.x = (Math.PI / 5) * (i + 1);
      ring.rotation.y = (Math.PI / 4) * i;
      globeGroup.add(ring);
    }

    const garmentMaterial = new THREE.MeshStandardMaterial({
      color: 0xdbe5ff,
      roughness: 0.35,
      metalness: 0.2
    });

    const garmentCount = isMobile ? 10 : 16;
    const garmentGeometry = new THREE.BoxGeometry(0.2, 0.25, 0.05);
    const garments = [];
    for (let i = 0; i < garmentCount; i += 1) {
      const g = new THREE.Mesh(garmentGeometry, garmentMaterial);
      const radius = 2.8 + Math.random() * 0.35;
      const angle = (i / garmentCount) * Math.PI * 2;
      g.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 1.6, Math.sin(angle) * radius);
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      g.userData = {
        speed: 0.35 + Math.random() * 0.35,
        radius,
        angle,
        yOffset: (Math.random() - 0.5) * 1.6
      };
      garments.push(g);
      scene.add(g);
    }

    const stars = new THREE.BufferGeometry();
    const starCount = isMobile ? 450 : 800;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }
    stars.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starPoints = new THREE.Points(
      stars,
      new THREE.PointsMaterial({ color: 0x98b7ff, size: 0.03, transparent: true, opacity: 0.85 })
    );
    scene.add(starPoints);

    const clock = new THREE.Clock();
    const targetFps = prefersReducedMotion ? 22 : isMobile ? 28 : 40;
    const frameInterval = 1 / targetFps;
    const scrollFrameInterval = 1 / (isMobile ? 18 : 24);
    let elapsedAccumulator = 0;
    let animationFrameId = null;
    let isHeroInView = true;
    let isPageVisible = !document.hidden;
    let isUserScrolling = false;
    let scrollTimeout = null;

    function shouldRender() {
      return isHeroInView && isPageVisible;
    }

    function startLoop() {
      if (animationFrameId === null) {
        clock.start();
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    function stopLoop() {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function setRenderQuality(scrolling) {
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, scrolling ? scrollPixelRatio : maxPixelRatio)
      );
      const { width, height } = getHeroRenderSize();
      renderer.setSize(width, height, false);
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);

      if (!shouldRender()) {
        return;
      }

      elapsedAccumulator += delta;
      const activeFrameInterval = isUserScrolling ? scrollFrameInterval : frameInterval;
      if (elapsedAccumulator < activeFrameInterval) {
        return;
      }

      const elapsed = clock.getElapsedTime();
      const step = elapsedAccumulator;
      elapsedAccumulator = 0;

      globeGroup.rotation.y = elapsed * 0.25;
      globeGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.08;

      garments.forEach((g, i) => {
        const d = g.userData;
        d.angle += d.speed * step;
        g.position.x = Math.cos(d.angle + i * 0.13) * d.radius;
        g.position.z = Math.sin(d.angle + i * 0.13) * d.radius;
        g.position.y = d.yOffset + Math.sin(elapsed * 1.8 + i) * 0.07;
        g.rotation.x += 0.65 * step;
        g.rotation.y += 0.5 * step;
      });

      starPoints.rotation.y = elapsed * 0.03;

      renderer.render(scene, camera);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        isHeroInView = entries[0]?.isIntersecting ?? true;
        if (shouldRender()) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(heroSection);

    document.addEventListener("visibilitychange", () => {
      isPageVisible = !document.hidden;
      if (shouldRender()) {
        startLoop();
      } else {
        stopLoop();
      }
    });

    startLoop();

    window.addEventListener(
      "resize",
      () => {
        const { width: w, height: h } = getHeroRenderSize();
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        setRenderQuality(isUserScrolling);
        renderer.setSize(w, h, false);
      },
      { passive: true }
    );

    window.addEventListener(
      "scroll",
      () => {
        if (!isUserScrolling) {
          isUserScrolling = true;
          setRenderQuality(true);
        }

        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(() => {
          isUserScrolling = false;
          setRenderQuality(false);
        }, 140);
      },
      { passive: true }
    );

    window.addEventListener("beforeunload", () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      observer.disconnect();
      stopLoop();
      stars.dispose();
      starPoints.material.dispose();
      garmentGeometry.dispose();
      garmentMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      renderer.dispose();
    });
  });
}
