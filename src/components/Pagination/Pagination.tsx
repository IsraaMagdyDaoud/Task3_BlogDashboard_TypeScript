import styles from "./Pagination.module.css";
import { PaginationProps, PageItem } from "../../types";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbersWithIds = (): PageItem[] => {
    const pageItems: PageItem[] = [];

    pageItems.push({ type: "page", value: 1, id: "first" });

    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    if (rangeStart > 2) {
      pageItems.push({ type: "ellipsis", id: "ellipsis-1" });
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageItems.push({ type: "page", value: i, id: `middle-${i}` });
    }

    if (rangeEnd < totalPages - 1) {
      pageItems.push({ type: "ellipsis", id: "ellipsis-2" });
    }

    if (totalPages > 1) {
      pageItems.push({ type: "page", value: totalPages, id: "last" });
    }

    return pageItems;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <div className={styles.pageNumbers}>
        {getPageNumbersWithIds().map((item) =>
          item.type === "ellipsis" ? (
            <span key={item.id} className={styles.ellipsis}>
              ...
            </span>
          ) : (
            <button
              key={item.id}
              className={`${styles.pageNumber} ${
                currentPage === item.value ? styles.active : ""
              }`}
              onClick={() => onPageChange(item.value!)}
              disabled={currentPage === item.value}
            >
              {item.value}
            </button>
          )
        )}
      </div>

      <button
        className={styles.pageButton}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
