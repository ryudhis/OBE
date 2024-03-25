import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RelationData<T> {
  data: T[];
  jenisData: string;
}

export const RelationData = <T extends { kode: string; deskripsi: string }>({
  data,
  jenisData,
}: RelationData<T>) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Data</TableHead>
          <TableHead>Kode</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{jenisData}</TableCell>
          <TableCell>
            {data.map((item, index) => (
              <React.Fragment key={item.kode}>
                {item.kode}
                {index !== data.length - 1 && ", "}
              </React.Fragment>
            ))}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
