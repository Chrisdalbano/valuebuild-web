<script setup lang="ts">
import { shallowRef } from "vue";
import {
  FzIcon,
  FzButton,
  FzPanel,
  FzBadge,
  FzField,
  FzSwitch,
  FzTabs,
  FzDialog,
  FzMeter,
} from "../../forza";
import SavedBuildList from "../SavedBuildList.vue";
import { useSavedBuilds } from "../composables/useSavedBuilds";
const builds = useSavedBuilds();
const query = shallowRef("");
const name = shallowRef("");
const precise = shallowRef(true);
const alerts = shallowRef(false);
const tab = shallowRef("overview");
const open = shallowRef(false);
const saved = shallowRef(false);
const loading = shallowRef(false);
function save() {
  if (builds.add(name.value)) {
    open.value = false;
    name.value = "";
  }
}
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
        <span class="eyebrow">Components</span>
        <h2>Controls you can feel.</h2>
      </div>
      <p>
        Real Vue components. Try every state.<br />Keyboard, pointer, and touch
        welcome.
      </p>
    </div>
    <div class="component-grid">
      <FzPanel title="Buttons"
        ><div class="button-stack">
          <FzButton @click="open = true"
            >Save a build
            <template #trailing
              ><FzIcon name="arrowUpRight" :size="17" /></template></FzButton
          ><FzButton variant="secondary" @click="saved = !saved">{{
            saved ? "Selected" : "Select variant"
          }}</FzButton
          ><FzButton variant="ghost" @click="saved = false"
            >Reset selection <FzIcon name="undo" :size="16"
          /></FzButton>
        </div>
        <div class="state-row">
          <FzButton size="sm" disabled>Unavailable</FzButton
          ><FzButton size="sm" :loading="loading" @click="loading = true">{{
            loading ? "Working" : "Show loading"
          }}</FzButton
          ><FzButton
            v-if="loading"
            variant="ghost"
            size="sm"
            @click="loading = false"
            >Stop</FzButton
          >
        </div>
        <template #footer
          ><code>variant="primary | secondary | ghost"</code></template
        ></FzPanel
      ><FzPanel title="Text fields"
        ><FzField
          v-model="query"
          label="Find an item"
          type="search"
          placeholder="Search your inventory..."
        />
        <div class="field-gap">
          <FzField
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
        ></FzPanel
      ><FzPanel title="Status & preferences"
        ><div class="badge-stack">
          <FzBadge tone="positive">Synced</FzBadge
          ><FzBadge tone="warning">Review needed</FzBadge
          ><FzBadge tone="accent">Experimental</FzBadge>
        </div>
        <FzSwitch v-model="precise" label="Show precise values" /><FzSwitch
          v-model="alerts"
          label="Enable patch alerts"
        />
        <div class="feedback-note" role="status">
          <Transition name="fz-state" mode="out-in"
            ><span :key="String(precise)">
              {{
                precise
                  ? "Precision enabled. Every decimal counts."
                  : "Rounded values. A quicker read."
              }}
            </span></Transition
          >
        </div>
        <template #footer
          ><code>Native states. Explicit labels.</code></template
        ></FzPanel
      >
    </div>
    <FzPanel class="navigation-demo" title="Tabs"
      ><FzTabs v-model="tab" label="Component example" :options="tabs"
        ><div v-if="tab === 'overview'" class="tab-content">
          <span class="big-index">01</span>
          <div>
            <h4>Context without the clutter.</h4>
            <p>
              Tabs keep related views within reach. Try the arrow keys, Home, or
              End.
            </p>
          </div>
          <FzBadge tone="positive">Overview active</FzBadge>
        </div>
        <div v-else-if="tab === 'stats'" class="tab-content">
          <span class="big-index">02</span>
          <div class="grow">
            <h4>Efficiency threshold</h4>
            <FzMeter :value="78" label="Example efficiency score" />
            <p>78 / 100 / Illustrative data</p>
          </div>
        </div>
        <div v-else class="tab-content">
          <span class="big-index">03</span>
          <div>
            <h4>Build history</h4>
            <p>
              {{ builds.items.value.length }} saved builds in this session.
              {{ builds.message.value }}
            </p>
          </div>
          <FzButton size="sm" @click="open = true">Save a build</FzButton>
        </div></FzTabs
      ></FzPanel
    ><FzDialog
      v-model="open"
      title="Save a build"
      description="Give this build a name. It stays in this preview session."
    >
      <FzField
        v-model="name"
        label="Build name"
        placeholder="e.g. Late-game carry"
      /><template #footer
        ><FzButton
          :disabled="name.trim().length < 3 || builds.items.value.length >= 6"
          @click="save"
          >Save build</FzButton
        ><FzButton variant="secondary" @click="open = false"
          >Cancel</FzButton
        ></template
      ></FzDialog
    >
    <SavedBuildList
      :items="builds.items.value"
      :can-undo="!!builds.removed.value"
      :message="builds.message.value"
      @create="open = true"
      @remove="builds.remove"
      @undo="builds.undo"
      @reorder="builds.reorder"
    />
    <p v-if="saved" role="status" class="save-message">
      Saved: {{ name.trim() || "Variant" }} selected in this preview session.
    </p>
  </section>
</template>
