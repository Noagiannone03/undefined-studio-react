# Direction Artistique — Undefined Studio

> **Soft-Pop Néo-Brutalisme**
> Un langage visuel qui marie la structure brute et physique du néo-brutalisme avec la chaleur, l'éditorial et la lisibilité d'un design soft-pop. Le résultat : un site qui a du caractère, qui surprend, mais qui ne fatigue pas.

---

## Concept

Le site est une **expérience**, pas un catalogue. Chaque section doit mériter le scroll. L'utilisateur doit avoir envie de rester, de descendre, de comprendre. La DA repose sur trois pilliers :

1. **Typographie souveraine** — Le texte n'illustre pas le design, il EST le design. Les headlines sont massives, elles remplissent la largeur viewport. Les polices se mélangent : Archivo Black pour la force, Instrument Serif italic pour le souffle éditorial, JetBrains Mono pour la précision technique.
2. **Physicalité brutaliste** — Les éléments ont du poids. Les cartes ont des ombres décalées (`box-shadow: 8px 8px 0 [couleur]`), les bordures sont visibles et assumées (2px solid ink). L'effet "press" au hover (translate + shadow collapse) donne une sensation tactile.
3. **Motion justifié** — Chaque animation a une raison d'être. Pas de rotation décorative, pas de parallax pour le parallax. Le scroll révèle, le hover récompense, le clip-path dévoile. GSAP est l'outil, l'intention est la règle.

---

## Palette

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-paper` | `#EFEBDD` | Background principal — chaud, patiné, pas blanc |
| `--color-paper-2` | `#E6E1D0` | Fonds secondaires, cartes |
| `--color-ink` | `#0E0E0C` | Texte principal, bordures |
| `--color-klein` | `#1D1DBF` | Accent primaire — électrique, affirmé |
| `--color-tomato` | `#E84A2A` | Accent secondaire — chaleureux, actif |

**Règle d'usage des couleurs :** paper en fond, ink en texte/bordure par défaut. Klein pour les éléments qui guident (CTA, chiffres actifs, accents de section). Tomato pour les éléments qui vivent (tags actifs, highlights, moments de surprise).

---

## Typographie

### Hiérarchie

| Rôle | Police | Taille | Caractère |
|------|--------|--------|-----------|
| **Display** | Archivo Black | `clamp(72px, 14vw, 210px)` | `letter-spacing: -0.045em`, `line-height: 0.88` |
| **Headline section** | Archivo Black | `clamp(48px, 8vw, 120px)` | Même tracking |
| **Serif éditorial** | Instrument Serif italic | `clamp(18px, 2vw, 28px)` | Souffle, contraste avec le display |
| **Corps** | Satoshi | `clamp(15px, 1.2vw, 18px)` | `line-height: 1.5` |
| **Label / Mono** | JetBrains Mono | `11px` | `letter-spacing: 0.2em`, uppercase |

### Mix éditorial

La signature typographique du studio vient du **mélange Archivo Black + Instrument Serif italic**. Dans les titres, certaines lignes ou mots peuvent basculer en serif italic pour créer une respiration :

```
WE BUILD          ← Archivo Black
things that       ← Instrument Serif italic
MOVE.             ← Archivo Black + tomato
```

Ce contraste brut/éditorial est la DA. Ne pas l'uniformiser.

---

## Composants UI

### Neo-brutal card
```css
border: 2px solid var(--color-ink);
box-shadow: 8px 8px 0 var(--project-color);  /* ou ink */
transition: transform 200ms ease, box-shadow 200ms ease;

:hover {
  transform: translate(8px, 8px);
  box-shadow: none;
}
```
L'effet "press" est central. Il donne une sensation physique et rend les cartes mémorables.

### Barre d'accent couleur
Chaque card projet a une barre pleine hauteur 8px en haut, dans la couleur du projet. Identifiant visuel immédiat.

### Labels de section
Format : `( 01 ) — Titre du chapitre`  
Police : JetBrains Mono, 11px, uppercase, `opacity: 0.5`  
Rôle : structure narrative, like a magazine chapter marker.

### Boutons
- **CTA principal** : neo-brutal (bordure 2px + ombre décalée), effect press au hover
- **Tags** : bordure 1px ink, sans radius, mono 10px — des étiquettes industrielles

---

## Animations GSAP

### Principes
- **Easing** : `expo.out` pour les reveals (entrée explosive, sortie douce), `power3.out` pour les mouvements UI, `none` pour les scrub
- **Stagger** : 0.08–0.15s entre éléments liés
- **Durée** : 0.9–1.2s pour les reveals principaux, 0.2–0.4s pour les micro-interactions

### Patterns récurrents

**1. Text line reveal (masqué)**
```tsx
// HTML : .reveal-mask > .reveal-line
gsap.from('.reveal-line', {
  yPercent: 110,
  duration: 1.2,
  stagger: 0.12,
  ease: 'expo.out'
})
```

**2. Clip-path image reveal (gauche → droite)**
```tsx
gsap.fromTo(imgEl,
  { clipPath: 'inset(0 100% 0 0)' },
  { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'expo.out' }
)
```

**3. Horizontal scroll (pinned, scrub)**
```tsx
const tween = gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth),
  ease: 'none',
  scrollTrigger: { trigger: section, pin: true, scrub: 1, ... }
});
// Animations enfants via containerAnimation: tween
```

**4. Neo-brutal press (hover)**
```tsx
onMouseEnter: el.style.transform = 'translate(8px, 8px)'; el.style.boxShadow = 'none'
onMouseLeave: el.style.transform = ''; el.style.boxShadow = '8px 8px 0 [color]'
```

---

## Structure des sections

```
Hero          → Statement d'ouverture. "WE BUILD THINGS THAT MOVE."
Marquee       → Séparateur rythmique. Band noir, items défilent.
About         → Qui on est. Statement + valeurs. AVANT les projets.
Work          → Ce qu'on a fait. Horizontal scroll, panels fullscreen.
Capabilities  → Ce qu'on fait. Liste numérotée, hover tomato.
Footer        → CTA de fin. "LET'S MAKE SOMETHING UNFORGETTABLE."
```

**Règle de narration :** On présente le studio (About) avant de montrer les projets (Work). On crée l'envie avant de montrer la preuve.

---

## Ce qu'on évite

- Animations décorative sans sens (rotation infinie, float)
- Trop d'info par section (une idée = une section)
- Couleurs supplémentaires hors palette
- Typographie uniforme (le mix serif/display/mono est la signature)
- Cards avec radius (le néo-brutalisme = angles droits)
- Navbar visible (le site est une expérience linéaire)

---

*Last updated: April 2026*
