import React from "react";
import { Button } from "@/components/ui/button";

interface Meta {
  totalItems: number;
  totalPages: number;
}

const Pagination = ({
  meta,
  currentPage,
  setCurrentPage,
}: {
  meta: Meta;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) => {
  const renderPagination = () => {
    const buttons = [];
    const maxButtons = 10;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(meta.totalPages, startPage + maxButtons - 1);

    if (currentPage > 1) {
      buttons.push(
        <Button
          key="prev"
          variant="outline"
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </Button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    if (endPage < meta.totalPages) {
      buttons.push(<span key="ellipsis">...</span>);
      buttons.push(
        <Button
          key={meta.totalPages}
          variant={meta.totalPages === currentPage ? "default" : "outline"}
          onClick={() => setCurrentPage(meta.totalPages)}
        >
          {meta.totalPages}
        </Button>
      );
    }

    if (currentPage < meta.totalPages) {
      buttons.push(
        <Button
          key="next"
          variant="outline"
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="mt-4 flex justify-between items-center">
      <span>Total Items: {meta.totalItems}</span>
      <div className="flex gap-2">{renderPagination()}</div>
      <div className="bg-white w-[120px]"></div>
    </div>
  );
};

export default Pagination;
