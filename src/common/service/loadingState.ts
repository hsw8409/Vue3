import { reactive } from 'vue';

interface LoadingState {
  count: number;
  flag: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  delay: number;
}

const state = reactive<LoadingState>({
  count: 0,
  flag: false,
  timer: null,
  delay: 1,
});

export const loadingState = {
  incrementLoading(): void {
    state.count++;

    if (state.timer === null) {
      state.timer = setTimeout(() => {
        if (state.count > 0) {
          state.flag = true;
        }
      }, state.delay);
    }
  },

  decrementLoading(): void {
    state.count--;

    if (state.count <= 0) {
      this.reset();
    }
  },

  reset(): void {
    if (state.timer) {
      clearTimeout(state.timer);
    }

    state.timer = null;
    state.flag = false;
    state.count = 0;
  },

  get isLoading(): boolean {
    return state.count > 0 && state.flag;
  },
};
