const app = new Vue({
  el: '#app',
  data: {
    url: '',
    shortUrl: '',
    created: null,
  },
  methods: {
    createUrl() {
      console.log(this.url, this.shortUrl);
    }
  }
})
