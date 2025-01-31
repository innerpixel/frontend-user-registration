<script setup>
import RegistrationForm from './RegistrationForm.vue'
</script>

<template>
  <section class="relative min-h-[80vh] overflow-hidden border-b border-white/10">
    <div class="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 class="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
        <span class="inline-block">CSMCL</span>
        <span class="inline-block text-white/75">.</span>
        <span class="inline-block text-white/75">SPACE</span>
      </h1>
      
      <p class="text-xl md:text-2xl mb-12 max-w-2xl text-white/70">
        Journey through the digital cosmos, where every pixel tells a story of transformation and discovery.
      </p>
      
      <div>
        <RegistrationForm />
      </div>
    </div>
  </section>
</template>

<style scoped>
.stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  box-shadow: 
    1px 1px white,
    10px 10px white,
    100px 100px white,
    200px 200px white,
    300px 20px white,
    400px 400px white,
    500px 50px white,
    600px 600px white,
    700px 70px white,
    800px 800px white,
    900px 90px white,
    1000px 1000px white;
}
</style>
