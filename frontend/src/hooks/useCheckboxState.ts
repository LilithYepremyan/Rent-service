import { useState } from "react";

export const useCheckboxState = <T extends { id: string | number }>() => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const isChecked = (item: T) => !!checkedItems[item.id];
  const onCheck = (item: T) =>
    setCheckedItems((prev) => ({ ...prev, [item.id]: !prev[item.id] }));

  return { checkedItems, isChecked, onCheck };
};