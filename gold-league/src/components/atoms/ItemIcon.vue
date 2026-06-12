<script setup>
import { ref, watch } from 'vue'
import { getItemImageUrl } from '@/api/items'

const props = defineProps({
  itemId: { type: String, required: true },
  alt: { type: String, default: '' },
})

const emit = defineEmits(['failed'])

// DDragon first; on 404 fall back to CommunityDragon; if both fail the item
// is reported up so lists can drop it (replaces the old DOM-poking handler).
const src = ref(getItemImageUrl(props.itemId))
const fallbackTried = ref(false)

watch(() => props.itemId, id => {
  src.value = getItemImageUrl(id)
  fallbackTried.value = false
})

function onError() {
  if (!fallbackTried.value) {
    fallbackTried.value = true
    src.value = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/items/icons2d/${props.itemId.toLowerCase()}.png`
    return
  }
  emit('failed', props.itemId)
}
</script>

<template>
  <img :src="src" :alt="alt || itemId" @error="onError" />
</template>
