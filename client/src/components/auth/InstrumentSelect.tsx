import React from "react";
import { TextField, Typography, MenuItem } from "@mui/material";

interface InstrumentSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const instruments = [
  { value: "guitar", label: "Guitar" },
  { value: "piano", label: "Piano" },
  { value: "violin", label: "Violin" },
  { value: "drums", label: "Drums" },
  { value: "bass", label: "Bass" },
  { value: "vocals", label: "Vocals" },
  { value: "saxophone", label: "Saxophone" },
  { value: "trumpet", label: "Trumpet" },
  { value: "flute", label: "Flute" },
  { value: "cello", label: "Cello" },
  { value: "clarinet", label: "Clarinet" },
  { value: "other", label: "Other" },
];

const InstrumentSelect: React.FC<InstrumentSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        Your instrument*
      </Typography>
      <TextField
        select
        fullWidth
        required
        name="instrument"
        value={value}
        onChange={onChange}
        error={!!error}
        helperText={error}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            bgcolor: "#7E6A2514",
            "& fieldset": {
              borderColor: "#BDBDBD",
            },
            "&:hover fieldset": {
              borderColor: "#937100",
            },
            borderRadius: "0.5em",
          },
          backgroundColor: "#7E6A2514",
          borderRadius: "0.5em",
        }}
      >
        <MenuItem value="" disabled>
          Select your instrument
        </MenuItem>
        {instruments.map((instrument) => (
          <MenuItem key={instrument.value} value={instrument.value}>
            {instrument.label}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default InstrumentSelect;
