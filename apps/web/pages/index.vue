<script setup lang="ts">
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;
const stage = config.public.stage;

const { data: health } = await useFetch<{ status: string; stage: string }>(
  () => `${apiUrl}/v2/health`,
  { server: false, lazy: true, default: () => ({ status: "loading", stage: "" }) }
);
</script>

<template>
  <main>
    <h1>sst-mono-starter</h1>
    <p>Stage: {{ stage }}</p>
    <p>API: {{ apiUrl }}</p>
    <p>Health: {{ health?.status }}</p>
  </main>
</template>
