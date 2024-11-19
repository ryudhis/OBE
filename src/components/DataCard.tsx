import React from 'react';

interface DataCardProps<T> {
  selected: string[];
  handleCheck: (kode: string) => void;
  data: T;
}

export const DataCard = <T extends { kode: string; deskripsi: string }>({
  selected,
  handleCheck,
  data,
}: DataCardProps<T>) => {
  return (
    <div
      onClick={() => {
        handleCheck(data?.kode);
      }}
      className="p-4 bg-white rounded-lg shadow-sm flex flex-row justify-between items-center cursor-pointer ease-in-out duration-300 hover:shadow-md border-slate-200 border-[1px]"
    >
      <div className='w-[200px]'>
        <div className="font-medium text-lg">{data?.kode}</div>
        <div className="text-sm">
          {data?.deskripsi.length > 30
            ? data?.deskripsi.slice(0, 28) + "..."
            : data?.deskripsi}
        </div>
      </div>

      <input readOnly checked={selected?.includes(data?.kode)} type="checkbox" />
    </div>
  );
};