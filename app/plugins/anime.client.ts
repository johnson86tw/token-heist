import anime from 'animejs/lib/anime.es.js'

export default defineNuxtPlugin(nuxtApp => {
	return {
		provide: {
			anime: anime,
		},
	}
})
