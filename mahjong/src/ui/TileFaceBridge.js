(function attachTileFaceBridge(global) {
  const Sanma = global.Sanma = global.Sanma || {};
  const RenderTiles = Sanma.RenderTiles;
  const TileUtil = Sanma.TileUtil;
  if (!RenderTiles || !TileUtil || typeof document === "undefined") return;

  const honors = { 東: 1, 南: 2, 西: 3, 北: 4, 白: 5, 發: 6, 発: 6, 中: 7 };

  function tileFromLabel(label, isRed) {
    const text = String(label || "").trim();
    const suited = /^([1-9])([mps])$/.exec(text);
    if (suited) {
      return { suit: suited[2], rank: Number(suited[1]), isRed: Boolean(isRed) };
    }
    if (honors[text]) {
      return { suit: "z", rank: honors[text], isRed: false };
    }
    return null;
  }

  function enhanceTile(node) {
    if (!node || !node.classList || !node.classList.contains("tile")) return;
    if (node.classList.contains("back") || node.querySelector(".tile-svg")) return;
    const tile = tileFromLabel(node.textContent, node.classList.contains("red"));
    if (!tile) return;
    const graphic = RenderTiles.createTileGraphic(tile);
    if (typeof node.replaceChildren === "function") node.replaceChildren(graphic);
    else {
      node.textContent = "";
      node.appendChild(graphic);
    }
    node.classList.add(`tile-${tile.suit}`);
    if (tile.isRed) node.classList.add("tile-red");
    node.setAttribute("aria-label", TileUtil.getTileAriaLabel(tile));
  }

  function enhance(root) {
    if (!root) return;
    if (root.classList && root.classList.contains("tile")) enhanceTile(root);
    if (typeof root.querySelectorAll === "function") {
      root.querySelectorAll(".tile").forEach(enhanceTile);
    }
  }

  function mount(root) {
    enhance(root);
    if (typeof MutationObserver !== "function" || !root) return null;
    const observer = new MutationObserver(() => enhance(root));
    observer.observe(root, { childList: true, subtree: true });
    return observer;
  }

  Sanma.TileFaceBridge = { tileFromLabel, enhanceTile, enhance, mount };
  const table = document.getElementById && document.getElementById("tableRoot");
  if (table) mount(table);
})(window);
