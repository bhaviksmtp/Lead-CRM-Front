import { ref, computed } from 'vue';

export function usePagination(fetchCallback) {
  const currentPage = ref(1);
  const perPage = ref(15);

  const setPage = (page) => {
    currentPage.value = page;
    fetchCallback();
  };

  return {
    currentPage,
    perPage,
    setPage
  };
}
