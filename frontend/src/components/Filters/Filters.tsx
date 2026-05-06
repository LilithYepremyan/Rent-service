import { useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import FormControl from "@mui/material/FormControl";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { SxProps, Theme } from "@mui/material/styles";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Filters.module.scss";

type FiltersProps = {
  onCodeChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onColorChange: (value: string) => void;
  colors: string[];
};

const menuItemStyles: SxProps<Theme> = {
  fontSize: "16px",
  color: "#3b2f2f",

  "&:hover": {
    backgroundColor: "#b5c3ae",
  },

  "&.Mui-selected": {
    backgroundColor: "#e8f3df",
  },

  "&.Mui-selected:hover": {
    backgroundColor: "#b5c3ae",
  },
};

const Filters: React.FC<FiltersProps> = ({
  onCodeChange,
  onDateChange,
  onColorChange,
  colors,
}) => {
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [selectedColor, setSelectedColor] = useState("");

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);

    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      onDateChange(formattedDate);
    } else {
      onDateChange("");
    }
  };

  const handleColorChange = (event: SelectChangeEvent) => {
    const value = event.target.value;

    setSelectedColor(value);
    onColorChange(value);
  };

  return (
    <div className={styles.filters}>
      <input
        type="text"
        placeholder={t("searchByCode")}
        onChange={(e) => onCodeChange(e.target.value)}
        className={styles.input}
      />

      <div className={styles.datePickerWrapper}>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          placeholderText={t("selectDate")}
          isClearable
          className={styles.input}
          calendarClassName={styles.calendar}
          calendarIconClassName={styles.calendarIcon}
        />
      </div>

      <FormControl sx={{ width: 250 }}>
        <Select
          value={selectedColor}
          onChange={handleColorChange}
          displayEmpty
          size="small"
          sx={{
            height: "40px",
            borderRadius: "8px",
            fontSize: "16px",
            backgroundColor: "#ffffff",
            cursor: "pointer",

            "&:hover": {
              border: "1px solid #b5c3ae",
              boxShadow: "0 0 5px 3px #4b969229",
              outline: "none",
            },

            "& .MuiSelect-select": {
              padding: "10px",
              color: "#6b7280",

            },

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f3f4f6",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f3f4f6",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f3f4f6",
              borderWidth: "1px",
              boxShadow: "0 0 5px 3px #a4c3b240",
            },
          }}
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  marginTop: "6px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
                },
              },
            },
          }}
        >
          <MenuItem value="" sx={menuItemStyles}>
            {t("allColors")}
          </MenuItem>

          {colors.map((color) => (
            <MenuItem key={color} value={color} sx={menuItemStyles}>
              {t(`colors.${color}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default Filters;
