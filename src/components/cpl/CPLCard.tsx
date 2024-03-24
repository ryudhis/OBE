interface CPLItem {
  kode: string;
  deskripsi: string;
}

interface CPLCardProps {
  selected: string[];
  handleCheck: (kode: string) => void;
  cpl: CPLItem;
}

export const CPLCard = ({ selected, handleCheck, cpl }: CPLCardProps) => {
  return (
    <div
      onClick={() => {
        handleCheck(cpl?.kode);
      }}
      className="p-4 bg-white rounded-lg shadow-sm flex flex-row justify-between items-center cursor-pointer ease-in-out duration-300 hover:shadow-md"
    >
      <div>
        <div className="font-medium text-lg">{cpl?.kode}</div>
        <div className="text-sm">
          {cpl?.deskripsi.length > 30
            ? cpl?.deskripsi.slice(0, 28) + "..."
            : cpl?.deskripsi}
        </div>
      </div>

      <input readOnly checked={selected?.includes(cpl?.kode)} type="checkbox" />
    </div>
  );
};
