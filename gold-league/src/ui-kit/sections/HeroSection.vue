<script setup lang="ts">
import { VgBadge } from "../../vantage";
</script>
<template>
  <section class="hero">
    <div class="hero-copy">
      <VgBadge tone="accent">Independent interface system / v0.1</VgBadge>
      <h1>PRECISION.<br />WITH <em>TEETH.</em></h1>
      <p>
        A sharp new language for tools that play seriously.<br
          class="desktop-break"
        />
        Expressive by nature. Systematic by design.
      </p>
      <div class="hero-actions">
        <a class="action-link" href="#components"
          >Explore the components <span>&#8599;</span></a
        ><a class="text-link" href="#build-lab"
          >Enter the build lab <span>&#8599;</span></a
        >
      </div>
      <div class="hero-note">
        <span class="crosshair">+</span
        ><span>BUILT FOR THE MOMENT<br />BETWEEN INSTINCT & DECISION.</span>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <span class="art-coordinate">FIG. 01 / THE ADVANTAGE</span
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
          d="M93 95H193L249 278L318 95H425L270 412H201Z"
          fill="url(#blade)"
        />
        <path d="M93 95L201 412H270L163 95" fill="#101416" fill-opacity=".17" />
        <path d="M202 45H233L327 348H296Z" fill="#f2efe6" />
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
        <span>ANGULAR BY INTENT.</span><span>35&#176; &#8599;</span>
      </div>
    </div>
  </section>
</template>
