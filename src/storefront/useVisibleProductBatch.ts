import { useEffect, useMemo, useState } from "react";

const PRODUCT_BATCH_SIZE = 4;

export function useVisibleProductBatch<T>(
  products: T[],
  batchSize = PRODUCT_BATCH_SIZE
) {
  // Product grids limit initial render to reduce first-load image requests.
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    setVisibleCount(batchSize);
  }, [batchSize, products]);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );
  const canLoadMore = visibleCount < products.length;

  return {
    canLoadMore,
    loadMore: () =>
      setVisibleCount((current) => Math.min(current + batchSize, products.length)),
    totalCount: products.length,
    visibleCount: Math.min(visibleCount, products.length),
    visibleProducts,
  };
}
