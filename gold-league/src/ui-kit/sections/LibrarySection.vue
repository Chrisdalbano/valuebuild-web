<script setup lang="ts">
import WorkflowDemo from "../demos/WorkflowDemo.vue";
import OverlayDemo from "../demos/OverlayDemo.vue";
import DiscoveryDemo from "../demos/DiscoveryDemo.vue";
import DataDemo from "../demos/DataDemo.vue";
</script>
<template>
  <section id="library" class="section library-section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">The library / 25 components</span>
        <h2>Built to work together.</h2>
      </div>
      <p>
        From the first choice to the last detail.<br />Four working patterns.
        One consistent language.
      </p>
    </div>
    <div class="library-grid">
      <article class="library-demo">
        <header>
          <span class="demo-number">01</span>
          <div>
            <h3>A clear next step.</h3>
            <p>Stepper · Select · Slider · Checkbox · Alert</p>
          </div>
        </header>
        <WorkflowDemo />
      </article>
      <article class="library-demo">
        <header>
          <span class="demo-number">02</span>
          <div>
            <h3>Room for the details.</h3>
            <p>Dropdown · Drawer · Popover · Tooltip</p>
          </div>
        </header>
        <OverlayDemo />
      </article>
      <article class="library-demo">
        <header>
          <span class="demo-number">03</span>
          <div>
            <h3>Explore at your pace.</h3>
            <p>Carousel · Accordion</p>
          </div>
        </header>
        <DiscoveryDemo />
      </article>
      <article class="library-demo">
        <header>
          <span class="demo-number">04</span>
          <div>
            <h3>Make sense of more.</h3>
            <p>Data table · Pagination · Search</p>
          </div>
        </header>
        <DataDemo />
      </article>
    </div>
  </section>
</template>
