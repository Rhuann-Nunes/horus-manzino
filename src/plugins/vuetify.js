import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#6B46C1',
        secondary: '#9F7AEA',
        accent: '#4FD1C5',
        success: '#48BB78',
        error: '#F56565',
        warning: '#ED8936',
        info: '#4299E1'
      },
    },
  },
});
