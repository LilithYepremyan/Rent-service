import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  InputAdornment,
  Divider,
} from "@mui/material";
import type {
  PenaltyReason,
  Rental,
} from "../../features/rentals/rentalsSlice";
import { useTranslation } from "react-i18next";

type PenaltyModalProps = {
  open: boolean;
  rental: Rental | null;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    reason: PenaltyReason;
    description: string;
  }) => void;
};

const PenaltyModal = ({ open, rental, onClose, onSave }: PenaltyModalProps) => {
  const { t } = useTranslation();

  const [reason, setReason] = useState<PenaltyReason>("DAMAGE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const penaltyAmount = Number(amount) || 0;

  useEffect(() => {
    if (!open) return;

    if (rental?.penalty) {
      setReason(rental.penalty.reason);
      setAmount(String(rental.penalty.amount));
      setDescription(rental.penalty.description || "");
      return;
    }

    setReason("DAMAGE");
    setAmount("");
    setDescription("");
  }, [open, rental]);

  const handleSave = () => {
    if (!penaltyAmount) return;

    onSave({
      amount: penaltyAmount,
      reason,
      description,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "22px",
          backgroundColor: "#fffaf7",
          boxShadow: "0 22px 70px rgba(36, 55, 71, 0.22)",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          color: "#243747",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        {t("additionalPaymentOrPenalty")}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            mt: 1,
            p: 2,
            borderRadius: "16px",
            backgroundColor: "#f4f7f3",
            border: "1px solid #d8e0d6",
          }}
        >
          <Typography
            sx={{
              color: "#243747",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            {rental?.cloth?.name || "-"}
          </Typography>

          <Typography sx={{ mt: 0.5, color: "#60706b", fontSize: "14px" }}>
            {t("code")}: {rental?.cloth?.code || "-"}
          </Typography>

          <Typography sx={{ mt: 0.5, color: "#60706b", fontSize: "14px" }}>
            {t("tenantName")}:{" "}
            {rental?.customer
              ? `${rental.customer.firstName} ${rental.customer.lastName}`
              : "-"}
          </Typography>
        </Box>

        <TextField
          select
          label={t("penaltyReason")}
          fullWidth
          margin="normal"
          value={reason}
          onChange={(e) => setReason(e.target.value as PenaltyReason)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              backgroundColor: "#ffffff",
            },
          }}
        >
          <MenuItem value="DAMAGE">{t("damage")}</MenuItem>
          <MenuItem value="DIRTY">{t("dirty")}</MenuItem>
          <MenuItem value="LOST_ITEM">{t("lostItem")}</MenuItem>
          <MenuItem value="LATE_RETURN">{t("lateReturn")}</MenuItem>
          <MenuItem value="OTHER">{t("other")}</MenuItem>
        </TextField>

        <TextField
          label={t("penaltyAmount")}
          type="number"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onWheel={(e) => e.currentTarget.blur()}
          slotProps={{
            htmlInput: {
              min: 0,
              step: 1000,
            },
            input: {
              endAdornment: <InputAdornment position="end">AMD</InputAdornment>,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              backgroundColor: "#ffffff",
            },
          }}
        />

        <TextField
          label={t("penaltyDescription")}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("penaltyDescriptionPlaceholder")}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              backgroundColor: "#ffffff",
            },
          }}
        />

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 2,
            borderRadius: "16px",
            backgroundColor: "#f7eee8",
            border: "1px solid #d6b09d",
          }}
        >
          <Typography
            sx={{
              color: "#8a4a34",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {t("penaltyAmount")}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#6f3827",
              fontWeight: 800,
              fontSize: "26px",
              lineHeight: 1.2,
            }}
          >
            {penaltyAmount} AMD
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            px: 2.5,
            borderRadius: "12px",
            color: "#60706b",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!penaltyAmount}
          sx={{
            px: 3,
            borderRadius: "12px",
            backgroundColor: "#8a4a34",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#6f3827",
              boxShadow: "none",
            },
            "&:disabled": {
              backgroundColor: "#d8ccc5",
              color: "#ffffff",
            },
          }}
        >
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PenaltyModal;
