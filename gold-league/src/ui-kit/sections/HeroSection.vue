<script setup lang="ts">
import { FzBadge, FzIcon } from "../../forza";
</script>
<template>
  <section class="hero">
    <div class="hero-copy">
      <FzBadge tone="accent">Forza UI / Preview</FzBadge>
      <h1>FORZA.<br /><em>IN MOTION.</em></h1>
      <p>
        Vue components with a little more force.<br class="desktop-break" />
        Precise controls. Fluid feedback. Built for your next app.
      </p>
      <div class="hero-actions">
        <a class="action-link" href="#components"
          >Explore the components <FzIcon name="arrowUpRight" :size="18" /></a
        ><a class="text-link" href="#build-lab"
          >Enter the build lab <FzIcon name="arrowUpRight" :size="18"
        /></a>
      </div>
      <div class="hero-note">
        <span class="crosshair"><FzIcon name="plus" :size="20" /></span
        ><span>ADD. COMPARE. REFINE.<br />NOTHING LOSES ITS PLACE.</span>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <span class="art-coordinate">FORZA / FORM STUDY</span
      ><svg viewBox="0 0 500 480" fill="none">
        <defs>
          <linearGradient
            id="blade"
            x1="70"
            y1="80"
            x2="400"
            y2="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#ff9b85" />
            <stop offset=".45" stop-color="#ff705b" />
            <stop offset="1" stop-color="#a33129" />
          </linearGradient>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M40 0H0V40" stroke="currentColor" stroke-opacity=".13" />
          </pattern>
        </defs>
        <rect width="500" height="480" fill="url(#grid)" />
        <circle
          cx="260"
          cy="230"
          r="180"
          stroke="currentColor"
          stroke-opacity=".2"
        />
        <circle
          cx="260"
          cy="230"
          r="132"
          stroke="currentColor"
          stroke-opacity=".15"
          stroke-dasharray="3 8"
        />
        <path
          d="M37 230H483M260 14V451"
          stroke="currentColor"
          stroke-opacity=".25"
        />
        <path
          d="M112 85H423L366 164H210V216H355L300 290H210V400H112Z"
          fill="url(#blade)"
        />
        <path d="M112 85H150V400H112Z" fill="#101416" fill-opacity=".17" />
        <path d="M248 325H278L236 415H206Z" fill="#f2efe6" />
        <path d="M72 432H436" stroke="currentColor" stroke-opacity=".5" />
        <path d="M72 425V439M436 425V439" stroke="currentColor" />
        <text
          x="220"
          y="456"
          fill="currentColor"
          font-family="monospace"
          font-size="10"
        >
          FORM / FUNCTION
        </text>
      </svg>
      <div class="art-bottom">
        <span>FORCE, WITH CONTROL.</span>
      </div>
    </div>
  </section>
</template>
