import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

interface SkeletonTableProps {
  rows: number;
  cols: number;
}

const SkeletonTable = ({ rows, cols }: SkeletonTableProps) => (
  <>
    {Array(rows)
      .fill(null)
      .map((_, rowIndex) => (
        <TableRow key={`row-${rowIndex}`}>
          {Array(cols)
            .fill(null)
            .map((_, colIndex) => (
              <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                <Skeleton
                  className={
                    colIndex === 0 ? "w-[60px] h-[20px]" : "w-full h-[20px]"
                  }
                />
              </TableCell>
            ))}
        </TableRow>
      ))}
  </>
);

export default SkeletonTable;
