<script setup lang="ts">
const config = useRuntimeConfig();
const stage = config.public.stage;
const { base, apiUseFetch } = useApi();

const { data: health } = await apiUseFetch<{ status: string; stage: string }>(
  "/v2/health",
  { server: false, lazy: true, default: () => ({ status: "loading", stage: "" }) },
);
</script>

<template>
  <main>
    <h1>sst-mono-starter</h1>
    <p>Stage: {{ stage }}</p>
    <p>API: {{ base.toString() }}</p>
    <p>Health: {{ health?.status }}</p>
  </main>
</template>
