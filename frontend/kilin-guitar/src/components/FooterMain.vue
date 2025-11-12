<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div>© {{ year }} Kilin&amp;Guitar</div>
        <div>
          <a href="https://twitter.com" target="_blank" rel="noopener">Twitter</a>
          <span style="padding:0 6px;color:#ddd">·</span>
          <a href="https://youtube.com" target="_blank" rel="noopener">YouTube</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterMain',
  data(){ return { year: new Date().getFullYear() } }
}
</script>
