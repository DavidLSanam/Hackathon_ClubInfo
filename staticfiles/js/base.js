// static/js/base.js - Version Ultra Moderne

document.addEventListener('DOMContentLoaded', function() {
  // ========= DARK MODE TOGGLE =========
  const toggle = document.getElementById("dark-mode-toggle");
  const html = document.documentElement;
  
  // Vérifier le préférence système ou le stockage local
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Appliquer le thème sauvegardé ou le thème système
  html.setAttribute('data-theme', savedTheme);
  
  // Mettre à jour l'icône du bouton
  updateToggleIcon(savedTheme);

  toggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    // Animation de transition
    html.style.transition = 'background 0.5s ease, color 0.3s ease';
    html.setAttribute("data-theme", newTheme);
    
    // Sauvegarder le choix dans le localStorage
    localStorage.setItem('theme', newTheme);
    
    // Mettre à jour l'icône
    updateToggleIcon(newTheme);
    
    // Supprimer la transition après l'animation
    setTimeout(() => {
      html.style.transition = '';
    }, 500);
  });

  // Fonction pour mettre à jour l'icône du bouton
  function updateToggleIcon(theme) {
    const icon = toggle.querySelector('i');
    if (icon) {
      icon.className = theme === "dark" ? "fas fa-sun pulse" : "fas fa-moon";
      if (theme === "dark") {
        setTimeout(() => {
          icon.classList.remove('pulse');
        }, 1000);
      }
    }
  }

  // Écouter les changements de préférence système
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      html.setAttribute('data-theme', newTheme);
      updateToggleIcon(newTheme);
    }
  });

  // ========= NAVBAR SCROLL EFFECT =========
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      navbar.classList.remove('scrolled');
      return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('nav-hidden')) {
      // Scroll vers le bas
      navbar.style.transform = 'translateY(-100%)';
      navbar.classList.add('nav-hidden');
    } else if (currentScroll < lastScroll && navbar.classList.contains('nav-hidden')) {
      // Scroll vers le haut
      navbar.style.transform = 'translateY(0)';
      navbar.classList.remove('nav-hidden');
      navbar.classList.add('scrolled');
    }
    
    // Ajouter la classe 'scrolled' après un certain défilement
    if (currentScroll > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // ========= BURGER MENU =========
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navLinks.classList.toggle('active');
      
      // Animation des liens
      if (navLinks.classList.contains('active')) {
        const links = document.querySelectorAll('.nav-links li');
        links.forEach((link, index) => {
          link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        });
      }
    });
  }

  // ========= BACK TO TOP BUTTON =========
  const backToTopBtn = document.querySelector('.back-to-top');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ========= FOOTER ANIMATIONS ==========
  const footerSections = document.querySelectorAll('.footer-section');
  
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1 });
  
  footerSections.forEach(section => {
    footerObserver.observe(section);
  });

  // ========= HOVER EFFECTS FOR NAV LINKS =========
  const navItems = document.querySelectorAll('.nav-links li');
  
  navItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-3px)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0)';
    });
  });

  // ========= SOCIAL ICONS ANIMATION =========
  const socialIcons = document.querySelectorAll('.socials a');
  
  socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'translateY(-5px) scale(1.1)';
    });
    
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = 'translateY(0) scale(1)';
    });
  });

  // ========= ACTIVE NAV LINK INDICATOR =========
  const sections = document.querySelectorAll('section');
  const navLi = document.querySelectorAll('.nav-links li');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= sectionTop - 300) {
        current = section.getAttribute('id');
      }
    });
    
    navLi.forEach(li => {
      li.classList.remove('active');
      if (li.querySelector('a').getAttribute('href').includes(current)) {
        li.classList.add('active');
      }
    });
  });
});

// Animation pour les liens du menu mobile
const navLinks = document.querySelectorAll('.nav-links li a');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Fermer le menu mobile après clic
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (burger && nav) {
      burger.classList.remove('open');
      nav.classList.remove('active');
    }
  });
});