import { defineStore } from 'pinia';

export const useNoteStore = defineStore('note', {
  state: () => ({
    currentNoteId: '',
  }),
  getters: {
    getCurrentNoteId: state => state.currentNoteId,
  },
  actions: {
    setCurrentNoteId(noteId: string) {
      this.currentNoteId = noteId;
    },
  },
});
