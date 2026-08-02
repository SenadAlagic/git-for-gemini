export type ListEntryProps = {
  isActive: boolean;
  name: string;
  onClick: () => void;
};

export const ListEntry = ({ isActive, name, onClick }: ListEntryProps) => {
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      {isActive ? "➔" : "o"} {name}
    </div>
  );
};
