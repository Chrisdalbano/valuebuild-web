<script setup>
defineProps({
  title: { type: String, required: true },
  // [{ label, to }] for router links, [{ label, href }] for external
  links: { type: Array, required: true },
})
</script>

<template>
  <div class="footer-column">
    <h4>{{ title }}</h4>
    <ul class="footer-links">
      <li v-for="link in links" :key="link.label">
        <router-link v-if="link.to" :to="link.to">{{ link.label }}</router-link>
        <a v-else :href="link.href" target="_blank" rel="noopener noreferrer">
          {{ link.label }}
          <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.footer-column h4 {
  color: var(--footer-accent-bright);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links li a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.footer-links li a:hover {
  color: var(--footer-accent-bright);
  transform: translateX(4px);
}

.external-icon { width: 14px; height: 14px; opacity: 0.5; transition: opacity 0.2s ease; }
.footer-links li a:hover .external-icon { opacity: 1; }
</style>
