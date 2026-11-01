/* Device hints are used only for presentation, never for identifying a player. */
(() => {
  const root = document.documentElement;
  function detectDevice(agent, touchPoints, width, coarse, hint='unknown') {
    const ua = String(agent || '').toLowerCase();
    if (/ipad|tablet|kindle|silk\//.test(ua) || /macintosh/.test(ua) && touchPoints > 1) return 'tablet';
    if (/android/.test(ua) && !/mobile/.test(ua)) return 'tablet';
    if (/iphone|ipod|android|windows phone|mobile/.test(ua)) return 'phone';
    if (hint === 'phone' || hint === 'tablet') return hint;
    if (coarse && touchPoints > 0 && width <= 1200) return width < 600 ? 'phone' : 'tablet';
    return 'desktop';
  }
  function chooseLayout(mode, device, width, coarse) {
    if (mode === 'mobile') return 'mobile';
    if (mode === 'desktop') return 'desktop';
    return device === 'phone' || device === 'tablet' || width < 760 || coarse && width <= 1200 ? 'mobile' : 'desktop';
  }
  function refresh() {
    const width = window.innerWidth;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const device = detectDevice(navigator.userAgent, navigator.maxTouchPoints || 0, width, coarse, root.dataset.deviceHint);
    const layout = chooseLayout(root.dataset.layoutMode || 'auto', device, width, coarse);
    root.classList.toggle('mobile-ui', layout === 'mobile');
    root.dataset.device = device;
    root.dataset.activeLayout = layout;
    const label = document.getElementById('device-status');
    if (label) label.textContent = (layout === 'mobile' ? 'Touch layout' : 'Desktop layout') + ' · ' + (device === 'phone' ? 'Phone' : device === 'tablet' ? 'Tablet' : 'Desktop browser');
  }
  window.CorlexDevice = {detectDevice, chooseLayout, refresh};
  window.addEventListener('resize', refresh);
  window.matchMedia('(pointer: coarse)').addEventListener('change', refresh);
  refresh();
})();
