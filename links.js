// "Read more" links: each overview step → the Astronomy Companions sections that explain it, labelled by equation.
// Keyed '<module>:<stepIdx>' like FIGS. Each link is [page key, section anchor, label].
// COMPANIONS_BASE is the only place the site address lives; change it to
// '../astronomy-companions/' to use your local copies instead of the published site.
window.COMPANIONS_BASE = 'https://vmon5589.github.io/astronomyCompanions/';

window.COMPANION_PAGES = {
  K: ['kepler_companion.html', 'Kepler'],
  T: ['trigonometry_companion.html', 'Trigonometry'],
  L: ['cosmic_distance_ladder.html', 'Distance Ladder'],
  U: ['discovery_of_universe_scale.html', 'Universe Scale'],
  S: ['spectroscopy_companion.html', 'Spectroscopy'],
  R: ['redshift_companion.html', 'Redshift'],
  V: ['vera_rubin_companion.html', 'Vera Rubin'],
  M: ['mercury_vulcan_companion.html', 'Mercury & Vulcan'],
  N: ['neptune_companion.html', 'Neptune'],
  G: ['gravitational_waves_companion.html', 'Gravitational Waves'],
  B: ['blackholes_companion.html', 'Black Holes'],
  RA: ['radio_astronomy_companion.html', 'Radio Astronomy']
};

window.SEE = {
  // Labels are the key equation shown in that companion section (Unicode, not TeX).
  // A plain-text label is used only where the section has no relevant equation.

  // ── Kepler ──
  'kepler:0': [['K','wanderer','1/S = 1/T_E − 1/T_M'], ['L','planets','1/P = 1/P⊕ − 1/S'], ['K','oppositions','1555 / 687 = 2.263 orbits']],
  'kepler:1': [['K','triangulate','x_M = (y₂ − y₁ + x₁ tan m₁ − x₂ tan m₂) / (tan m₁ − tan m₂)'], ['L','kepler','E₁ + s û₁ = E₂ + t û₂'], ['T','ratios','opp = adj · tan θ']],
  'kepler:2': [['T','ellipse','r = a(1 − e²) / (1 + e cos θ)'], ['K','circle','Σ (r − |Pᵢ|)²'], ['K','ellipse','AC / MC = 1.00429']],
  'kepler:3': [['K','equant','e_Sun = e_Equant']],
  'kepler:4': [['T','ellipse','r = a(1 − e²) / (1 + e cos θ)']],
  'kepler:5': [['K','legacy','P² = a³'], ['T','ellipse','T² = 4π²a³ / GM'], ['L','au','1 AU = d_Mars / d_Mars[AU]']],

  // ── Positions ──
  'positions:0': [['T','radians','θ = D/d,  1 rad = 206,265″'], ['T','smallangle','sin p ≈ p ≈ tan p']],
  'positions:1': [['T','ratios','tan θ = opp / adj'], ['T','circle','(cos θ, sin θ)']],
  'positions:3': [['T','ratios','θ = tan⁻¹(opp / adj)'], ['T','circle','cos²θ + sin²θ = 1']],
  'positions:4': [['T','ratios','hyp² = opp² + adj²'], ['U','vanmaanen','v_t = 4.74 μ d']],
  'positions:5': [['T','circle','(cos θ, sin θ)']],
  'positions:6': [['T','ratios','tan θ = opp / adj'], ['T','smallangle','tan θ ≈ θ']],

  // ── Distances ──
  'distances:0': [['T','smallangle','sin θ ≈ θ ≈ tan θ'], ['T','radians','θ = D/d'], ['L','earth','θ / 360° = s / C']],
  'distances:1': [['L','parallax','d[pc] = 1 / p[″]'], ['T','smallangle','d = B / tan p → B / p'], ['L','au','d_Mars = B / p']],
  'distances:2': [['L','candles','F = L / 4πd²'], ['R','candles','F₅₀ / F₁₅₀ = (150/50)²']],
  'distances:3': [['U','leavitt','F₁ / F₂ = 10^(−0.4 (m₁ − m₂))']],
  'distances:4': [['L','candles','m − M = 5 log₁₀(d / 10 pc)'], ['U','calibrate','d = 10^((m − M + 5)/5) pc']],
  'distances:5': [['U','leavitt','M_V = −2.43 (log₁₀P − 1) − 4.05'], ['R','cepheids','M_V ≈ −1.43 − 2.81 log₁₀P'], ['U','calibrate','d = 10^((m − M + 5)/5) pc'], ['U','hubble','P = 31.4 d → M_V ≈ −5.3']],
  'distances:6': [['L','bigcandles','M_B ≈ −19.3 + 0.78 (Δm₁₅ − 1.1)'], ['R','dilation','Δt_obs = (1 + z) Δt_emit'], ['L','redshift','d ≈ cz / H₀']],

  // ── Speeds ──
  'speeds:0': [['S','doppler','Δλ / λ = v / c'], ['R','shift','v = (Δλ / λ) c'], ['V','doppler','Δλ = λ₀ v / c'], ['RA','doppler','Δf / f₀ = −v_r / c']],
  'speeds:1': [['S','calibration','dispersion = λ / (p − p₀)'], ['S','grating','sin θ = mλ / d'], ['S','resolution','R = λ / Δλ']],
  'speeds:2': [['V','observer','v⊕ = 29.79 cos β km/s']],
  'speeds:3': [['T','ratios','hyp² = opp² + adj²']],
  'speeds:4': [['V','tilt','v_obs = v_sys + v sin i cos θ'], ['T','ellipse','M = 4π²a³ / GT²']],
  'speeds:5': [['R','relativistic','1 + z = √((1 + β)/(1 − β))'], ['R','lorentz','γ = 1 / √(1 − β²)'], ['S','redshift','1 + z = a_now / a_then'], ['U','expansion','v = H₀ d']],

  // ── Composition ──
  'composition:0': [['S','blackbody','λ_peak = 2.898×10⁻³ / T'], ['B','spectra','B_λ(T) = (2hc²/λ⁵) / (e^(hc/λkT) − 1)']],
  'composition:1': [['S','balmer','1/λ = R_H (1/2² − 1/n²)'], ['B','lines','E_n = −13.6 eV / n²'], ['S','calibration','λ = dispersion × (p − p₀)']],
  'composition:2': [['S','balmer','E_n = −13.6 eV / n²']],
  'composition:3': [['S','classify','n_(i+1) / n_i ∝ T^(3/2) e^(−χ/kT) / n_e'], ['B','spectra','Payne applies Saha to stellar spectra']],
  'composition:4': [['S','classify','Saha: n_(i+1) / n_i ∝ T^(3/2) e^(−χ/kT) / n_e']],
  'composition:5': [['B','spectra','Payne: stars are mostly hydrogen'], ['S','kirchhoff','cool gas + continuum → absorption lines']],

  // ── Comets ──
  'comets:0': [['K','legacy','P² = a³'], ['T','ellipse','r = a(1 − e²) / (1 + e cos θ)']],
  'comets:1': [['T','ellipse','r = a(1 − e²) / (1 + e cos θ)'], ['L','kepler','r_min = a(1 − e),  r_max = a(1 + e)']],
  'comets:2': [['V','orbits','v = √(GM / r)'], ['T','integral','½ m v² = GMm / R']],
  'comets:3': [['N','clue','GM☉ = 4π²  (AU, yr)'], ['N','residual','O − C residual'], ['M','budget','532″ predicted vs 574″ observed']],
  'comets:4': [['T','ratios','θ = tan⁻¹(opp / adj)']],
  'comets:5': [['K','triangulate','x_M = (y₂ − y₁ + x₁ tan m₁ − x₂ tan m₂) / (tan m₁ − tan m₂)'], ['L','kepler','E₁ + s û₁ = E₂ + t û₂']],
  'comets:6': [['S','doppler','v = c Δλ / λ'], ['T','smallangle','L = d tan θ']],

  // ── Mercury ──
  'mercury:0': [['M','budget','574″ − 532″ ≈ 43″ per century'], ['M','precession','574″ per century ≈ 1.4″ per orbit'], ['M','vulcan','43″ per century → Vulcan?']],
  'mercury:1': [['V','orbits','v = √(GM / r)'], ['T','ellipse','r = a(1 − e²) / (1 + e cos θ)']],
  'mercury:2': [['M','relativity','Δφ = 6πGM / c²a(1 − e²)'], ['B','horizon','r_s = 2GM / c²'], ['T','taylor','√(1 − R_s/r) ≈ 1 − R_s/2r']],
  'mercury:3': [['M','relativity','Δφ = 6πGM / c²a(1 − e²)']],
  'mercury:4': [['M','budget','574″ − 532″ ≈ 43″ per century']],
  'mercury:5': [['G','appendix','ω̇ = 4.2° per year'], ['G','decay','P = (32/5)(G⁴/c⁵)(m₁m₂)²(m₁ + m₂) / a⁵'], ['B','neutron','v_eq = 2πR / P']]
};
