<template>
  <section class="hero">
    <div class="container">
      <div class="carousel" style="text-align:center;">
        <div class="slide" :style="{ backgroundImage: 'url('+current.image+')' }">
          <div class="slide-overlay"></div>
          <h2>{{ current.title }}</h2>
        </div>

        <div class="carousel-controls" aria-hidden="false" style="margin-top:14px;">
          <button class="btn" @click="prev">Prev</button>
          <button class="btn" @click="next">Next</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroCarousel',
  data(){
    return {
      slides: [
        { title: 'New Single — Echoes', image: '/src/assets/slide1.jpg' },
        { title: 'Live Tour 2025', image: '/src/assets/slide2.jpg' },
        { title: 'Official Goods', image: '/src/assets/slide3.jpg' }
      ],
      idx: 0,
      timer: null
    }
  },
  computed: {
    current(){ return this.slides[this.idx] }
  },
  mounted(){
    // 若没有占位图，使用 gradient 背景
    this.slides = this.slides.map((s,i) => {
      if(!this._imgExists(s.image)){
        return {...s, image: this._placeholder(i)}
      }
      return s
    })
    this.startAuto()
  },
  beforeUnmount(){ this.stopAuto() },
  methods:{
    next(){ this.idx = (this.idx + 1) % this.slides.length },
    prev(){ this.idx = (this.idx - 1 + this.slides.length) % this.slides.length },
    startAuto(){ this.timer = setInterval(()=> this.next(), 4000) },
    stopAuto(){ if(this.timer){ clearInterval(this.timer); this.timer = null } },

    // 检测图片是否存在（同步尝试）
    _imgExists(url){
      try{
        // for dev convenience: Vite serves /src assets; images may not exist - skip checking heavy
        return false
      }catch(e){ return false }
    },
    _placeholder(i){
      // simple gradient data URI backgrounds for placeholder
      const colors = [
        'linear-gradient(135deg,#6b6bff,#1e1e1e)',
        'linear-gradient(135deg,#ff7a7a,#4b1f6b)',
        'linear-gradient(135deg,#56d7b3,#1b6fb5)'
      ]
      return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#111'/><stop offset='1' stop-color='#333'/></linearGradient></defs><rect width='100%' height='100%' fill='${i===0?`#333`:(i===1?`#5b3`:'#246')} ' /><text x='50%' y='50%' font-size='48' fill='white' dominant-baseline='middle' text-anchor='middle'>Slide ${i+1}</text></svg>`)}` 
    }
  }
}
</script>
