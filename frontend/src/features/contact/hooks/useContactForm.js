import { useState } from "react";
import { INITIAL_CONTACT_FORM_DATA } from "../utils/contact.constants";
import { sendContactMessage } from "../services/contactApi";

export function useContactForm() {
  const [formData, setFormData] = useState(INITIAL_CONTACT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_CONTACT_FORM_DATA);
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: "",
      message: "",
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Kérjük, add meg a neved.";
    }

    if (!formData.email.trim()) {
      return "Kérjük, add meg az email címed.";
    }

    if (!formData.message.trim()) {
      return "Kérjük, írd be az üzeneted.";
    }

    if (!formData.accepted) {
        return "Az üzenet elküldéséhez el kell fogadnod az adatkezelési feltételeket.";
      }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setModalState({
        isOpen: true,
        type: "error",
        message: validationError,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        accepted: formData.accepted,
      });

      setModalState({
        isOpen: true,
        type: "success",
        message:
          "Köszönjük az üzeneted! Hamarosan felvesszük veled a kapcsolatot.",
      });

      resetForm();
    } catch (error) {
      setModalState({
        isOpen: true,
        type: "error",
        message: error.message || "Hiba történt az üzenet küldése közben.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    modalState,
    handleChange,
    handleSubmit,
    closeModal,
  };
}