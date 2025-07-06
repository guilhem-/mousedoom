const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    const canvas = ref(null);
    let ctx;
    let currentPath = [];
    const pointers = [];

    function record(e) {
      const rect = canvas.value.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      currentPath.push({ x, y, t: Date.now() });
    }

    function colorFor(index) {
      const base = 255 - Math.min(index, 50) * 5; // about 2%
      const c = Math.max(0, base);
      return `rgb(${c},${c},${c})`;
    }

    function sendRecords() {
      if (currentPath.length === 0) return;
      fetch('/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: currentPath })
      })
        .then(r => r.json())
        .then(json => {
          if (Array.isArray(json.records)) {
            json.records.forEach(rec => {
              pointers.push({ path: rec, start: Date.now(), color: colorFor(pointers.length) });
            });
            while (pointers.length > 100) pointers.shift();
          }
        })
        .catch(() => { });

      pointers.push({ path: currentPath, start: Date.now(), color: colorFor(pointers.length) });
      while (pointers.length > 100) pointers.shift();
      currentPath = [];
    }

    function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
      const now = Date.now();
      for (let i = 0; i < pointers.length; i++) {
        const p = pointers[i];
        const elapsed = now - p.start;
        let pos = p.path[0];
        for (let j = 0; j < p.path.length; j++) {
          const step = p.path[j];
          if (elapsed >= step.t - p.path[0].t) {
            pos = step;
          } else {
            break;
          }
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(canvas.value.width / 2 + pos.x, canvas.value.height / 2 + pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    onMounted(() => {
      const c = canvas.value = document.querySelector('#app canvas');
      c.width = c.clientWidth;
      c.height = c.clientHeight;
      ctx = c.getContext('2d');
      c.addEventListener('mousemove', record);
      setInterval(sendRecords, 15000);
      draw();
    });

    return { canvas };
  }
}).mount('#app');
