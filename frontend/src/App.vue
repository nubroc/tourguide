<script setup>
import Navbar from './components/Navbar.vue'

function handleLanguageChange(language) {
  console.log('Langue changée:', language)
  // Ici vous pouvez gérer le changement de langue globalement
}
</script>

<template>
  <div id="app">
    <Navbar @language-changed="handleLanguageChange" />
    
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
#app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
