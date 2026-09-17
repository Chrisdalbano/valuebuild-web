<script setup lang="ts">
import { shallowRef } from "vue";
import {
  VgButton,
  VgPanel,
  VgBadge,
  VgField,
  VgSwitch,
  VgTabs,
  VgDialog,
  VgMeter,
} from "../../vantage";
const query = shallowRef("");
const name = shallowRef("");
const precise = shallowRef(true);
const alerts = shallowRef(false);
const tab = shallowRef("overview");
const open = shallowRef(false);
const saved = shallowRef(false);
const tabs = [
  { value: "overview", label: "Overview" },
  { value: "stats", label: "Statistics" },
  { value: "history", label: "History" },
];
</script>
<template>
  <section id="components" class="section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">02 / COMPONENT LIBRARY</span>
        <h2>Small parts. Strong opinions.</h2>
      </div>
      <p>
        Real Vue components. Try every state.<br />Keyboard, pointer, and touch
        welcome.
      </p>
    </div>
    <div class="component-grid">
      <VgPanel eyebrow="01 / ACTIONS" title="Commit to the click"
        ><div class="button-stack">
          <VgButton @click="open = true"
            >Save a build <template #trailing>&#8599;</template></VgButton
          ><VgButton variant="secondary" @click="saved = !saved">{{
            saved ? "Selected" : "Select variant"
          }}</VgButton
          ><VgButton variant="ghost" @click="saved = false"
            >Reset selection &#8594;</VgButton
          >
        </div>
        <div class="state-row">
          <VgButton size="sm" disabled>Unavailable</VgButton
          ><VgButton size="sm" loading>Saving</VgButton>
        </div>
        <template #footer
          ><code>variant="primary | secondary | ghost"</code></template
        ></VgPanel
      ><VgPanel eyebrow="02 / INPUT" title="A clear way in"
        ><VgField
          v-model="query"
          label="Find an item"
          type="search"
          placeholder="Search your inventory..."
        />
        <div class="field-gap">
          <VgField
            v-model="name"
            label="Build name"
            placeholder="Give your build a name"
            :error="
              name && name.length < 3 ? 'Use at least 3 characters.' : undefined
            "
            hint="A little personality is encouraged."
          />
        </div>
        <template #footer
          ><code>v-model + label + hint + error</code></template
        ></VgPanel
      ><VgPanel eyebrow="03 / FEEDBACK" title="Signals, not noise"
        ><div class="badge-stack">
          <VgBadge tone="positive">Synced</VgBadge
          ><VgBadge tone="warning">Review needed</VgBadge
          ><VgBadge tone="accent">Experimental</VgBadge>
        </div>
        <VgSwitch v-model="precise" label="Show precise values" /><VgSwitch
          v-model="alerts"
          label="Enable patch alerts"
        />
        <div class="feedback-note" role="status">
          {{
            precise
              ? "Precision enabled. Every decimal counts."
              : "Rounded values. A quicker read."
          }}
        </div>
        <template #footer
          ><code>Native states. Explicit labels.</code></template
        ></VgPanel
      >
    </div>
    <VgPanel
      class="navigation-demo"
      eyebrow="04 / NAVIGATION"
      title="Stay in the flow"
      ><VgTabs v-model="tab" label="Component example" :options="tabs"
        ><div v-if="tab === 'overview'" class="tab-content">
          <span class="big-index">01</span>
          <div>
            <h4>Context without the clutter.</h4>
            <p>
              Tabs keep related views within reach. Try the arrow keys, Home, or
              End.
            </p>
          </div>
          <VgBadge tone="positive">Overview active</VgBadge>
        </div>
        <div v-else-if="tab === 'stats'" class="tab-content">
          <span class="big-index">02</span>
          <div class="grow">
            <h4>Efficiency threshold</h4>
            <VgMeter :value="78" label="Example efficiency score" />
            <p>78 / 100 / Illustrative data</p>
          </div>
        </div>
        <div v-else class="tab-content">
          <span class="big-index">03</span>
          <div>
            <h4>A useful empty state.</h4>
            <p>
              No saved changes yet. Save your first build to start a history.
            </p>
          </div>
          <VgButton size="sm" @click="open = true">Save a build</VgButton>
        </div></VgTabs
      ></VgPanel
    ><VgDialog v-model="open" title="Save your advantage"
      ><p class="muted">
        This is a component demo. Your build stays in this preview session.
      </p>
      <VgField
        v-model="name"
        label="Build name"
        placeholder="e.g. Late-game carry"
      /><template #footer
        ><VgButton
          :disabled="name.trim().length < 3"
          @click="
            saved = true;
            open = false;
          "
          >Save build</VgButton
        ><VgButton variant="secondary" @click="open = false"
          >Cancel</VgButton
        ></template
      ></VgDialog
    >
    <p v-if="saved" role="status" class="save-message">
      Saved: {{ name.trim() || "Variant" }} selected in this preview session.
    </p>
  </section>
</template>
