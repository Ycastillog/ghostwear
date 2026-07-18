const phone = "18099770166";
    const money = new Intl.NumberFormat("es-DO");
    const year = document.getElementById("year");
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("drawerOverlay");
    const galleryModal = document.getElementById("galleryModal");
    const galleryTitle = document.getElementById("galleryTitle");
    const galleryImage = document.getElementById("galleryImage");
    const galleryTabs = document.getElementById("galleryTabs");
    const galleryPrev = document.getElementById("galleryPrev");
    const galleryNext = document.getElementById("galleryNext");
    const closeGallery = document.getElementById("closeGallery");
    const cartBtn = document.getElementById("cartBtn");
    const cartLinks = document.querySelectorAll("[data-cart-link]");
    const heroLookBtn = document.getElementById("heroLookBtn");
    const heroCartBtn = document.getElementById("heroCartBtn");
    const closeCart = document.getElementById("closeCart");
    const cartItemsEl = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const cartCountEl = document.getElementById("cartCount");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const clearBtn = document.getElementById("clearBtn");
    const announceTrack = document.getElementById("announceTrack");
    const heroStats = document.getElementById("heroStats");
    const heroTag = document.getElementById("heroTag");
    const heroFeature = document.getElementById("heroFeature");
    const heroPrice = document.getElementById("heroPrice");
    const welcomeCard = document.querySelector(".welcome-card");
    const welcomeFitBtn = document.getElementById("welcomeFitBtn");
    const floatingWa = document.getElementById("floatingWa");
    const shopCards = document.getElementById("shopCards");
    const shopFilters = document.getElementById("shopFilters");
    const shopFilterCount = document.getElementById("shopFilterCount");
    const filteredShopGrid = document.getElementById("filteredShopGrid");
    const shopSearch = document.getElementById("shopSearch");
    const shopSort = document.getElementById("shopSort");
    const shopLoadMore = document.getElementById("shopLoadMore");
    const shopLoadMoreWrap = document.getElementById("shopLoadMoreWrap");
    const comboGrid = document.getElementById("comboGrid");
    const productGrid = document.getElementById("productGrid");
    const gearGrid = document.getElementById("gearGrid");
    const shopPageSize = 12;
    let activeShopFilter = "todos";
    let visibleShopLimit = shopPageSize;
    const store = {
      phone,
      shipping: "RD + USA por cotizacion",
      payment: "Pago se confirma por DM",
      hero: {
        tag: "Drop principal",
        feature: "Short + medias"
      },
      metrics: {
        piecesLabel: "shorts + gear"
      }
    };

    function moneyText(value) {
      return "RD$ " + money.format(value);
    }

    function attrText(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function attrJson(value) {
      return attrText(JSON.stringify(value));
    }

    const responsiveImageFolders = [
      "/images/designed/",
      "/images/media/",
      "/images/inventory/caps/studio/"
    ];

    function responsiveSrcset(src) {
      if (!src || !src.endsWith(".webp") || !responsiveImageFolders.some(folder => src.includes(folder))) return "";
      const base = src.slice(0, -5);
      return `${base}-480.webp 480w, ${base}-720.webp 720w, ${src} 960w`;
    }

    function responsiveImageAttributes(src, sizes = "(max-width: 620px) 92vw, 33vw") {
      const srcset = responsiveSrcset(src);
      return srcset ? ` srcset="${attrText(srcset)}" sizes="${attrText(sizes)}"` : "";
    }

    function prepareProductImages(root = document) {
      root.querySelectorAll(".color-img img").forEach(image => {
        const frame = image.closest(".color-img");
        if (!frame) return;
        const settle = () => frame.classList.remove("image-loading");
        if (image.complete && image.naturalWidth > 0) {
          settle();
          return;
        }
        frame.classList.add("image-loading");
        image.addEventListener("load", settle, { once: true });
        image.addEventListener("error", settle, { once: true });
      });
    }

    function setResponsiveImage(image, src, sizes = "(max-width: 620px) 92vw, 33vw") {
      const frame = image.closest(".color-img");
      if (frame) frame.classList.add("image-loading");
      const srcset = responsiveSrcset(src);
      if (srcset) {
        image.srcset = srcset;
        image.sizes = sizes;
      } else {
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
      }
      image.src = src;
      prepareProductImages(frame || image.parentElement);
    }

    const metricsStorageKey = "ghostwearMetricsV1";

    function trackEvent(name, detail = {}) {
      const payload = {
        event: `ghostwear_${name}`,
        ...detail,
        timestamp: new Date().toISOString()
      };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      document.dispatchEvent(new CustomEvent("ghostwear:track", { detail: payload }));
      try {
        const metrics = JSON.parse(localStorage.getItem(metricsStorageKey) || '{"counts":{}}');
        metrics.counts[name] = (metrics.counts[name] || 0) + 1;
        metrics.lastEvent = payload;
        localStorage.setItem(metricsStorageKey, JSON.stringify(metrics));
      } catch (error) {
      }
    }

    const products = [
      { color: "Red", name: "Short Ghost Red", image: "./images/media/ghostwear-media-01.webp", hex: "#d71925", note: "Rojo de juego caliente: entra duro, se ve desde la grada.", courtTag: "Buzzer rojo", courtLine: "Para el fit que grita clutch cuando llega la hora de cerrar." },
      { color: "Baby Blue", name: "Short Ghost Baby Blue", image: "./images/media/ghostwear-media-02.webp", hex: "#a7d8ff", note: "Azul claro tipo warmup fresco, limpio con medias Ghost blancas.", courtTag: "Warmup", courtLine: "Color suave para bajar tranquilo, pero con energia de cancha." },
      { color: "Light Gray", name: "Short Ghost Light Gray", image: "./images/media/ghostwear-media-03.webp", hex: "#d8d4cd", note: "Gris de practica: facil de combinar para gym, cancha y calle.", courtTag: "Practice", courtLine: "El short de rotacion diaria cuando el fit va sin mucha vuelta." },
      { color: "Orange", name: "Short Ghost Orange", image: "./images/media/ghostwear-media-04.webp", hex: "#f36a22", note: "Naranja de balon: vivo, deportivo y hecho para contenido.", courtTag: "Ball color", courtLine: "La conexion mas directa con basket: color de pelota, flow Ghost." },
      { color: "Olive", name: "Short Ghost Olive", image: "./images/media/ghostwear-media-05.webp", hex: "#777b52", note: "Olive defensivo, sobrio y callejero para jugar callado.", courtTag: "Defensa", courtLine: "Para el que no habla mucho, pero se siente cuando entra al juego." },
      { color: "Aqua", name: "Short Ghost Aqua", image: "./images/media/ghostwear-media-06.webp", hex: "#54ded1", note: "Aqua fresco de verano, cancha abierta y fit de calor RD.", courtTag: "Summer run", courtLine: "Perfecto para juego al aire libre, playa y vuelta despues de la cancha." },
      { color: "Sky Blue", name: "Short Ghost Sky Blue", image: "./images/media/ghostwear-media-07.webp", hex: "#35a7df", note: "Azul cielo con vibra deportiva y energia de uniforme alterno.", courtTag: "Away blue", courtLine: "El color visitante: fresco, visible y facil de combinar." },
      { color: "Pink", name: "Short Ghost Pink", image: "./images/media/ghostwear-media-08.webp", hex: "#ff4f86", note: "Pink intenso para romper la cancha y no parecerse a nadie.", courtTag: "Statement", courtLine: "Para el jugador que quiere que el fit sea parte del show." },
      { color: "Neon Green", name: "Short Ghost Neon Green", image: "./images/media/ghostwear-media-09.webp", hex: "#83f13a", note: "Verde neon tipo highlight: el color que no se pierde en la jugada.", courtTag: "Highlight", courtLine: "Cuando hay luces, video y story, este color aparece primero." },
      { color: "Royal Blue", name: "Short Ghost Royal Blue", image: "./images/media/ghostwear-media-10.webp", hex: "#2454ff", note: "Azul royal con energia de uniforme fuerte y cancha dominicana.", courtTag: "Royal game", courtLine: "El color mas de equipo: serio, deportivo y con presencia." },
      { color: "Yellow", name: "Short Ghost Yellow", image: "./images/media/ghostwear-media-11.webp", hex: "#f4c21c", note: "Amarillo ganador, brillante y facil de leer en foto o reel.", courtTag: "Trophy", courtLine: "Para meterle luz al fit: amarillo de trofeo, foto y celebracion." },
      { color: "Navy", name: "Short Ghost Navy", image: "./images/media/ghostwear-media-12.webp", hex: "#202a64", note: "Azul navy oscuro tipo uniforme serio para jugar con calma.", courtTag: "Capitan", courtLine: "Color de lider: combina facil y mantiene la vuelta limpia." },
      { color: "Lavender", name: "Short Ghost Lavender", image: "./images/media/ghostwear-media-13.webp", hex: "#c8afe6", note: "Lavender suave para un alterno diferente, fino y de coleccion.", courtTag: "Alternate", courtLine: "Ese color raro del equipo que despues todo el mundo pregunta." },
      { color: "Black", name: "Short Ghost Black", image: "./images/media/ghostwear-media-14.webp", hex: "#111111", note: "Negro away: esencial, fuerte, logo blanco y uso diario.", courtTag: "Away black", courtLine: "El uniforme oscuro del Ghost: seguro, facil y siempre duro." },
      { color: "White", name: "Short Ghost White", image: "./images/media/ghostwear-media-15.webp", hex: "#f4f1e8", note: "Blanco home: fresco, limpio y con cordon negro para contraste.", courtTag: "Home white", courtLine: "El color de casa: limpio para fotos, cancha y salida." }
    ].map(product => ({
      ...product,
      tag: product.color,
      price: 1500,
      priceLabel: moneyText(1500),
      sizes: ["S", "M", "L", "XL"],
      quantities: ["1", "2", "3"],
      href: "#drop"
    }));
    const realShortImages = {
      "Red": "./images/real/ghostwear-real-3081.webp",
      "Baby Blue": "./images/real/ghostwear-real-3082.webp",
      "Light Gray": "./images/real/ghostwear-real-3083.webp",
      "Orange": "./images/real/ghostwear-real-3084.webp",
      "Olive": "./images/real/ghostwear-real-3085.webp",
      "Aqua": "./images/real/ghostwear-real-3086.webp",
      "Sky Blue": "./images/real/ghostwear-real-3087.webp",
      "Pink": "./images/real/ghostwear-real-3088.webp",
      "Neon Green": "./images/real/ghostwear-real-3089.webp",
      "Royal Blue": "./images/real/ghostwear-real-3090.webp",
      "Yellow": "./images/real/ghostwear-real-3091.webp",
      "Navy": "./images/real/ghostwear-real-3092.webp",
      "Lavender": "./images/real/ghostwear-real-3093.webp",
      "Black": "./images/real/ghostwear-real-3094.webp",
      "White": "./images/real/ghostwear-real-3095.webp"
    };
    products.forEach(product => {
      product.image = realShortImages[product.color] || product.image;
    });
    const logoToneByColor = {
      "White": { label: "Logo negro", hex: "#080808" },
      "Light Gray": { label: "Logo negro", hex: "#080808" },
      "Baby Blue": { label: "Logo negro", hex: "#080808" },
      "Lavender": { label: "Logo gris", hex: "#cfcfc7" },
      "Red": { label: "Logo blanco", hex: "#f8f6ee" },
      "Orange": { label: "Logo blanco", hex: "#f8f6ee" },
      "Olive": { label: "Logo blanco", hex: "#f8f6ee" },
      "Aqua": { label: "Logo blanco", hex: "#f8f6ee" },
      "Sky Blue": { label: "Logo blanco", hex: "#f8f6ee" },
      "Pink": { label: "Logo blanco", hex: "#f8f6ee" },
      "Neon Green": { label: "Logo blanco", hex: "#f8f6ee" },
      "Royal Blue": { label: "Logo blanco", hex: "#f8f6ee" },
      "Yellow": { label: "Logo blanco", hex: "#f8f6ee" },
      "Navy": { label: "Logo blanco", hex: "#f8f6ee" },
      "Black": { label: "Logo blanco", hex: "#f8f6ee" }
    };
    products.forEach(product => {
      product.logoTone = logoToneByColor[product.color] || { label: "Logo blanco", hex: "#f8f6ee" };
    });
    const shortsCollectionProduct = {
      color: products[0].color,
      tag: products[0].color,
      category: "shorts",
      name: products[0].name,
      image: "./images/designed/ghostwear-short-red-studio.webp",
      realImage: products[0].image,
      hex: products[0].hex,
      price: 1500,
      priceLabel: moneyText(1500),
      note: products[0].note,
      courtTag: products[0].courtTag,
      courtLine: products[0].courtLine,
      logoTone: products[0].logoTone,
      sizes: ["S", "M", "L", "XL"],
      quantities: ["1", "2", "3"],
      urgency: { label: "Drop activo RD", line: "Los colores se confirman por talla y stock antes del pago." },
      href: "#drop"
    };
    shortsCollectionProduct.colorOptions = products;
    const capProducts = [
      {
        tag: "Malla",
        category: "gorras",
        name: "Gorra 01 - Azul con blanco",
        image: "./images/inventory/caps/studio/cap-01-azul-con-blanco-front.webp",
        realImage: "./images/inventory/caps/studio/cap-01-azul-con-blanco-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Trucker azul con blanco, malla azul y ghost azul en el logo. Color fuerte y limpio.",
        swatch: "#1f5bd8",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Azul/Blanco", line: "Estilo 01 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-01-azul-con-blanco-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-01-azul-con-blanco-side.webp", view: "real" }
        ]
      },
      {
        tag: "Tela",
        category: "gorras",
        name: "Gorra 02 - Azul con beige",
        image: "./images/inventory/caps/studio/cap-02-azul-con-beige-front.webp",
        realImage: "./images/inventory/caps/studio/cap-02-azul-con-beige-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Beige con azul royal, panel lateral cerrado y boton azul. No es la misma que la azul con blanco de malla.",
        swatch: "#2454ff",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Azul/Beige", line: "Estilo 02 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-02-azul-con-beige-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-02-azul-con-beige-side.webp", view: "real" }
        ]
      },
      {
        tag: "Tela",
        category: "gorras",
        name: "Gorra 03 - Crema con marron tela diferente",
        image: "./images/inventory/caps/studio/cap-03-crema-marron-tela-diferente-front.webp",
        realImage: "./images/inventory/caps/studio/cap-03-crema-marron-tela-diferente-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Crema con marron en tela acanalada/tipo corduroy. Se ve diferente a la crema con marron lisa.",
        swatch: "#7a4a2f",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Tela diferente", line: "Estilo 03 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-03-crema-marron-tela-diferente-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-03-crema-marron-tela-diferente-side.webp", view: "real" }
        ]
      },
      {
        tag: "Pana",
        category: "gorras",
        name: "Gorra 04 - Marron con marron en pana",
        image: "./images/inventory/caps/studio/cap-04-marron-pana-front.webp",
        realImage: "./images/inventory/caps/studio/cap-04-marron-pana-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Marron completa en pana/peludita con malla marron y logo blanco. Textura premium.",
        swatch: "#9a5a2b",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Pana marron", line: "Estilo 04 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-04-marron-pana-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-04-marron-pana-side.webp", view: "real" }
        ]
      },
      {
        tag: "Tela",
        category: "gorras",
        name: "Gorra 05 - Marron con crema",
        image: "./images/inventory/caps/studio/cap-05-marron-con-crema-front.webp",
        realImage: "./images/inventory/caps/studio/cap-05-marron-con-crema-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Crema con marron lisa, logo negro y visera marron. Variante clasica sin textura peludita.",
        swatch: "#6b3f2a",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Marron/Crema", line: "Estilo 05 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-05-marron-con-crema-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-05-marron-con-crema-side.webp", view: "real" }
        ]
      },
      {
        tag: "Pana",
        category: "gorras",
        name: "Gorra 06 - Roja en pana ghost negro",
        image: "./images/inventory/caps/studio/cap-06-roja-pana-ghost-negro-front.webp",
        realImage: "./images/inventory/caps/studio/cap-06-roja-pana-ghost-negro-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Roja completa en pana/peludita con ghost negro. Variante roja mas oscura/premium.",
        swatch: "#e31b1b",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Pana roja", line: "Estilo 06 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-06-roja-pana-ghost-negro-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-06-roja-pana-ghost-negro-side.webp", view: "real" }
        ]
      },
      {
        tag: "Pana",
        category: "gorras",
        name: "Gorra 07 - Roja en pana ghost blanco",
        image: "./images/inventory/caps/studio/cap-07-roja-pana-ghost-blanco-front.webp",
        realImage: "./images/inventory/caps/studio/cap-07-roja-pana-ghost-blanco-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Roja completa en pana/peludita con logo Ghost blanco. La roja mas brillante del drop.",
        swatch: "#ff2a22",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Pana roja", line: "Estilo 07 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-07-roja-pana-ghost-blanco-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-07-roja-pana-ghost-blanco-side.webp", view: "real" }
        ]
      },
      {
        tag: "Bordada",
        category: "gorras",
        name: "Gorra 08 - Azul con blanco lineas",
        image: "./images/inventory/caps/studio/cap-08-azul-blanco-lineas-front.webp",
        realImage: "./images/inventory/caps/studio/cap-08-azul-blanco-lineas-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Blanca con visera azul y lineas bordadas negras/azules en los laterales. Estilo mas agresivo.",
        swatch: "#13a9c9",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Lineas bordadas", line: "Estilo 08 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-08-azul-blanco-lineas-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-08-azul-blanco-lineas-side.webp", view: "real" }
        ]
      },
      {
        tag: "Pana",
        category: "gorras",
        name: "Gorra 09 - Negra completa ghost blanco",
        image: "./images/inventory/caps/studio/cap-09-negra-ghost-blanco-front.webp",
        realImage: "./images/inventory/caps/studio/cap-09-negra-ghost-blanco-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Negra completa en pana/peludita con malla negra y logo blanco. Basica fuerte.",
        swatch: "#111111",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Pana negra", line: "Estilo 09 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-09-negra-ghost-blanco-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-09-negra-ghost-blanco-side.webp", view: "real" }
        ]
      },
      {
        tag: "Malla",
        category: "gorras",
        name: "Gorra 10 - Blanca con azul claro",
        image: "./images/inventory/caps/studio/cap-10-blanca-azul-claro-front.webp",
        realImage: "./images/inventory/caps/studio/cap-10-blanca-azul-claro-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Blanca con azul claro, malla azul clara y ghost azul suave. Color limpio y facil de combinar.",
        swatch: "#b9ddf4",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Azul claro", line: "Estilo 10 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-10-blanca-azul-claro-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-10-blanca-azul-claro-side.webp", view: "real" }
        ]
      },
      {
        tag: "Tela",
        category: "gorras",
        name: "Gorra 11 - Crema con verde",
        image: "./images/inventory/caps/studio/cap-11-crema-verde-front.webp",
        realImage: "./images/inventory/caps/studio/cap-11-crema-verde-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Crema con verde oscuro, logo negro y ghost verde. Tono retro limpio.",
        swatch: "#1f5a36",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Crema/Verde", line: "Estilo 11 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-11-crema-verde-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-11-crema-verde-side.webp", view: "real" }
        ]
      },
      {
        tag: "Pana",
        category: "gorras",
        name: "Gorra 12 - Gris completa ghost negro",
        image: "./images/inventory/caps/studio/cap-12-gris-ghost-negro-front.webp",
        realImage: "./images/inventory/caps/studio/cap-12-gris-ghost-negro-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Gris completa en pana/peludita con logo negro. Neutral, pero con textura visible.",
        swatch: "#b8b8b8",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Pana gris", line: "Estilo 12 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-12-gris-ghost-negro-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-12-gris-ghost-negro-side.webp", view: "real" }
        ]
      },
      {
        tag: "Tela",
        category: "gorras",
        name: "Gorra 13 - Crema con rojo",
        image: "./images/inventory/caps/studio/cap-13-crema-rojo-front.webp",
        realImage: "./images/inventory/caps/studio/cap-13-crema-rojo-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Crema con rojo, logo negro y ghost rojo. Colorway clasico con contraste fuerte.",
        swatch: "#e53935",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Crema/Rojo", line: "Estilo 13 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-13-crema-rojo-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-13-crema-rojo-side.webp", view: "real" }
        ]
      },
      {
        tag: "Pana",
        category: "gorras",
        name: "Gorra 14 - Rosada completa ghost negro",
        image: "./images/inventory/caps/studio/cap-14-rosada-ghost-negro-front.webp",
        realImage: "./images/inventory/caps/studio/cap-14-rosada-ghost-negro-side.webp",
        price: 1500,
        priceLabel: "RD$ 1,500",
        note: "Rosada completa en pana/peludita con logo Ghost negro. Color statement del drop.",
        swatch: "#f5a2b7",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Pana rosada", line: "Estilo 14 confirmado con fondo de catalogo; stock se valida por DM." },
        photos: [
          { label: "Frente", src: "./images/inventory/caps/studio/cap-14-rosada-ghost-negro-front.webp", view: "real" },
          { label: "Lado", src: "./images/inventory/caps/studio/cap-14-rosada-ghost-negro-side.webp", view: "real" }
        ]
      }
    ];
    const teeProducts = [
      {
        tag: "T-Shirt",
        category: "tees",
        name: "T-Shirt Ghost Fire",
        image: "./images/inventory/tees/ghostwear-tee-02.webp",
        realImage: "./images/inventory/tees/ghostwear-tee-01.webp",
        price: 2300,
        priceLabel: "RD$ 2,300",
        note: "T-shirt blanca con logo Ghost Wear flame en el pecho y arte grande de fuego en la espalda.",
        swatch: "#f4f1e8",
        sizes: ["S", "M", "L", "XL"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Frente y espalda", line: "Fire se confirma por talla antes de pago." },
        photos: [
          { label: "Frente", src: "./images/inventory/tees/ghostwear-tee-02.webp", view: "clean" },
          { label: "Espalda", src: "./images/inventory/tees/ghostwear-tee-01.webp", view: "clean" },
          { label: "Empaque", src: "./images/inventory/misc/ghostwear-cap-13.webp", view: "clean" }
        ]
      },
      {
        tag: "T-Shirt",
        category: "tees",
        name: "T-Shirt Ghost Purple Shadow",
        image: "./images/inventory/tees/ghostwear-tee-04.webp",
        realImage: "./images/inventory/tees/ghostwear-tee-03.webp",
        price: 2300,
        priceLabel: "RD$ 2,300",
        note: "T-shirt blanca con grafico morado al frente y arte Shadow Ghost en la espalda.",
        swatch: "#7b5cff",
        sizes: ["S", "M", "L", "XL"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Frente y espalda", line: "Purple Shadow disponible por DM; talla se confirma." },
        photos: [
          { label: "Frente", src: "./images/inventory/tees/ghostwear-tee-04.webp", view: "clean" },
          { label: "Espalda", src: "./images/inventory/tees/ghostwear-tee-03.webp", view: "clean" }
        ]
      },
      {
        tag: "T-Shirt",
        category: "tees",
        name: "T-Shirt Ghost Red Logo",
        image: "./images/inventory/tees/ghostwear-tee-05.webp",
        realImage: "./images/inventory/tees/ghostwear-tee-05.webp",
        price: 2300,
        priceLabel: "RD$ 2,300",
        note: "T-shirt roja con logo blanco GHOST grande al frente.",
        swatch: "#e53935",
        sizes: ["S", "M", "L", "XL"],
        quantities: ["1", "2", "3"],
        urgency: { label: "Roja activa", line: "Red Logo se confirma por talla antes de pago." }
      }
    ];
    const gearProducts = [
      {
        tag: "Medias",
        category: "medias",
        name: "Medias Ghost",
        image: "./images/inventory/misc/ghostwear-cap-10.webp",
        realImage: "./images/inventory/misc/ghostwear-cap-11.webp",
        modelImage: "./images/model/ghostwear-socks-detail-real.jpg",
        price: 350,
        priceLabel: "RD$ 350",
        note: "Par de medias blancas con logo Ghost bordado en colores.",
        swatch: "#f6f3ee",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        photos: [
          { label: "Azul", src: "./images/inventory/misc/ghostwear-cap-10.webp", view: "clean" },
          { label: "Amarilla", src: "./images/inventory/misc/ghostwear-cap-11.webp", view: "clean" },
          { label: "En uso", src: "./images/model/ghostwear-socks-detail-real.jpg", view: "real" }
        ]
      },
      {
        tag: "Pack",
        category: "medias",
        name: "Pack 3 Medias Ghost",
        image: "./images/designed/ghostwear-socks-studio.webp",
        realImage: "./images/ghostwear-socks-real.jpg",
        modelImage: "./images/model/ghostwear-socks-detail-real.jpg",
        price: 1000,
        priceLabel: "RD$ 1,000",
        note: "Oferta de historia: tres pares con logos Ghost en colores surtidos.",
        swatch: "#f4f1dc",
        sizes: ["Unica"],
        quantities: ["1", "2", "3"],
        photos: [
          { label: "Pack", src: "./images/designed/ghostwear-socks-studio.webp", view: "clean" },
          { label: "Real", src: "./images/ghostwear-socks-real.jpg", view: "real" },
          { label: "En uso", src: "./images/model/ghostwear-socks-detail-real.jpg", view: "real" }
        ]
      },
      ...capProducts,
      {
        tag: "Hoodie",
        category: "hoodie",
        name: "Hoodie Ghost Black",
        image: "./images/designed/ghostwear-hoodie-studio.webp",
        realImage: "./images/gear/ghostwear-hoodie.jpg",
        price: 3000,
        priceLabel: "RD$ 3,000",
        note: "Hoodie negro con logo Ghost grande, bolsillo frontal y fit comodo.",
        swatch: "#111111",
        sizes: ["S", "M", "L", "XL"],
        quantities: ["1", "2", "3"]
      },
      ...teeProducts
    ];
    const socksProduct = gearProducts.find(product => product.name === "Medias Ghost");
    const socksPackProduct = gearProducts.find(product => product.name.includes("Pack 3"));
    const hoodieProduct = gearProducts.find(product => product.category === "hoodie");
    const firstCapProduct = capProducts[0];
    const firstTeeProduct = teeProducts[0];
    const comboProducts = [
      {
        tag: "Combo",
        name: "Combo Short + Medias",
        image: realShortImages["Royal Blue"],
        price: 1750,
        priceLabel: "RD$ 1,750",
        normalPrice: 1850,
        oldPrice: "RD$ 1,850",
        note: "Short Ghost + medias para salir con el fit amarrado. Ahorras RD$ 100.",
        swatch: "#f4f1dc",
        sizes: ["S", "M", "L", "XL"],
        quantities: ["1", "2", "3"],
        includes: ["Short Ghost", "Medias Ghost"],
        comboImages: [
          { label: "Short", src: realShortImages["Royal Blue"] },
          { label: "Medias", src: "./images/ghostwear-socks-real.jpg" }
        ]
      },
      {
        tag: "Combo",
        name: "Combo Short + Gorra",
        image: firstCapProduct.image,
        price: 2850,
        priceLabel: "RD$ 2,850",
        normalPrice: 3000,
        oldPrice: "RD$ 3,000",
        note: "Short Ghost + gorra Ghost. La vuelta facil para cerrar el look.",
        swatch: "#2454ff",
        sizes: ["S", "M", "L", "XL"],
        quantities: ["1", "2", "3"],
        includes: ["Short Ghost", "Gorra Ghost"],
        comboImages: [
          { label: "Short", src: realShortImages["Light Gray"] },
          { label: "Gorra", src: firstCapProduct.image }
        ]
      },
      {
        tag: "Full Fit",
        name: "Full Ghost Fit",
        image: "./images/designed/ghostwear-hoodie-studio.webp",
        price: 4600,
        priceLabel: "RD$ 4,600",
        normalPrice: 4850,
        oldPrice: "RD$ 4,850",
        note: "Short + hoodie + medias. Full Ghost fit con descuento de RD$ 250.",
        swatch: "#111111",
        sizes: ["S", "M", "L", "XL"],
        quantities: ["1", "2", "3"],
        includes: ["Short Ghost", "Hoodie Ghost", "Medias Ghost"],
        comboImages: [
          { label: "Short", src: realShortImages["Black"] },
          { label: "Hoodie", src: "./images/gear/ghostwear-hoodie.jpg" },
          { label: "Medias", src: "./images/ghostwear-socks-real.jpg" }
        ]
      }
    ];
    comboProducts.forEach(product => {
      product.category = "combos";
    });
    const allProducts = [...products, ...gearProducts, ...comboProducts];
    products.forEach(product => {
      product.category = "shorts";
    });
    products.forEach(product => {
      const urgencyByColor = {
        "Royal Blue": { label: "Color mas pedido", line: "Se mueve rapido por DM. Talla se confirma antes de pago." },
        "Neon Green": { label: "Pocas unidades", line: "Color activo del drop. Talla se confirma antes de apartar." },
        "Red": { label: "Disponible por DM", line: "Rojo activo. Ideal con medias Ghost blancas." },
        "Baby Blue": { label: "Disponible por DM", line: "Baby blue activo. Pregunta talla antes del pago." },
        "Light Gray": { label: "Disponible por DM", line: "Gris claro activo; stock se valida por talla." },
        "Orange": { label: "Disponible por DM", line: "Orange activo para fotos y cancha. Confirmamos talla por WhatsApp." },
        "Olive": { label: "Pocas unidades", line: "Olive tiene stock corto. Talla/color se confirma antes de pago." },
        "Aqua": { label: "Disponible por DM", line: "Aqua fresco del drop. Envio se cotiza si aplica." },
        "Sky Blue": { label: "Disponible por DM", line: "Sky blue activo. Entrega se confirma por WhatsApp." },
        "Black": { label: "Ultimas unidades", line: "Basico que rota rapido. Talla se confirma antes de pago." },
        "White": { label: "Por confirmar", line: "Color limpio para verano. Se valida talla por DM." },
        "Pink": { label: "Pocas unidades", line: "Tono llamativo con disponibilidad limitada." },
        "Yellow": { label: "Por confirmar", line: "Color solicitado. Se valida disponibilidad por talla." },
        "Navy": { label: "Disponible por DM", line: "Navy activo para un fit mas serio. Se confirma por talla." },
        "Lavender": { label: "Pocas unidades", line: "Color de coleccion con disponibilidad limitada." }
      };
      product.urgency = urgencyByColor[product.color] || { label: "Disponible por DM", line: "Talla y envio se confirman por WhatsApp." };
      const availabilityByColor = {
        "Royal Blue": { label: "Pocas tallas", line: "Se confirma S, M, L o XL por WhatsApp antes de apartar." },
        "Neon Green": { label: "Pocas tallas", line: "Color activo con disponibilidad corta por talla." },
        "Red": { label: "Disponible", line: "Activo para pedir por color y talla." },
        "Baby Blue": { label: "Disponible", line: "Activo para confirmar talla por WhatsApp." },
        "Light Gray": { label: "Disponible", line: "Color facil de combinar, sujeto a talla." },
        "Orange": { label: "Disponible", line: "Activo para confirmar por WhatsApp." },
        "Olive": { label: "Pocas tallas", line: "Se revisa talla antes de pago." },
        "Aqua": { label: "Disponible", line: "Activo mientras dure el drop." },
        "Sky Blue": { label: "Disponible", line: "Se confirma talla y entrega por WhatsApp." },
        "Black": { label: "Pocas tallas", line: "Basico de rotacion rapida." },
        "White": { label: "Por confirmar", line: "Color limpio, se valida talla antes de apartar." },
        "Pink": { label: "Pocas tallas", line: "Color llamativo con disponibilidad limitada." },
        "Yellow": { label: "Por confirmar", line: "Se valida disponibilidad por talla." },
        "Navy": { label: "Disponible", line: "Activo para un fit mas serio." },
        "Lavender": { label: "Pocas tallas", line: "Color de coleccion con disponibilidad limitada." }
      };
      product.availability = availabilityByColor[product.color] || { label: "Por confirmar", line: "Se valida disponibilidad por DM." };
    });
    shortsCollectionProduct.availability = products[0].availability;
    if (socksProduct) socksProduct.urgency = { label: "Pedido por DM", line: "Par suelto para completar cualquier fit." };
    if (socksPackProduct) socksPackProduct.urgency = { label: "Oferta activa", line: "3 pares por RD$ 1,000 mientras dure el pack." };
    if (hoodieProduct) hoodieProduct.urgency = { label: "Quedan pocas", line: "Hoodie negro con disponibilidad limitada por talla." };
    comboProducts[0].urgency = { label: "Combo activo", line: "Short + medias para armar el fit sin pensarlo mucho." };
    comboProducts[1].urgency = { label: "Color mas pedido", line: "Short + gorra para salir con el look completo." };
    comboProducts[2].urgency = { label: "Full fit limitado", line: "El paquete completo tiene descuento y stock por talla." };
    const cleanShortImages = {
      "Red": "./images/designed/ghostwear-short-red-studio.webp",
      "Baby Blue": "./images/designed/ghostwear-short-baby-blue-logo-black.webp",
      "Light Gray": "./images/designed/ghostwear-short-light-gray-logo-black.webp",
      "Orange": "./images/designed/ghostwear-short-orange-studio.webp",
      "Olive": "./images/designed/ghostwear-short-olive-studio.webp",
      "Aqua": "./images/designed/ghostwear-short-aqua-logo-gray.webp",
      "Sky Blue": "./images/designed/ghostwear-short-sky-blue-logo-black.webp",
      "Pink": "./images/designed/ghostwear-short-pink-studio.webp",
      "Neon Green": "./images/designed/ghostwear-short-neon-green-studio.webp",
      "Royal Blue": "./images/designed/ghostwear-short-royal-blue-studio.webp",
      "Yellow": "./images/designed/ghostwear-short-yellow-studio.webp",
      "Navy": "./images/designed/ghostwear-short-navy-studio.webp",
      "Lavender": "./images/designed/ghostwear-short-lavender-logo-gray.webp",
      "Black": "./images/designed/ghostwear-short-black-studio.webp",
      "White": "./images/designed/ghostwear-short-white-logo-black.webp"
    };
    const ghostModelImages = {
      court: "./images/model/ghostwear-juanco-model-court.jpg",
      hoodie: "./images/model/ghostwear-juanco-model-hoodie.jpg"
    };
    products.forEach(product => {
      const cleanImage = cleanShortImages[product.color] || product.image;
      product.photos = [
        { label: "Limpia", src: cleanImage, view: cleanImage === product.image ? "real" : "clean" },
        { label: "Real", src: product.image, view: "real" }
      ];
    });
    shortsCollectionProduct.photos = [
      { label: "Limpia", src: shortsCollectionProduct.image, view: "clean" },
      { label: "Real", src: shortsCollectionProduct.realImage, view: "real" }
    ];
    gearProducts.forEach(product => {
      if (product.photos) return;
      const realImage = product.realImage || product.image;
      const productModelImage = product.modelImage || realImage;
      const modelImageByCategory = {
        medias: productModelImage,
        gorras: realImage,
        hoodie: ghostModelImages.hoodie,
        tees: realImage
      };
      const modelImage = modelImageByCategory[product.category] || realImage;
      product.photos = [
        { label: "Limpia", src: product.image, view: product.category === "medias" ? "real" : "clean" },
        { label: "Real", src: realImage, view: "real" }
      ];
    });
    comboProducts[0].photos = [
      { label: "Real", src: realShortImages["Royal Blue"], view: "real" },
      { label: "Medias", src: "./images/ghostwear-socks-real.jpg", view: "real" }
    ];
    comboProducts[1].photos = [
      { label: "Short", src: realShortImages["Light Gray"], view: "real" },
      { label: "Gorra", src: firstCapProduct.image, view: "clean" }
    ];
    comboProducts[2].photos = [
      { label: "Short", src: realShortImages["Black"], view: "real" },
      { label: "Hoodie", src: "./images/gear/ghostwear-hoodie.jpg", view: "real" }
    ];
    const shopCollections = [
      {
        title: "Combos",
        href: "#combos",
        image: "./images/designed/ghostwear-short-royal-blue-studio.webp",
        price: comboProducts[0].price,
        note: "Combos listos para resolver la vuelta."
      },
      {
        title: "Shorts",
        href: "#drop",
        image: "./images/designed/ghostwear-short-royal-blue-studio.webp",
        price: products[0].price,
        note: `${products.length} colores para armar el fit.`
      },
      {
        title: "Gorras",
        href: "#gear",
        image: firstCapProduct.image,
        price: firstCapProduct.price,
        note: `${capProducts.length} colorways de gorras con fondos de catalogo y texturas claras.`
      },
      {
        title: "Medias",
        href: "#gear",
        image: "./images/designed/ghostwear-socks-studio.webp",
        price: gearProducts.find(product => product.name === "Medias Ghost").price,
        note: `3 pares por ${gearProducts.find(product => product.name.includes("Pack")).priceLabel}.`
      },
      {
        title: "T-Shirts",
        href: "#gear",
        image: firstTeeProduct.image,
        price: firstTeeProduct.price,
        note: `${teeProducts.length} t-shirts con frente/espalda listos para pedir.`
      }
    ];
    let cart = [];

    year.textContent = new Date().getFullYear();
    floatingWa.href = waLink("Hola GhostWear, quiero conocer disponibilidad, tallas y entrega del drop activo.");

    if (
      welcomeCard
      && window.matchMedia("(pointer: fine)").matches
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      let introMotionFrame = 0;
      const setIntroMotion = (x, y) => {
        window.cancelAnimationFrame(introMotionFrame);
        introMotionFrame = window.requestAnimationFrame(() => {
          welcomeCard.style.setProperty("--intro-x", x.toFixed(3));
          welcomeCard.style.setProperty("--intro-y", y.toFixed(3));
        });
      };

      welcomeCard.addEventListener("pointermove", event => {
        const bounds = welcomeCard.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) - 0.5;
        const y = ((event.clientY - bounds.top) / bounds.height) - 0.5;
        setIntroMotion(x, y);
      });

      welcomeCard.addEventListener("pointerleave", () => setIntroMotion(0, 0));
    }

    function waLink(text) {
      return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
    }

    function openDrawer() {
      drawer.classList.add("open");
      overlay.classList.add("open");
      overlay.hidden = false;
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      window.setTimeout(() => {
        if (!overlay.classList.contains("open")) overlay.hidden = true;
      }, 180);
    }

    function animateProductImage(image) {
      if (!image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      image.classList.remove("image-switching");
      void image.offsetWidth;
      image.classList.add("image-switching");
      window.setTimeout(() => image.classList.remove("image-switching"), 380);
    }

    function bumpCart() {
      cartBtn.classList.remove("cart-bump");
      void cartBtn.offsetWidth;
      cartBtn.classList.add("cart-bump");
      window.setTimeout(() => cartBtn.classList.remove("cart-bump"), 440);
    }

    function setGalleryPhoto(photos, index) {
      const photo = photos[index] || photos[0];
      if (!photo) return;
      galleryModal.dataset.currentIndex = String(index);
      galleryImage.src = photo.src;
      galleryImage.alt = `${galleryTitle.textContent} - ${photo.label}`;
      galleryTabs.querySelectorAll(".gallery-tab").forEach((button, buttonIndex) => {
        button.classList.toggle("active", buttonIndex === index);
      });
    }

    function moveGallery(step) {
      const photos = JSON.parse(galleryModal.dataset.photos || "[]");
      if (!photos.length) return;
      const currentIndex = Number(galleryModal.dataset.currentIndex || 0);
      const nextIndex = (currentIndex + step + photos.length) % photos.length;
      setGalleryPhoto(photos, nextIndex);
    }

    function openGallery(title, photos, startIndex = 0) {
      if (!photos.length) return;
      galleryTitle.textContent = title;
      galleryTabs.innerHTML = photos.map((photo, index) => `
        <button class="gallery-tab${index === startIndex ? " active" : ""}" type="button" data-gallery-index="${index}" data-gallery-view="${photo.view}">
          <img src="${photo.src}"${responsiveImageAttributes(photo.src, "96px")} alt="" loading="lazy" decoding="async" />
          <span>${photo.label}</span>
        </button>
      `).join("");
      galleryModal.dataset.photos = JSON.stringify(photos);
      galleryModal.dataset.currentIndex = String(startIndex);
      galleryModal.classList.add("open");
      galleryModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      setGalleryPhoto(photos, startIndex);
    }

    function closeGalleryModal() {
      galleryModal.classList.remove("open");
      galleryModal.setAttribute("aria-hidden", "true");
      if (!drawer.classList.contains("open")) document.body.classList.remove("no-scroll");
    }

    function getChoice(button) {
      const card = button.closest("[data-product-card]");
      const variantText = card.querySelector(".variant-summary")?.textContent.replace(/\s+/g, " ").trim();
      const statusText = card.querySelector(".availability-line")?.textContent.replace(/\s+/g, " ").trim();
      const currentImage = card.querySelector(".color-img img")?.getAttribute("src");
      const productPath = currentImage ? currentImage.replace("./", "") : "";
      return {
        name: button.dataset.name,
        price: Number(button.dataset.price),
        unitPrice: button.dataset.priceLabel || moneyText(Number(button.dataset.price)),
        category: button.dataset.category || card.dataset.category,
        variant: variantText || button.dataset.name,
        status: statusText || "Estado: por confirmar por WhatsApp",
        image: productPath ? `https://ghostwear1.com/${productPath}` : "https://ghostwear1.com/",
        link: "https://ghostwear1.com/",
        size: card.querySelector(".size").value,
        qty: Number(card.querySelector(".qty").value),
        delivery: card.querySelector(".delivery").value
      };
    }

    function selectProductColor(colorButton) {
      const card = colorButton.closest("[data-product-card]");
      const imageWrap = card.querySelector(".color-img");
      const image = imageWrap.querySelector("img");
      const title = card.querySelector(".color-title h3");
      const note = card.querySelector(".color-body p");
      const chip = card.querySelector(".color-chip");
      const tagBadge = card.querySelector(".badge-row .badge:nth-child(2)");
      const urgentBadge = card.querySelector(".badge-row .badge.urgent");
      const addButton = card.querySelector(".add");
      const waButton = card.querySelector(".wa");
      const label = imageWrap.querySelector(".photo-label");
      const stockLine = card.querySelector(".stock-line");
      const sellLine = card.querySelector(".sell-line");
      const availabilityLine = card.querySelector(".availability-line");
      const courtLine = card.querySelector(".court-line");
      const shortDot = card.querySelector(".variant-short-dot");
      const shortText = card.querySelector(".variant-short-text");
      const logoDot = card.querySelector(".variant-logo-dot");
      const logoText = card.querySelector(".variant-logo-text");

      setResponsiveImage(image, colorButton.dataset.productImage);
      image.alt = `${colorButton.dataset.productName} - Limpia`;
      animateProductImage(image);
      imageWrap.dataset.galleryTitle = colorButton.dataset.productName;
      imageWrap.dataset.galleryPhotos = JSON.stringify([
        { label: "Limpia", src: colorButton.dataset.productImage, view: "clean" },
        { label: "Real", src: colorButton.dataset.productRealImage, view: "real" }
      ]);
      imageWrap.dataset.view = "clean";
      title.textContent = colorButton.dataset.productName;
      note.textContent = colorButton.dataset.productNote;
      chip.style.background = colorButton.dataset.productHex;
      tagBadge.textContent = colorButton.dataset.color;
      if (shortDot) shortDot.style.setProperty("--variant-dot", colorButton.dataset.productHex);
      if (shortText) shortText.textContent = `Short ${colorButton.dataset.color}`;
      if (logoDot) logoDot.style.setProperty("--variant-dot", colorButton.dataset.productLogoHex);
      if (logoText) logoText.textContent = colorButton.dataset.productLogoLabel;
      if (urgentBadge) urgentBadge.textContent = colorButton.dataset.productUrgencyLabel;
      if (stockLine) stockLine.textContent = colorButton.dataset.productUrgencyLine;
      if (sellLine) sellLine.textContent = colorButton.dataset.productSellLine;
      if (availabilityLine) availabilityLine.innerHTML = `<strong>Estado:</strong> ${colorButton.dataset.productAvailability}`;
      if (courtLine) courtLine.textContent = colorButton.dataset.productCourtLine;
      addButton.dataset.name = colorButton.dataset.productName;
      waButton.dataset.name = colorButton.dataset.productName;
      if (label) label.textContent = "Color";

      card.querySelectorAll("[data-color-option]").forEach(button => {
        button.classList.toggle("active", button === colorButton);
      });
    }

    function productCard(product, options = {}) {
      const swatch = product.swatch || product.hex || "#f4f1dc";
      const badge = options.badge || "En stock";
      const tag = options.tag || product.tag || product.category;
      const imageLoading = options.eagerImage ? "eager" : "lazy";
      const imagePriority = options.eagerImage ? ' fetchpriority="high"' : "";
      const selectedSize = options.selectedSize ?? (product.sizes.length > 1 ? 1 : 0);
      const sellLine = options.sellLine || (product.oldPrice ? `Precio normal ${product.oldPrice}` : "Agrega y manda el DM");
      const photos = product.photos || [{ label: "Real", src: product.image, view: "real" }];
      const primaryPhoto = photos[0];
      const urgency = product.urgency || { label: "Drop activo", line: "Disponible ahora mientras dure el drop." };
      const logoTone = product.logoTone || { label: "Logo blanco", hex: "#f8f6ee" };
      const isCombo = product.category === "combos";
      const compact = options.compact || false;
      const savedAmount = isCombo && product.normalPrice ? product.normalPrice - product.price : 0;
      const availabilityCopy = product.sizes.length > 1
        ? (product.availability ? `${product.availability.label}: ${product.availability.line}` : "Por confirmar: disponibilidad por talla/color se confirma por WhatsApp antes del pago.")
        : "Disponibilidad se confirma por WhatsApp antes del pago.";
      const sizeHelp = product.sizes.length > 1
        ? `<a class="size-help" href="#tallas" aria-label="Ver guia de tallas para ${product.name}">Ver guia de tallas</a>`
        : "";
      const priceMarkup = isCombo
        ? `<span class="price-stack"><small class="old-price">${product.oldPrice}</small><strong class="combo-price">${product.priceLabel}</strong><small class="combo-save">Ahorras ${moneyText(savedAmount)}</small></span>`
        : `<span>${product.priceLabel}</span>`;
      const comboPieces = isCombo && product.comboImages
        ? `<div class="combo-pieces" aria-label="Piezas incluidas en ${product.name}">
            ${product.comboImages.map(piece => `
              <span class="combo-piece">
                <img src="${piece.src}"${responsiveImageAttributes(piece.src, "120px")} alt="${piece.label} incluido en ${product.name}" loading="lazy" decoding="async" />
                <span>${piece.label}</span>
              </span>
            `).join("")}
          </div>`
        : "";
      const comboIncludes = isCombo && product.includes
        ? `<div class="combo-includes">
            ${product.includes.map(item => `<span>${item}</span>`).join("")}
          </div>
          <div class="combo-ticket">
            <small>Precio por separado ${product.oldPrice}. Oferta para pedir el fit junto.</small>
            <strong>${product.priceLabel}</strong>
          </div>`
        : "";
      const colorPicker = product.colorOptions
        ? `<div class="color-picker" aria-label="Colores disponibles para ${product.name}">
            ${product.colorOptions.map((option, index) => {
              const cleanImage = cleanShortImages[option.color] || option.image;
              const optionUrgency = option.urgency || { label: "Drop activo RD", line: "Disponible por DM mientras dure el drop." };
              const optionStatus = option.availability || { label: "Por confirmar", line: optionUrgency.line };
              const optionAvailability = `${optionStatus.label}: ${optionStatus.line}`;
              return `
                <button
                  class="color-swatch${index === 0 ? " active" : ""}"
                  type="button"
                  style="--swatch:${option.hex}"
                  title="${option.color}"
                  aria-label="Ver ${option.name}"
                  data-color-option
                  data-color="${option.color}"
                  data-product-name="${option.name}"
                  data-product-note="${option.note}"
                  data-product-image="${cleanImage}"
                  data-product-real-image="${option.image}"
                  data-product-hex="${option.hex}"
                  data-product-logo-label="${option.logoTone.label}"
                  data-product-logo-hex="${option.logoTone.hex}"
                  data-product-urgency-label="${optionUrgency.label}"
                  data-product-urgency-line="${optionUrgency.line}"
                  data-product-availability="${optionAvailability}"
                  data-product-sell-line="${option.color} validado por DM"
                  data-product-court-line="${option.courtLine || ""}"
                ></button>
              `;
            }).join("")}
          </div>`
        : "";
      const variantSummary = product.colorOptions
        ? `<div class="variant-summary" aria-label="Color seleccionado para ${product.name}">
            <span class="variant-chip">
              <span class="variant-dot variant-short-dot" style="--variant-dot:${swatch}" aria-hidden="true"></span>
              <span class="variant-short-text">Short ${product.colorOptions[0].color}</span>
            </span>
            <span class="variant-chip">
              <span class="variant-dot variant-logo-dot" style="--variant-dot:${logoTone.hex}" aria-hidden="true"></span>
              <span class="variant-logo-text">${logoTone.label}</span>
            </span>
          </div>`
        : product.category === "shorts"
          ? `<div class="variant-summary" aria-label="Color de ${product.name}">
              <span class="variant-chip">
                <span class="variant-dot" style="--variant-dot:${swatch}" aria-hidden="true"></span>
                Short ${product.color}
              </span>
              <span class="variant-chip">
                <span class="variant-dot" style="--variant-dot:${logoTone.hex}" aria-hidden="true"></span>
                ${logoTone.label}
              </span>
            </div>`
          : "";

      return `
        <article class="card color-card${isCombo ? " combo-offer" : ""}${compact ? " compact-card" : ""}" data-product-card data-category="${product.category}">
          <div class="color-img" data-view="${primaryPhoto.view}" data-gallery-title="${attrText(product.name)}" data-gallery-photos="${attrJson(photos)}">
            <img src="${primaryPhoto.src}"${responsiveImageAttributes(primaryPhoto.src)} alt="${product.name} - ${primaryPhoto.label}" loading="${imageLoading}"${imagePriority} decoding="async" />
            <span class="color-chip" style="background:${swatch}" aria-hidden="true"></span>
            <span class="ghost-corner" aria-hidden="true">BOO</span>
            <span class="zoom-hint">Ver grande</span>
            <span class="photo-label">${primaryPhoto.label}</span>
            ${comboPieces}
          </div>
          <div class="photo-tabs" aria-label="Fotos de ${product.name}">
            ${photos.map((photo, index) => `
              <button
                class="photo-tab${index === 0 ? " active" : ""}"
                type="button"
                data-photo-src="${photo.src}"
                data-photo-label="${photo.label}"
                data-photo-view="${photo.view}"
              >${photo.label}</button>
            `).join("")}
          </div>
          <div class="color-body">
            <div>
              <div class="badge-row">
                <span class="badge">${badge}</span>
                <span class="badge">${tag}</span>
                ${product.courtTag ? `<span class="badge court">${product.courtTag}</span>` : ""}
                <span class="badge urgent">${urgency.label}</span>
              </div>
              <div class="color-title">
                <h3>${product.name}</h3>
                ${priceMarkup}
              </div>
              ${compact ? `<button class="details-toggle" type="button" aria-expanded="false">Ver opciones</button>` : ""}
              <div class="product-details">
                ${comboIncludes}
                <p>${product.note}</p>
                ${colorPicker}
                ${variantSummary}
                ${product.courtLine ? `<div class="court-line">${product.courtLine}</div>` : ""}
                <div class="sell-line">${sellLine}</div>
                <div class="stock-line">${urgency.line}</div>
              </div>
            </div>
            <div class="purchase-panel">
              <div class="options">
                <label>Size
                  <select class="size">
                    ${product.sizes.map((size, index) => `<option${index === selectedSize ? " selected" : ""}>${size}</option>`).join("")}
                  </select>
                </label>
                <label>Cantidad
                  <select class="qty">
                    ${product.quantities.map((qty, index) => `<option${index === 0 ? " selected" : ""}>${qty}</option>`).join("")}
                  </select>
                </label>
                <label>Entrega
                  <select class="delivery">
                    <option selected>Santo Domingo</option>
                    <option>Interior RD</option>
                    <option>Retiro</option>
                    <option>USA por cotizacion</option>
                  </select>
                </label>
              </div>
              <p class="availability-line"><strong>Estado:</strong> ${availabilityCopy}</p>
              ${sizeHelp}
              <div class="buy-row">
                <button class="btn primary add" type="button" data-name="${product.name}" data-price="${product.price}" data-price-label="${product.priceLabel}" data-category="${product.category}">Agregar al carrito</button>
                <button class="btn wa" type="button" data-name="${product.name}" data-price="${product.price}" data-price-label="${product.priceLabel}" data-category="${product.category}">Pedir por WhatsApp</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    function buildMixedDropProducts() {
      const shortOrder = ["Red", "Black", "Royal Blue", "Baby Blue", "Neon Green", "White", "Orange", "Pink", "Navy", "Light Gray", "Olive", "Aqua", "Sky Blue", "Yellow", "Lavender"];
      const capOrder = [
        "Gorra 09 - Negra completa ghost blanco",
        "Gorra 08 - Azul con blanco lineas",
        "Gorra 01 - Azul con blanco",
        "Gorra 14 - Rosada completa ghost negro",
        "Gorra 06 - Roja en pana ghost negro",
        "Gorra 12 - Gris completa ghost negro"
      ];
      const orderedShorts = [
        ...shortOrder.map(color => products.find(product => product.color === color)).filter(Boolean),
        ...products.filter(product => !shortOrder.includes(product.color))
      ];
      const orderedCaps = [
        ...capOrder.map(name => capProducts.find(product => product.name === name)).filter(Boolean),
        ...capProducts.filter(product => !capOrder.includes(product.name))
      ];
      const lanes = {
        shorts: orderedShorts,
        gorras: orderedCaps,
        tees: [...teeProducts],
        medias: gearProducts.filter(product => product.category === "medias"),
        hoodie: gearProducts.filter(product => product.category === "hoodie")
      };
      const pattern = ["shorts", "gorras", "tees", "medias", "shorts", "gorras", "hoodie", "tees", "shorts", "gorras", "medias"];
      const mixed = [];
      const takeNext = category => {
        const product = lanes[category]?.shift();
        if (product && !mixed.includes(product)) mixed.push(product);
      };

      while (Object.values(lanes).some(group => group.length)) {
        pattern.forEach(takeNext);
        Object.keys(lanes).forEach(takeNext);
      }

      return mixed;
    }

    function comboBuilderMarkup() {
      const firstShort = products[0];
      const firstCap = capProducts[0];
      const firstTee = teeProducts[0];
      const socks = gearProducts.find(product => product.name === "Medias Ghost");
      const hoodie = gearProducts.find(product => product.category === "hoodie");
      const baseOptions = [
        { label: `Short Ghost (${firstShort.priceLabel})`, value: "Short Ghost" },
        { label: `Gorra Ghost (${firstCap.priceLabel})`, value: "Gorra Ghost" },
        { label: `T-Shirt Ghost (${firstTee.priceLabel})`, value: "T-Shirt Ghost" },
        { label: `Medias Ghost (${socks.priceLabel})`, value: "Medias Ghost" },
        { label: `Hoodie Ghost (${hoodie.priceLabel})`, value: "Hoodie Ghost" }
      ];
      const extras = [
        "Short extra",
        "Gorra",
        "T-Shirt",
        "Medias",
        "Hoodie"
      ];

      return `
        <article class="card combo-builder" data-combo-builder>
          <div class="combo-builder-visual">
            <span class="section-kicker">Armar combo</span>
            <h3>Arma tu combo.</h3>
            <p>Mezcla short, gorra, t-shirt, medias o hoodie. Confirmamos colores, tallas y precio por WhatsApp.</p>
          </div>
          <form class="combo-builder-form">
            <label>Base del combo
              <select class="combo-base">
                ${baseOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join("")}
              </select>
            </label>
            <fieldset>
              <legend>Agregar piezas</legend>
              <div class="combo-extra-grid">
                ${extras.map(extra => `
                  <label class="combo-extra">
                    <input type="checkbox" value="${extra}" />
                    <span>${extra}</span>
                  </label>
                `).join("")}
              </div>
            </fieldset>
            <div class="options">
              <label>Talla base
                <select class="combo-size">
                  <option selected>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>Unica</option>
                </select>
              </label>
              <label>Cantidad
                <select class="combo-qty">
                  <option selected>1</option>
                  <option>2</option>
                  <option>3</option>
                </select>
              </label>
              <label>Entrega
                <select class="combo-delivery">
                  <option selected>Santo Domingo</option>
                  <option>Interior RD</option>
                  <option>Retiro</option>
                  <option>USA por cotizacion</option>
                </select>
              </label>
            </div>
            <p class="combo-builder-note">El precio final se confirma despues de validar color, talla y stock. Ideal para pedir un fit completo sin que venga armado de antemano.</p>
            <button class="btn primary full combo-wa" type="button">Mandar combo por WhatsApp</button>
          </form>
        </article>
      `;
    }

    function normalizeShopText(value = "") {
      return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    }

    function shopProductsFor(filter) {
      if (filter === "todos") return buildMixedDropProducts();
      if (filter === "shorts") return products;
      return allProducts.filter(product => product.category === filter);
    }

    function renderFilteredShop(filter = activeShopFilter) {
      activeShopFilter = filter;
      filteredShopGrid.setAttribute("aria-busy", "true");
      const filterLabels = {
        todos: "todo el drop",
        combos: "combos",
        shorts: "shorts",
        medias: "medias",
        gorras: "gorras",
        hoodie: "hoodie",
        tees: "t-shirts"
      };
      const label = filterLabels[filter] || filter;

      if (filter === "combos") {
        filteredShopGrid.classList.add("sparse-results", "combo-results");
        filteredShopGrid.innerHTML = comboBuilderMarkup();
        shopFilterCount.textContent = "Arma tu combo con las piezas que quieras y mandalo por WhatsApp.";
        shopSearch.disabled = true;
        shopSort.disabled = true;
        shopLoadMoreWrap.hidden = true;
        filteredShopGrid.setAttribute("aria-busy", "false");
        return;
      }

      shopSearch.disabled = false;
      shopSort.disabled = false;
      filteredShopGrid.classList.remove("combo-results");
      const query = normalizeShopText(shopSearch.value.trim());
      let matchingProducts = shopProductsFor(filter).filter(product => {
        if (!query) return true;
        const searchable = [product.name, product.color, product.category, product.tag, product.note]
          .map(normalizeShopText)
          .join(" ");
        return searchable.includes(query);
      });

      if (shopSort.value === "price-asc") {
        matchingProducts = matchingProducts.map((product, index) => ({ product, index }))
          .sort((a, b) => a.product.price - b.product.price || a.index - b.index)
          .map(item => item.product);
      } else if (shopSort.value === "price-desc") {
        matchingProducts = matchingProducts.map((product, index) => ({ product, index }))
          .sort((a, b) => b.product.price - a.product.price || a.index - b.index)
          .map(item => item.product);
      }

      const visibleProducts = matchingProducts.slice(0, visibleShopLimit);
      filteredShopGrid.classList.toggle("sparse-results", matchingProducts.length > 0 && matchingProducts.length <= 3);
      if (!visibleProducts.length) {
        filteredShopGrid.innerHTML = `
          <div class="shop-empty">
            <strong>No encontramos esa pieza.</strong>
            <span>Prueba otro color, nombre o categoria.</span>
          </div>
        `;
        shopFilterCount.textContent = `0 resultados en ${label}`;
        shopLoadMoreWrap.hidden = true;
        filteredShopGrid.setAttribute("aria-busy", "false");
        return;
      }

      filteredShopGrid.innerHTML = visibleProducts.map(product => {
        const isCombo = product.category === "combos";
        return productCard(product, {
          badge: isCombo ? "Ahorro" : "En stock",
          tag: isCombo ? product.tag : product.tag,
          sellLine: isCombo ? `Oferta combo: ahorras ${moneyText(product.normalPrice - product.price)}` : "Disponible por DM",
          compact: true
        });
      }).join("");
      prepareProductImages(filteredShopGrid);
      filteredShopGrid.setAttribute("aria-busy", "false");
      shopFilterCount.textContent = `Mostrando ${visibleProducts.length} de ${matchingProducts.length} pieza${matchingProducts.length === 1 ? "" : "s"} en ${label}`;
      shopLoadMoreWrap.hidden = visibleProducts.length >= matchingProducts.length;
    }

    function setShopFilter(filter = "todos") {
      const filterButton = shopFilters.querySelector(`[data-filter="${filter}"]`) || shopFilters.querySelector('[data-filter="todos"]');
      shopFilters.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle("active", button === filterButton);
      });
      visibleShopLimit = shopPageSize;
      renderFilteredShop(filterButton.dataset.filter);
    }

    function revealCollection(filter = "todos") {
      trackEvent("enter_collection", { category: filter });
      setShopFilter(filter);
      const shop = document.getElementById("shop");
      shop.classList.remove("shop-discovered");
      void shop.offsetWidth;
      shop.classList.add("shop-discovered");
      try {
        sessionStorage.setItem("ghostIntroSeen", "1");
      } catch (error) {
      }
      document.body.classList.add("intro-leaving");
      const introExitDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 760;
      window.setTimeout(() => {
        document.body.classList.remove("intro-active", "intro-leaving");
        document.body.classList.add("intro-dismissed");
        shop.scrollIntoView({ behavior: "smooth", block: "start" });
      }, document.body.classList.contains("intro-active") ? introExitDuration : 0);
      window.setTimeout(() => shop.classList.remove("shop-discovered"), 1050);
    }

    function renderStorefront() {
      const minPrice = Math.min(...allProducts.map(product => product.price));
      const featuredAnnouncements = [
        "Drop activo RD",
        "USA por cotizacion",
        "Quedan pocas unidades",
        "Color mas pedido: Royal Blue",
        `Shorts ${products[0].priceLabel}`,
        `Medias ${gearProducts.find(product => product.name === "Medias Ghost").priceLabel}`,
        `3 pares ${gearProducts.find(product => product.name.includes("Pack")).priceLabel}`,
        `Gorras ${gearProducts.find(product => product.name.includes("Gorra")).priceLabel}`,
        `Hoodie ${gearProducts.find(product => product.name.includes("Hoodie")).priceLabel}`,
        `T-Shirts ${firstTeeProduct.priceLabel}`,
        store.shipping
      ];

      const marqueeItems = [...featuredAnnouncements, ...featuredAnnouncements];
      announceTrack.innerHTML = marqueeItems.map(item => `<span>${item}</span>`).join("");
      heroTag.textContent = store.hero.tag;
      heroFeature.textContent = store.hero.feature;
      heroPrice.textContent = products[0].priceLabel;
      heroStats.innerHTML = [
        { value: `${allProducts.length} piezas`, label: store.metrics.piecesLabel },
        { value: `Desde ${moneyText(minPrice)}`, label: "medias y packs" },
        { value: "RD + USA", label: "por cotizacion" }
      ].map(stat => `
        <div><strong>${stat.value}</strong><span>${stat.label}</span></div>
      `).join("");

      shopCards.innerHTML = `
        <article class="card switch-card">
          <div>
            <span class="section-kicker">Shop the Ghost</span>
            <h2>Arma el fit por pieza o combo.</h2>
          </div>
          <p>Producto, precio, talla, cantidad y DM listo para WhatsApp. Sin perder tiempo.</p>
        </article>
        ${shopCollections.map(collection => `
          <a class="card switch-card image" href="${collection.href}" style="background-image:url('${collection.image}')">
            <span class="switch-price">${moneyText(collection.price)}</span>
            <div>
              <h3>${collection.title}</h3>
              <p>${collection.note}</p>
            </div>
          </a>
        `).join("")}
      `;
    }

    function renderCombos() {
      comboGrid.innerHTML = comboBuilderMarkup();
    }

    function renderProducts() {
      const prioritizeCatalogImages = document.body.classList.contains("intro-dismissed");
      productGrid.innerHTML = products.map((product, index) => productCard(product, {
        badge: "En stock",
        tag: product.color,
        sellLine: "Disponible por DM hoy",
        eagerImage: prioritizeCatalogImages && index < 3
      })).join("");
    }

    function renderGear() {
      gearGrid.innerHTML = gearProducts.map(product => productCard(product, {
        badge: "En stock",
        tag: product.tag,
        selectedSize: 0,
        sellLine: "Agrega y manda el DM"
      })).join("");
    }

    function restoreDeepLink() {
      if (!location.hash || !document.body.classList.contains("intro-dismissed")) return;
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      requestAnimationFrame(() => {
        setTimeout(() => target.scrollIntoView({ block: "start" }), 80);
      });
    }

    function itemKey(item) {
      return [item.name, item.size, item.delivery].join("|");
    }

    function renderCart() {
      const count = cart.reduce((sum, item) => sum + item.qty, 0);
      const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
      cartCountEl.textContent = count;
      cartTotalEl.textContent = money.format(total);

      if (!cart.length) {
        cartItemsEl.innerHTML = '<p class="empty">Tu carrito esta vacio. Agrega una pieza y manda el DM.</p>';
        return;
      }

      cartItemsEl.innerHTML = cart.map((item, index) => {
        const subtotal = item.qty * item.price;
        return `
          <article class="cart-item">
            <div class="cart-item-top">
              <div>
                <h3>${item.name}</h3>
                <p>${item.variant || item.name}</p>
                <p>Talla ${item.size} | ${item.delivery}</p>
                <p>${item.qty} x RD$ ${money.format(item.price)}</p>
              </div>
              <button class="remove" type="button" data-remove="${index}" aria-label="Quitar ${item.name}">X</button>
            </div>
            <strong>RD$ ${money.format(subtotal)}</strong>
          </article>
        `;
      }).join("");
    }

    function addItem(item) {
      const existing = cart.find(cartItem => itemKey(cartItem) === itemKey(item));
      if (existing) existing.qty += item.qty;
      else cart.push(item);
      renderCart();
      bumpCart();
      openDrawer();
    }

    function addLookToCart() {
      const royalShort = products.find(product => product.color === "Royal Blue");
      const socks = gearProducts.find(product => product.name === "Medias Ghost");
      const cap = firstCapProduct;
      const lookItems = [
        {
          name: royalShort.name,
          price: royalShort.price,
          unitPrice: royalShort.priceLabel,
          category: royalShort.category,
          variant: `Short ${royalShort.color} ${royalShort.logoTone.label}`,
          status: `${royalShort.availability.label}: ${royalShort.availability.line}`,
          image: `https://ghostwear1.com/${royalShort.image.replace("./", "")}`,
          link: "https://ghostwear1.com/",
          size: "M",
          qty: 1,
          delivery: "Santo Domingo"
        },
        {
          name: socks.name,
          price: socks.price,
          unitPrice: socks.priceLabel,
          category: socks.category,
          variant: "Medias talla unica",
          status: "Disponible por DM: se confirma antes de pago.",
          image: "https://ghostwear1.com/images/ghostwear-socks-real.jpg",
          link: "https://ghostwear1.com/",
          size: "Unica",
          qty: 1,
          delivery: "Santo Domingo"
        },
        {
          name: cap.name,
          price: cap.price,
          unitPrice: cap.priceLabel,
          category: cap.category,
          variant: cap.name,
          status: "Disponible por DM: colorway se confirma antes de pago.",
          image: `https://ghostwear1.com/${cap.image.replace("./", "")}`,
          link: "https://ghostwear1.com/",
          size: "Unica",
          qty: 1,
          delivery: "Santo Domingo"
        }
      ];

      lookItems.forEach(item => {
        const existing = cart.find(cartItem => itemKey(cartItem) === itemKey(item));
        if (existing) existing.qty += item.qty;
        else cart.push(item);
      });
      renderCart();
      bumpCart();
      openDrawer();
    }

    function buildSingleMessage(item) {
      const locationPrompt = item.delivery.includes("USA")
        ? "Ciudad / Estado / ZIP:"
        : "Sector o ciudad:";
      return `Hola GhostWear, quiero armar este fit.

Producto: ${item.name}
Variante: ${item.variant}
Talla: ${item.size}
Cantidad: ${item.qty}
Entrega: ${item.delivery}
Precio unitario: ${item.unitPrice}
Total: RD$ ${money.format(item.price * item.qty)}
${item.status}

Foto / referencia: ${item.image}
Pagina: ${item.link}

Mi nombre es:
${locationPrompt}
Referencia de entrega:`;
    }

    function buildCheckoutMessage() {
      const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
      const hasUsa = cart.some(item => item.delivery.includes("USA"));
      const locationPrompt = hasUsa ? "Ciudad / Estado / ZIP:" : "Sector o ciudad:";
      const lines = cart.map(item => {
        return `- ${item.name} | ${item.variant} | Talla ${item.size} | ${item.delivery} | x${item.qty} | RD$ ${money.format(item.qty * item.price)}`;
      }).join("\n");

      return `Hola GhostWear, quiero cerrar este pedido.

Items:
${lines}

Total: RD$ ${money.format(total)}
Pagina: https://ghostwear1.com/

Mi nombre es:
${locationPrompt}
Referencia de entrega:`;
    }

    function buildComboMessage(builder) {
      const base = builder.querySelector(".combo-base").value;
      const extras = [...builder.querySelectorAll(".combo-extra input:checked")].map(input => input.value);
      const size = builder.querySelector(".combo-size").value;
      const qty = builder.querySelector(".combo-qty").value;
      const delivery = builder.querySelector(".combo-delivery").value;
      const locationPrompt = delivery.includes("USA") ? "Ciudad / Estado / ZIP:" : "Sector o ciudad:";

      return `Hola GhostWear, quiero armar un combo a mi forma.

Base: ${base}
Agregar: ${extras.length ? extras.join(", ") : "Por confirmar"}
Talla base: ${size}
Cantidad: ${qty}
Entrega: ${delivery}

Quiero que me confirmen colores disponibles, tallas y precio final del combo.
Pagina: https://ghostwear1.com/

Mi nombre es:
${locationPrompt}
Referencia de entrega:`;
    }

    renderStorefront();
    if (document.body.classList.contains("intro-dismissed")) renderFilteredShop();
    trackEvent("page_view", { mode: document.body.classList.contains("intro-active") ? "intro" : "catalog" });

    shopFilters.addEventListener("click", event => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      trackEvent("filter", { category: button.dataset.filter });
      setShopFilter(button.dataset.filter);
    });

    let shopSearchTimer;
    shopSearch.addEventListener("input", () => {
      window.clearTimeout(shopSearchTimer);
      shopSearchTimer = window.setTimeout(() => {
        visibleShopLimit = shopPageSize;
        renderFilteredShop();
        trackEvent("shop_search", { query: shopSearch.value.trim() });
      }, 120);
    });

    shopSort.addEventListener("change", () => {
      visibleShopLimit = shopPageSize;
      renderFilteredShop();
      trackEvent("shop_sort", { order: shopSort.value });
    });

    shopLoadMore.addEventListener("click", () => {
      visibleShopLimit += shopPageSize;
      renderFilteredShop();
      trackEvent("shop_load_more", { visible: visibleShopLimit, category: activeShopFilter });
    });

    document.addEventListener("click", event => {
      const discoverTarget = event.target.closest("[data-discover-shop]");
      if (discoverTarget) {
        event.preventDefault();
        revealCollection("todos");
        return;
      }

      const shopFilterLink = event.target.closest("[data-shop-filter]");
      if (shopFilterLink) {
        if (shopFilterLink.tagName === "A") {
          event.preventDefault();
          revealCollection(shopFilterLink.dataset.shopFilter);
          return;
        }
        setShopFilter(shopFilterLink.dataset.shopFilter);
        return;
      }

      const detailsToggle = event.target.closest(".details-toggle");
      if (detailsToggle) {
        const card = detailsToggle.closest("[data-product-card]");
        const willOpen = !card.classList.contains("details-open");
        filteredShopGrid.querySelectorAll(".compact-card.details-open").forEach(openCard => {
          if (openCard === card) return;
          openCard.classList.remove("details-open");
          const openButton = openCard.querySelector(".details-toggle");
          openButton.setAttribute("aria-expanded", "false");
          openButton.textContent = "Ver opciones";
        });
        card.classList.toggle("details-open", willOpen);
        detailsToggle.setAttribute("aria-expanded", String(willOpen));
        detailsToggle.textContent = willOpen ? "Cerrar opciones" : "Ver opciones";
        trackEvent("product_details", { product: card.querySelector("h3").textContent, open: willOpen });
        return;
      }

      const colorButton = event.target.closest("[data-color-option]");
      if (colorButton) {
        selectProductColor(colorButton);
        trackEvent("select_color", { color: colorButton.dataset.color });
        return;
      }

      const photoButton = event.target.closest(".photo-tab");
      if (photoButton) {
        const card = photoButton.closest("[data-product-card]");
        const imageWrap = card.querySelector(".color-img");
        const image = imageWrap.querySelector("img");
        const label = imageWrap.querySelector(".photo-label");
        setResponsiveImage(image, photoButton.dataset.photoSrc);
        image.alt = `${card.querySelector("h3").textContent} - ${photoButton.dataset.photoLabel}`;
        animateProductImage(image);
        imageWrap.dataset.view = photoButton.dataset.photoView;
        label.textContent = photoButton.dataset.photoLabel;
        card.querySelectorAll(".photo-tab").forEach(button => {
          button.classList.toggle("active", button === photoButton);
        });
        return;
      }

      const galleryTarget = event.target.closest(".color-img");
      if (galleryTarget) {
        const card = galleryTarget.closest("[data-product-card]");
        const title = galleryTarget.dataset.galleryTitle || card.querySelector("h3").textContent;
        const photos = JSON.parse(galleryTarget.dataset.galleryPhotos || "[]");
        const currentSrc = galleryTarget.querySelector("img").getAttribute("src");
        const startIndex = Math.max(0, photos.findIndex(photo => photo.src === currentSrc));
        openGallery(title, photos, startIndex);
        return;
      }

      const addButton = event.target.closest(".add");
      if (addButton) {
        const choice = getChoice(addButton);
        addItem(choice);
        trackEvent("add_to_cart", { product: choice.name, category: choice.category });
        return;
      }

      const waButton = event.target.closest(".wa");
      if (waButton) {
        const choice = getChoice(waButton);
        trackEvent("product_whatsapp", { product: choice.name, category: choice.category });
        window.open(waLink(buildSingleMessage(choice)), "_blank", "noopener");
      }
    });

    cartItemsEl.addEventListener("click", event => {
      const removeButton = event.target.closest("[data-remove]");
      if (!removeButton) return;
      cart.splice(Number(removeButton.dataset.remove), 1);
      renderCart();
    });

    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) {
        openDrawer();
        return;
      }
      trackEvent("checkout_whatsapp", { items: cart.reduce((sum, item) => sum + item.qty, 0) });
      window.open(waLink(buildCheckoutMessage()), "_blank", "noopener");
    });

    clearBtn.addEventListener("click", () => {
      cart = [];
      renderCart();
    });

    cartBtn.addEventListener("click", openDrawer);
    cartLinks.forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      openDrawer();
    }));
    document.addEventListener("click", event => {
      const comboButton = event.target.closest(".combo-wa");
      if (!comboButton) return;
      const builder = comboButton.closest("[data-combo-builder]");
      if (!builder) return;
      trackEvent("combo_whatsapp");
      window.open(waLink(buildComboMessage(builder)), "_blank", "noopener");
    });
    heroLookBtn.addEventListener("click", addLookToCart);
    heroCartBtn.addEventListener("click", openDrawer);
    welcomeFitBtn.addEventListener("click", () => revealCollection("combos"));
    closeCart.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    closeGallery.addEventListener("click", closeGalleryModal);
    galleryPrev.addEventListener("click", () => moveGallery(-1));
    galleryNext.addEventListener("click", () => moveGallery(1));
    galleryModal.addEventListener("click", event => {
      if (event.target === galleryModal) closeGalleryModal();
      const tab = event.target.closest("[data-gallery-index]");
      if (!tab) return;
      setGalleryPhoto(JSON.parse(galleryModal.dataset.photos || "[]"), Number(tab.dataset.galleryIndex));
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeGalleryModal();
        closeDrawer();
      }
      if (galleryModal.classList.contains("open") && event.key === "ArrowLeft") moveGallery(-1);
      if (galleryModal.classList.contains("open") && event.key === "ArrowRight") moveGallery(1);
    });

    renderCart();
    restoreDeepLink();
    window.addEventListener("hashchange", restoreDeepLink);
    floatingWa.addEventListener("click", () => trackEvent("floating_whatsapp"));

    const shopSection = document.getElementById("shop");
    if ("IntersectionObserver" in window) {
      const shopObserver = new IntersectionObserver(entries => {
        document.body.classList.toggle("shop-in-view", entries.some(entry => entry.isIntersecting));
      }, { threshold: 0.08 });
      shopObserver.observe(shopSection);
    }

    window.addEventListener("load", () => {
      try {
        const navigation = performance.getEntriesByType("navigation")[0];
        if (navigation) {
          trackEvent("performance", {
            domReadyMs: Math.round(navigation.domContentLoadedEventEnd),
            loadMs: Math.round(navigation.loadEventEnd)
          });
        }
      } catch (error) {
      }

      if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
      }
    });
