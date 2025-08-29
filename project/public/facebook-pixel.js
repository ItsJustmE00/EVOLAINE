// facebook-pixel.js
(function() {
  try {
    // Vérifier si fbq est déjà chargé
    if (window.fbq) return;
    
    // Créer un nouvel élément script
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onerror = function() {
      console.warn('Impossible de charger le script Facebook Pixel. Vérifiez votre bloqueur de publicités.');
    };
    
    // Initialisation du pixel
    window.fbq = function() {
      if (!window._fbq) window._fbq = [];
      window._fbq.push(arguments);
    };
    
    window.fbq.loaded = true;
    window.fbq.push = window.fbq;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
    
    // Initialisation du pixel avec notre ID
    window.fbq('init', '743290068698217');
    window.fbq('track', 'PageView');
    
    // Ajouter le script au document
    document.head.appendChild(script);
    
    // Ajouter le code de suivi no-js
    var noScript = document.createElement('noscript');
    noScript.innerHTML = '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=743290068698217&ev=PageView&noscript=1" alt="" />';
    document.body.appendChild(noScript);
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du Pixel Facebook:', error);
  }
})();
