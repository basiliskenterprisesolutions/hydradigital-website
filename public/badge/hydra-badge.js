/*!
 * Hydra Digital - footer credit badge
 * https://hydradigital.co.uk
 *
 * Preferred usage (gives hydradigital.co.uk a real, crawlable backlink):
 *
 *   <hydra-badge>
 *     <a href="https://hydradigital.co.uk/?ref=CLIENTDOMAIN">Built by <b>Hydra Digital</b></a>
 *   </hydra-badge>
 *   <script src="https://hydradigital.co.uk/badge/hydra-badge.js" async></script>
 *
 * A port of the Basilisk badge (basilisk.software/badge/basilisk-badge.js v1.3.0)
 * with the Hydra symbol and wording. Same contract: the anchor lives in the
 * client's HTML so crawlers see the link; everything visual comes from this
 * file, so design changes reach every embedding site automatically.
 *
 * The legacy empty form <hydra-badge></hydra-badge> also renders, but the link
 * then exists only in the shadow root. Always use the slotted form.
 *
 * v1.0.0
 */
(function () {
  "use strict";

  if (!("customElements" in window) || customElements.get("hydra-badge")) return;

  /* ------------------------------------------------------------------
   * Config - safe to edit
   * ------------------------------------------------------------------ */

  // The Hydra symbol, inlined so this file has zero external dependencies.
  // To swap it: base64-encode a square, transparent, BLACK PNG and paste it
  // here. The badge inverts it automatically on dark footers.
  var MARK = "data:image/png;base64,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";

  // Trailing slash matters: it is what the canonical tag, og:url and sitemap
  // declare, and crawlers read the raw href attribute rather than the value the
  // browser normalises at runtime.
  var DEFAULT_HREF  = "https://hydradigital.co.uk/";
  var DEFAULT_LABEL = "Built by";
  var DEFAULT_NAME  = "Hydra Digital";

  /* ------------------------------------------------------------------
   * Styles - scoped to the shadow root, cannot leak in or out
   * ------------------------------------------------------------------ */

  var CSS = `
    :host {
      display: inline-block;
      /* Containing block for the mark, which is positioned over the pill. */
      position: relative;
      /* The tilt lives on the host rather than the anchor so that the pill and
         the mark tilt together as one object. It cannot live on the anchor:
         the mark is not a child of it, and cannot become one without breaking
         hydration on prerendered sites (React finds a node it did not render). */
      transform-style: preserve-3d;
      transform: perspective(520px) rotateX(0deg) rotateY(0deg);
      transition: transform .35s cubic-bezier(.3, .7, .3, 1);
      /* light footer defaults */
      --hyd-ink:        rgba(0, 0, 0, .46);
      --hyd-strong:     rgba(0, 0, 0, .90);
      --hyd-hair:       rgba(0, 0, 0, .13);
      --hyd-hair-hover: rgba(0, 0, 0, .30);
      --hyd-tint:       rgba(0, 0, 0, .035);
      --hyd-shadow:     rgba(0, 0, 0, .28);
      --hyd-invert:     0;
    }
    :host([hidden]) { display: none; }

    :host(:hover) {
      transform: perspective(520px)
                 rotateX(calc((var(--hyd-my, .5) - .5) * -16deg))
                 rotateY(calc((var(--hyd-mx, .5) - .5) *  22deg));
      /* snappy while tracking the cursor, eased on the way back */
      transition: transform .08s linear;
    }

    :host([data-scheme="dark"]) {
      --hyd-ink:        rgba(255, 255, 255, .48);
      --hyd-strong:     rgba(255, 255, 255, .92);
      --hyd-hair:       rgba(255, 255, 255, .14);
      --hyd-hair-hover: rgba(255, 255, 255, .30);
      --hyd-tint:       rgba(255, 255, 255, .045);
      --hyd-shadow:     rgba(0, 0, 0, .45);
      --hyd-invert:     1;
    }

    /* One rule for both forms. The anchor either lives in the shadow root
       (legacy) or in the client's HTML (preferred); everything visual is
       declared once here so the two cannot drift apart. !important is for the
       slotted case, where the outer document's rules would otherwise win. */
    a,
    ::slotted(a) {
      display: inline-flex !important;
      align-items: center !important;
      /* Flex trims the trailing whitespace of the anonymous text item, so
         without this the label and the name run together. */
      gap: 8.28px !important;
      /* system monospace - no webfont request, renders everywhere */
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
                   "Liberation Mono", monospace !important;
      font-size: 10.58px !important;
      /* Not 1. The mark no longer sits in the flex row, so the line box is what
         holds the pill open; 12.88px is the height the mark used to give it. */
      line-height: 12.88px !important;
      /* Left padding clears the mark. */
      padding: 7.36px 12.88px 7.36px 34px !important;
      border-radius: 8.28px !important;
      background-color: var(--hyd-tint) !important;
      border: 1px solid var(--hyd-hair) !important;
      color: var(--hyd-ink) !important;
      text-decoration: none !important;
      white-space: nowrap !important;
      transition: box-shadow .35s ease, border-color .35s ease !important;
      -webkit-tap-highlight-color: transparent;
    }

    a:hover,
    ::slotted(a:hover) {
      border-color: var(--hyd-hair-hover) !important;
      box-shadow: 0 8px 22px var(--hyd-shadow);
    }

    a:focus-visible,
    ::slotted(a:focus-visible) {
      outline: 2px solid currentColor !important;
      outline-offset: 3px;
    }

    /* The mark sits in the shadow root for both forms, painted over the pill's
       left padding. margin-top rather than translateY(-50%) keeps the transform
       property free for the hover zoom. */
    .mark {
      position: absolute;
      left: 13.88px;
      top: 50%;
      margin-top: -6.44px;
      width: 12.88px;
      height: 12.88px;
      display: block;
      filter: invert(var(--hyd-invert));
      transition: transform .35s cubic-bezier(.3, .7, .3, 1);
      pointer-events: none;
    }

    :host(:hover) .mark { transform: scale(1.35) rotate(-8deg); }

    b {
      color: var(--hyd-strong);
      font-weight: 500;
    }

    @media (prefers-reduced-motion: reduce) {
      :host, .mark, a, ::slotted(a) { transition: none !important; }
      :host(:hover) { transform: perspective(520px) rotateX(0deg) rotateY(0deg); }
      :host(:hover) .mark { transform: none; }
    }
  `;

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */

  // Decide light/dark from the text colour the badge inherits from its
  // footer. Light text implies a dark background behind it.
  function inheritedSchemeIsDark(el) {
    try {
      var c = getComputedStyle(el).color;
      var p = c.match(/[\d.]+/g);
      if (!p || p.length < 3) return false;
      var lum = (0.2126 * +p[0] + 0.7152 * +p[1] + 0.0722 * +p[2]) / 255;
      return lum > 0.5;
    } catch (e) {
      return false;
    }
  }

  /* ------------------------------------------------------------------
   * Element
   * ------------------------------------------------------------------ */

  class HydraBadge extends HTMLElement {
    static get observedAttributes() { return ["theme", "label", "name", "href"]; }

    constructor() {
      super();
      this._onMove = this._onMove.bind(this);
      this._onLeave = this._onLeave.bind(this);
    }

    connectedCallback() {
      if (!this._root) this._build();
      this._render();
      this._applyTheme();
    }

    attributeChangedCallback() {
      if (this._root) { this._render(); this._applyTheme(); }
    }

    _build() {
      this._root = this.attachShadow({ mode: "open" });

      var style = document.createElement("style");
      style.textContent = CSS;

      // The mark belongs to the shadow root in both forms. Keeping it here is
      // what lets the slotted form match the legacy one exactly: it is a real
      // element, so it can be rotated, and it never touches the client's DOM.
      var mark = document.createElement("img");
      mark.className = "mark";
      mark.src = MARK;
      mark.alt = "";
      mark.setAttribute("aria-hidden", "true");
      mark.setAttribute("decoding", "async");

      // Preferred path: the client's HTML already contains the anchor, so the
      // link is in the raw source where every crawler can see it. Slot it and
      // style it from here, leaving its href and wording alone.
      var slotted = this.querySelector("a");

      if (slotted) {
        this._slotted = true;
        this._a = slotted;
        if (!slotted.hasAttribute("target")) slotted.target = "_blank";
        if (!slotted.hasAttribute("rel")) slotted.rel = "noopener noreferrer";
        // Mark last, so it paints over the anchor's background.
        this._root.append(style, document.createElement("slot"), mark);
      } else {
        // Legacy path, kept so existing embeds keep working untouched. The
        // anchor is built in the shadow root and is not visible to crawlers
        // that do not flatten shadow DOM.
        this._slotted = false;

        var a = document.createElement("a");
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        var text = document.createTextNode("");
        var name = document.createElement("b");

        a.append(text, name);
        this._root.append(style, a, mark);

        this._a = a;
        this._text = text;
        this._name = name;
      }

      // Cursor tracking. Listeners sit on the host, so they are removed with
      // the element - nothing is left bound to document.
      this.addEventListener("pointermove", this._onMove);
      this.addEventListener("pointerleave", this._onLeave);
    }

    _onMove(e) {
      var r = this._a.getBoundingClientRect();
      if (!r.width || !r.height) return;
      this.style.setProperty("--hyd-mx", ((e.clientX - r.left) / r.width).toFixed(3));
      this.style.setProperty("--hyd-my", ((e.clientY - r.top) / r.height).toFixed(3));
    }

    _onLeave() {
      this.style.setProperty("--hyd-mx", "0.5");
      this.style.setProperty("--hyd-my", "0.5");
    }

    _render() {
      var label = this.getAttribute("label") || DEFAULT_LABEL;
      var name  = this.getAttribute("name")  || DEFAULT_NAME;
      var href  = this.getAttribute("href")  || DEFAULT_HREF;

      if (this._slotted) {
        // Do not rewrite the anchor's href or wording. What a crawler reads in
        // the HTML must be what a visitor sees, and the client's markup is the
        // source of truth for both. Only the href attribute on the host is
        // honoured, and only when the anchor has none of its own.
        if (!this._a.getAttribute("href")) this._a.href = href;
        // ::slotted() cannot reach the <b>, so colour it directly. The custom
        // property is inherited through the flattened tree from :host.
        var b = this._a.querySelector("b");
        if (b) {
          b.style.color = "var(--hyd-strong)";
          b.style.fontWeight = "500";
        }
        return;
      }

      this._a.href = href;
      this._text.nodeValue = label ? label + " " : "";
      this._name.textContent = name;
      this._a.setAttribute("aria-label", (label ? label + " " : "") + name);
    }

    _applyTheme() {
      var theme = (this.getAttribute("theme") || "auto").toLowerCase();
      var dark =
        theme === "dark" ? true :
        theme === "light" ? false :
        inheritedSchemeIsDark(this);
      this.setAttribute("data-scheme", dark ? "dark" : "light");
    }
  }

  customElements.define("hydra-badge", HydraBadge);
})();
