<script setup lang="ts">
const { base, apiUseFetch } = useApi();
const { base: assetsBase } = useAssets();

const { data: health } = await apiUseFetch<{ status: string; stage: string }>(
  "/v2/health",
  { server: false, lazy: true, default: () => ({ status: "loading", stage: "" }) },
);
</script>

<template>
  <main>
    <h1>sst-mono-starter</h1>
    <p>Stage: {{ health?.stage }}</p>
    <p>API: {{ base.toString() }}</p>
    <p>Assets: {{ assetsBase.toString() }}</p>
    <p>Health: {{ health?.status }}</p>
  </main>
</template>
