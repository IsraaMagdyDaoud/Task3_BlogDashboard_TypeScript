import styles from "./Pagination.module.css";
import { PaginationProps, PageItem } from "../../types";

/**
 * Pagination component - Displays navigation controls for paginated content.
 *
 * @component
 * @param {PaginationProps} props - Component props
 * @param {number} props.currentPage - The currently selected page number
 * @param {number} props.totalPages - Total number of available pages
 * @param {Function} props.onPageChange - Callback to handle page changes
 * @returns {JSX.Element }
 */

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  /**
   * Generates a list of page buttons with ellipses where appropriate.
   *
   * Always includes:
   * - First page (1)
   * - Last page (totalPages)
   * - Up to 3 pages surrounding the currentPage
   * - Ellipses (...) where page ranges are skipped
   *
   * @returns {PageItem[]} An array of page items including numbers and ellipses
   */
  const getPageNumbersWithIds = (): PageItem[] => {
    const pageItems: PageItem[] = [];

    // Always show first page
    pageItems.push({ type: "page", value: 1, id: "first" });

    // Determine middle page range (around current page)
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    if (rangeStart > 2) {
      pageItems.push({ type: "ellipsis", id: "ellipsis-1" });
    }

    // Add middle page numbers
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageItems.push({ type: "page", value: i, id: `middle-${i}` });
    }

    // Add right ellipsis if there's a gap
    if (rangeEnd < totalPages - 1) {
      pageItems.push({ type: "ellipsis", id: "ellipsis-2" });
    }

    // Always show last page if more than one page exists
    if (totalPages > 1) {
      pageItems.push({ type: "page", value: totalPages, id: "last" });
    }

    return pageItems;
  };

  // Don't render pagination if only one page
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
