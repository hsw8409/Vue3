import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    layoutHeight: 0,
  }),

  actions: {
    setlayoutHeight(height: number) {
      this.layoutHeight = height;
    },
  },
});
