export function renderGuitarTab(vextabText) {
  const VF = window.Vex.Flow;
  const VTD = window.VexTabDiv;

  const container = document.getElementById('tabContainer');
  container.innerHTML = '';

  // 把多余空行压缩掉，避免 VexTab 语法报错
  const cleanVextab = vextabText
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')  // 连续三行空 → 两行空
    .trim();

  // 渲染器
  const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
  renderer.resize(1100, 700);

  const artist = new VTD.Artist(10, 10, 1050, { scale: 0.95 });
  const vextab = new VTD.VexTab(artist);

  try {
    vextab.parse(cleanVextab);
    artist.render(renderer);
  } catch (err) {
    console.error("VexTab Parse Error:", err);
    container.innerHTML =
      `<pre style="color:red; white-space: pre-wrap;">
解析错误:
${err.message || err}
-----------------------
你的原始文本:
${cleanVextab}
</pre>`;
  }
}
